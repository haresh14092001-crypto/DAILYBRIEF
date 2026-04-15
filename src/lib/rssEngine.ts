/**
 * RSS & Content Aggregation Engine
 * Phases 2–3: RSS fetching + light scraping for VetDesk Intelligence Feed
 */

export type FeedCategory = 'Veterinary' | 'Research' | 'Startup' | 'Jobs' | 'Courses' | 'Business' | 'General';
export type SourceType = 'RSS' | 'Website';
export type FocusMode = 'All' | 'Study' | 'Career' | 'Startup';

export interface FeedSource {
  id: string;
  name: string;
  type: SourceType;
  url: string;
  category: FeedCategory;
  addedAt: string;
  active: boolean;
}

export interface FeedItem {
  id: string;
  sourceId: string;
  sourceName: string;
  category: FeedCategory;
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  isOpportunity: boolean;
  isSaved: boolean;
  isPinned: boolean;
  isIgnored: boolean;
  fetchedAt: string;
  relevanceScore?: number;
}

// ─── RSS Parser (client-side via DOMParser) ───────────────────────────────────
export async function fetchRSSFeed(source: FeedSource): Promise<FeedItem[]> {
  try {
    // Use local API proxy to bypass CORS reliably from our own server
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(source.url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const text = await res.text();

    if (!text) throw new Error('Empty response from proxy');

    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');

    // Handle both RSS <item> and Atom <entry>
    const items = [
      ...Array.from(xml.querySelectorAll('item')),
      ...Array.from(xml.querySelectorAll('entry')),
    ];

    return items.slice(0, 30).map((item, index) => {
      const title =
        item.querySelector('title')?.textContent?.trim() || 'Untitled';
      const link =
        item.querySelector('link')?.textContent?.trim() ||
        item.querySelector('link')?.getAttribute('href') ||
        '';
      const description =
        item.querySelector('description')?.textContent?.trim() ||
        item.querySelector('summary')?.textContent?.trim() ||
        '';
      const pubDate =
        item.querySelector('pubDate')?.textContent?.trim() ||
        item.querySelector('published')?.textContent?.trim() ||
        item.querySelector('updated')?.textContent?.trim() ||
        '';

      return {
        id: `${source.id}-${index}-${Date.now()}`,
        sourceId: source.id,
        sourceName: source.name,
        category: source.category,
        title: stripHtml(title),
        link,
        description: stripHtml(description).slice(0, 200),
        pubDate,
        isOpportunity: detectOpportunity(title, source.category),
        isSaved: false,
        isPinned: false,
        isIgnored: false,
        fetchedAt: new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn(`RSS fetch failed for ${source.name}:`, err);
    return [];
  }
}

// ─── Light HTML Scraper ────────────────────────────────────────────────────────
export async function fetchHTMLFeed(source: FeedSource): Promise<FeedItem[]> {
  try {
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(source.url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const text = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // Only grab meaningful anchor links (ignore nav/footer/social links)
    const links = Array.from(doc.querySelectorAll('a[href]'))
      .filter((a) => {
        const href = (a as HTMLAnchorElement).href;
        const text = a.textContent?.trim() || '';
        return (
          text.length > 20 &&
          text.length < 300 &&
          href.startsWith('http') &&
          !href.includes('javascript:')
        );
      })
      .slice(0, 15);

    return links.map((a, index) => {
      const title = a.textContent?.trim() || 'Untitled';
      const link = (a as HTMLAnchorElement).href;
      return {
        id: `${source.id}-html-${index}-${Date.now()}`,
        sourceId: source.id,
        sourceName: source.name,
        category: source.category,
        title,
        link,
        isOpportunity: detectOpportunity(title, source.category),
        isSaved: false,
        isPinned: false,
        isIgnored: false,
        fetchedAt: new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn(`HTML fetch failed for ${source.name}:`, err);
    return [];
  }
}

// ─── Aggregator ───────────────────────────────────────────────────────────────
export async function aggregateAllSources(sources: FeedSource[]): Promise<FeedItem[]> {
  const activeSources = sources.filter((s) => s.active);
  if (activeSources.length === 0) return [];

  const results = await Promise.allSettled(
    activeSources.map((source) =>
      source.type === 'RSS' ? fetchRSSFeed(source) : fetchHTMLFeed(source)
    )
  );

  const allItems = results
    .filter((r): r is PromiseFulfilledResult<FeedItem[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  // Sort: pinned first, then opportunities, then newest
  return allItems.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.isOpportunity && !b.isOpportunity) return -1;
    if (!a.isOpportunity && b.isOpportunity) return 1;
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return dateB - dateA;
  });
}

// ─── AI-style Noise Filter ────────────────────────────────────────────────────
const NOISE_PATTERNS = [
  /cookie/i, /privacy policy/i, /subscribe to our newsletter/i,
  /click here/i, /sign up/i, /advertisement/i, /sponsored/i,
  /^\s*$/, /^[0-9]+$/, /^(read more|more|continue|next|prev(ious)?)\s*$/i,
  /^privacy$/i, /^terms$/i, /^contact$/i, /^about$/i,
  /login/i, /register/i, /sign in/i,
];

export function isNoisy(title: string): boolean {
  if (title.length < 5) return true; // Too short
  if (title.length > 150) return true; // Too long
  return NOISE_PATTERNS.some((p) => p.test(title));
}

export function filterNoisy(items: FeedItem[]): FeedItem[] {
  return items.filter((item) => !isNoisy(item.title) && item.title.length > 10);
}

// ─── Opportunity Detector ─────────────────────────────────────────────────────
const OPPORTUNITY_KEYWORDS = [
  'job', 'internship', 'fellowship', 'opening', 'hiring', 'vacancy', 'recruitment',
  'position', 'apply', 'application', 'career', 'employment', 'work', 'role',
  'grant', 'scholarship', 'funding', 'award', 'prize', 'competition',
  'ph.d', 'phd', 'postdoc', 'residency', 'placement', 'trainee',
  'research fellow', 'scientist', 'specialist', 'expert', 'consultant',
  'opportunity', 'chance', 'available', 'seeking', 'wanted',
  'deadline', 'apply now', 'join us', 'we are hiring',
];

const OPPORTUNITY_PHRASES = [
  'call for', 'open position', 'job opening', 'career opportunity',
  'research position', 'academic position', 'faculty position',
  'postdoctoral', 'doctoral', 'graduate program',
];

export function detectOpportunity(title: string, category: FeedCategory): boolean {
  if (category === 'Jobs') return true;
  const lower = title.toLowerCase();

  // Check keywords
  if (OPPORTUNITY_KEYWORDS.some((kw) => lower.includes(kw))) return true;

  // Check phrases
  if (OPPORTUNITY_PHRASES.some((phrase) => lower.includes(phrase))) return true;

  // Category-specific boosts
  if (category === 'Courses' && (lower.includes('enrollment') || lower.includes('admission'))) return true;
  if (category === 'Research' && (lower.includes('funding') || lower.includes('grant'))) return true;

  return false;
}

// ─── Focus Mode Filter ─────────────────────────────────────────────────────────
export function applyFocusMode(items: FeedItem[], mode: FocusMode): FeedItem[] {
  switch (mode) {
    case 'Study':
      return items.filter((i) =>
        i.category === 'Veterinary' || i.category === 'Research' || i.category === 'Courses'
      );
    case 'Career':
      return items.filter((i) =>
        i.category === 'Jobs' || i.category === 'Courses' || i.category === 'Business'
      );
    case 'Startup':
      return items.filter((i) =>
        i.category === 'Startup' || i.category === 'Business'
      );
    case 'All':
    default:
      return items;
  }
}

// ─── Default Sources (pre-loaded curated knowledge base) ─────────────────────
const SEED_DATE = '2026-04-15T00:00:00.000Z';

export const DEFAULT_SOURCES: FeedSource[] = [

  // ━━ 🐄 VETERINARY (9) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'merck-vet',        name: 'Merck Veterinary Manual',         type: 'Website', url: 'https://www.merckvetmanual.com/',                              category: 'Veterinary', addedAt: SEED_DATE, active: true },
  { id: 'vin',              name: 'Veterinary Information Network',  type: 'Website', url: 'https://www.vin.com/',                                        category: 'Veterinary', addedAt: SEED_DATE, active: true },
  { id: 'ivis',             name: 'IVIS',                            type: 'Website', url: 'https://www.ivis.org/',                                       category: 'Veterinary', addedAt: SEED_DATE, active: true },
  { id: 'eclinpath',        name: 'eClinpath',                       type: 'Website', url: 'https://eclinpath.com/',                                      category: 'Veterinary', addedAt: SEED_DATE, active: true },
  { id: 'vetstudy-notes',   name: 'VetStudy Notes',                  type: 'Website', url: 'https://vetstudy.journeywithasr.com/?m=1',                    category: 'Veterinary', addedAt: SEED_DATE, active: true },
  { id: 'dvm360',           name: 'DVM360',                          type: 'RSS',     url: 'https://www.dvm360.com/rss.xml',                              category: 'Veterinary', addedAt: SEED_DATE, active: true },
  { id: 'vet-practice-news',name: 'Veterinary Practice News',        type: 'RSS',     url: 'https://www.veterinarypracticenews.com/feed/',                 category: 'Veterinary', addedAt: SEED_DATE, active: true },
  { id: 'vet-times',        name: 'Vet Times',                       type: 'RSS',     url: 'https://www.vettimes.co.uk/feed/',                            category: 'Veterinary', addedAt: SEED_DATE, active: true },
  { id: 'avma',             name: 'AVMA',                            type: 'RSS',     url: 'https://www.avma.org/rss.xml',                                category: 'Veterinary', addedAt: SEED_DATE, active: true },

  // ━━ 🔬 RESEARCH (10) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'pubmed',            name: 'PubMed',                         type: 'Website', url: 'https://pubmed.ncbi.nlm.nih.gov/',                            category: 'Research', addedAt: SEED_DATE, active: true },
  { id: 'pubmed-vet-rss',   name: 'PubMed – Vet Search',            type: 'RSS',     url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/1puhyZxq2kX3ZQ9mKj8/?limit=15', category: 'Research', addedAt: SEED_DATE, active: true },
  { id: 'scholar',           name: 'Google Scholar',                 type: 'Website', url: 'https://scholar.google.com/',                                 category: 'Research', addedAt: SEED_DATE, active: true },
  { id: 'cab-direct',       name: 'CAB Direct',                      type: 'Website', url: 'https://www.cabdirect.org/',                                  category: 'Research', addedAt: SEED_DATE, active: true },
  { id: 'ivri',             name: 'IVRI',                            type: 'Website', url: 'https://ivri.nic.in/',                                       category: 'Research', addedAt: SEED_DATE, active: true },
  { id: 'woah',             name: 'WOAH',                            type: 'Website', url: 'https://www.woah.org/',                                      category: 'Research', addedAt: SEED_DATE, active: true },
  { id: 'fao',              name: 'FAO',                             type: 'Website', url: 'https://www.fao.org/',                                       category: 'Research', addedAt: SEED_DATE, active: true },
  { id: 'bmc-vet-res',      name: 'BMC Veterinary Research',         type: 'RSS',     url: 'https://bmcvetres.biomedcentral.com/articles/rss.xml',        category: 'Research', addedAt: SEED_DATE, active: true },
  { id: 'wiley-vet-record', name: 'Wiley – Veterinary Record',       type: 'RSS',     url: 'https://onlinelibrary.wiley.com/feed/20427670/most-recent',   category: 'Research', addedAt: SEED_DATE, active: true },
  { id: 'frontiers-vet',    name: 'Frontiers – Veterinary Science',  type: 'RSS',     url: 'https://www.frontiersin.org/journals/veterinary-science/rss', category: 'Research', addedAt: SEED_DATE, active: true },

  // ━━ 🌾 AGRICULTURE & ONE HEALTH (6) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'hindu-agri',       name: 'The Hindu – Agriculture',         type: 'RSS',     url: 'https://www.thehindu.com/sci-tech/agriculture/feeder/default.rss', category: 'General', addedAt: SEED_DATE, active: true },
  { id: 'krishijagran',     name: 'Krishi Jagran',                   type: 'RSS',     url: 'https://krishijagran.com/feed/',                              category: 'General',  addedAt: SEED_DATE, active: true },
  { id: 'dte-agri',         name: 'Down To Earth – Agriculture',     type: 'RSS',     url: 'https://www.downtoearth.org.in/rss/agriculture',              category: 'General',  addedAt: SEED_DATE, active: true },
  { id: 'cidrap',           name: 'CIDRAP – One Health',             type: 'RSS',     url: 'https://www.cidrap.umn.edu/rss/all',                          category: 'Research', addedAt: SEED_DATE, active: true },
  { id: 'sciencedaily-vet', name: 'ScienceDaily – Animal Disease',   type: 'RSS',     url: 'https://www.sciencedaily.com/rss/health_medicine/animal_disease.xml', category: 'Research', addedAt: SEED_DATE, active: true },
  { id: 'who-news',         name: 'WHO News',                        type: 'RSS',     url: 'https://www.who.int/feeds/entity/news-english.xml',           category: 'Research', addedAt: SEED_DATE, active: true },

  // ━━ 🚀 STARTUPS (4) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'yourstory',        name: 'YourStory',                       type: 'RSS',     url: 'https://yourstory.com/feed',                                  category: 'Startup',  addedAt: SEED_DATE, active: true },
  { id: 'inc42',            name: 'Inc42',                           type: 'RSS',     url: 'https://inc42.com/feed/',                                     category: 'Startup',  addedAt: SEED_DATE, active: true },
  { id: 'tc-healthtech',    name: 'TechCrunch – HealthTech',         type: 'RSS',     url: 'https://techcrunch.com/tag/healthtech/feed/',                  category: 'Startup',  addedAt: SEED_DATE, active: true },
  { id: 'mint-companies',   name: 'LiveMint – Companies',            type: 'RSS',     url: 'https://www.livemint.com/rss/companies',                      category: 'Startup',  addedAt: SEED_DATE, active: true },

  // ━━ 💼 JOBS (7) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'icar-jobs',         name: 'ICAR',                           type: 'Website', url: 'https://icar.org.in/',                                        category: 'Jobs',     addedAt: SEED_DATE, active: true },
  { id: 'vci',               name: 'Veterinary Council of India',    type: 'Website', url: 'https://vci.dahd.nic.in/',                                    category: 'Jobs',     addedAt: SEED_DATE, active: true },
  { id: 'linkedin-jobs',    name: 'LinkedIn Jobs',                   type: 'Website', url: 'https://www.linkedin.com/jobs/',                               category: 'Jobs',     addedAt: SEED_DATE, active: true },
  { id: 'indeed-vet-rss',   name: 'Indeed – Vet Jobs',               type: 'RSS',     url: 'https://in.indeed.com/rss?q=veterinary',                       category: 'Jobs',     addedAt: SEED_DATE, active: true },
  { id: 'indeed-anisci',    name: 'Indeed – Animal Science',          type: 'RSS',     url: 'https://in.indeed.com/rss?q=animal+science',                   category: 'Jobs',     addedAt: SEED_DATE, active: true },
  { id: 'indeed-research',  name: 'Indeed – Research Assistant',      type: 'RSS',     url: 'https://in.indeed.com/rss?q=research+assistant+biology',       category: 'Jobs',     addedAt: SEED_DATE, active: true },

  // ━━ 🎓 COURSES (4) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'swayam',           name: 'SWAYAM',                          type: 'Website', url: 'https://swayam.gov.in/',                                      category: 'Courses',  addedAt: SEED_DATE, active: true },
  { id: 'coursera',         name: 'Coursera',                        type: 'Website', url: 'https://www.coursera.org/',                                    category: 'Courses',  addedAt: SEED_DATE, active: true },
  { id: 'class-central',    name: 'Class Central',                   type: 'RSS',     url: 'https://www.classcentral.com/report/feed/',                     category: 'Courses',  addedAt: SEED_DATE, active: true },
  { id: 'edx',              name: 'edX',                             type: 'RSS',     url: 'https://www.edx.org/rss',                                      category: 'Courses',  addedAt: SEED_DATE, active: true },

  // ━━ 📈 BUSINESS (3) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'finshots',          name: 'Finshots',                       type: 'RSS',     url: 'https://finshots.in/archive/rss.xml',                           category: 'Business', addedAt: SEED_DATE, active: true },
  { id: 'moneycontrol-biz', name: 'MoneyControl – Business',         type: 'RSS',     url: 'https://www.moneycontrol.com/rss/business.xml',                 category: 'Business', addedAt: SEED_DATE, active: true },
  { id: 'mint-market',      name: 'LiveMint – Markets',              type: 'RSS',     url: 'https://www.livemint.com/rss/market',                           category: 'Business', addedAt: SEED_DATE, active: true },

  // ━━ 🌐 GENERAL (1) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'auroville-now',    name: 'Auroville Now',                   type: 'Website', url: 'https://aurovillenow.in/en',                                   category: 'General',  addedAt: SEED_DATE, active: true },
];

/**
 * Merge saved localStorage sources with DEFAULT_SOURCES.
 * Adds any default source (by id) that doesn't already exist in saved list.
 * Never overwrites sources the user has added or modified.
 */
export function mergeWithDefaults(saved: FeedSource[]): FeedSource[] {
  const savedIds = new Set(saved.map((s) => s.id));
  const newDefaults = DEFAULT_SOURCES.filter((d) => !savedIds.has(d.id));
  return newDefaults.length > 0 ? [...saved, ...newDefaults] : saved;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim();
}

export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
