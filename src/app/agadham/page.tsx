'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Globe, MapPin, Target, Eye, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

import { VenturePitch } from '@/components/VenturePitch';

export default function Agadham() {
  const { ideas, addIdea, problems, addProblem } = useUIStore();
  const [globalRef, setGlobalRef] = useState('');
  const [localAdap, setLocalAdap] = useState('');
  const [strategy, setStrategy] = useState('');

  const [isAddingProblem, setIsAddingProblem] = useState(false);
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');

  const mapIdea = () => {
    if (!globalRef || !localAdap) return;
    addIdea({ global: globalRef, local: localAdap, strategy });
    setGlobalRef('');
    setLocalAdap('');
    setStrategy('');
  };

  const handleLogProblem = () => {
    if (!pTitle || !pDesc) return;
    addProblem({ id: Date.now(), title: pTitle, description: pDesc, status: 'New Log' });
    setPTitle('');
    setPDesc('');
    setIsAddingProblem(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <header className="sticky top-0 z-10 bg-[#fafafa]/80 backdrop-blur-md border-b border-border/40 px-4 py-4">
        <h1 className="text-xl font-semibold tracking-tight text-emerald-900">அகதம் <span className="text-sm font-normal text-muted-foreground ml-2">War Room</span></h1>
      </header>

      <div className="flex-1 p-4 pb-24">
        <Tabs defaultValue="mapper" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-white border border-border/40 p-1 rounded-[20px] mb-8 h-12 shadow-sm">
            <TabsTrigger value="mapper" className="rounded-[16px] text-[11px] font-bold uppercase tracking-tight data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">Idea Mapper</TabsTrigger>
            <TabsTrigger value="intel" className="rounded-[16px] text-[11px] font-bold uppercase tracking-tight data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">Problem Log</TabsTrigger>
            <TabsTrigger value="synthesis" className="rounded-[16px] text-[11px] font-bold uppercase tracking-tight data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Synthesis</TabsTrigger>
          </TabsList>

          <TabsContent value="synthesis" className="outline-none">
            <VenturePitch />
          </TabsContent>

          <TabsContent value="mapper" className="space-y-4 outline-none">
             <div className="bg-emerald-50 rounded-[24px] p-6 shadow-sm border border-emerald-100/50 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl -mr-10 -mt-10 opacity-60 pointer-events-none"></div>
               <h2 className="text-base font-semibold text-emerald-900 mb-1">Think Global, Act Local</h2>
               <p className="text-xs text-emerald-700/80 mb-5 leading-relaxed">Map verified global concepts to precise Tamil Nadu execution.</p>
               
               <div className="space-y-4 relative z-10">
                 <div>
                   <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                     <Globe className="w-3.5 h-3.5 opacity-80" /> Global Reference
                   </label>
                   <Input 
                    placeholder="e.g. Modern Animal (USA) membership" 
                    className="bg-white border border-emerald-100 shadow-sm rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-500 text-sm h-11" 
                    value={globalRef}
                    onChange={(e) => setGlobalRef(e.target.value)}
                   />
                 </div>
                 
                 <div className="flex justify-center -my-2 relative z-0">
                    <div className="w-px h-6 bg-emerald-200"></div>
                 </div>

                 <div>
                   <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                     <MapPin className="w-3.5 h-3.5 opacity-80" /> Local Adaptation
                   </label>
                   <Input 
                    placeholder="e.g. WhatsApp-first booking + low-cost" 
                    className="bg-white border border-emerald-100 shadow-sm rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-500 text-sm h-11" 
                    value={localAdap}
                    onChange={(e) => setLocalAdap(e.target.value)}
                   />
                 </div>

                 <div className="flex justify-center -my-2 relative z-0">
                    <div className="w-px h-6 bg-emerald-200"></div>
                 </div>

                 <div>
                   <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                     <Target className="w-3.5 h-3.5 opacity-80" /> Core Strategy
                   </label>
                   <Textarea 
                    placeholder="Distribution channel, cost reduction strategy..." 
                    className="min-h-[80px] bg-white border border-emerald-100 shadow-sm rounded-xl resize-none focus-visible:ring-1 focus-visible:ring-emerald-500 text-sm py-3" 
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                   />
                 </div>

                 <Button 
                  onClick={mapIdea}
                  className="w-full mt-2 rounded-[14px] shadow-lg shadow-emerald-600/20 bg-[#065f46] hover:bg-[#064e3b] transition-all h-12 text-[15px] font-medium"
                 >
                   Map to Idea Engine
                 </Button>
               </div>
             </div>

             <div className="pt-2 space-y-3">
                <h3 className="font-bold text-sm tracking-tight px-1 text-foreground/80 mt-2">Mapped Strategy Room</h3>
                {ideas.length === 0 && <p className="text-xs text-muted-foreground px-1 opacity-60">No strategies mapped yet.</p>}
                {ideas.map((idea, idx) => (
                  <Card key={idx} className="shadow-sm border-border/40 hover:shadow-md transition-all cursor-pointer rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-[15px]">{idea.local}</h3>
                        <Badge variant="outline" className="text-[8px] bg-emerald-50">Local adaptation</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 italic">Ref: {idea.global}</p>
                    </CardContent>
                  </Card>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-4 outline-none">
             <Button variant="outline" className="w-full border-dashed border-2 py-8 text-emerald-800 hover:text-emerald-900 hover:bg-emerald-50/50 hover:border-emerald-300 rounded-2xl transition-all font-medium">
               <Plus className="w-5 h-5 mr-2" /> Log a New Competitor
             </Button>

             <Card className="shadow-sm border-border/40 rounded-2xl overflow-hidden">
               <CardContent className="p-4 relative">
                 <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                 <h3 className="font-semibold text-[16px] mb-1 text-foreground flex items-center gap-2 pl-2">
                   Vetic <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">Delhi NCR</span>
                 </h3>
                 <p className="text-xs text-muted-foreground mt-1 pl-2">Tech enabled pet clinics.</p>
                 <div className="text-[12px] mt-3 bg-muted/30 p-2.5 rounded-lg border border-border/30 pl-3">
                   <p><span className="font-semibold text-foreground/80">Monitor:</span> Scaling fast. Pricing strategies.</p>
                 </div>
               </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="intel" className="space-y-4 outline-none">
             <div className="grid grid-cols-2 gap-3 mb-2">
               <Card className="bg-white border-border/40 shadow-sm rounded-2xl">
                 <CardContent className="p-5 text-center">
                   <Eye className="w-5 h-5 text-emerald-700 mx-auto mb-2 opacity-80" />
                   <h4 className="text-2xl font-bold text-emerald-900">{problems.length}</h4>
                   <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Problems Logged</p>
                 </CardContent>
               </Card>
               <Card className="bg-white border-border/40 shadow-sm rounded-2xl">
                 <CardContent className="p-5 text-center">
                   <Users className="w-5 h-5 text-emerald-700 mx-auto mb-2 opacity-80" />
                   <h4 className="text-2xl font-bold text-emerald-900">4</h4>
                   <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Investors Tracked</p>
                 </CardContent>
               </Card>
             </div>
             
             <div className="flex justify-between items-center px-1 mt-6 mb-2">
               <h3 className="font-bold text-sm tracking-tight text-foreground/80">Latest Problem Logs</h3>
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsAddingProblem(true)}
                className="h-7 text-[10px] rounded-full px-3 bg-red-50 text-red-700 hover:bg-red-100 font-bold"
               >
                 + Log Real Gap
               </Button>
             </div>

             {isAddingProblem && (
               <Card className="p-4 border-red-100 bg-red-50/20 rounded-2xl">
                 <input 
                  autoFocus
                  placeholder="Problem Title..." 
                  className="w-full bg-transparent font-bold outline-none text-sm mb-2 placeholder:text-red-900/40"
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                 />
                 <textarea 
                  placeholder="Describe the observation/gap..." 
                  className="w-full bg-transparent text-xs outline-none min-h-[80px] mb-3 resize-none placeholder:text-red-900/40"
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                 />
                 <div className="flex gap-2">
                   <Button size="sm" onClick={handleLogProblem} className="bg-red-600 hover:bg-red-700 h-8 text-xs px-4">Save Entry</Button>
                   <Button size="sm" variant="ghost" onClick={() => setIsAddingProblem(false)} className="h-8 text-xs">Cancel</Button>
                 </div>
               </Card>
             )}

             <div className="space-y-3">
               {problems.map((problem) => (
                 <Card key={problem.id} className="shadow-sm border-border/40 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                   <CardContent className="p-4 relative">
                     {/* Category Marker */}
                     <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[8px] font-bold uppercase tracking-widest ${problem.category === 'Corporate/Venture' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {problem.category || 'Observation'}
                     </div>

                     <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${problem.impact === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{problem.target || 'General'}</span>
                     </div>

                     <h3 className={`font-semibold text-[15px] mb-1.5 ${problem.category === 'Corporate/Venture' ? 'text-indigo-900' : 'text-emerald-900'}`}>
                        {problem.title}
                     </h3>
                     <p className="text-xs text-muted-foreground leading-relaxed italic mb-3">"{problem.description}"</p>
                     
                     <div className="flex gap-2 items-center">
                        <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold border border-border/40 bg-white w-fit px-2 py-1 rounded-md">
                          {problem.status || 'Validation Phase'}
                        </div>
                        {problem.impact === 'Critical' && (
                          <Badge className="bg-red-50 text-red-700 border-red-100 text-[8px] h-5">Priority 1 Venture</Badge>
                        )}
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
