import { create } from 'zustand';
import { supabase } from './supabase';

interface UIState {
  isQuickCaptureOpen: boolean;
  isSearchOpen: boolean;
  activeSubject: string | null;
  toggleQuickCapture: (open?: boolean) => void;
  toggleSearch: (open?: boolean) => void;
  setActiveSubject: (subject: string | null) => void;
  
  // Intelligence Data
  activities: any[];
  problems: any[];
  ideas: any[];
  posts: any[];
  notes: any[];
  
  // Cloud Actions
  fetchCloudData: () => Promise<void>;
  addActivity: (item: any) => Promise<void>;
  addProblem: (item: any) => Promise<void>;
  addIdea: (item: any) => Promise<void>;
  addPost: (item: any) => Promise<void>;
  updatePostStatus: (id: number | string) => Promise<void>;
  updatePostPerformance: (id: number | string, performance: string) => Promise<void>;
  addNote: (item: any) => Promise<void>;
}

export const useUIStore = create<UIState>((set, get) => ({
  isQuickCaptureOpen: false,
  isSearchOpen: false,
  activeSubject: null,
  activities: [],
  problems: [],
  ideas: [],
  posts: [],
  notes: [],

  toggleQuickCapture: (open) => set((state) => ({ isQuickCaptureOpen: open !== undefined ? open : !state.isQuickCaptureOpen })),
  toggleSearch: (open) => set((state) => ({ isSearchOpen: open !== undefined ? open : !state.isSearchOpen })),
  setActiveSubject: (subject) => set({ activeSubject: subject }),

  fetchCloudData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Parallel fetch for speed
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
      notes: nts.data || []
    });
  },

  addActivity: async (item) => {
    set((state) => ({ activities: [item, ...state.activities] }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('activities').insert({ ...item, user_id: user.id });
  },

  addProblem: async (item) => {
    set((state) => ({ problems: [item, ...state.problems] }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('startup_problems').insert({ ...item, user_id: user.id });
  },

  addIdea: async (item) => {
    set((state) => ({ ideas: [item, ...state.ideas] }));
    // Future implementation: sync ideas table
  },

  addPost: async (item) => {
    set((state) => ({ posts: [item, ...state.posts] }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('content_posts').insert({ ...item, user_id: user.id });
  },

  updatePostStatus: async (id) => {
    set((state) => ({
      posts: state.posts.map(p => p.id === id ? { ...p, status: p.status === 'Planned' ? 'Posted' : 'Planned' } : p)
    }));
    const newStatus = get().posts.find(p => p.id === id)?.status;
    await supabase.from('content_posts').update({ status: newStatus }).eq('id', id);
  },

  updatePostPerformance: async (id, performance) => {
    set((state) => ({
      posts: state.posts.map(p => p.id === id ? { ...p, performance } : p)
    }));
    await supabase.from('content_posts').update({ performance }).eq('id', id);
  },

  addNote: async (item) => {
    set((state) => ({ notes: [item, ...state.notes] }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('clinical_notes').insert({ ...item, user_id: user.id });
  },
}));
