'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { FeedCategory, FeedSource, SourceType } from '@/lib/rssEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus, Trash2, ToggleLeft, ToggleRight,
  Rss, Globe, Briefcase, BookOpen, Zap, TrendingUp, GraduationCap, BarChart2, Newspaper
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES: { label: string; value: FeedCategory }[] = [
  { label: 'Veterinary', value: 'Veterinary' },
  { label: 'Research',   value: 'Research' },
  { label: 'Startup',    value: 'Startup' },
  { label: 'Jobs',       value: 'Jobs' },
  { label: 'Courses',    value: 'Courses' },
  { label: 'Business',   value: 'Business' },
  { label: 'General',    value: 'General' },
];

const SOURCE_TYPES: { label: string; value: SourceType }[] = [
  { label: 'RSS Feed', value: 'RSS' },
  { label: 'Website', value: 'Website' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Veterinary: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Research:   'bg-blue-50 text-blue-700 border-blue-100',
  Startup:    'bg-purple-50 text-purple-700 border-purple-100',
  Jobs:       'bg-orange-50 text-orange-700 border-orange-100',
  Courses:    'bg-cyan-50 text-cyan-700 border-cyan-100',
  Business:   'bg-rose-50 text-rose-700 border-rose-100',
  General:    'bg-gray-50 text-gray-600 border-gray-100',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Veterinary: <BookOpen className="w-3.5 h-3.5" />,
  Research:   <Zap className="w-3.5 h-3.5" />,
  Startup:    <TrendingUp className="w-3.5 h-3.5" />,
  Jobs:       <Briefcase className="w-3.5 h-3.5" />,
  Courses:    <GraduationCap className="w-3.5 h-3.5" />,
  Business:   <BarChart2 className="w-3.5 h-3.5" />,
  General:    <Globe className="w-3.5 h-3.5" />,
};

export default function SourcesPage() {
  const { sources, addSource, removeSource, toggleSourceActive, refreshFeed } = useUIStore();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<SourceType>('RSS');
  const [category, setCategory] = useState<FeedCategory>('General');
  const [error, setError] = useState('');

  const handleAdd = () => {
    setError('');
    if (!name.trim()) { setError('Source name is required.'); return; }
    if (!url.trim() || !url.startsWith('http')) { setError('Enter a valid URL starting with http(s).'); return; }

    addSource({ name: name.trim(), url: url.trim(), type, category });
    setName(''); setUrl(''); setType('RSS'); setCategory('General');
    setIsAdding(false);
  };

  const handleSaveAndRefresh = () => {
    setIsAdding(false);
    refreshFeed();
  };

  const activeCount = sources.filter((s) => s.active).length;
  const rssCount = sources.filter((s) => s.type === 'RSS').length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-20 glass border-b border-border/30 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
              Sources
            </h1>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-medium tracking-wide">
              {activeCount} active · {rssCount} RSS · {sources.length - rssCount} websites
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAdding(true)}
            className="rounded-full px-4 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white h-9 shadow-lg shadow-emerald-900/15 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Source
          </Button>
        </div>
      </header>

      <div className="flex-1 p-4 pb-28 max-w-2xl mx-auto w-full space-y-3">

        {/* Add Source Form */}
        {isAdding && (
          <div className="glass-card rounded-[18px] p-5 space-y-4 border-emerald-100">
            <h2 className="font-bold text-[15px] text-foreground">New Source</h2>

            {error && (
              <p className="text-xs text-red-600 bg-red-50/80 border border-red-100 rounded-[12px] px-3 py-2">
                {error}
              </p>
            )}

            <div className="space-y-3">
              <Input
                placeholder="Source Name (e.g. PubMed Vet)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-[12px] border-border/40 bg-white/80 focus-visible:ring-1 focus-visible:ring-emerald-500"
              />
              <Input
                placeholder="URL (https://...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-10 rounded-[12px] border-border/40 bg-white/80 focus-visible:ring-1 focus-visible:ring-emerald-500 font-mono text-xs"
              />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/60 mb-2">Source Type</p>
              <div className="flex gap-2">
                {SOURCE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={cn(
                      'flex-1 py-2 rounded-[12px] text-xs font-semibold border transition-all duration-200',
                      type === t.value
                        ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white border-transparent shadow-sm'
                        : 'bg-white/80 text-muted-foreground/70 border-border/30 hover:border-emerald-200'
                    )}
                  >
                    {t.value === 'RSS' ? <Rss className="w-3.5 h-3.5 inline mr-1" /> : <Globe className="w-3.5 h-3.5 inline mr-1" />}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/60 mb-2">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-[6px] rounded-full text-[11px] font-semibold border transition-all duration-200',
                      category === cat.value
                        ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white border-transparent shadow-sm'
                        : 'bg-white/80 text-muted-foreground/70 border-border/30 hover:border-emerald-200'
                    )}
                  >
                    {CATEGORY_ICONS[cat.value]}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button onClick={handleAdd} className="flex-1 rounded-[12px] bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 h-10 text-sm shadow-md shadow-emerald-900/15 transition-all duration-200">
                Save Source
              </Button>
              <Button variant="outline" onClick={() => { setIsAdding(false); setError(''); }} className="rounded-[12px] h-10 text-sm border-border/30 hover:bg-muted/30">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Refresh after changes prompt */}
        {!isAdding && (
          <button
            onClick={handleSaveAndRefresh}
            className="w-full py-2.5 rounded-[14px] text-[12px] font-semibold text-emerald-700 bg-emerald-50/60 border border-emerald-100/60 hover:bg-emerald-50 transition-all duration-200"
          >
            🔄 Refresh feed with current sources
          </button>
        )}

        {/* Empty state */}
        {sources.length === 0 && (
          <div className="text-center py-16 text-muted-foreground/50">
            <Rss className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No sources yet. Add your first RSS feed.</p>
          </div>
        )}

        {/* Source cards */}
        {sources.map((source: FeedSource) => (
          <div
            key={source.id}
            className={cn(
              'glass-card rounded-[16px] p-4 transition-all duration-200',
              source.active ? '' : 'opacity-40',
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'mt-0.5 p-2 rounded-[12px] flex-shrink-0 transition-colors',
                source.type === 'RSS' ? 'bg-orange-50/80' : 'bg-blue-50/80'
              )}>
                {source.type === 'RSS'
                  ? <Rss className="w-4 h-4 text-orange-500/70" />
                  : <Globe className="w-4 h-4 text-blue-500/70" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[14px] leading-tight truncate text-foreground mb-0.5">{source.name}</h3>
                <p className="text-[10px] text-muted-foreground/50 font-mono truncate mb-2">{source.url}</p>
                <Badge
                  variant="secondary"
                  className={cn('text-[9px] px-2 py-0.5 rounded-full font-bold border', CATEGORY_COLORS[source.category])}
                >
                  {source.category}
                </Badge>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={() => toggleSourceActive(source.id)}
                  className={cn(
                    'p-2 rounded-[10px] transition-all duration-200',
                    source.active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-muted-foreground/40 hover:bg-muted/30'
                  )}
                  title={source.active ? 'Disable source' : 'Enable source'}
                >
                  {source.active
                    ? <ToggleRight className="w-5 h-5" />
                    : <ToggleLeft className="w-5 h-5" />
                  }
                </button>
                <button
                  onClick={() => removeSource(source.id)}
                  className="p-2 rounded-[10px] text-muted-foreground/40 hover:text-red-500 hover:bg-red-50/60 transition-all duration-200"
                  title="Remove source"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
