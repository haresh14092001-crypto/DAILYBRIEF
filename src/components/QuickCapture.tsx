'use client';

import { useUIStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

export function QuickCapture() {
  const { isQuickCaptureOpen, toggleQuickCapture, addActivity } = useUIStore();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Note' | 'Link' | 'Idea' | 'Opportunity'>('Note');
  const [isSaving, setIsSaving] = useState(false);

  // Simple auto-detect if the user pastes a link
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    
    if (val.startsWith('http') && !val.includes(' ') && category === 'Note') {
      setCategory('Link');
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);

    const isUrl = content.trim().startsWith('http');
    
    // OFFLINE MODE: Save to Global Zustand Store
    addActivity({
      id: Date.now(),
      type: category.toLowerCase(),
      title: isUrl ? 'Saved Link' : 'Quick Note',
      content: content,
      url: isUrl ? content.trim() : null,
      tag: 'Inbox',
      created_at: new Date().toISOString()
    });

    /* 
    // CLOUD MODE (Ready for Supabase)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.activities.insert({ ... });
      }
    } catch (err) { console.error(err); } 
    */

    setContent('');
    setIsSaving(false);
    toggleQuickCapture(false);
  };

  return (
    <Dialog open={isQuickCaptureOpen} onOpenChange={toggleQuickCapture}>
      <DialogContent className="sm:max-w-md w-[92vw] rounded-[24px] mx-auto top-[15%] translate-y-0 translate-x-[-50%] p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6 bg-card">
           <DialogHeader className="mb-4">
             <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">Capture</DialogTitle>
             <DialogDescription className="sr-only">Add a new note, link, idea, or opportunity.</DialogDescription>
           </DialogHeader>
           
           <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none hide-scrollbar">
             {(['Note', 'Link', 'Idea', 'Opportunity'] as const).map(c => (
               <Badge 
                 key={c}
                 variant={category === c ? 'default' : 'secondary'}
                 className="cursor-pointer rounded-full px-4 py-1.5 flex-shrink-0 font-medium transition-all"
                 onClick={() => setCategory(c)}
               >
                 {c}
               </Badge>
             ))}
           </div>
           
           <Textarea 
             autoFocus
             placeholder={`Type your ${category.toLowerCase()}...`}
             className="min-h-[140px] resize-none border-none shadow-none focus-visible:ring-0 px-0 bg-transparent text-lg placeholder:text-muted-foreground/60"
             value={content}
             onChange={handleContentChange}
           />
           
           <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border/40">
             <Button variant="ghost" className="rounded-full px-5 text-muted-foreground" onClick={() => toggleQuickCapture(false)}>Cancel</Button>
             <Button className="rounded-full px-6 shadow-md shadow-primary/20 bg-primary hover:bg-primary/90" onClick={handleSave} disabled={!content.trim()}>Save Item</Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
