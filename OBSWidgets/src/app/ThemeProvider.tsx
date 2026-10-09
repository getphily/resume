'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type ThemeMode = 'modern-minimal' | 'autoblog' | 'alpine' | 'light-green' | 'japan-blues' | 'astrovista' | 'porfolio' | 'vescrow' | 'polaris' | 'claude' | 'dark' | 'light';

export const VALID_THEMES: ThemeMode[] = [
  'modern-minimal',
  'autoblog',
  'alpine',
  'light-green',
  'japan-blues',
  'astrovista',
  'porfolio',
  'vescrow',
  'polaris',
  'claude',
  'dark',
  'light',
];

export const DEFAULT_THEME: ThemeMode = 'modern-minimal';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(DEFAULT_THEME);

  useEffect(() => {
    // 1. Initial local theme check
    const savedLocal = typeof window !== 'undefined' ? localStorage.getItem('theme') as ThemeMode : null;
    if (savedLocal && VALID_THEMES.includes(savedLocal)) {
      setTheme(savedLocal);
      document.documentElement.setAttribute('data-theme', savedLocal);
    } else if (typeof window !== 'undefined') {
      const currentAttr = document.documentElement.getAttribute('data-theme') as ThemeMode;
      if (currentAttr && VALID_THEMES.includes(currentAttr)) {
        setTheme(currentAttr);
      }
    }

    // 2. Fetch profile theme if logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchTheme(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchTheme(session.user.id);
      }
    });

    const handleThemeUpdated = () => {
      const current = document.documentElement.getAttribute('data-theme') as ThemeMode;
      if (current && VALID_THEMES.includes(current)) {
        setTheme(current);
        localStorage.setItem('theme', current);
      }
    };
    window.addEventListener('theme-updated', handleThemeUpdated);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('theme-updated', handleThemeUpdated);
    };
  }, []);

  const fetchTheme = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('theme')
      .eq('id', userId)
      .single();
    
    if (data && data.theme) {
      const resolved = VALID_THEMES.includes(data.theme as ThemeMode)
        ? (data.theme as ThemeMode)
        : DEFAULT_THEME;
      setTheme(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
      localStorage.setItem('theme', resolved);
    }
  };

  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return <>{children}</>;
}
