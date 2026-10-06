'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Radio 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeMode, VALID_THEMES } from '@/app/ThemeProvider';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const themeAttr = document.documentElement.getAttribute('data-theme') as ThemeMode;
    if (themeAttr && VALID_THEMES.includes(themeAttr)) setCurrentTheme(themeAttr);

    const onThemeUpdated = () => {
      const updated = document.documentElement.getAttribute('data-theme') as ThemeMode;
      if (updated && VALID_THEMES.includes(updated)) setCurrentTheme(updated);
    };
    window.addEventListener('theme-updated', onThemeUpdated);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('theme-updated', onThemeUpdated);
    };
  }, []);

  const toggleTheme = async () => {
    let nextTheme: ThemeMode = 'dark';
    if (currentTheme === 'dark') nextTheme = 'light';
    else if (currentTheme === 'light') nextTheme = 'dark';
    else if (currentTheme === 'antd-dark') nextTheme = 'antd-light';
    else if (currentTheme === 'antd-light') nextTheme = 'antd-dark';
    else nextTheme = 'dark';

    setCurrentTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    window.dispatchEvent(new Event('theme-updated'));

    if (session) {
      await supabase
        .from('profiles')
        .upsert({ id: session.user.id, theme: nextTheme, updated_at: new Date().toISOString() });
    }
    const label = 
      nextTheme === 'antd-light' ? 'Ant Design Pro (Light)' :
      nextTheme === 'antd-dark' ? 'Ant Design Pro (Dark)' :
      nextTheme === 'dark' ? 'Dark mode' : 'Light mode';
    toast.success(`${label} enabled`, { id: 'theme-toast', duration: 1500 });
  };

  const isDark = currentTheme === 'dark' || currentTheme === 'antd-dark';
  const tooltipContent = 
    currentTheme === 'dark' ? 'Switch to Light mode' :
    currentTheme === 'light' ? 'Switch to Dark mode' :
    currentTheme === 'antd-dark' ? 'Switch to Ant Design Pro (Light)' :
    'Switch to Ant Design Pro (Dark)';

  return (
    <header className="h-[60px] bg-[#0f172a] text-white border-b border-white/10 px-4 flex items-center justify-between shrink-0 z-20">
      <div className="flex items-center gap-4">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 no-underline group">
          <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
            <Radio className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white leading-tight">
              getphily.io
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
              OBS Stream Studio
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Theme Switcher */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-slate-300 hover:text-white hover:bg-white/10 h-8 w-8"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-5 bg-white/15 mx-1" />

        {session ? (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className="text-slate-200 hover:text-white hover:bg-white/10 text-xs font-medium h-8 gap-1.5"
            >
              <Link href="/account">
                <User className="w-3.5 h-3.5" />
                <span>Account</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                supabase.auth.signOut();
                toast.success('Signed out');
              }}
              className="text-slate-400 hover:text-red-400 hover:bg-white/10 text-xs font-medium h-8 gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="border-white/20 text-white hover:bg-white/10 text-xs h-8"
          >
            <Link href="/auth">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
