'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Theme } from '@radix-ui/themes';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // 1. Initial local theme check
    const savedLocal = typeof window !== 'undefined' ? localStorage.getItem('theme') as 'light' | 'dark' : null;
    if (savedLocal) {
      setTheme(savedLocal);
      document.documentElement.setAttribute('data-theme', savedLocal);
    } else if (typeof window !== 'undefined') {
      const currentAttr = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
      if (currentAttr) setTheme(currentAttr);
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
      const current = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
      if (current) {
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
      const resolved = data.theme === 'light' ? 'light' : 'dark';
      setTheme(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
      localStorage.setItem('theme', resolved);
    }
  };

  return (
    <Theme appearance={theme} accentColor="indigo" radius="medium">
      {children}
    </Theme>
  );
}
