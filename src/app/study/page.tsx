'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudyZone() {
  const router = useRouter();
  
  const subjects = [
    'Veterinary Medicine', 'Veterinary Surgery & Radiology', 'Veterinary Gynaecology & Obstetrics',
    'Veterinary Clinical Practices', 'Veterinary Anatomy', 'Veterinary Physiology',
    'Veterinary Biochemistry', 'Veterinary Pharmacology & Toxicology', 'Veterinary Pathology',
    'Veterinary Microbiology', 'Veterinary Parasitology', 'Veterinary Public Health',
    'Livestock Production Management', 'Livestock Products Technology', 'Veterinary Extension Education',
    'Veterinary Economics', 'Animal Genetics & Breeding', 'Animal Nutrition'
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <header className="sticky top-0 z-10 bg-[#fafafa]/80 backdrop-blur-md border-b border-border/40 px-4 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Study Zone</h1>
        <p className="text-sm text-muted-foreground mt-1">UG & PG Knowledge Base</p>
      </header>

      <div className="p-4 flex-1 pb-24">
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
           {subjects.map((subject, idx) => {
             // Create a URL friendly slug
             const slug = subject.toLowerCase().replace(/ & /g, '-and-').replace(/ /g, '-');
             
             return (
              <Card 
                key={idx} 
                className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md hover:-translate-y-0.5 border-border/60"
                onClick={() => router.push(`/study/${slug}`)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="p-2 bg-primary/10 w-fit rounded-lg">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-sm text-foreground/90 leading-tight pr-4">
                       {subject}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground opacity-50" />
                </CardContent>
              </Card>
             );
           })}
         </div>
      </div>
    </div>
  );
}
