'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { QuickCapture } from '@/components/QuickCapture';
import { SearchOverlay } from '@/components/SearchOverlay';
import { useUIStore } from '@/lib/store';
import { runIntelligenceIngest } from '@/lib/intelligenceEngine';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const { toggleSearch } = useUIStore(); // Just to reference the store to initialize it
  const store = useUIStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!session && pathname !== '/login') {
        router.replace('/login');
      } else if (session && pathname === '/login') {
        router.replace('/');
      }
      
      // Auto-populate intelligence in the background if empty
      // We do this here because it simulates the "Personal Data Load" after auth
      runIntelligenceIngest(store);
      
      setIsLoading(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login');
      } else if (session && pathname === '/login') {
        router.replace('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
        <div className="w-10 h-10 border-[4px] border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-xs text-muted-foreground mt-4 font-medium uppercase tracking-widest">Initializing Core...</p>
      </div>
    );
  }

  const isLoginPage = pathname === '/login';

  return (
    <>
      <div className={`flex-1 w-full max-w-md mx-auto ${isLoginPage ? '' : 'bg-[#fafafa] relative shadow-[0_0_40px_rgba(0,0,0,0.02)] h-full pb-20'}`}>
        {children}
      </div>
      
      {!isLoginPage && (
        <>
          <BottomNav />
          <QuickCapture />
          <SearchOverlay />
        </>
      )}
    </>
  );
}
