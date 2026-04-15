'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Swords, LayoutGrid, Plus, Rss } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const toggleQuickCapture = useUIStore((state) => state.toggleQuickCapture);
  const feedItems = useUIStore((state) => state.feedItems);

  // Count unread opportunities for badge
  const oppCount = feedItems.filter((i) => i.isOpportunity && !i.isSaved && !i.isIgnored).length;

  const leftNav = [
    { name: 'Feed',    href: '/',         icon: Home },
    { name: 'Sources', href: '/sources',  icon: Rss },
  ];

  const rightNav = [
    { name: 'Study',   href: '/study',    icon: BookOpen },
    { name: 'Agadham', href: '/agadham',  icon: Swords },
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
          'relative flex flex-col items-center justify-center w-full flex-1 gap-0.5 py-2',
          'transition-all duration-200',
          isActive ? 'text-emerald-700' : 'text-muted-foreground/50 hover:text-muted-foreground/80',
        )}
      >
        <div className="relative">
          <item.icon
            className={cn(
              'h-[20px] w-[20px] transition-all duration-200',
              isActive && 'text-emerald-700',
            )}
            strokeWidth={isActive ? 2.5 : 1.8}
          />
          {/* Opportunity badge dot */}
          {showBadge && (
            <span className="absolute -top-0.5 -right-1.5 w-2 h-2 bg-orange-500 rounded-full border-[1.5px] border-white animate-pulse shadow-sm shadow-orange-500/30" />
          )}
        </div>
        <span className={cn(
          'text-[10px] font-medium tracking-wide transition-all duration-200',
          isActive ? 'text-emerald-700' : 'text-muted-foreground/50',
        )}>
          {item.name}
        </span>
        {/* Active indicator pill */}
        {isActive && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[68px] glass border-t border-white/30 z-40">
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
              'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-3.5 rounded-[18px]',
              'shadow-[0_8px_24px_rgba(4,78,58,0.4)]',
              'hover:shadow-[0_12px_28px_rgba(4,78,58,0.5)] hover:scale-105',
              'active:scale-95 transition-all duration-300',
              'outline-none border-[4px] border-white/90',
            )}
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
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
