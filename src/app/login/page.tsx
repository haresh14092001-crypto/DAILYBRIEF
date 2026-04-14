'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for a confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4 text-foreground">
      <Card className="w-full max-w-sm shadow-xl border-border/40 rounded-3xl overflow-hidden">
        <CardHeader className="text-center pt-8 bg-emerald-50/50 pb-6 border-b border-border/40">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-emerald-800" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-emerald-950">Intelligence OS</CardTitle>
          <CardDescription className="text-emerald-800/70 mt-1">
             Enter your credentials to access your system.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 px-6 pb-8">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Vault</label>
              <Input 
                type="email" 
                placeholder="founder@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-emerald-500"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Passkey</label>
              <Input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-emerald-500"
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 font-medium">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full h-12 mt-2 rounded-[14px] bg-[#065f46] hover:bg-[#064e3b] text-base font-medium shadow-lg shadow-emerald-500/20" disabled={loading}>
              {loading ? 'Authenticating...' : isSignUp ? 'Create System Core' : 'Unlock System'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-muted-foreground hover:text-emerald-700 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need to initialize? First-time setup'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
