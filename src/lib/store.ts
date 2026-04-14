import { create } from 'zustand';

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
  
  addActivity: (item: any) => void;
  addProblem: (item: any) => void;
  addIdea: (item: any) => void;
  addPost: (item: any) => void;
  updatePostStatus: (id: number) => void;
  updatePostPerformance: (id: number, performance: string) => void;
  addNote: (item: any) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isQuickCaptureOpen: false,
  isSearchOpen: false,
  activeSubject: null,
  activities: [],
  problems: [
    { id: 1, title: 'Rural emergency access', desc: 'Farmers have zero access to reliable paravets after 9 PM. Huge mortality rate in large animals due to delayed dystocia handling.', status: 'Validation Phase' }
  ],
  ideas: [],
  posts: [
    { id: 1, title: 'Mastitis Awareness Reel', type: 'Case Insights', status: 'Planned', performance: '' }
  ],
  notes: [],

  toggleQuickCapture: (open) => set((state) => ({ isQuickCaptureOpen: open !== undefined ? open : !state.isQuickCaptureOpen })),
  toggleSearch: (open) => set((state) => ({ isSearchOpen: open !== undefined ? open : !state.isSearchOpen })),
  setActiveSubject: (subject) => set({ activeSubject: subject }),

  addActivity: (item) => set((state) => ({ activities: [item, ...state.activities] })),
  addProblem: (item) => set((state) => ({ problems: [item, ...state.problems] })),
  addIdea: (item) => set((state) => ({ ideas: [item, ...state.ideas] })),
  addPost: (item) => set((state) => ({ posts: [item, ...state.posts] })),
  updatePostStatus: (id) => set((state) => ({
    posts: state.posts.map(p => p.id === id ? { ...p, status: p.status === 'Planned' ? 'Posted' : 'Planned' } : p)
  })),
  updatePostPerformance: (id, performance) => set((state) => ({
    posts: state.posts.map(p => p.id === id ? { ...p, performance } : p)
  })),
  addNote: (item) => set((state) => ({ notes: [item, ...state.notes] })),
}));
