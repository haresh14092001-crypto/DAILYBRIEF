'use client';

import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Link, Lightbulb, Briefcase, Bell, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/store';

export default function Home() {
  const [filter, setFilter] = useState<'All' | 'Note' | 'Link' | 'Idea' | 'Opportunity'>('All');
  const { toggleSearch, activities } = useUIStore();

  const filteredActivities = activities.filter(a => {
    if (filter === 'All') return true;
    return a.type === filter.toLowerCase();
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'link': return <Link className="w-4 h-4 text-indigo-500" />;
      case 'idea': return <Lightbulb className="w-4 h-4 text-emerald-500" />;
      case 'opportunity': return <Briefcase className="w-4 h-4 text-orange-500" />;
      case 'alert': return <Bell className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  /* 
  // CLOUD SYNC LOGIC (Ready for 8-hour refresh)
  useEffect(() => {
    const fetchActivities = async () => { ... };
    fetchActivities();
  }, [filter]); 
  */

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* Header Sticky Area */}
      <header className="sticky top-0 z-10 bg-[#fafafa]/80 backdrop-blur-md border-b border-border/40 px-4 py-3">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-semibold tracking-tight">Intelligence Core</h1>
          <Button variant="ghost" size="icon" onClick={() => toggleSearch(true)}>
            <Search className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none hide-scrollbar">
          {(['All', 'Note', 'Link', 'Idea', 'Opportunity'] as const).map(f => (
            <Badge
              key={f}
              variant={filter === f ? 'default' : 'secondary'}
              className="cursor-pointer rounded-full px-4 py-1.5 font-medium whitespace-nowrap shadow-sm border-0 transition-all border border-border/30"
              onClick={() => setFilter(f)}
            >
              {f}
            </Badge>
          ))}
        </div>
      </header>

      {/* Daily Focus Block */}
      <div className="p-4 pt-6">
        <h2 className="text-sm font-semibold tracking-wide text-primary/80 uppercase mb-3">Daily Focus</h2>
        <Card className="shadow-md shadow-primary/5 border-primary/20 bg-gradient-to-br from-white to-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="mt-1 bg-red-100 p-2 rounded-full">
              <Bell className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Review 5 missed ICAR MCQs</p>
              <p className="text-xs text-muted-foreground mt-1">Pharmacology & Toxicology · High Yield</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <div className="px-4 pb-24 space-y-4">
        {!filteredActivities?.length ? (
          <div className="text-center text-muted-foreground py-10 opacity-60">
            <p className="text-sm">No activity in this view. Capture a note, link, or idea to get started.</p>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <Card key={activity.id} className="shadow-sm border-border/40 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(activity.type)}
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{activity.type}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {new Date(activity.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'})}
                  </span>
                </div>
                
                <h3 className="font-semibold text-[15px] mb-1">{activity.title}</h3>
                
                {activity.content && (
                  <p className="text-sm text-foreground/80 line-clamp-3 mb-2 whitespace-pre-wrap">{activity.content}</p>
                )}
                
                {activity.url && (
                  <a href={activity.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mt-2">
                    <Link className="h-3 w-3" /> Visit Source
                  </a>
                )}
                
                {activity.tag && activity.tag !== 'Inbox' && (
                  <Badge variant="outline" className="mt-2 text-[10px] bg-secondary/50 text-secondary-foreground border-border/50">
                    {activity.tag}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
