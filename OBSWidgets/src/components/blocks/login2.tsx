'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Radio, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Login2Block() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Welcome back!');
        router.push('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Verification link sent! Check your email inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
      setGoogleLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      
      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border/60">
        <Link href="/" className="inline-flex items-center gap-2.5 text-foreground hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-xs">
            <Radio className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg  text-foreground">
            getphily&apos;s code stand
          </span>
        </Link>
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Stand</span>
        </Link>
      </header>

      {/* Center Auth Card (Shadcnblocks Login2 pattern) */}
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center gap-6">
          
          <div className="flex w-full flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            
            {/* Header */}
            <div className="flex flex-col gap-1.5 text-center">
              <h1 className="text-2xl   text-foreground">
                {isLogin ? 'Log in to your account' : 'Create your account'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLogin 
                  ? 'Access your saved overlays, stream widgets, and studio settings.' 
                  : 'Start creating broadcast overlays and custom browser sources.'}
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div role="alert" className="p-3 bg-red-500/10 border border-red-500/25 rounded-md text-red-600 dark:text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Google OAuth Provider Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full h-11 gap-2.5 text-sm font-semibold border-border bg-card hover:bg-muted/60 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
            </Button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Or with email
              </div>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="streamer@broadcast.io"
                  required
                  className="h-10 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="h-10 text-sm"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading || googleLoading} 
                className="w-full h-11 text-sm font-semibold mt-1"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In to Studio' : 'Create Studio Account'}
              </Button>
            </form>

            {/* Toggle Login / Signup */}
            <div className="text-center pt-2 border-t border-border/80">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }}
                  className="font-bold text-primary hover:underline cursor-pointer bg-transparent border-0 p-0 ml-1"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>

          </div>

          <p className="text-xs text-muted-foreground text-center max-w-xs">
            By signing in, you agree to our terms of service and broadcast privacy policy.
          </p>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-border/60 text-xs text-muted-foreground">
        © {new Date().getFullYear()} OBSWidgets Studio • Real-Time Stream Overlays
      </footer>

    </section>
  );
}
