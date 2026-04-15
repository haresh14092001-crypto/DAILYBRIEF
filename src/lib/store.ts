import { create } from 'zustand';
import { supabase } from './supabase';
import {
  FeedSource,
  FeedItem,
  FocusMode,
  FeedCategory,
  DEFAULT_SOURCES,
  aggregateAllSources,
  filterNoisy,
  applyFocusMode,
  mergeWithDefaults,
} from './rssEngine';

// ─── localStorage helpers ──────────────────────────────────────────────────────
const LS_SOURCES = 'vetdesk_sources';
const LS_FEED = 'vetdesk_feed';
const LS_SAVED = 'vetdesk_saved';
const LS_IGNORED = 'vetdesk_ignored';
const LS_PINNED = 'vetdesk_pinned';
const LS_PREFERENCES = 'vetdesk_preferences';

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; }
}
function saveJSON(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* noop */ }
}

// ─── User Preferences ────────────────────────────────────────────────────────
interface UserPreferences {
  keywords: string[];
  preferredCategories: FeedCategory[];
  enablePersonalization: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  keywords: [],
  preferredCategories: ['Veterinary', 'Research', 'Jobs', 'Startup'],
  enablePersonalization: true,
};

// ─── UI State ──────────────────────────────────────────────────────────────────
interface UIState {
  isQuickCaptureOpen: boolean;
  isSearchOpen: boolean;
  activeSubject: string | null;
  toggleQuickCapture: (open?: boolean) => void;
  toggleSearch: (open?: boolean) => void;
  setActiveSubject: (subject: string | null) => void;

  // ── Personal capture (Supabase) ────────────────────────────────────────────
  activities: any[];
  problems: any[];
  ideas: any[];
  posts: any[];
  notes: any[];

  fetchCloudData: () => Promise<void>;
  addActivity: (item: any) => Promise<void>;
  addProblem: (item: any) => Promise<void>;
  addIdea: (item: any) => Promise<void>;
  addPost: (item: any) => Promise<void>;
  updatePostStatus: (id: number | string) => Promise<void>;
  updatePostPerformance: (id: number | string, performance: string) => Promise<void>;
  addNote: (item: any) => Promise<void>;

  // ── RSS Intelligence Feed ──────────────────────────────────────────────────
  sources: FeedSource[];
  feedItems: FeedItem[];
  categoryFilter: FeedCategory | 'All';
  focusMode: FocusMode;
  isFeedLoading: boolean;
  lastRefreshed: string | null;
  userPreferences: UserPreferences;

  addSource: (source: Omit<FeedSource, 'id' | 'addedAt' | 'active'>) => void;
  removeSource: (id: string) => void;
  toggleSourceActive: (id: string) => void;
  setCategoryFilter: (cat: FeedCategory | 'All') => void;
  setFocusMode: (mode: FocusMode) => void;
  refreshFeed: () => Promise<void>;
  saveFeedItem: (id: string) => void;
  pinFeedItem: (id: string) => void;
  ignoreFeedItem: (id: string) => void;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;

  // Derived
  visibleFeedItems: () => FeedItem[];
}

export const useUIStore = create<UIState>((set, get) => ({
  // ── UI ─────────────────────────────────────────────────────────────────────
  isQuickCaptureOpen: false,
  isSearchOpen: false,
  activeSubject: null,
  activities: [],
  problems: [],
  ideas: [],
  posts: [],
  notes: [],

  toggleQuickCapture: (open) =>
    set((state) => ({ isQuickCaptureOpen: open !== undefined ? open : !state.isQuickCaptureOpen })),
  toggleSearch: (open) =>
    set((state) => ({ isSearchOpen: open !== undefined ? open : !state.isSearchOpen })),
  setActiveSubject: (subject) => set({ activeSubject: subject }),

  // ── Cloud (Supabase) ───────────────────────────────────────────────────────
  fetchCloudData: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [act, prob, pst, nts] = await Promise.all([
      supabase.from('activities').select('*').order('created_at', { ascending: false }),
      supabase.from('startup_problems').select('*').order('created_at', { ascending: false }),
      supabase.from('content_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('clinical_notes').select('*').order('created_at', { ascending: false }),
    ]);

    set({
      activities: act.data || [],
      problems: prob.data || [],
      posts: pst.data || [],
      notes: nts.data || [],
    });
  },

  addActivity: async (item) => {
    set((state) => ({ activities: [item, ...state.activities] }));
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) await supabase.from('activities').insert({ ...item, user_id: user.id });
  },

  addProblem: async (item) => {
    set((state) => ({ problems: [item, ...state.problems] }));
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) await supabase.from('startup_problems').insert({ ...item, user_id: user.id });
  },

  addIdea: async (item) => {
    set((state) => ({ ideas: [item, ...state.ideas] }));
  },

  addPost: async (item) => {
    set((state) => ({ posts: [item, ...state.posts] }));
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) await supabase.from('content_posts').insert({ ...item, user_id: user.id });
  },

  updatePostStatus: async (id) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === id ? { ...p, status: p.status === 'Planned' ? 'Posted' : 'Planned' } : p
      ),
    }));
    const newStatus = get().posts.find((p) => p.id === id)?.status;
    await supabase.from('content_posts').update({ status: newStatus }).eq('id', id);
  },

  updatePostPerformance: async (id, performance) => {
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, performance } : p)),
    }));
    await supabase.from('content_posts').update({ performance }).eq('id', id);
  },

  addNote: async (item) => {
    set((state) => ({ notes: [item, ...state.notes] }));
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) await supabase.from('clinical_notes').insert({ ...item, user_id: user.id });
  },

  // ── RSS Feed State ─────────────────────────────────────────────────────────
  // mergeWithDefaults adds any new default sources added since the user's last visit
  // without overwriting their existing or custom-added sources
  sources: mergeWithDefaults(loadJSON<FeedSource[]>(LS_SOURCES, DEFAULT_SOURCES)),
  feedItems: loadJSON<FeedItem[]>(LS_FEED, []),
  categoryFilter: 'All',
  focusMode: 'All',
  isFeedLoading: false,
  lastRefreshed: null,
  userPreferences: loadJSON<UserPreferences>(LS_PREFERENCES, DEFAULT_PREFERENCES),

  addSource: (source) => {
    const newSource: FeedSource = {
      ...source,
      id: `src-${Date.now()}`,
      addedAt: new Date().toISOString(),
      active: true,
    };
    set((state) => {
      const updated = [newSource, ...state.sources];
      saveJSON(LS_SOURCES, updated);
      return { sources: updated };
    });
  },

  removeSource: (id) => {
    set((state) => {
      const updated = state.sources.filter((s) => s.id !== id);
      saveJSON(LS_SOURCES, updated);
      return { sources: updated };
    });
  },

  toggleSourceActive: (id) => {
    set((state) => {
      const updated = state.sources.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s
      );
      saveJSON(LS_SOURCES, updated);
      return { sources: updated };
    });
  },

  setCategoryFilter: (cat) => set({ categoryFilter: cat }),
  setFocusMode: (mode) => set({ focusMode: mode }),

  updateUserPreferences: (prefs) => {
    set((state) => {
      const updated = { ...state.userPreferences, ...prefs };
      saveJSON(LS_PREFERENCES, updated);
      return { userPreferences: updated };
    });
  },

  refreshFeed: async () => {
    const { sources } = get();
    set({ isFeedLoading: true });
    try {
      // Load saved/pinned/ignored sets
      const savedIds = new Set<string>(loadJSON<string[]>(LS_SAVED, []));
      const pinnedIds = new Set<string>(loadJSON<string[]>(LS_PINNED, []));
      const ignoredIds = new Set<string>(loadJSON<string[]>(LS_IGNORED, []));

      const raw = await aggregateAllSources(sources);
      const clean = filterNoisy(raw).map((item) => ({
        ...item,
        isSaved: savedIds.has(item.id),
        isPinned: pinnedIds.has(item.id),
        isIgnored: ignoredIds.has(item.id),
      }));

      saveJSON(LS_FEED, clean);
      set({ feedItems: clean, lastRefreshed: new Date().toISOString(), isFeedLoading: false });
    } catch {
      set({ isFeedLoading: false });
    }
  },

  saveFeedItem: (id) => {
    set((state) => {
      const updated = state.feedItems.map((item) =>
        item.id === id ? { ...item, isSaved: !item.isSaved } : item
      );
      saveJSON(LS_FEED, updated);
      const savedIds = updated.filter((i) => i.isSaved).map((i) => i.id);
      saveJSON(LS_SAVED, savedIds);
      return { feedItems: updated };
    });
  },

  pinFeedItem: (id) => {
    set((state) => {
      const updated = state.feedItems.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      );
      saveJSON(LS_FEED, updated);
      const pinnedIds = updated.filter((i) => i.isPinned).map((i) => i.id);
      saveJSON(LS_PINNED, pinnedIds);
      return { feedItems: updated };
    });
  },

  ignoreFeedItem: (id) => {
    set((state) => {
      const updated = state.feedItems.map((item) =>
        item.id === id ? { ...item, isIgnored: true } : item
      );
      saveJSON(LS_FEED, updated);
      const ignoredIds = updated.filter((i) => i.isIgnored).map((i) => i.id);
      saveJSON(LS_IGNORED, ignoredIds);
      return { feedItems: updated };
    });
  },

  visibleFeedItems: () => {
    const { feedItems, categoryFilter, focusMode, userPreferences } = get();
    let items = feedItems.filter((i) => !i.isIgnored);

    // Focus mode filter
    items = applyFocusMode(items, focusMode);

    // Category filter
    if (categoryFilter !== 'All') {
      items = items.filter((i) => i.category === categoryFilter);
    }

    // Personalization scoring
    if (userPreferences.enablePersonalization) {
      items = items.map((item) => {
        let score = 0;
        const titleLower = item.title.toLowerCase();
        const descLower = (item.description || '').toLowerCase();

        // Keyword matching
        for (const keyword of userPreferences.keywords) {
          const kwLower = keyword.toLowerCase();
          if (titleLower.includes(kwLower) || descLower.includes(kwLower)) {
            score += 10;
          }
        }

        // Preferred categories
        if (userPreferences.preferredCategories.includes(item.category)) {
          score += 5;
        }

        // Opportunities get boost
        if (item.isOpportunity) {
          score += 15;
        }

        // Recent items
        const ageHours = (Date.now() - new Date(item.fetchedAt).getTime()) / (1000 * 60 * 60);
        if (ageHours < 24) score += 5;

        return { ...item, relevanceScore: score };
      }).sort((a, b) => {
        // Pinned first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Then by relevance score
        return (b.relevanceScore || 0) - (a.relevanceScore || 0);
      });
    } else {
      // Default sorting
      items = items.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        if (a.isOpportunity && !b.isOpportunity) return -1;
        if (!a.isOpportunity && b.isOpportunity) return 1;
        return 0;
      });
    }

    return items;
  },
}));
