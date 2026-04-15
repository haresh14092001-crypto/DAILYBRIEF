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
}

// ─── RSS Parser (client-side via DOMParser) ───────────────────────────────────
export async function fetchRSSFeed(source: FeedSource): Promise<FeedItem[]> {
  try {
    // Use a CORS proxy to avoid cross-origin issues in the browser
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const text: string = json.contents;

    if (!text) throw new Error('Empty response from proxy');

    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');

    // Handle both RSS <item> and Atom <entry>
    const items = [
      ...Array.from(xml.querySelectorAll('item')),
      ...Array.from(xml.querySelectorAll('entry')),
    ];

    return items.slice(0, 20).map((item, index) => {
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
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const text: string = json.contents;

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
      .slice(0, 10);

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
];

export function isNoisy(title: string): boolean {
  return NOISE_PATTERNS.some((p) => p.test(title));
}

export function filterNoisy(items: FeedItem[]): FeedItem[] {
  return items.filter((item) => !isNoisy(item.title) && item.title.length > 10);
}

// ─── Opportunity Detector ─────────────────────────────────────────────────────
const OPPORTUNITY_KEYWORDS = [
  'job', 'internship', 'fellowship', 'opening', 'hiring', 'vacancy',
  'apply', 'opportunity', 'position', 'recruitment', 'grant', 'scholarship',
  'research fellow', 'ph.d', 'phd', 'postdoc', 'residency', 'placement',
];

export function detectOpportunity(title: string, category: FeedCategory): boolean {
  if (category === 'Jobs') return true;
  const lower = title.toLowerCase();
  return OPPORTUNITY_KEYWORDS.some((kw) => lower.includes(kw));
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
  // ── Veterinary ──────────────────────────────────────────────────────────────
  { id: 'merck-vet',      name: 'Merck Veterinary Manual',      type: 'Website', url: 'https://www.merckvetmanual.com/',               category: 'Veterinary', addedAt: SEED_DATE, active: true },
  { id: 'vin',            name: 'Veterinary Information Network',type: 'Website', url: 'https://www.vin.com/',                           category: 'Veterinary', addedAt: SEED_DATE, active: true },
  { id: 'ivis',           name: 'IVIS',                          type: 'Website', url: 'https://www.ivis.org/',                          category: 'Veterinary', addedAt: SEED_DATE, active: true },
  { id: 'eclinpath',      name: 'eClinpath',                     type: 'Website', url: 'https://eclinpath.com/',                        category: 'Veterinary', addedAt: SEED_DATE, active: true },
  { id: 'vetstudy-notes', name: 'VetStudy Notes',                type: 'Website', url: 'https://vetstudy.journeywithasr.com/?m=1',      category: 'Veterinary', addedAt: SEED_DATE, active: true },

  // ── Research ────────────────────────────────────────────────────────────────
  { id: 'pubmed',         name: 'PubMed',                        type: 'Website', url: 'https://pubmed.ncbi.nlm.nih.gov/',             category: 'Research',   addedAt: SEED_DATE, active: true },
  { id: 'scholar',        name: 'Google Scholar',                type: 'Website', url: 'https://scholar.google.com/',                  category: 'Research',   addedAt: SEED_DATE, active: true },
  { id: 'cab-direct',     name: 'CAB Direct',                    type: 'Website', url: 'https://www.cabdirect.org/',                   category: 'Research',   addedAt: SEED_DATE, active: true },
  { id: 'ivri',           name: 'IVRI',                          type: 'Website', url: 'https://ivri.nic.in/',                         category: 'Research',   addedAt: SEED_DATE, active: true },
  { id: 'woah',           name: 'WOAH',                          type: 'Website', url: 'https://www.woah.org/',                        category: 'Research',   addedAt: SEED_DATE, active: true },
  { id: 'fao',            name: 'FAO',                           type: 'Website', url: 'https://www.fao.org/',                         category: 'Research',   addedAt: SEED_DATE, active: true },

  // ── Startups ─────────────────────────────────────────────────────────────────
  { id: 'yourstory',      name: 'YourStory',                     type: 'RSS',     url: 'https://yourstory.com/feed',                  category: 'Startup',    addedAt: SEED_DATE, active: true },
  { id: 'inc42',          name: 'Inc42',                         type: 'RSS',     url: 'https://inc42.com/feed/',                     category: 'Startup',    addedAt: SEED_DATE, active: true },

  // ── Jobs ─────────────────────────────────────────────────────────────────────
  { id: 'icar-jobs',      name: 'ICAR',                          type: 'Website', url: 'https://icar.org.in/',                        category: 'Jobs',       addedAt: SEED_DATE, active: true },
  { id: 'vci',            name: 'Veterinary Council of India',   type: 'Website', url: 'https://vci.dahd.nic.in/',                    category: 'Jobs',       addedAt: SEED_DATE, active: true },
  { id: 'indeed-vet',     name: 'Indeed – Veterinary Jobs',      type: 'Website', url: 'https://in.indeed.com/jobs?q=veterinary',     category: 'Jobs',       addedAt: SEED_DATE, active: true },
  { id: 'linkedin-jobs',  name: 'LinkedIn Jobs',                 type: 'Website', url: 'https://www.linkedin.com/jobs/',              category: 'Jobs',       addedAt: SEED_DATE, active: true },

  // ── Courses ──────────────────────────────────────────────────────────────────
  { id: 'swayam',         name: 'SWAYAM',                        type: 'Website', url: 'https://swayam.gov.in/',                      category: 'Courses',    addedAt: SEED_DATE, active: true },
  { id: 'coursera',       name: 'Coursera',                      type: 'Website', url: 'https://www.coursera.org/',                   category: 'Courses',    addedAt: SEED_DATE, active: true },

  // ── Business ─────────────────────────────────────────────────────────────────
  { id: 'finshots',       name: 'Finshots',                      type: 'RSS',     url: 'https://finshots.in/archive/rss.xml',         category: 'Business',   addedAt: SEED_DATE, active: true },

  // ── General ──────────────────────────────────────────────────────────────────
  { id: 'auroville-now',  name: 'Auroville Now',                 type: 'Website', url: 'https://aurovillenow.in/en',                  category: 'General',    addedAt: SEED_DATE, active: true },
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
