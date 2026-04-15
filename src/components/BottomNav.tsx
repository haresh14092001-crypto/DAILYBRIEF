'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Rocket, LayoutGrid, Plus, Rss } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const toggleQuickCapture = useUIStore((state) => state.toggleQuickCapture);
  const feedItems = useUIStore((state) => state.feedItems);

  // Count unread opportunities for badge
  const oppCount = feedItems.filter((i) => i.isOpportunity && !i.isSaved && !i.isIgnored).length;

  const leftNav = [
    { name: 'Feed',    href: '/',        icon: Home },
    { name: 'Sources', href: '/sources', icon: Rss },
  ];

  const rightNav = [
    { name: 'Study',   href: '/study',   icon: BookOpen },
    { name: 'Hub',     href: '/hub',     icon: LayoutGrid },
  ];

  const renderItem = (item: { name: string; href: string; icon: React.ElementType }) => {
    const isActive =
      pathname === item.href ||
      (item.href !== '/' && pathname.startsWith(item.href));
    const showBadge = item.href === '/' && oppCount > 0;

    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          'relative flex flex-col items-center justify-center w-full flex-1 gap-1 transition-colors py-2',
          isActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <div className="relative">
          <item.icon
            className={cn('h-[22px] w-[22px]', isActive && 'fill-primary/15')}
            strokeWidth={isActive ? 2.5 : 2}
          />
          {/* Opportunity badge dot */}
          {showBadge && (
            <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-orange-500 rounded-full border-[1.5px] border-white animate-pulse" />
          )}
        </div>
        <span className={cn('text-[10px] font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>
          {item.name}
        </span>
        {/* Active underline */}
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[68px] bg-white/95 backdrop-blur-md border-t border-border/60 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto h-full flex justify-between items-center relative px-2">

        {/* Left nav items */}
        <div className="flex flex-1 justify-around h-full items-center">
          {leftNav.map(renderItem)}
        </div>

        {/* Central FAB */}
        <div className="relative flex items-center justify-center px-3 mt-[-30px] z-50">
          <button
            onClick={() => toggleQuickCapture(true)}
            aria-label="Quick capture"
            className={cn(
              'bg-[#065f46] text-white p-3.5 rounded-full',
              'shadow-[0_8px_20px_rgba(6,95,70,0.35)]',
              'hover:bg-[#064e3b] hover:scale-105',
              'active:scale-95 transition-all duration-150',
              'outline-none border-[4px] border-[#fafafa]',
            )}
          >
            <Plus className="h-7 w-7" />
          </button>
        </div>

        {/* Right nav items */}
        <div className="flex flex-1 justify-around h-full items-center">
          {rightNav.map(renderItem)}
        </div>
      </div>
    </div>
  );
}
