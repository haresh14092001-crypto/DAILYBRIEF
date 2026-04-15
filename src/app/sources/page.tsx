'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { FeedCategory, FeedSource, SourceType } from '@/lib/rssEngine';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus, Trash2, ToggleLeft, ToggleRight,
  Rss, Globe, Briefcase, BookOpen, Zap, TrendingUp, GraduationCap, BarChart2
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
  Veterinary: 'bg-emerald-50 text-emerald-700',
  Research:   'bg-blue-50 text-blue-700',
  Startup:    'bg-purple-50 text-purple-700',
  Jobs:       'bg-orange-50 text-orange-700',
  Courses:    'bg-cyan-50 text-cyan-700',
  Business:   'bg-rose-50 text-rose-700',
  General:    'bg-gray-50 text-gray-600',
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

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <header className="sticky top-0 z-20 bg-[#fafafa]/90 backdrop-blur-md border-b border-border/40 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Sources</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeCount}/{sources.length} active
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAdding(true)}
            className="rounded-full px-4 bg-[#065f46] hover:bg-[#064e3b] text-white h-9 shadow-md shadow-emerald-900/10"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Source
          </Button>
        </div>
      </header>

      <div className="flex-1 p-4 pb-28 space-y-3">

        {/* Add Source Form */}
        {isAdding && (
          <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-[15px] mb-1">New Source</h2>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="space-y-3">
              <Input
                placeholder="Source Name (e.g. PubMed Vet)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-xl border-border/60 focus-visible:ring-1 focus-visible:ring-emerald-500"
              />
              <Input
                placeholder="URL (https://...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-10 rounded-xl border-border/60 focus-visible:ring-1 focus-visible:ring-emerald-500 font-mono text-xs"
              />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Source Type</p>
              <div className="flex gap-2">
                {SOURCE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-xs font-semibold border transition-all',
                      type === t.value
                        ? 'bg-[#065f46] text-white border-transparent'
                        : 'bg-white text-muted-foreground border-border/50 hover:border-primary/30'
                    )}
                  >
                    {t.value === 'RSS' ? <Rss className="w-3.5 h-3.5 inline mr-1" /> : <Globe className="w-3.5 h-3.5 inline mr-1" />}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all',
                      category === cat.value
                        ? 'bg-[#065f46] text-white border-transparent'
                        : 'bg-white text-muted-foreground border-border/40 hover:border-primary/20'
                    )}
                  >
                    {CATEGORY_ICONS[cat.value]}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button onClick={handleAdd} className="flex-1 rounded-xl bg-[#065f46] hover:bg-[#064e3b] h-10 text-sm">
                Save Source
              </Button>
              <Button variant="outline" onClick={() => { setIsAdding(false); setError(''); }} className="rounded-xl h-10 text-sm">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Refresh after changes prompt */}
        {!isAdding && (
          <button
            onClick={handleSaveAndRefresh}
            className="w-full py-2.5 rounded-xl text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all"
          >
            🔄 Refresh feed with current sources
          </button>
        )}

        {/* Source cards */}
        {sources.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Rss className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No sources yet. Add your first RSS feed.</p>
          </div>
        )}

        {sources.map((source: FeedSource) => (
          <Card
            key={source.id}
            className={cn(
              'border shadow-sm rounded-2xl transition-all',
              source.active ? 'border-border/40' : 'border-border/20 opacity-60'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'mt-0.5 p-2 rounded-xl flex-shrink-0',
                  source.type === 'RSS' ? 'bg-orange-50' : 'bg-blue-50'
                )}>
                  {source.type === 'RSS'
                    ? <Rss className="w-4 h-4 text-orange-500" />
                    : <Globe className="w-4 h-4 text-blue-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-[14px] leading-tight truncate">{source.name}</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono truncate mb-2">{source.url}</p>
                  <Badge
                    variant="secondary"
                    className={cn('text-[9px] px-2 py-0.5 rounded-full font-bold', CATEGORY_COLORS[source.category])}
                  >
                    {source.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleSourceActive(source.id)}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      source.active ? 'text-emerald-600' : 'text-muted-foreground'
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
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Remove source"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
