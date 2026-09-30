'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchTheme(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchTheme(session.user.id);
      } else {
        setTheme('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchTheme = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('theme')
      .eq('id', userId)
      .single();
    
    if (data && data.theme) {
      setTheme(data.theme);
      document.documentElement.setAttribute('data-theme', data.theme);
    }
  };

  return <>{children}</>;
}
