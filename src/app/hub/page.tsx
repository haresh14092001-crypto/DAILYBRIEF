'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, FolderArchive, ArrowDownToLine, ArrowUpFromLine, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Hub() {
  const { posts, addPost, updatePostStatus } = useUIStore();
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostType, setNewPostType] = useState('Study Snippet');
  const [isAddingPost, setIsAddingPost] = useState(false);

  const handleAddPost = () => {
    if (!newPostTitle) return;
    addPost({ id: Date.now(), title: newPostTitle, type: newPostType, status: 'Planned' });
    setNewPostTitle('');
    setIsAddingPost(false);
  };

  const toggleStatus = (id: number) => {
    updatePostStatus(id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <header className="sticky top-0 z-10 bg-[#fafafa]/80 backdrop-blur-md border-b border-border/40 px-4 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Hub <span className="text-sm font-normal text-muted-foreground ml-2">Resources & Settings</span></h1>
      </header>

      <div className="flex-1 p-4 pb-24">
        <Tabs defaultValue="opportunities" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 rounded-full p-1 overflow-x-auto justify-start sm:justify-center shadow-inner">
            <TabsTrigger value="opportunities" className="rounded-full text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Tracking</TabsTrigger>
            <TabsTrigger value="resources" className="rounded-full text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Resources</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="opportunities" className="space-y-4 outline-none">
             {/* Opportunities Tracker (Kanban) */}
             <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
                <div className="min-w-[85%] sm:min-w-[70%] xl:min-w-0 xl:flex-1 shrink-0 snap-center">
                  <div className="bg-muted/30 rounded-3xl p-4 border border-border/50 h-full">
                    <div className="flex justify-between items-center mb-4 px-1">
                      <h3 className="font-bold text-[13px] text-foreground/80 uppercase tracking-widest">Job Tracker</h3>
                    </div>
                    <Card className="shadow-sm border-border/40 rounded-2xl">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-[14px]">IVRI Research Fellow</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 tracking-tight italic">Drafting application...</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
             </div>

             {/* Maatu Doctor Section */}
             <div className="flex justify-between items-center px-1 mt-4 mb-2">
               <h2 className="font-bold text-sm flex items-center gap-2 tracking-tight">
                  <Video className="w-4 h-4 text-pink-600" /> மாட்டு டாக்டர் Pipeline
               </h2>
               <Button variant="ghost" size="sm" onClick={() => setIsAddingPost(true)} className="h-7 text-[10px] rounded-full px-3 bg-pink-50 text-pink-700 hover:bg-pink-100 italic font-bold">
                 + Create Post Idea
               </Button>
             </div>

             {isAddingPost && (
               <Card className="p-4 mb-4 border-pink-100 bg-pink-50/20">
                 <input 
                  autoFocus
                  placeholder="Content Title (e.g. MCQ of the day)" 
                  className="w-full bg-transparent font-bold outline-none text-sm mb-2"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                 />
                 <div className="flex gap-2 mb-3">
                   {['ICAR MCQ', 'Case Insights', 'Study Snippet', 'Agadham'].map(t => (
                     <Badge 
                      key={t} 
                      variant={newPostType === t ? 'default' : 'outline'}
                      className="cursor-pointer text-[9px] rounded-full"
                      onClick={() => setNewPostType(t)}
                     >
                       {t}
                     </Badge>
                   ))}
                 </div>
                 <div className="flex gap-2">
                   <Button size="sm" onClick={addPost} className="bg-pink-600 hover:bg-pink-700 h-8 text-xs">Save Idea</Button>
                   <Button size="sm" variant="ghost" onClick={() => setIsAddingPost(false)} className="h-8 text-xs">Cancel</Button>
                 </div>
               </Card>
             )}
             
             <div className="space-y-3">
               {posts.map(post => {
                 const isIngested = post.id >= 200 && post.id < 300; // IDs from our engine
                 return (
                   <Card key={post.id} className="shadow-sm border-border/40 rounded-[20px] bg-white group overflow-hidden transition-all hover:border-pink-200">
                     <CardContent className="p-4 relative">
                       {isIngested && (
                         <div className="absolute top-0 right-0 bg-pink-600 text-white text-[7px] font-bold px-2 py-0.5 uppercase tracking-tighter">
                            AI Ingested
                         </div>
                       )}
                       
                       <div className="flex justify-between items-center">
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-[9px] font-bold text-pink-600 uppercase tracking-tighter">{post.type}</span>
                             <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${post.status === 'Posted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                               {post.status}
                             </span>
                           </div>
                           <h4 className="font-semibold text-[14px] text-foreground/90">{post.title}</h4>
                         </div>
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleStatus(post.id)}
                          className={`rounded-full h-9 w-9 transition-all border border-border/20 ${post.status === 'Posted' ? 'text-green-600 bg-green-50 border-green-100' : 'text-muted-foreground bg-muted/30'}`}
                         >
                           {post.status === 'Posted' ? '✓' : '🚀'}
                         </Button>
                       </div>
                       
                       {post.status === 'Posted' ? (
                         <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                           <input 
                            placeholder="Enter stats (e.g. 5k views)" 
                            className="bg-transparent text-[11px] outline-none placeholder:text-muted-foreground italic w-full"
                            value={post.performance || ''}
                            onChange={(e) => updatePostPerformance(post.id, e.target.value)}
                           />
                           {post.performance && (
                             <div className="flex items-center gap-1">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                               <span className="text-[9px] font-bold text-emerald-700 uppercase">Live Index</span>
                             </div>
                           )}
                         </div>
                       ) : (
                         <div className="mt-3 flex items-center gap-2">
                            <div className="h-1 bg-pink-100 flex-1 rounded-full overflow-hidden">
                               <div className="h-full bg-pink-500 w-[60%]" />
                            </div>
                            <span className="text-[8px] font-bold text-pink-600 uppercase whitespace-nowrap">High Growth Potential</span>
                         </div>
                       )}
                     </CardContent>
                   </Card>
                 );
               })}
             </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4 outline-none">
             <div className="grid grid-cols-2 gap-3">
               {['Veterinary', 'Research', 'AI Tools', 'Business Strategy', 'Templates'].map(cat => (
                 <Card key={cat} className="shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-border/40 hover:shadow-md cursor-pointer rounded-[20px] transition-all hover:border-primary/30 active:scale-[0.98]">
                   <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
                     <div className="p-3 bg-primary/5 rounded-full">
                        <FolderArchive className="w-6 h-6 text-primary" />
                     </div>
                     <h4 className="font-semibold text-[12px] text-foreground/80 leading-tight">{cat}</h4>
                   </CardContent>
                 </Card>
               ))}
             </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 outline-none">
             <div className="bg-white border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
               <div>
                 <h3 className="font-semibold text-[16px] mb-1 tracking-tight">Database Backup</h3>
                 <p className="text-[12px] text-muted-foreground leading-relaxed">Your data lives entirely on your device. Export regularly to avoid data loss on browser cache clear.</p>
               </div>
               
               <div className="flex flex-col gap-3 pt-2">
                 <Button variant="outline" className="w-full justify-start rounded-[14px] h-12 border-border shadow-sm text-[14px] font-medium">
                   <ArrowDownToLine className="w-4 h-4 mr-3 text-muted-foreground" /> Export Brain (JSON)
                 </Button>
                 <Button variant="outline" className="w-full justify-start rounded-[14px] h-12 border-border shadow-sm text-[14px] font-medium text-destructive hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 border-dashed">
                   <ArrowUpFromLine className="w-4 h-4 mr-3" /> Import Backup
                 </Button>
               </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
