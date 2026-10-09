'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

  const base = "px-3 py-2 rounded-md transition-colors whitespace-nowrap";
  const cls = (active: boolean) =>
    cn(base, active ? "text-white bg-white/10 " : "text-slate-300 hover:text-white hover:bg-white/10");

  const toolsetActive = (ts: (typeof TOOLSETS)[number]) =>
    (pathname === '/dashboard' && activeSet === ts.id) ||
    ts.tools.some((t) => pathname.startsWith(t.path)) ||
    (ts.id === 'broadcast' && ['/chyron', '/stream-studio'].some((p) => pathname.startsWith(p)));

  return (
    <nav className="hidden lg:flex items-center gap-2 ml-4 text-[15px] font-heading tracking-wide" aria-label="Main">
      <Link href="/" className={cls(pathname === '/')} aria-current={pathname === '/' ? 'page' : undefined}>
        Home
      </Link>
      <Link
        href="/dashboard"
        className={cls(pathname === '/dashboard' && !activeSet)}
        aria-current={pathname === '/dashboard' && !activeSet ? 'page' : undefined}
      >
        Dashboard
      </Link>
      <Link
        href="/account"
        className={cls(pathname.startsWith('/account'))}
        aria-current={pathname.startsWith('/account') ? 'page' : undefined}
      >
        Account & Media
      </Link>
      <span className="w-px h-5 bg-white/15 mx-2" aria-hidden="true" />
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

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('theme-updated', onThemeUpdated);
    };
  }, []);

  const toggleTheme = async () => {
    let nextTheme: ThemeMode = 'modern-minimal';
    if (currentTheme === 'dark') nextTheme = 'modern-minimal';
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
    const THEME_LABELS: Record<ThemeMode, string> = {
      'modern-minimal': 'Modern Minimal (Default)',
      'autoblog': 'Autoblog',
      'alpine': 'Alpine',
      'light-green': 'Light Green',
      'dark': 'Dark mode',
      'light': 'Light mode',
    };
    const label = THEME_LABELS[nextTheme] || 'Theme';
    toast.success(`${label} enabled`, { id: 'theme-toast', duration: 1500 });
  };

  const isDark = currentTheme === 'dark';
  const tooltipContent = isDark ? 'Switch to Modern Minimal' : 'Switch to Dark mode';

  return (
    <header className="h-[72px] bg-[#0f172a] text-white border-b border-white/10 px-4 flex items-center justify-between shrink-0 z-20">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-slate-300 hover:text-white hover:bg-white/10 h-11 w-11"
          onClick={() => setIsOpen(prev => !prev)}
          aria-expanded={isOpen}
          aria-controls="main-menu"
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>

        {/* Brand Logo */}
        <Link href="/" className="flex items-center no-underline group min-h-[44px] p-1 rounded-md focus-visible:outline-white focus-visible:outline-2 focus-visible:outline-offset-2">
          <Image src="/logo-gp-black.png" alt="GetPhily Logo" width={48} height={48} className="h-10 w-auto object-contain drop-shadow-sm group-hover:opacity-90 transition-opacity" priority />
        </Link>

        {/* Desktop Nav: Home, Dashboard, one item per toolset */}
        <Suspense fallback={null}>
          <TopNavLinks />
        </Suspense>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Theme Switcher */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-slate-300 hover:text-white hover:bg-white/10 h-11 w-11"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>

        <div className="hidden sm:block w-px h-6 bg-white/15 mx-2" aria-hidden="true" />

        {session ? (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className="text-slate-200 hover:text-white hover:bg-white/10 text-sm font-medium h-11 px-3 gap-2 hidden sm:flex"
            >
              <Link href="/account">
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
              className="text-slate-400 hover:text-red-400 hover:bg-white/10 text-sm font-medium h-11 px-3 gap-2"
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
