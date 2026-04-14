'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Rocket, LayoutGrid, Plus } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const toggleQuickCapture = useUIStore((state) => state.toggleQuickCapture);

  const leftNav = [
    { name: 'Feed', href: '/', icon: Home },
    { name: 'Study', href: '/study', icon: BookOpen },
  ];
  const rightNav = [
    { name: 'Agadham', href: '/agadham', icon: Rocket },
    { name: 'Hub', href: '/hub', icon: LayoutGrid },
  ];

  const renderItem = (item: any) => {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
    return (
      <Link key={item.name} href={item.href} className={cn("flex flex-col items-center justify-center w-full flex-1 gap-1 text-muted-foreground transition-colors py-2", isActive && "text-primary")}>
        <item.icon className={cn("h-[22px] w-[22px]", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
        <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[68px] bg-white border-t border-border z-40">
      {/* Added safe area padding for iOS visually by extending height and centering, but let's keep it simple for now */}
      <div className="max-w-md mx-auto h-full flex justify-between items-center relative px-2">
        <div className="flex flex-1 justify-around h-full items-center">
          {leftNav.map(renderItem)}
        </div>
        
        {/* Central FAB - Omnipresent Quick Capture */}
        <div className="relative flex items-center justify-center px-3 mt-[-30px] z-50">
          <button
            onClick={() => toggleQuickCapture(true)}
            className="bg-primary text-primary-foreground p-3.5 rounded-full shadow-[0_8px_16px_rgba(6,95,70,0.3)] hover:scale-105 active:scale-95 transition-all outline-none border-[4px] border-background"
          >
            <Plus className="h-7 w-7" />
          </button>
        </div>

        <div className="flex flex-1 justify-around h-full items-center">
          {rightNav.map(renderItem)}
        </div>
      </div>
    </div>
  );
}
