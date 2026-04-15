'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  ArrowLeft, Plus, BrainCircuit, FileText, Star, StarOff,
  ChevronDown, ChevronUp, Zap, CheckCircle2, Circle, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';
import { PdfExtractor } from '@/components/PdfExtractor';

// ─── Subject colour mapping ───────────────────────────────────────────────────
const SUBJECT_COLORS: Record<string, { accent: string; bg: string; border: string }> = {
  'Veterinary Medicine':                  { accent: 'text-emerald-700', bg: 'bg-emerald-50',   border: 'border-emerald-100' },
  'Veterinary Surgery & Radiology':       { accent: 'text-blue-700',    bg: 'bg-blue-50',      border: 'border-blue-100' },
  'Veterinary Gynaecology & Obstetrics':  { accent: 'text-rose-700',    bg: 'bg-rose-50',      border: 'border-rose-100' },
  'Veterinary Clinical Practices':        { accent: 'text-teal-700',    bg: 'bg-teal-50',      border: 'border-teal-100' },
  'Veterinary Anatomy':                   { accent: 'text-purple-700',  bg: 'bg-purple-50',    border: 'border-purple-100' },
  'Veterinary Physiology':                { accent: 'text-indigo-700',  bg: 'bg-indigo-50',    border: 'border-indigo-100' },
  'Veterinary Biochemistry':              { accent: 'text-amber-700',   bg: 'bg-amber-50',     border: 'border-amber-100' },
  'Veterinary Pharmacology & Toxicology': { accent: 'text-red-700',     bg: 'bg-red-50',       border: 'border-red-100' },
  'Veterinary Pathology':                 { accent: 'text-orange-700',  bg: 'bg-orange-50',    border: 'border-orange-100' },
  'Veterinary Microbiology':              { accent: 'text-cyan-700',    bg: 'bg-cyan-50',      border: 'border-cyan-100' },
  'Veterinary Parasitology':              { accent: 'text-lime-700',    bg: 'bg-lime-50',      border: 'border-lime-100' },
  'Veterinary Public Health':             { accent: 'text-green-700',   bg: 'bg-green-50',     border: 'border-green-100' },
  'Livestock Production Management':      { accent: 'text-yellow-700',  bg: 'bg-yellow-50',    border: 'border-yellow-100' },
  'Livestock Products Technology':        { accent: 'text-pink-700',    bg: 'bg-pink-50',      border: 'border-pink-100' },
  'Animal Genetics & Breeding':           { accent: 'text-violet-700',  bg: 'bg-violet-50',    border: 'border-violet-100' },
  'Animal Nutrition':                     { accent: 'text-emerald-700', bg: 'bg-emerald-50',   border: 'border-emerald-100' },
};
const DEFAULT_COLOR = { accent: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' };

// ─── Seed MCQs per subject ────────────────────────────────────────────────────
const SUBJECT_MCQS: Record<string, { q: string; options: string[]; answer: number; hint: string }[]> = {
  'Veterinary Medicine': [
    { q: 'Hallmark biochemical finding in Bovine Ketosis?', options: ['Hyperglycemia','Hypoglycemia + Hyperketonemia','Hypocalcemia','Hypomagnesemia'], answer: 1, hint: 'Think: NEB → fat mobilisation → ketone bodies ↑, glucose ↓' },
    { q: 'Which form of ketosis is MORE common in dairy cattle?', options: ['Primary ketosis','Secondary ketosis','Acetonemia type III','Protein-energy ketosis'], answer: 1, hint: 'Secondary = caused by another disease suppressing feed intake' },
    { q: 'Emergency treatment of Bovine Hypocalcaemia (Milk Fever)?', options: ['IV Magnesium only','IV Calcium Borogluconate','IM Dextrose 50%','Oral KCl'], answer: 1, hint: 'Slow IV calcium — monitor heart during infusion!' },
  ],
  'Veterinary Surgery & Radiology': [
    { q: 'MAC value indicates what in anaesthesia?', options: ['Minimum lethal dose','Minimum Alveolar Concentration for immobility in 50% patients','Maximum analgesic ceiling','Minimum antibiotic concentration'], answer: 1, hint: 'MAC = potency measure; lower MAC = more potent volatile agent' },
    { q: 'Rumenotomy is indicated in which condition?', options: ['Abomasal displacement','Frothy bloat','Vagal indigestion / hardware disease','Johne\'s disease'], answer: 2, hint: 'Surgery to access rumen contents — hardware retrieval' },
  ],
  'Veterinary Pharmacology & Toxicology': [
    { q: 'Atropine dose for cardiac emergency in dogs?', options: ['0.01 mg/kg IV','0.04 mg/kg IV or IM','0.1 mg/kg SC','0.5 mg/kg IM'], answer: 1, hint: 'Anticholinergic — blocks vagal bradycardia' },
    { q: 'Drug of choice for organophosphate toxicosis?', options: ['Pralidoxime only','Atropine only','Atropine + Pralidoxime (2-PAM)','Diazepam'], answer: 2, hint: '2-PAM reactivates AChE if given early; atropine controls muscarinic signs' },
  ],
};

// ─── Tag config ───────────────────────────────────────────────────────────────
const TAGS = ['High Yield', 'Easy', 'Tricky', 'Revision', 'Must Know'];
const TAG_COLORS: Record<string, string> = {
  'High Yield': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Easy':       'bg-sky-50 text-sky-700 border-sky-100',
  'Tricky':     'bg-red-50 text-red-600 border-red-100',
  'Revision':   'bg-amber-50 text-amber-700 border-amber-100',
  'Must Know':  'bg-violet-50 text-violet-700 border-violet-100',
};

// ─── NoteCard ─────────────────────────────────────────────────────────────────
function NoteCard({ note, onToggleStar }: { note: any; onToggleStar: (id: number | string) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="glass-card rounded-[18px] overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        {/* Header */}
        <div className="flex items-start gap-2 mb-2">
          <div className="flex-1 min-w-0">
            {note.tag && (
              <span className={cn('inline-block text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border mb-1.5', TAG_COLORS[note.tag] || TAG_COLORS['Revision'])}>
                {note.tag}
              </span>
            )}
            {note.isHighYield && !note.tag && (
              <span className="inline-block text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border mb-1.5 bg-emerald-50 text-emerald-700 border-emerald-100">
                High Yield
              </span>
            )}
            <h3 className="font-semibold text-[14px] leading-snug text-foreground/90">{note.title}</h3>
          </div>
          <button
            onClick={() => onToggleStar(note.id)}
            className={cn('p-1.5 rounded-[10px] transition-colors flex-shrink-0', note.isHighYield ? 'text-amber-500' : 'text-muted-foreground/30 hover:text-amber-400')}
          >
            {note.isHighYield ? <Star className="w-4 h-4 fill-amber-400" /> : <StarOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Content preview */}
        <p className={cn('text-[12px] text-muted-foreground leading-relaxed', !expanded && 'line-clamp-2')}>
          {note.content}
        </p>

        {note.content && note.content.length > 120 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MCQ Session ─────────────────────────────────────────────────────────────
function MCQSession({ subject, color }: { subject: string; color: typeof DEFAULT_COLOR }) {
  const mcqs = SUBJECT_MCQS[subject] || [];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [scored, setScored] = useState(0);
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (mcqs.length === 0) {
    return (
      <div className="glass-card rounded-[18px] p-6 text-center">
        <BrainCircuit className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
        <p className="font-semibold text-sm text-foreground/70 mb-1">MCQs Coming Soon</p>
        <p className="text-[11px] text-muted-foreground/60">High-yield ICAR questions for {subject} will be added here.</p>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((scored / mcqs.length) * 100);
    return (
      <div className="glass-card rounded-[18px] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-extrabold text-emerald-700">{pct}%</span>
        </div>
        <p className="font-bold text-[15px] mb-1">{scored}/{mcqs.length} correct</p>
        <p className="text-[11px] text-muted-foreground/70 mb-5">
          {pct >= 80 ? '🔥 Excellent! You\'re ready.' : pct >= 60 ? '💪 Good — review the ones you missed.' : '📖 Needs revision — go through notes again.'}
        </p>
        <button
          onClick={() => { setCurrent(0); setSelected(null); setScored(0); setDone(false); setShowHint(false); }}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-4 decoration-emerald-300"
        >
          Retry session
        </button>
      </div>
    );
  }

  const q = mcqs[current];
  const isRevealed = selected !== null;

  const handleSelect = (idx: number) => {
    if (isRevealed) return;
    setSelected(idx);
    if (idx === q.answer) setScored(s => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= mcqs.length) { setDone(true); return; }
    setCurrent(c => c + 1);
    setSelected(null);
    setShowHint(false);
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${((current) / mcqs.length) * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums">{current + 1}/{mcqs.length}</span>
      </div>

      {/* Question card */}
      <div className="glass-card rounded-[18px] p-5">
        <p className="font-semibold text-[14px] leading-snug text-foreground mb-4">{q.q}</p>

        <div className="space-y-2.5">
          {q.options.map((opt, idx) => {
            let cls = 'border-border/30 bg-white/80 text-foreground/80';
            if (isRevealed) {
              if (idx === q.answer) cls = 'border-emerald-300 bg-emerald-50 text-emerald-800';
              else if (idx === selected) cls = 'border-red-200 bg-red-50/60 text-red-700 line-through';
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={cn('w-full text-left px-4 py-3 rounded-[14px] border text-[13px] font-medium transition-all duration-200', cls, !isRevealed && 'hover:border-emerald-200 hover:bg-emerald-50/30 active:scale-[0.99]')}
              >
                <span className="font-bold text-[10px] mr-2 opacity-60">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Hint */}
        {!isRevealed && (
          <button onClick={() => setShowHint(h => !h)} className="mt-3 text-[11px] text-muted-foreground/60 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors">
            <Zap className="w-3 h-3" /> {showHint ? 'Hide hint' : 'Show hint'}
          </button>
        )}
        {showHint && !isRevealed && (
          <p className="mt-2 text-[11px] text-emerald-700 bg-emerald-50/60 border border-emerald-100 rounded-[10px] px-3 py-2 leading-relaxed">
            💡 {q.hint}
          </p>
        )}

        {/* Explanation and Next */}
        {isRevealed && (
          <div className="mt-4 pt-3 border-t border-border/20 space-y-3">
            <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-[10px] px-3 py-2 leading-relaxed">
              💡 {q.hint}
            </p>
            <button
              onClick={handleNext}
              className="w-full py-2.5 rounded-[12px] text-[13px] font-semibold bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-md shadow-emerald-900/15 hover:from-emerald-800 hover:to-emerald-700 transition-all"
            >
              {current + 1 >= mcqs.length ? 'See Results' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubjectDetail() {
  const params = useParams();
  const router = useRouter();
  const subjectSlug = params.subject as string;

  const { notes, addNote } = useUIStore();

  const [activeTab, setActiveTab] = useState<'notes' | 'icar' | 'pdf'>('notes');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isImportingPdf, setIsImportingPdf] = useState(false);
  const [filterHighYield, setFilterHighYield] = useState(false);

  // Re-format slug to title
  const title = typeof subjectSlug === 'string'
    ? subjectSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace(/-and-/gi, ' & ')
    : '';

  const color = SUBJECT_COLORS[title] || DEFAULT_COLOR;

  // Filter notes
  const subjectNotes = useMemo(() => {
    let filtered = notes.filter((n: any) => n.subject === title || (!n.subject && n.id < 500));
    if (filterHighYield) filtered = filtered.filter((n: any) => n.isHighYield);
    return filtered;
  }, [notes, title, filterHighYield]);

  const handleAddNote = () => {
    if (!newNoteTitle || !newNoteContent) return;
    addNote({
      id: Date.now(),
      subject: title,
      title: newNoteTitle,
      content: newNoteContent,
      tag: newNoteTag || undefined,
      isHighYield: newNoteTag === 'High Yield' || newNoteTag === 'Must Know',
    });
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteTag('');
    setIsAddingNote(false);
  };

  const handleToggleStar = (id: number | string) => {
    // Toggle isHighYield - we'll do this via a store call if added, or optimistic for now
    // Since store doesn't have editNote, we'll use a simple local flag pattern via addNote trick
    // This is a placeholder — can wire to store later
  };

  const TABS = [
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'icar',  label: 'MCQs',  icon: BrainCircuit },
    { id: 'pdf',   label: 'PDFs',  icon: FileText },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 glass border-b border-border/30">
        <div className="px-4 pt-3 pb-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="h-9 w-9 rounded-[12px] flex items-center justify-center text-muted-foreground/60 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex-shrink-0"
            >
              <ArrowLeft className="w-[18px] h-[18px]" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[15px] font-extrabold tracking-tight text-foreground/90 truncate leading-tight">{title}</h1>
              <p className="text-[10px] text-muted-foreground/50 font-medium mt-0.5">{subjectNotes.length} note{subjectNotes.length !== 1 ? 's' : ''} · ICAR Ready</p>
            </div>
            <div className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide', color.bg, color.accent, 'border', color.border)}>
              UG/PG
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1.5 mt-3">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-[7px] rounded-full text-[11px] font-semibold border transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white border-transparent shadow-sm shadow-emerald-900/20'
                    : 'bg-white/80 text-muted-foreground/70 border-border/30 hover:border-emerald-200 hover:text-emerald-700',
                )}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex-1 px-4 pb-28 pt-4 max-w-2xl mx-auto w-full">

        {/* ── NOTES TAB ── */}
        {activeTab === 'notes' && (
          <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setFilterHighYield(!filterHighYield)}
                className={cn(
                  'flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all duration-200',
                  filterHighYield
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-white/80 text-muted-foreground/60 border-border/30 hover:border-amber-200 hover:text-amber-600'
                )}
              >
                <Star className="w-3 h-3" /> High Yield Only
              </button>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setIsImportingPdf(true)}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-full border bg-white/80 text-muted-foreground/60 border-border/30 hover:border-emerald-200 hover:text-emerald-700 transition-all"
                >
                  📄 Import PDF
                </button>
                <button
                  onClick={() => setIsAddingNote(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-sm shadow-emerald-900/20 hover:from-emerald-800 hover:to-emerald-700 transition-all"
                >
                  <Plus className="w-3 h-3" /> New Note
                </button>
              </div>
            </div>

            {/* PDF importer */}
            {isImportingPdf && (
              <PdfExtractor subject={title} onClose={() => setIsImportingPdf(false)} />
            )}

            {/* Add note form */}
            {isAddingNote && (
              <div className="glass-card rounded-[18px] p-5 space-y-3">
                <h3 className="font-bold text-[14px] text-foreground">New Note</h3>
                <input
                  autoFocus
                  placeholder="Note title…"
                  className="w-full bg-transparent font-semibold text-[14px] outline-none placeholder:text-muted-foreground/40 border-b border-border/30 pb-2"
                  value={newNoteTitle}
                  onChange={e => setNewNoteTitle(e.target.value)}
                />
                <textarea
                  placeholder="Content, formulas, clinical pearls…"
                  className="w-full bg-transparent text-[13px] text-foreground/80 outline-none min-h-[100px] resize-none leading-relaxed placeholder:text-muted-foreground/40"
                  value={newNoteContent}
                  onChange={e => setNewNoteContent(e.target.value)}
                />
                {/* Tag picker */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/50 mb-2">Tag</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setNewNoteTag(newNoteTag === tag ? '' : tag)}
                        className={cn(
                          'text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all',
                          newNoteTag === tag ? TAG_COLORS[tag] : 'bg-white/80 text-muted-foreground/60 border-border/30'
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleAddNote}
                    className="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-md shadow-emerald-900/15 hover:from-emerald-800 hover:to-emerald-700 transition-all"
                  >
                    Save Note
                  </button>
                  <button
                    onClick={() => { setIsAddingNote(false); setNewNoteTag(''); }}
                    className="px-4 py-2.5 rounded-[12px] text-[13px] font-semibold border border-border/30 text-muted-foreground hover:bg-muted/30 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Notes list */}
            {subjectNotes.length === 0 && !isAddingNote && (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-[16px] bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-emerald-600/60" />
                </div>
                <p className="font-semibold text-sm text-foreground/60 mb-1">No notes yet</p>
                <p className="text-[11px] text-muted-foreground/50">Add your first clinical pearl or revision note</p>
              </div>
            )}

            {subjectNotes.map((note: any) => (
              <NoteCard key={note.id} note={note} onToggleStar={handleToggleStar} />
            ))}
          </div>
        )}

        {/* ── MCQ TAB ── */}
        {activeTab === 'icar' && (
          <div className="space-y-4">
            {/* Header card */}
            <div className={cn('rounded-[18px] p-5 border', color.bg, color.border)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-white/70 flex items-center justify-center shadow-sm">
                  <BrainCircuit className={cn('w-5 h-5', color.accent)} />
                </div>
                <div>
                  <h2 className={cn('font-bold text-[14px]', color.accent)}>ICAR Revision Mode</h2>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">High-yield MCQs · Tap an option to reveal answer</p>
                </div>
              </div>
            </div>
            <MCQSession subject={title} color={color} />
          </div>
        )}

        {/* ── PDF TAB ── */}
        {activeTab === 'pdf' && (
          <div className="space-y-4">
            <div className="glass-card rounded-[18px] p-6 text-center">
              <div className="w-14 h-14 rounded-[16px] bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-emerald-600/70" />
              </div>
              <h3 className="font-bold text-[14px] mb-1 text-foreground/80">PDF Textbook Import</h3>
              <p className="text-[11px] text-muted-foreground/60 mb-5 leading-relaxed max-w-[220px] mx-auto">
                Upload a PDF to extract key passages and save them as notes automatically.
              </p>
              <button
                onClick={() => setIsImportingPdf(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-md shadow-emerald-900/15 hover:from-emerald-800 hover:to-emerald-700 transition-all"
              >
                <Plus className="w-4 h-4" /> Import PDF
              </button>
            </div>

            {isImportingPdf && (
              <PdfExtractor subject={title} onClose={() => setIsImportingPdf(false)} />
            )}

            {/* Notes imported from PDFs */}
            {subjectNotes.filter((n: any) => n.fromPdf).length === 0 && (
              <div className="px-1">
                <p className="text-[11px] text-muted-foreground/50 text-center">No PDF extracts yet for {title}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
