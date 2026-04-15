'use client';

import { Globe, MapPin, Target, Eye, Users, Plus, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { VenturePitch } from '@/components/VenturePitch';
import { cn } from '@/lib/utils';

const PROBLEM_IMPACT_COLORS: Record<string, string> = {
  Critical: 'bg-red-50 text-red-700 border-red-100',
  High:     'bg-orange-50 text-orange-700 border-orange-100',
  Medium:   'bg-amber-50 text-amber-700 border-amber-100',
};

export default function Agadham() {
  const { ideas, addIdea, problems, addProblem } = useUIStore();

  const [activeTab, setActiveTab] = useState<'mapper' | 'intel' | 'synthesis'>('mapper');
  const [globalRef, setGlobalRef]   = useState('');
  const [localAdap, setLocalAdap]   = useState('');
  const [strategy, setStrategy]     = useState('');
  const [isAddingProblem, setIsAddingProblem] = useState(false);
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc]   = useState('');

  const mapIdea = () => {
    if (!globalRef || !localAdap) return;
    addIdea({ global: globalRef, local: localAdap, strategy });
    setGlobalRef(''); setLocalAdap(''); setStrategy('');
  };

  const handleLogProblem = () => {
    if (!pTitle || !pDesc) return;
    addProblem({ id: Date.now(), title: pTitle, description: pDesc, status: 'New Log' });
    setPTitle(''); setPDesc('');
    setIsAddingProblem(false);
  };

  const TABS = [
    { id: 'mapper',    label: 'Idea Mapper', emoji: '🗺' },
    { id: 'intel',     label: 'Problem Log', emoji: '🔴' },
    { id: 'synthesis', label: 'Synthesis',   emoji: '🧬' },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-border/30">
        <div className="px-4 pt-4 pb-3 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-tight leading-tight bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
                அகதம்
              </h1>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-medium tracking-wide">
                Startup War Room · Think Global, Act Local
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="glass-card rounded-[12px] px-3 py-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700">{problems.length} logged</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 text-[11px] font-semibold py-[7px] rounded-full border transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white border-transparent shadow-sm shadow-emerald-900/20'
                    : 'bg-white/80 text-muted-foreground/70 border-border/30 hover:border-emerald-200 hover:text-emerald-700',
                )}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4 max-w-2xl mx-auto w-full space-y-3">

        {/* ─── MAPPER TAB ────────────────────────────────────── */}
        {activeTab === 'mapper' && (
          <>
            {/* Input card */}
            <div className="glass-card rounded-[18px] p-5 space-y-4">
              <div>
                <h2 className="font-bold text-[15px] text-foreground mb-0.5">Think Global, Act Local</h2>
                <p className="text-[11px] text-muted-foreground/60 leading-relaxed">Map verified global concepts to precise Tamil Nadu execution.</p>
              </div>

              <div className="space-y-3">
                {/* Global Reference */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/60 mb-1.5">
                    <Globe className="w-3 h-3" /> Global Reference
                  </label>
                  <Input
                    placeholder="e.g. Modern Animal (USA) membership model"
                    className="h-10 rounded-[12px] border-border/40 bg-white/80 focus-visible:ring-1 focus-visible:ring-emerald-500 text-[13px]"
                    value={globalRef}
                    onChange={e => setGlobalRef(e.target.value)}
                  />
                </div>

                {/* Connector */}
                <div className="flex justify-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-px h-3 bg-emerald-200" />
                    <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                      <span className="text-[9px] text-emerald-700 font-bold">↓</span>
                    </div>
                    <div className="w-px h-3 bg-emerald-200" />
                  </div>
                </div>

                {/* Local Adaptation */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/60 mb-1.5">
                    <MapPin className="w-3 h-3" /> Local Adaptation
                  </label>
                  <Input
                    placeholder="e.g. WhatsApp-first booking + rural paravet network"
                    className="h-10 rounded-[12px] border-border/40 bg-white/80 focus-visible:ring-1 focus-visible:ring-emerald-500 text-[13px]"
                    value={localAdap}
                    onChange={e => setLocalAdap(e.target.value)}
                  />
                </div>

                {/* Strategy */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/60 mb-1.5">
                    <Target className="w-3 h-3" /> Core Strategy
                  </label>
                  <Textarea
                    placeholder="Distribution channel, cost reduction, market entry…"
                    className="min-h-[80px] rounded-[12px] border-border/40 bg-white/80 focus-visible:ring-1 focus-visible:ring-emerald-500 resize-none text-[13px]"
                    value={strategy}
                    onChange={e => setStrategy(e.target.value)}
                  />
                </div>

                <button
                  onClick={mapIdea}
                  disabled={!globalRef || !localAdap}
                  className="w-full py-3 rounded-[14px] text-[13px] font-semibold bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-lg shadow-emerald-900/20 hover:from-emerald-800 hover:to-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Map to Idea Engine →
                </button>
              </div>
            </div>

            {/* Mapped ideas */}
            {ideas.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/50 px-1">Strategy Room ({ideas.length})</p>
                {ideas.map((idea, idx) => (
                  <div key={idx} className="glass-card rounded-[18px] p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-[14px] text-foreground/90 leading-snug">{idea.local}</h3>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex-shrink-0">Local</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/60 italic">Ref: {idea.global}</p>
                    {idea.strategy && <p className="text-[11px] text-muted-foreground/70 mt-1.5 leading-relaxed">{idea.strategy}</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── PROBLEM LOG TAB ───────────────────────────────── */}
        {activeTab === 'intel' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-[18px] p-4 text-center">
                <Eye className="w-5 h-5 text-emerald-700 mx-auto mb-2 opacity-80" />
                <p className="text-2xl font-extrabold text-emerald-900">{problems.length}</p>
                <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-0.5">Problems Logged</p>
              </div>
              <div className="glass-card rounded-[18px] p-4 text-center">
                <Users className="w-5 h-5 text-emerald-700 mx-auto mb-2 opacity-80" />
                <p className="text-2xl font-extrabold text-emerald-900">4</p>
                <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-0.5">Investors Tracked</p>
              </div>
            </div>

            {/* Header + add button */}
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-[13px] text-foreground/80">Problem Intelligence Feed</h3>
              <button
                onClick={() => setIsAddingProblem(true)}
                className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 transition-all"
              >
                <Plus className="w-3 h-3" /> Log Gap
              </button>
            </div>

            {/* Add form */}
            {isAddingProblem && (
              <div className="glass-card rounded-[18px] p-5 space-y-3 border-red-100">
                <h3 className="font-bold text-[14px] text-red-800">Log a Real-World Gap</h3>
                <input
                  autoFocus
                  placeholder="Problem title…"
                  className="w-full bg-transparent font-semibold text-[13px] outline-none placeholder:text-red-900/30 border-b border-red-100 pb-2"
                  value={pTitle}
                  onChange={e => setPTitle(e.target.value)}
                />
                <textarea
                  placeholder="Describe the observation or market gap…"
                  className="w-full bg-transparent text-[12px] text-foreground/80 outline-none min-h-[80px] resize-none placeholder:text-muted-foreground/40 leading-relaxed"
                  value={pDesc}
                  onChange={e => setPDesc(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={handleLogProblem} className="flex-1 py-2.5 rounded-[12px] text-[12px] font-semibold bg-red-600 text-white hover:bg-red-700 transition-all">
                    Save Entry
                  </button>
                  <button onClick={() => setIsAddingProblem(false)} className="px-4 py-2.5 rounded-[12px] text-[12px] font-semibold border border-border/30 text-muted-foreground hover:bg-muted/30 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Problems list */}
            {problems.length === 0 && !isAddingProblem && (
              <div className="text-center py-12">
                <Shield className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
                <p className="text-sm font-semibold text-foreground/50">No problems logged yet</p>
                <p className="text-[11px] text-muted-foreground/40 mt-1">Tap + Log Gap to start capturing market intelligence</p>
              </div>
            )}

            <div className="space-y-2.5">
              {problems.map(problem => (
                <div key={problem.id} className="glass-card rounded-[18px] p-4 relative overflow-hidden">
                  {/* Category tag */}
                  <div className={cn(
                    'absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[8px] font-bold uppercase tracking-wide',
                    problem.category === 'Corporate/Venture' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                  )}>
                    {problem.category || 'Observation'}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0', problem.impact === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500')} />
                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wide">{problem.target || 'General'}</span>
                  </div>

                  <h3 className={cn('font-semibold text-[14px] mb-1.5 leading-snug', problem.category === 'Corporate/Venture' ? 'text-indigo-900' : 'text-emerald-900')}>
                    {problem.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground/70 italic leading-relaxed mb-3">
                    "{problem.description}"
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-bold uppercase tracking-wide border border-border/40 px-2 py-1 rounded-[8px] text-muted-foreground/60">
                      {problem.status || 'Validation Phase'}
                    </span>
                    {problem.impact && (
                      <span className={cn('text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border', PROBLEM_IMPACT_COLORS[problem.impact] || '')}>
                        {problem.impact} Impact
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ─── SYNTHESIS TAB ─────────────────────────────────── */}
        {activeTab === 'synthesis' && (
          <VenturePitch />
        )}
      </main>
    </div>
  );
}
