'use client';

import { useUIStore } from '@/lib/store';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, X, BookOpen, Link, Lightbulb, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import MiniSearch from 'minisearch';
import { supabase } from '@/lib/supabase';

// We initialize minisearch
const miniSearch = new MiniSearch({
  fields: ['title', 'content', 'tag', 'url'], // fields to index for full-text search
  storeFields: ['id', 'title', 'content', 'type', 'url', 'created_at'], // fields to return with search results
});

export function SearchOverlay() {
  const { isSearchOpen, toggleSearch, activities, problems, ideas, posts } = useUIStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  // Load data into minisearch on open
  useEffect(() => {
    if (isSearchOpen) {
      // Aggregate everything for indexing
      const allData = [
        ...activities,
        ...problems.map(p => ({ ...p, type: 'problem' })),
        ...ideas.map(i => ({ ...i, title: i.local, content: i.strategy, type: 'idea' })),
        ...posts.map(post => ({ ...post, type: 'content' }))
      ];

      if (allData.length > 0) {
        miniSearch.removeAll();
        miniSearch.addAll(allData);
      }
    }
  }, [isSearchOpen, activities, problems, ideas, posts]);

  useEffect(() => {
    if (query.trim().length > 1) {
      const searchResults = miniSearch.search(query, { prefix: true, fuzzy: 0.2 });
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'link': return <Link className="w-4 h-4 text-indigo-500" />;
      case 'idea': return <Lightbulb className="w-4 h-4 text-emerald-500" />;
      case 'opportunity': return <Briefcase className="w-4 h-4 text-orange-500" />;
      default: return null;
    }
  };

  return (
    <Dialog open={isSearchOpen} onOpenChange={toggleSearch}>
      <DialogContent className="fixed inset-0 z-50 m-0 h-[100dvh] w-full max-w-md mx-auto rounded-none border-none bg-background p-0 sm:rounded-none">
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <DialogDescription className="sr-only">Search across notes, links, and ideas.</DialogDescription>
        
        <div className="flex flex-col h-full items-start w-full">
          {/* Header Search Input */}
          <div className="flex w-full items-center border-b border-border/40 px-4 py-4 bg-background">
            <SearchIcon className="h-5 w-5 text-muted-foreground mr-3" />
            <Input 
              autoFocus
              className="flex-1 border-0 bg-transparent px-0 text-lg shadow-none focus-visible:ring-0"
              placeholder="Search everything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={() => toggleSearch(false)} className="ml-3 p-2 bg-muted/50 rounded-full hover:bg-muted">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto w-full p-4 bg-muted/20">
            {query.length > 0 && results.length === 0 ? (
               <div className="text-center mt-10 text-muted-foreground">No matches found for "{query}"</div>
            ) : results.length > 0 ? (
               <div className="space-y-3">
                 {results.map((res: any) => (
                   <div key={res.id} className="p-3 bg-card rounded-xl border border-border/40 shadow-sm">
                     <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(res.type)}
                        <span className="text-xs font-semibold text-muted-foreground uppercase">{res.type}</span>
                     </div>
                     <h4 className="font-semibold text-[15px]">{res.title}</h4>
                     {res.content && <p className="text-sm text-foreground/70 truncate mt-1">{res.content}</p>}
                   </div>
                 ))}
               </div>
            ) : (
               <div className="text-center mt-10 text-muted-foreground text-sm opacity-60">
                 Start typing to search your OS
               </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
