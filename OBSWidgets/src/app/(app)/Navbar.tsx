'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Flex, Box, Text, Button, IconButton, Tooltip, Badge } from '@radix-ui/themes';
import { SunIcon, MoonIcon, PersonIcon, ExitIcon } from '@radix-ui/react-icons';
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

    // Sync theme
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

  return (
    <Flex asChild align="center" justify="between" px="4" style={{ 
      height: '60px', 
      backgroundColor: 'var(--bg-navbar)',
      color: 'var(--text-navbar)',
      zIndex: 20,
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <nav>
        <Flex align="center" gap="4">
          {/* Brand Logo & Title */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Flex align="center" gap="3">
              <Box style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: 'var(--accent-primary)', 
                color: '#ffffff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </Box>
              <Flex direction="column" gap="0">
                <Text size="3" weight="bold" style={{ color: 'var(--text-navbar)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  getphily.io
                </Text>
                <Text size="1" style={{ color: 'rgba(255, 255, 255, 0.6)', letterSpacing: '0.06em', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
                  OBS Stream Studio
                </Text>
              </Flex>
            </Flex>
          </Link>
          <Badge size="1" color="indigo" variant="surface" style={{ display: 'none' }}>v2.0</Badge>
        </Flex>
        
        <Flex align="center" gap="3">
          {/* Theme Switcher Quick Action */}
          {(() => {
            const isDark = currentTheme === 'dark' || currentTheme === 'antd-dark';
            const tooltipContent = 
              currentTheme === 'dark' ? 'Switch to Light mode' :
              currentTheme === 'light' ? 'Switch to Dark mode' :
              currentTheme === 'antd-dark' ? 'Switch to Ant Design Pro (Light)' :
              'Switch to Ant Design Pro (Dark)';

            return (
              <Tooltip content={tooltipContent}>
                <IconButton 
                  size="2" 
                  variant="ghost" 
                  onClick={toggleTheme}
                  style={{ color: 'var(--text-navbar)', cursor: 'pointer' }}
                  aria-label="Toggle Theme"
                >
                  {isDark ? <SunIcon width={18} height={18} /> : <MoonIcon width={18} height={18} />}
                </IconButton>
              </Tooltip>
            );
          })()}

          <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

          {session ? (
            <Flex align="center" gap="3">
              <Link href="/account" style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="2" style={{ color: 'var(--text-navbar)', opacity: 0.9, gap: '6px' }}>
                  <PersonIcon /> Account
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="2"
                onClick={() => {
                  supabase.auth.signOut();
                  toast.success('Signed out');
                }} 
                style={{ color: 'var(--text-navbar)', opacity: 0.8, gap: '6px' }}
              >
                <ExitIcon /> Sign Out
              </Button>
            </Flex>
          ) : (
            <Button asChild variant="outline" size="2" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </Flex>
      </nav>
    </Flex>
  );
}
