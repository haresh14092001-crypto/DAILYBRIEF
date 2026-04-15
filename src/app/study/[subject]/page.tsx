'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, FileText, Plus, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useUIStore } from '@/lib/store';

import { PdfExtractor } from '@/components/PdfExtractor';


export default function SubjectDetail() {
  const params = useParams();
  const router = useRouter();
  const subjectSlug = params.subject as string;
  
  const { notes, addNote } = useUIStore();
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isImportingPdf, setIsImportingPdf] = useState(false);

  // Re-format slug to title
  const title = typeof subjectSlug === 'string' ? subjectSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace('And', '&') : '';

  // Filter notes for this specific subject
  const subjectNotes = notes.filter((n: any) => n.subject === title);

  const handleAddNote = () => {
    if (!newNoteTitle || !newNoteContent) return;
    addNote({ 
      id: Date.now(), 
      subject: title, 
      title: newNoteTitle, 
      content: newNoteContent 
    });
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <header className="sticky top-0 z-10 bg-[#fafafa]/90 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full shrink-0">
           <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight truncate flex-1">{title}</h1>
      </header>

      <div className="flex-1 p-4 pb-24">
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 rounded-full overflow-hidden p-1 shadow-inner">
            <TabsTrigger value="notes" className="rounded-full text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">Notes</TabsTrigger>
            <TabsTrigger value="pdfs" className="rounded-full text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">PDFs</TabsTrigger>
            <TabsTrigger value="icar" className="rounded-full text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">MCQs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notes" className="space-y-4 outline-none">
             <div className="flex justify-between items-center px-1 mb-2">
               <h3 className="font-bold text-sm tracking-tight text-foreground/80">Revision Notes</h3>
               <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsImportingPdf(true)}
                  className="h-7 text-[10px] rounded-full px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold"
                >
                  + Import from Textbook
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAddingNote(true)}
                  className="h-7 text-[10px] rounded-full px-3 bg-white border border-border/40 text-foreground/70 font-bold"
                >
                  + New Note
                </Button>
               </div>
             </div>

             {isImportingPdf && (
               <PdfExtractor 
                subject={title} 
                onClose={() => setIsImportingPdf(false)} 
               />
             )}

             {isAddingNote && (
               <Card className="p-4 space-y-3">
                 <input 
                  placeholder="Note Title" 
                  className="w-full bg-transparent font-bold outline-none" 
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                 />
                 <textarea 
                  placeholder="Start typing..." 
                  className="w-full bg-transparent text-sm outline-none min-h-[100px]"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                 />
                 <div className="flex gap-2">
                   <Button size="sm" onClick={handleAddNote}>Save</Button>
                   <Button size="sm" variant="ghost" onClick={() => setIsAddingNote(false)}>Cancel</Button>
                 </div>
               </Card>
             )}

             {subjectNotes.map((note: any) => (
               <Card key={note.id} className="shadow-sm border-border/40 hover:shadow-md transition-all cursor-pointer">
                 <CardContent className="p-4">
                   <h3 className="font-semibold text-sm mb-1 line-clamp-1">{note.title}</h3>
                   <p className="text-xs text-muted-foreground line-clamp-2">{note.content}</p>
                 </CardContent>
               </Card>
             ))}
          </TabsContent>

          <TabsContent value="pdfs" className="space-y-4 outline-none">
             <Button variant="outline" className="w-full border-dashed border-2 py-8 text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/30 rounded-xl transition-all">
               <FileText className="w-5 h-5 mr-2" /> Upload PDF Material
             </Button>
          </TabsContent>

          <TabsContent value="icar" className="space-y-4 outline-none">
             <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-none">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <BrainCircuit className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-[15px] text-foreground mb-1">ICAR Revision Mode</h3>
                  <p className="text-[11px] text-muted-foreground/80 mb-5 leading-relaxed px-4">Track highly repeated questions and master {title} concepts rapidly.</p>
                  <Button size="sm" className="rounded-full bg-primary px-6 shadow-md shadow-primary/20 hover:scale-105 transition-all">Start Session</Button>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
