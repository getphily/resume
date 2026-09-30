'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav style={{ 
      height: '60px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 24px',
      backgroundColor: 'var(--bg-navbar)',
      color: 'var(--text-navbar)',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        {/* Brand / Logo Area */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-navbar)', textDecoration: 'none' }}>
          <div style={{ width: '24px', height: '24px', backgroundColor: 'var(--text-navbar)', color: 'var(--bg-navbar)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '0.8rem' }}>H</div>
          getphily.io
        </Link>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {session ? (
          <>
            <Link href="/account" style={{ color: 'var(--text-navbar)', opacity: 0.9, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Account</Link>
            <button 
              onClick={() => supabase.auth.signOut()} 
              style={{ background: 'none', border: 'none', color: 'var(--text-navbar)', opacity: 0.9, cursor: 'pointer', fontSize: '14px', fontWeight: 500, padding: 0 }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/auth">
            <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.9rem', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>Sign In</button>
          </Link>
        )}
      </div>
    </nav>
  );
}
