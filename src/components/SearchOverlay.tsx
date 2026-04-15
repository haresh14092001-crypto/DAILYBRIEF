'use client';

import { useUIStore } from '@/lib/store';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Search as SearchIcon, X, BookOpen, Link2, Lightbulb, Briefcase, Rss, FileText } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

type SearchResult = {
  id: string | number;
  type: 'feed' | 'note' | 'link' | 'idea' | 'problem' | 'post';
  title: string;
  subtitle?: string;
  url?: string;
};

export function SearchOverlay() {
  const {
    isSearchOpen, toggleSearch,
    activities, problems, ideas, posts, notes,
    feedItems,
  } = useUIStore();
  const [query, setQuery] = useState('');

  // Build unified search index on every render (memoized by deps)
  const allItems: SearchResult[] = useMemo(() => [
    // RSS feed items
    ...feedItems.map(f => ({
      id: f.id,
      type: 'feed' as const,
      title: f.title,
      subtitle: f.sourceName,
      url: f.link,
    })),
    // Clinical notes
    ...notes.map((n: any) => ({
      id: n.id,
      type: 'note' as const,
      title: n.title,
      subtitle: n.subject || n.content?.slice(0, 60),
    })),
    // Startup problems
    ...problems.map((p: any) => ({
      id: p.id,
      type: 'problem' as const,
      title: p.title,
      subtitle: p.description?.slice(0, 80),
    })),
    // Idea mapper
    ...ideas.map((i: any, idx: number) => ({
      id: `idea-${idx}`,
      type: 'idea' as const,
      title: i.local,
      subtitle: `↳ ${i.global}`,
    })),
    // Content posts
    ...posts.map((p: any) => ({
      id: p.id,
      type: 'post' as const,
      title: p.title,
      subtitle: `${p.type} · ${p.status}`,
    })),
    // Activities
    ...activities.map((a: any) => ({
      id: a.id,
      type: 'link' as const,
      title: a.title,
      subtitle: a.content?.slice(0, 60),
      url: a.url,
    })),
  ], [feedItems, notes, problems, ideas, posts, activities]);

  // Simple fuzzy filter — no external library needed
  const results = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return allItems.filter(
      item =>
        item.title?.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [query, allItems]);

  const TYPE_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    feed:    { icon: <Rss className="w-3.5 h-3.5" />,      label: 'Feed',    color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    note:    { icon: <BookOpen className="w-3.5 h-3.5" />,  label: 'Note',    color: 'text-blue-600 bg-blue-50 border-blue-100' },
    link:    { icon: <Link2 className="w-3.5 h-3.5" />,     label: 'Link',    color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    idea:    { icon: <Lightbulb className="w-3.5 h-3.5" />, label: 'Idea',    color: 'text-amber-600 bg-amber-50 border-amber-100' },
    problem: { icon: <FileText className="w-3.5 h-3.5" />,  label: 'Problem', color: 'text-red-600 bg-red-50 border-red-100' },
    post:    { icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Content', color: 'text-pink-600 bg-pink-50 border-pink-100' },
  };

  const grouped = useMemo(() => {
    const map: Record<string, SearchResult[]> = {};
    for (const item of results) {
      if (!map[item.type]) map[item.type] = [];
      map[item.type].push(item);
    }
    return map;
  }, [results]);

  const handleClose = () => { toggleSearch(false); setQuery(''); };

  return (
    <Dialog open={isSearchOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="fixed inset-0 z-50 m-0 h-[100dvh] w-full max-w-md mx-auto rounded-none border-none bg-background p-0 sm:rounded-none">
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <DialogDescription className="sr-only">Search across feed, notes, ideas, and more.</DialogDescription>

        <div className="flex flex-col h-full">
          {/* Search header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border/30 bg-white/90 backdrop-blur-xl">
            <SearchIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <input
              autoFocus
              className="flex-1 bg-transparent text-[16px] outline-none placeholder:text-muted-foreground/40 font-medium"
              placeholder="Search everything…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-full hover:bg-muted/50 text-muted-foreground/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-[10px] hover:bg-muted/50 text-muted-foreground/60 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {/* Empty state */}
            {query.trim().length < 2 && (
              <div className="text-center py-16 px-6">
                <div className="w-14 h-14 rounded-[16px] bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-6 h-6 text-emerald-600/70" />
                </div>
                <p className="font-semibold text-sm text-foreground/60 mb-1">Search your entire OS</p>
                <p className="text-[11px] text-muted-foreground/50 max-w-[200px] mx-auto leading-relaxed">
                  Feed articles, notes, ideas, startup problems, content posts
                </p>
                {/* Stats */}
                <div className="mt-6 flex justify-center gap-4 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.08em]">
                  <span>{feedItems.length} feed</span>
                  <span>{notes.length} notes</span>
                  <span>{problems.length} problems</span>
                </div>
              </div>
            )}

            {/* No results */}
            {query.trim().length >= 2 && results.length === 0 && (
              <div className="text-center py-16 px-6">
                <p className="font-semibold text-sm text-foreground/50 mb-1">No results for "{query}"</p>
                <p className="text-[11px] text-muted-foreground/40">Try a different keyword</p>
              </div>
            )}

            {/* Grouped results */}
            {results.length > 0 && (
              <div className="p-4 space-y-5">
                {Object.entries(grouped).map(([type, items]) => {
                  const meta = TYPE_META[type];
                  return (
                    <div key={type}>
                      {/* Group header */}
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className={cn('flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded-full border', meta.color)}>
                          {meta.icon} {meta.label}
                        </span>
                        <span className="text-[9px] text-muted-foreground/40 font-semibold">{items.length} result{items.length !== 1 ? 's' : ''}</span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {items.map(item => {
                          const content = (
                            <div className="glass-card rounded-[14px] p-3.5 text-left w-full transition-all hover:shadow-md active:scale-[0.99]">
                              <p className="font-semibold text-[13px] text-foreground/90 leading-snug line-clamp-2">{item.title}</p>
                              {item.subtitle && (
                                <p className="text-[11px] text-muted-foreground/60 mt-0.5 line-clamp-1">{item.subtitle}</p>
                              )}
                            </div>
                          );

                          if (item.url) {
                            return (
                              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" onClick={handleClose}>
                                {content}
                              </a>
                            );
                          }
                          return <div key={item.id}>{content}</div>;
                        })}
                      </div>
                    </div>
                  );
                })}

                <p className="text-center text-[10px] text-muted-foreground/40 py-4">
                  {results.length} result{results.length !== 1 ? 's' : ''} across your OS
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
