'use client';

import { useEffect, useCallback } from 'react';
import { useUIStore } from '@/lib/store';
import { FeedCategory, FocusMode, formatRelativeTime } from '@/lib/rssEngine';
import {
  Bookmark, Pin, EyeOff, ExternalLink, RefreshCw,
  Briefcase, Search, Zap, BookOpen, TrendingUp, GraduationCap, Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Category config ───────────────────────────────────────────────────────────
const CATEGORIES: { label: string; value: FeedCategory | 'All'; icon: React.ReactNode }[] = [
  { label: 'All', value: 'All', icon: <Globe className="w-3 h-3" /> },
  { label: 'Vet', value: 'Veterinary', icon: <BookOpen className="w-3 h-3" /> },
  { label: 'Research', value: 'Research', icon: <Zap className="w-3 h-3" /> },
  { label: 'Startup', value: 'Startup', icon: <TrendingUp className="w-3 h-3" /> },
  { label: 'Jobs', value: 'Jobs', icon: <Briefcase className="w-3 h-3" /> },
  { label: 'Courses', value: 'Courses', icon: <GraduationCap className="w-3 h-3" /> },
];

const FOCUS_MODES: { label: string; value: FocusMode }[] = [
  { label: '🌐 All', value: 'All' },
  { label: '📖 Study', value: 'Study' },
  { label: '💼 Career', value: 'Career' },
  { label: '🚀 Startup', value: 'Startup' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Veterinary: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Research:   'bg-blue-50 text-blue-700 border-blue-100',
  Startup:    'bg-purple-50 text-purple-700 border-purple-100',
  Jobs:       'bg-orange-50 text-orange-700 border-orange-100',
  Courses:    'bg-cyan-50 text-cyan-700 border-cyan-100',
  General:    'bg-gray-50 text-gray-600 border-gray-100',
};

export default function FeedPage() {
  const {
    categoryFilter, setCategoryFilter,
    focusMode, setFocusMode,
    isFeedLoading, lastRefreshed,
    refreshFeed, saveFeedItem, pinFeedItem, ignoreFeedItem,
    visibleFeedItems, feedItems,
    toggleSearch,
  } = useUIStore();

  const items = visibleFeedItems();
  const hasItems = feedItems.length > 0;

  // Auto-load on first render if feed is empty
  useEffect(() => {
    if (feedItems.length === 0) {
      refreshFeed();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = useCallback(() => {
    refreshFeed();
  }, [refreshFeed]);

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-20 bg-[#fafafa]/90 backdrop-blur-md border-b border-border/40">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight leading-tight">Intelligence Feed</h1>
              {lastRefreshed && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Updated {formatRelativeTime(lastRefreshed)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost" size="icon"
                onClick={() => toggleSearch(true)}
                className="rounded-full h-9 w-9"
              >
                <Search className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost" size="icon"
                onClick={handleRefresh}
                disabled={isFeedLoading}
                className="rounded-full h-9 w-9"
              >
                <RefreshCw className={cn('w-4 h-4 text-muted-foreground', isFeedLoading && 'animate-spin')} />
              </Button>
            </div>
          </div>

          {/* Focus Mode Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 hide-scrollbar mb-2">
            {FOCUS_MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setFocusMode(m.value)}
                className={cn(
                  'flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all',
                  focusMode === m.value
                    ? 'bg-[#065f46] text-white border-transparent shadow-md'
                    : 'bg-white text-muted-foreground border-border/50 hover:border-primary/30'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full border transition-all',
                  categoryFilter === cat.value
                    ? 'bg-[#065f46] text-white border-transparent'
                    : 'bg-white text-muted-foreground border-border/40 hover:border-primary/20'
                )}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Feed Body ── */}
      <main className="flex-1 px-4 pb-28 pt-4 space-y-3">

        {/* Loading skeleton */}
        {isFeedLoading && (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-28 border border-border/40 shadow-sm" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isFeedLoading && !hasItems && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="font-semibold text-base mb-1">Feed is empty</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Add sources from the Sources page or tap refresh to load your intelligence feed.
            </p>
            <Button onClick={handleRefresh} className="rounded-full px-6 bg-[#065f46] hover:bg-[#064e3b]">
              <RefreshCw className="w-4 h-4 mr-2" /> Load Feed
            </Button>
          </div>
        )}

        {/* No results after filter */}
        {!isFeedLoading && hasItems && items.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No items match this filter.</p>
            <button onClick={() => { setCategoryFilter('All'); setFocusMode('All'); }} className="text-xs text-primary mt-2 underline underline-offset-2">
              Clear filters
            </button>
          </div>
        )}

        {/* Feed cards */}
        {!isFeedLoading && items.map((item) => {
          const catColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.General;

          return (
            <article
              key={item.id}
              className={cn(
                'group bg-white rounded-2xl border shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5',
                item.isPinned ? 'border-amber-200 shadow-amber-50' : 'border-border/40',
                item.isOpportunity ? 'border-l-4 border-l-orange-400' : '',
              )}
            >
              <div className="p-4">
                {/* Top row: badges + actions */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.isPinned && (
                      <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                        📌 Pinned
                      </span>
                    )}
                    {item.isOpportunity && (
                      <span className="text-[9px] font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100 animate-pulse">
                        🎯 Opportunity
                      </span>
                    )}
                    <span className={cn('text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border', catColor)}>
                      {item.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {formatRelativeTime(item.pubDate || item.fetchedAt)}
                  </span>
                </div>

                {/* Title */}
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link"
                >
                  <h2 className="font-semibold text-[14px] leading-snug text-foreground/90 mb-1 group-hover/link:text-emerald-700 transition-colors line-clamp-3">
                    {item.title}
                  </h2>
                </a>

                {/* Description */}
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {/* Footer: source + action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Globe className="w-2.5 h-2.5 text-emerald-600" />
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[140px]">
                      {item.sourceName}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => saveFeedItem(item.id)}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors',
                        item.isSaved ? 'text-emerald-600 bg-emerald-50' : 'text-muted-foreground hover:bg-muted/60'
                      )}
                      title={item.isSaved ? 'Unsave' : 'Save'}
                    >
                      <Bookmark className={cn('w-3.5 h-3.5', item.isSaved && 'fill-emerald-600')} />
                    </button>
                    <button
                      onClick={() => pinFeedItem(item.id)}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors',
                        item.isPinned ? 'text-amber-600 bg-amber-50' : 'text-muted-foreground hover:bg-muted/60'
                      )}
                      title={item.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className={cn('w-3.5 h-3.5', item.isPinned && 'fill-amber-500')} />
                    </button>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/60 transition-colors"
                      title="Open article"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => ignoreFeedItem(item.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Hide forever"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </main>
    </div>
  );
}
