'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import { usePathname, useSearchParams } from 'next/navigation';
import { TOOLSETS } from '@/lib/toolsets';
import { cn } from '@/lib/utils';
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
  Radio,
  Menu,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeMode, VALID_THEMES } from '@/app/ThemeProvider';
import { useMobileNav } from '@/components/MobileNavContext';

function TopNavLinks() {
  const pathname = (usePathname() || '').replace(/\/$/, '') || '/';
  const searchParams = useSearchParams();
  const activeSet = searchParams.get('set');

  const base = "px-3 py-1.5 rounded-md transition-colors whitespace-nowrap";
  const cls = (active: boolean) =>
    cn(base, active ? "text-primary bg-primary/10 font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted");

  const toolsetActive = (ts: (typeof TOOLSETS)[number]) =>
    (pathname === '/dashboard' && activeSet === ts.id) ||
    ts.tools.some((t) => pathname.startsWith(t.path)) ||
    (ts.id === 'broadcast' && ['/chyron', '/stream-studio'].some((p) => pathname.startsWith(p)));

  return (
    <nav className="hidden lg:flex items-center gap-1 ml-4 text-sm font-sans font-normal" aria-label="Main">
      <Link
        href="/dashboard"
        className={cls(pathname === '/dashboard' && !activeSet)}
        aria-current={pathname === '/dashboard' && !activeSet ? 'page' : undefined}
      >
        Dashboard
      </Link>
      <span className="w-px h-5 bg-border mx-2" aria-hidden="true" />
      {TOOLSETS.map((ts) => {
        const active = toolsetActive(ts);
        return (
          <Link
            key={ts.id}
            href={`/dashboard?set=${ts.id}`}
            className={cls(active)}
            aria-current={active ? 'page' : undefined}
          >
            {ts.name}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('light');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [menuIsDark, setMenuIsDark] = useState(false);
  const { isOpen, setIsOpen } = useMobileNav();

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

        const onModeUpdated = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark') || localStorage.getItem('mode') === 'dark');
      setMenuIsDark(localStorage.getItem('topMenuMode') === 'dark');
    };
    onModeUpdated();
    window.addEventListener('mode-updated', onModeUpdated);
    window.addEventListener('menu-mode-updated', onModeUpdated);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('theme-updated', onThemeUpdated);
      window.removeEventListener('mode-updated', onModeUpdated);
      window.removeEventListener('menu-mode-updated', onModeUpdated);
    };
  }, []);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const nextMode = isDark ? 'light' : 'dark';
    
    if (nextMode === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mode', 'dark');
      setIsDarkMode(true);
      toast.success('Dark mode enabled', { id: 'mode-toast', duration: 1500 });
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mode', 'light');
      setIsDarkMode(false);
      toast.success('Light mode enabled', { id: 'mode-toast', duration: 1500 });
    }
    window.dispatchEvent(new Event('mode-updated'));
  };
  

  return (
    <header className={cn("h-[72px] bg-card text-card-foreground border-b border-border px-4 flex items-center justify-between shrink-0 z-20 shadow-sm", menuIsDark && "dark")}>
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-muted h-11 w-11"
          onClick={() => setIsOpen(prev => !prev)}
          aria-expanded={isOpen}
          aria-controls="main-menu"
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>

        {/* Brand Logo */}
        <Link href="/" className="flex items-center no-underline group min-h-[44px] p-1 rounded-md focus-visible:outline-white focus-visible:outline-2 focus-visible:outline-offset-2">
          <Logo className="h-10 w-10 drop-shadow-sm group-hover:opacity-90 transition-opacity"  />
        </Link>

        {/* Desktop Nav: Home, Dashboard, one item per toolset */}
        <Suspense fallback={null}>
          <TopNavLinks />
        </Suspense>
      </div>

      <div className="flex items-center gap-2">
        

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
              className="text-muted-foreground hover:text-foreground hover:bg-muted w-10 h-10 transition-colors"
              aria-label="Toggle Light/Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</p>
          </TooltipContent>
        </Tooltip>

        <div className="hidden sm:block w-px h-6 bg-border mx-2" aria-hidden="true" />

        {session ? (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className="text-muted-foreground hover:text-foreground hover:bg-muted text-sm font-medium h-11 px-3 gap-2 hidden sm:flex"
            >
              <Link href="/dashboard">
                <User className="w-4 h-4" />
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
              className="text-muted-foreground hover:text-red-500 hover:bg-muted text-sm font-medium h-11 px-3 gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
              
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="bg-transparent border-white/20 text-white hover:text-white hover:bg-white/10 text-sm h-11 px-4"
          >
            <Link href="/auth">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
