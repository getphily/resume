'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Radio } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      try {
        // Check current session or wait for hash tokens to process
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session) {
          toast.success('Successfully signed in with Google!', {
            position: 'top-center',
          });
          router.replace('/dashboard');
          return;
        }

        // Listen for auth state change in case OAuth hash tokens are being processed
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            toast.success('Successfully signed in with Google!', {
              position: 'top-center',
            });
            router.replace('/dashboard');
          }
        });

        // Fallback timeout after 3 seconds
        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          router.replace('/dashboard');
        }, 3000);

        return () => {
          clearTimeout(timeout);
          subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setErrorMsg(err.message || 'Authentication failed');
        toast.error(err.message || 'Authentication failed', { position: 'top-center' });
        setTimeout(() => router.replace('/auth'), 2000);
      }
    }

    handleAuth();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-4 p-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center animate-pulse">
        <Radio className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold">
        {errorMsg ? 'Authentication Failed' : 'Completing Google Sign In...'}
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        {errorMsg ? errorMsg : 'Verifying your credentials and directing you to your dashboard.'}
      </p>
    </div>
  );
}
