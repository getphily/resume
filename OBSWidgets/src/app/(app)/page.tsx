'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
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
    <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', borderBottom: '1px solid var(--border-rigid)', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>getphily's OBS Widgets</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Select a widget to customize and import into OBS.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {session ? (
            <>
              <Link href="/account" style={{ color: 'var(--active-amber)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>ACCOUNT</Link>
              <button 
                onClick={() => supabase.auth.signOut()} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
              >
                SIGN OUT
              </button>
            </>
          ) : (
            <Link href="/auth">
              <button className="btn-amber">Sign In</button>
            </Link>
          )}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Clock Widget Card */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="preview-window-container" style={{ aspectRatio: '300 / 200' }}>
            <div className="screen-readout" style={{ fontSize: '2rem' }}>
              12:34:56
            </div>
          </div>
          <div>
            <h3>Clock Widget</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>A fully customizable digital clock. Customize colors, font, and format.</p>
            <Link href="/clock">
              <button className="btn-amber" style={{ width: '100%' }}>Customize</button>
            </Link>
          </div>
        </div>

        {/* Marquee Widget Card */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="preview-window-container" style={{ aspectRatio: '1920 / 300' }}>
            <div className="screen-readout" style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <span style={{ display: 'inline-block', animation: 'scroll 5s linear infinite' }}>SCROLLING TEXT EXAMPLE...</span>
            </div>
          </div>
          <style>{`
            @keyframes scroll {
              from { transform: translateX(100%); }
              to { transform: translateX(-100%); }
            }
          `}</style>
          <div>
            <h3>Marquee Widget</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>A horizontal scrolling marquee for announcements or ticker text.</p>
            <Link href="/marquee">
              <button className="btn-amber" style={{ width: '100%' }}>Customize</button>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
