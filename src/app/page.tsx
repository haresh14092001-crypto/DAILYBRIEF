'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useUIStore } from '@/lib/store';
import { FeedCategory, FocusMode, FeedItem, formatRelativeTime } from '@/lib/rssEngine';
import {
  Bookmark, Pin, EyeOff, ExternalLink, RefreshCw,
  Briefcase, Search, Zap, BookOpen, TrendingUp, GraduationCap,
  Globe, Sparkles, Filter, BarChart2, Newspaper, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Config ────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12; // items per "page" for infinite scroll

const CATEGORIES: { label: string; value: FeedCategory | 'All'; icon: React.ReactNode }[] = [
  { label: 'All',      value: 'All',        icon: <Globe className="w-3 h-3" /> },
  { label: 'Vet',      value: 'Veterinary', icon: <BookOpen className="w-3 h-3" /> },
  { label: 'Research', value: 'Research',   icon: <Zap className="w-3 h-3" /> },
  { label: 'Startup',  value: 'Startup',    icon: <TrendingUp className="w-3 h-3" /> },
  { label: 'Jobs',     value: 'Jobs',       icon: <Briefcase className="w-3 h-3" /> },
  { label: 'Courses',  value: 'Courses',    icon: <GraduationCap className="w-3 h-3" /> },
  { label: 'Business', value: 'Business',   icon: <BarChart2 className="w-3 h-3" /> },
  { label: 'General',  value: 'General',    icon: <Newspaper className="w-3 h-3" /> },
];

const FOCUS_MODES: { label: string; value: FocusMode }[] = [
  { label: '🌐 All',     value: 'All' },
  { label: '📖 Study',   value: 'Study' },
  { label: '💼 Career',  value: 'Career' },
  { label: '🚀 Startup', value: 'Startup' },
];

const CAT_STYLE: Record<string, { badge: string; dot: string }> = {
  Veterinary: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
  Research:   { badge: 'bg-blue-50 text-blue-700 border-blue-100',          dot: 'bg-blue-500' },
  Startup:    { badge: 'bg-violet-50 text-violet-700 border-violet-100',    dot: 'bg-violet-500' },
  Jobs:       { badge: 'bg-orange-50 text-orange-700 border-orange-100',    dot: 'bg-orange-500' },
  Courses:    { badge: 'bg-cyan-50 text-cyan-700 border-cyan-100',          dot: 'bg-cyan-500' },
  Business:   { badge: 'bg-rose-50 text-rose-700 border-rose-100',          dot: 'bg-rose-500' },
  General:    { badge: 'bg-gray-50 text-gray-500 border-gray-100',          dot: 'bg-gray-400' },
};

// ─── FeedCard component ───────────────────────────────────────────────────────
function FeedCard({
  item, index,
  onSave, onPin, onIgnore,
}: {
  item: FeedItem; index: number;
  onSave: (id: string) => void;
  onPin:  (id: string) => void;
  onIgnore: (id: string) => void;
}) {
  const style = CAT_STYLE[item.category] || CAT_STYLE.General;
  const isJob = item.category === 'Jobs' || item.isOpportunity;

  return (
    <article
      className={cn(
        'group relative rounded-[18px] transition-all duration-300 tap-scale',
        'glass-card hover:-translate-y-[2px] feed-card-enter',
        item.isPinned
          ? 'border-amber-200 ring-1 ring-amber-100 shadow-amber-900/5'
          : isJob
          ? 'border-l-[3px] border-l-orange-400'
          : '',
      )}
      style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
    >
      {/* Opportunity glow strip */}
      {isJob && (
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-orange-400 to-amber-400" />
      )}

      <div className="p-4">
        {/* ── Top Row ── */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.isPinned && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 uppercase tracking-wide bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                📌 Pinned
              </span>
            )}
            {item.isOpportunity && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-orange-700 uppercase tracking-wide bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100">
                <Sparkles className="w-2.5 h-2.5" /> Opportunity
              </span>
            )}
            {item.relevanceScore && item.relevanceScore > 15 && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-700 uppercase tracking-wide bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-100">
                <Star className="w-2.5 h-2.5" /> Relevant
              </span>
            )}
            <span className={cn('text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md border', style.badge)}>
              {item.category}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground/70 flex-shrink-0 tabular-nums">
            {formatRelativeTime(item.pubDate || item.fetchedAt)}
          </span>
        </div>

        {/* ── Title ── */}
        <a href={item.link} target="_blank" rel="noopener noreferrer">
          <h2 className="font-semibold text-[14px] leading-snug text-foreground/90 mb-1.5 line-clamp-3 hover:text-emerald-700 transition-colors">
            {item.title}
          </h2>
        </a>

        {/* ── Description ── */}
        {item.description && (
          <p className="text-[12px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border/20 mt-auto">
          {/* Source pill */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', style.dot)} />
            <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[130px]">
              {item.sourceName}
            </span>
          </div>

          {/* Action buttons — always visible on mobile, hover on desktop */}
          <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
            <ActionBtn
              onClick={() => onSave(item.id)}
              active={item.isSaved}
              activeClass="text-emerald-600 bg-emerald-50"
              title={item.isSaved ? 'Unsave' : 'Save'}
            >
              <Bookmark className={cn('w-3.5 h-3.5', item.isSaved && 'fill-emerald-600')} />
            </ActionBtn>
            <ActionBtn
              onClick={() => onPin(item.id)}
              active={item.isPinned}
              activeClass="text-amber-600 bg-amber-50"
              title={item.isPinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin className={cn('w-3.5 h-3.5', item.isPinned && 'fill-amber-500')} />
            </ActionBtn>
            <a
              href={item.link} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-[10px] text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <ActionBtn
              onClick={() => onIgnore(item.id)}
              active={false}
              activeClass=""
              title="Hide permanently"
              className="hover:bg-red-50 hover:text-red-500"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </ActionBtn>
          </div>
        </div>
      </div>
    </article>
  );
}

function ActionBtn({
  children, onClick, active, activeClass, title, className = '',
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  activeClass: string;
  title: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'p-2 rounded-[10px] transition-all duration-200',
        active ? activeClass : `text-muted-foreground/60 hover:bg-muted/50 hover:text-foreground ${className}`,
      )}
    >
      {children}
    </button>
  );
}

// ─── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="glass-card rounded-[18px] p-5 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex gap-2 mb-4">
        <div className="h-4 w-14 bg-emerald-50 rounded-full" />
        <div className="h-4 w-18 bg-muted rounded-full" />
      </div>
      <div className="space-y-2.5 mb-4">
        <div className="h-3.5 bg-muted/80 rounded-full w-full" />
        <div className="h-3.5 bg-muted/60 rounded-full w-4/5" />
        <div className="h-3.5 bg-muted/40 rounded-full w-3/5" />
      </div>
      <div className="h-3 bg-muted/30 rounded-full w-2/5" />
    </div>
  );
}

// ─── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ items }: { items: FeedItem[] }) {
  const total = items.length;
  const opps  = items.filter(i => i.isOpportunity).length;
  const saved  = items.filter(i => i.isSaved).length;
  const pinned = items.filter(i => i.isPinned).length;

  if (total === 0) return null;

  return (
    <div className="flex items-center gap-2.5 px-1 mb-4 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.08em] overflow-x-auto hide-scrollbar">
      <span className="tabular-nums">{total} items</span>
      {opps > 0 && <span className="text-orange-500/80 tabular-nums">🎯 {opps} opp{opps > 1 ? 's' : ''}</span>}
      {saved > 0 && <span className="text-emerald-600/80 tabular-nums">🔖 {saved} saved</span>}
      {pinned > 0 && <span className="text-amber-500/80 tabular-nums">📌 {pinned} pinned</span>}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FeedPage() {
  const {
    categoryFilter, setCategoryFilter,
    focusMode, setFocusMode,
    isFeedLoading, lastRefreshed,
    refreshFeed, saveFeedItem, pinFeedItem, ignoreFeedItem,
    visibleFeedItems, feedItems,
    toggleSearch,
  } = useUIStore();

  const allVisible = visibleFeedItems();
  const hasItems = feedItems.length > 0;

  // ── Infinite scroll state ──────────────────────────────────────────────────
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Reset pagination whenever the filtered list changes
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [categoryFilter, focusMode, feedItems.length]);

  // Set up IntersectionObserver for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, allVisible.length + PAGE_SIZE));
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [allVisible.length]);

  // Auto-load on first open
  useEffect(() => {
    if (feedItems.length === 0) refreshFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayedItems = allVisible.slice(0, displayCount);
  const hasMore = displayCount < allVisible.length;

  const handleRefresh = useCallback(() => {
    setDisplayCount(PAGE_SIZE);
    refreshFeed();
  }, [refreshFeed]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 glass border-b border-border/30">
        <div className="px-4 pt-4 pb-3 max-w-2xl mx-auto">

          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-tight leading-tight bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
                Intelligence Feed
              </h1>
              {lastRefreshed && (
                <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-medium tracking-wide">
                  Updated {formatRelativeTime(lastRefreshed)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => toggleSearch(true)}
                className="h-9 w-9 rounded-[12px] flex items-center justify-center text-muted-foreground/60 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>
              <button
                onClick={handleRefresh}
                disabled={isFeedLoading}
                className="h-9 w-9 rounded-[12px] flex items-center justify-center text-muted-foreground/60 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 disabled:opacity-40"
              >
                <RefreshCw className={cn('w-[18px] h-[18px]', isFeedLoading && 'animate-spin')} />
              </button>
            </div>
          </div>

          {/* Focus Mode toggle */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 hide-scrollbar">
            {FOCUS_MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setFocusMode(m.value)}
                className={cn(
                  'flex-shrink-0 text-[11px] font-semibold px-3.5 py-[6px] rounded-full border transition-all duration-200',
                  focusMode === m.value
                    ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white border-transparent shadow-lg shadow-emerald-900/20'
                    : 'bg-white/80 text-muted-foreground/80 border-border/30 hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50/50',
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 text-[11px] font-semibold px-3 py-[6px] rounded-full border transition-all duration-200',
                  categoryFilter === cat.value
                    ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white border-transparent shadow-sm shadow-emerald-900/15'
                    : 'bg-white/80 text-muted-foreground/70 border-border/30 hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50/50',
                )}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Feed Body ──────────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 pb-28 pt-4 max-w-2xl mx-auto w-full">

        {/* Loading skeletons */}
        {isFeedLoading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} delay={i * 80} />
            ))}
          </div>
        )}

        {/* Empty — no sources fetched yet */}
        {!isFeedLoading && !hasItems && (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/10">
                <Globe className="w-9 h-9 text-emerald-600" />
              </div>
            </div>
            <h2 className="font-extrabold text-lg mb-2 text-foreground">Feed is empty</h2>
            <p className="text-sm text-muted-foreground/70 mb-7 max-w-[260px] leading-relaxed">
              Add RSS sources on the Sources tab, then tap refresh to load your intelligence feed.
            </p>
            <Button
              onClick={handleRefresh}
              className="rounded-full px-7 h-11 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 shadow-lg shadow-emerald-900/25 font-semibold transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Fetch Now
            </Button>
          </div>
        )}

        {/* No results after filter */}
        {!isFeedLoading && hasItems && allVisible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-14 h-14 bg-muted/60 rounded-[16px] flex items-center justify-center mb-4">
              <Filter className="w-6 h-6 text-muted-foreground/60" />
            </div>
            <p className="font-semibold text-sm mb-1 text-foreground">No items match this filter</p>
            <p className="text-xs text-muted-foreground/70 mb-5">Try switching to a different focus mode or category</p>
            <button
              onClick={() => { setCategoryFilter('All'); setFocusMode('All'); }}
              className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 underline underline-offset-4 decoration-emerald-300 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Live feed */}
        {!isFeedLoading && displayedItems.length > 0 && (
          <div className="space-y-3">
            <StatsBar items={allVisible} />

            {displayedItems.map((item, index) => (
              <FeedCard
                key={item.id}
                item={item}
                index={index}
                onSave={saveFeedItem}
                onPin={pinFeedItem}
                onIgnore={ignoreFeedItem}
              />
            ))}

            {/* ── Infinite scroll sentinel ── */}
            <div ref={sentinelRef} className="h-4" />

            {/* Loading more indicator */}
            {hasMore && (
              <div className="flex justify-center py-5">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60 font-medium">
                  <div className="w-3.5 h-3.5 border-2 border-muted border-t-emerald-500 rounded-full animate-spin" />
                  Loading more…
                </div>
              </div>
            )}

            {/* End of feed */}
            {!hasMore && allVisible.length > PAGE_SIZE && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-[11px] text-muted-foreground/60 font-medium glass-card rounded-full px-5 py-2.5">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  You&apos;re all caught up · {allVisible.length} items
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
