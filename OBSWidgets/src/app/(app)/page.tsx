'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', color: 'var(--text-primary)' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Manage your custom OBS widgets.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Clock Widget Card */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="preview-window-container" style={{ aspectRatio: '16 / 9', marginBottom: '20px', borderRadius: '6px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
              12:34
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Clock Widget</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>A fully customizable digital clock. Edit colors, font, and format for your stream.</p>
            <Link href="/clock">
              <button className="btn-primary" style={{ width: '100%' }}>Manage Widget</button>
            </Link>
          </div>
        </div>

        {/* Chyron Builder Card */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="preview-window-container" style={{ aspectRatio: '16 / 5', marginBottom: '20px', borderRadius: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
            {/* Mini chyron mockup */}
            <div style={{ backgroundColor: '#1a1a2e', borderLeft: '3px solid #e63946', padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>BREAKING NEWS HEADLINE</span>
              <span style={{ color: '#fff', fontSize: '10px', fontFamily: 'monospace', backgroundColor: '#e63946', padding: '2px 6px', borderRadius: '2px' }}>LIVE</span>
            </div>
            <div style={{ backgroundColor: '#0f172a', borderTop: '2px solid #e63946', padding: '4px 12px', overflow: 'hidden' }}>
              <span style={{ color: '#fff', fontSize: '10px', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block', animation: 'scroll 6s linear infinite' }}>SCROLLING TICKER TEXT ★ LATEST UPDATES ★ LIVE COVERAGE</span>
            </div>
          </div>
          <style>{`
            @keyframes scroll {
              from { transform: translateX(100%); }
              to { transform: translateX(-100%); }
            }
          `}</style>
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Chyron Builder</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>Build broadcast-style lower thirds with title, logo, clock, and scrolling crawl.</p>
            <Link href="/crawl">
              <button className="btn-primary" style={{ width: '100%' }}>Open Builder</button>
            </Link>
          </div>
        </div>

        {/* Screen Sets Card */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="preview-window-container" style={{ aspectRatio: '16 / 9', marginBottom: '20px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', lineHeight: 1.1 }}>STARTING SOON</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>The stream will begin shortly...</div>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Screen Sets</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>Create full-screen overlays for Starting Soon, Be Right Back, and Goodbye pages with timers.</p>
            <Link href="/screen">
              <button className="btn-primary" style={{ width: '100%' }}>Manage Screens</button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
