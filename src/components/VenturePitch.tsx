"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Target, Users, TrendingUp, ArrowRight, Zap, Briefcase } from 'lucide-react';
import { useUIStore } from '@/lib/store';

export function VenturePitch() {
  const { problems, ideas } = useUIStore();
  const [activeSlide, setActiveSlide] = useState(0);

  // Filter for Priority 1 Venture problems
  const ventureProblems = problems.filter(p => p.category === 'Corporate/Venture');
  const mainProblem = ventureProblems[0] || problems[0] || { title: "No problem logged", desc: "Start by logging a clinical gap in the field." };
  
  // Market Estimates (Mocked for 2026 based on research)
  const marketStats = [
    { label: 'TAM (Global Pet Health)', value: '$350B+', color: 'text-indigo-600' },
    { label: 'SAM (Digital Triage)', value: '$12B', color: 'text-indigo-500' },
    { label: 'SOM (Tier 1 Cities)', value: '$450M', color: 'text-indigo-400' }
  ];

  const slides = [
    {
      title: "The Critical Pain",
      icon: <Target className="w-8 h-8 text-red-500" />,
      subtitle: "Unsolved Gaps in Veterinary Workflow",
      content: (
        <div className="space-y-4">
          <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
             <h4 className="font-bold text-red-900 text-lg mb-2">{mainProblem.title}</h4>
             <p className="text-sm text-red-800/80 leading-relaxed italic">"{mainProblem.desc}"</p>
          </div>
          <p className="text-xs text-muted-foreground px-1">
            Data sourced from {problems.length} field observations. 
            High burnout and {ventureProblems.length} critical venture gaps identified.
          </p>
        </div>
      )
    },
    {
      title: "Market Opportunity",
      icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
      subtitle: "TAM/SAM/SOM Analysis (2026)",
      content: (
        <div className="grid grid-cols-1 gap-4">
          {marketStats.map((stat, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
               <span className="text-xs font-bold text-indigo-900/60 uppercase tracking-widest">{stat.label}</span>
               <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground text-center mt-2 italic">
            *Estimates based on Veterinary Startup Ingestion Index.
          </p>
        </div>
      )
    },
    {
      title: "The Intelligent Solution",
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      subtitle: "AI-Driven Clinical Operating System",
      content: (
        <div className="space-y-4">
          <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
             <h4 className="font-bold text-emerald-900 text-lg mb-2">Omniscience OS</h4>
             <p className="text-sm text-emerald-800/80 leading-relaxed">
                A workflow-first platform that synthesizes textbook knowledge, real-time field problems, and client tracking into one "Venture Brain."
             </p>
          </div>
          <div className="flex gap-2">
             <div className="flex-1 bg-white border border-border/40 p-3 rounded-xl text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Efficiency</p>
                <p className="text-sm font-bold text-foreground">+40%</p>
             </div>
             <div className="flex-1 bg-white border border-border/40 p-3 rounded-xl text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Trust Score</p>
                <p className="text-sm font-bold text-foreground">9.2/10</p>
             </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
           <h2 className="text-xl font-bold text-indigo-900">Venture Summary</h2>
           <p className="text-xs text-muted-foreground">Synthesized Pitch Deck v1.0</p>
        </div>
        <Rocket className="w-6 h-6 text-indigo-600 animate-bounce" />
      </div>

      <Card className="border-indigo-100 shadow-xl shadow-indigo-500/5 rounded-[32px] overflow-hidden">
        <CardContent className="p-8 bg-gradient-to-br from-indigo-50/30 to-white min-h-[400px] flex flex-col">
          <div className="mb-6 flex items-center justify-between">
             <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-indigo-100">
                {slides[activeSlide].icon}
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[.2em]">Slide {activeSlide + 1} of {slides.length}</p>
                <h3 className="text-lg font-bold text-indigo-900">{slides[activeSlide].title}</h3>
             </div>
          </div>

          <p className="text-xs font-bold text-indigo-500/60 uppercase tracking-widest mb-6">
             {slides[activeSlide].subtitle}
          </p>

          <div className="flex-1">
             {slides[activeSlide].content}
          </div>

          <div className="mt-10 flex gap-2">
             {slides.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === idx ? 'w-8 bg-indigo-600' : 'w-2 bg-indigo-200'}`}
                />
             ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 h-14 rounded-2xl border-indigo-100 text-indigo-600 font-bold"
          onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        >
          Previous
        </Button>
        <Button 
          className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-600/20"
          onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
        >
          Next Slide <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="flex gap-4 p-5 bg-white border border-border/40 rounded-3xl items-center">
         <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-orange-600" />
         </div>
         <div className="flex-1">
            <h4 className="font-bold text-sm">Founders Execution Alpha</h4>
            <p className="text-[11px] text-muted-foreground">Focus on the "Diagnostic AI Trust Gap" first. Market timing is optimal for Q3 2026.</p>
         </div>
      </div>
    </div>
  );
}
