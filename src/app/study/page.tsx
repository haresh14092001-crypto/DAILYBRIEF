'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Stethoscope, Scissors, Baby, ClipboardList, Bone, Activity,
  FlaskConical, Pill, Microscope, Bug, ShieldPlus, Heart,
  Beef, Package, Users, BarChart2, Dna, Leaf, Search,
} from 'lucide-react';
import { useState } from 'react';
import { useUIStore } from '@/lib/store';

const SUBJECTS: {
  name: string;
  icon: React.ElementType;
  accent: string;
  bg: string;
  border: string;
  tag: string;
}[] = [
  { name: 'Veterinary Medicine',                  icon: Stethoscope,    accent: 'text-emerald-700',  bg: 'bg-emerald-50',   border: 'border-emerald-100',  tag: 'Clinical' },
  { name: 'Veterinary Surgery & Radiology',       icon: Scissors,       accent: 'text-blue-700',     bg: 'bg-blue-50',      border: 'border-blue-100',     tag: 'Surgery' },
  { name: 'Veterinary Gynaecology & Obstetrics',  icon: Baby,           accent: 'text-rose-700',     bg: 'bg-rose-50',      border: 'border-rose-100',     tag: 'Go & Ob' },
  { name: 'Veterinary Clinical Practices',        icon: ClipboardList,  accent: 'text-teal-700',     bg: 'bg-teal-50',      border: 'border-teal-100',     tag: 'Clinical' },
  { name: 'Veterinary Anatomy',                   icon: Bone,           accent: 'text-purple-700',   bg: 'bg-purple-50',    border: 'border-purple-100',   tag: 'Basic' },
  { name: 'Veterinary Physiology',                icon: Activity,       accent: 'text-indigo-700',   bg: 'bg-indigo-50',    border: 'border-indigo-100',   tag: 'Basic' },
  { name: 'Veterinary Biochemistry',              icon: FlaskConical,   accent: 'text-amber-700',    bg: 'bg-amber-50',     border: 'border-amber-100',    tag: 'Basic' },
  { name: 'Veterinary Pharmacology & Toxicology', icon: Pill,          accent: 'text-red-700',      bg: 'bg-red-50',       border: 'border-red-100',      tag: 'Pharma' },
  { name: 'Veterinary Pathology',                 icon: Microscope,     accent: 'text-orange-700',   bg: 'bg-orange-50',    border: 'border-orange-100',   tag: 'Para-Clinical' },
  { name: 'Veterinary Microbiology',              icon: Bug,            accent: 'text-cyan-700',     bg: 'bg-cyan-50',      border: 'border-cyan-100',     tag: 'Para-Clinical' },
  { name: 'Veterinary Parasitology',              icon: Bug,            accent: 'text-lime-700',     bg: 'bg-lime-50',      border: 'border-lime-100',     tag: 'Para-Clinical' },
  { name: 'Veterinary Public Health',             icon: ShieldPlus,     accent: 'text-green-700',    bg: 'bg-green-50',     border: 'border-green-100',    tag: 'Public Health' },
  { name: 'Livestock Production Management',      icon: Beef,           accent: 'text-yellow-700',   bg: 'bg-yellow-50',    border: 'border-yellow-100',   tag: 'Production' },
  { name: 'Livestock Products Technology',        icon: Package,        accent: 'text-pink-700',     bg: 'bg-pink-50',      border: 'border-pink-100',     tag: 'Technology' },
  { name: 'Veterinary Extension Education',       icon: Users,          accent: 'text-sky-700',      bg: 'bg-sky-50',       border: 'border-sky-100',      tag: 'Extension' },
  { name: 'Veterinary Economics',                 icon: BarChart2,      accent: 'text-violet-700',   bg: 'bg-violet-50',    border: 'border-violet-100',   tag: 'Economics' },
  { name: 'Animal Genetics & Breeding',           icon: Dna,            accent: 'text-fuchsia-700',  bg: 'bg-fuchsia-50',   border: 'border-fuchsia-100',  tag: 'Genetics' },
  { name: 'Animal Nutrition',                     icon: Leaf,           accent: 'text-emerald-700',  bg: 'bg-emerald-50',   border: 'border-emerald-100',  tag: 'Nutrition' },
];

export default function StudyZone() {
  const router = useRouter();
  const notes = useUIStore(s => s.notes);
  const [query, setQuery] = useState('');

  const filtered = SUBJECTS.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.tag.toLowerCase().includes(query.toLowerCase())
  );

  const getSlug = (name: string) =>
    name.toLowerCase().replace(/ & /g, '-and-').replace(/\//g, '-').replace(/ /g, '-');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-border/30">
        <div className="px-4 pt-4 pb-3 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-tight leading-tight bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
                Study Zone
              </h1>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-medium tracking-wide">
                {SUBJECTS.length} subjects · UG &amp; PG Preparation
              </p>
            </div>
            <div className="h-9 w-9 rounded-[12px] flex items-center justify-center bg-emerald-50 border border-emerald-100">
              <span className="text-base">🎓</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input
              type="text"
              placeholder="Search subjects…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-9 rounded-full text-[12px] bg-white/80 border border-border/30 outline-none focus:border-emerald-300 transition-colors placeholder:text-muted-foreground/40 font-medium"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4 max-w-2xl mx-auto w-full">
        {/* Stats row */}
        <div className="flex items-center gap-3 mb-4 px-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.08em]">
          <span>{notes.length} notes saved</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span className="text-emerald-700">ICAR ready</span>
        </div>

        {/* Subject grid */}
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((subject, idx) => {
            const slug = getSlug(subject.name);
            const noteCount = notes.filter((n: any) => n.subject === subject.name).length;
            const Icon = subject.icon;

            return (
              <button
                key={idx}
                onClick={() => router.push(`/study/${slug}`)}
                className="glass-card rounded-[18px] p-4 text-left transition-all duration-200 hover:-translate-y-[1px] active:scale-[0.99] group"
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={cn('p-2.5 rounded-[14px] flex-shrink-0', subject.bg, 'border', subject.border)}>
                    <Icon className={cn('w-5 h-5', subject.accent)} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={cn('text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border', subject.bg, subject.accent, subject.border)}>
                        {subject.tag}
                      </span>
                      {noteCount > 0 && (
                        <span className="text-[9px] font-semibold text-muted-foreground/50">
                          {noteCount} note{noteCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-[13px] text-foreground/90 leading-snug">{subject.name}</p>
                  </div>

                  {/* Arrow */}
                  <div className="text-muted-foreground/30 group-hover:text-emerald-500 transition-colors flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-semibold text-sm text-foreground/50 mb-1">No subjects match</p>
            <button onClick={() => setQuery('')} className="text-xs text-emerald-700 underline underline-offset-4">
              Clear search
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
