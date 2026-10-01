'use client';

import { useState, useEffect } from 'react';

import { ScreenConfig } from '@/types/screen';

// Map font family names to their Google Fonts import URL slugs
const GOOGLE_FONT_MAP: Record<string, string> = {
  'Inter': 'Inter:wght@400;500;600;700;800',
  'Outfit': 'Outfit:wght@400;500;600;700;800',
  'Bebas Neue': 'Bebas+Neue',
  'Roboto Mono': 'Roboto+Mono:wght@400;500;700',
};

interface ScreenPreviewProps {
  config: ScreenConfig;
  activePageId?: string;
}

export function ScreenPreview({ config, activePageId }: ScreenPreviewProps) {
  const page = config.pages.find(p => p.id === activePageId) || config.pages[0];

  if (!page) {
    return <div style={{ width: '100%', height: '100%', backgroundColor: config.layout.bgColor, color: config.layout.textColor }}>No page selected</div>;
  }

  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Dynamically load the selected Google Font
  useEffect(() => {
    const fontSlug = GOOGLE_FONT_MAP[config.layout.fontFamily];
    if (!fontSlug) return;
    
    const linkId = `gfont-${config.layout.fontFamily.replace(/\s/g, '-')}`;
    if (document.getElementById(linkId)) return; // Already loaded
    
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontSlug}&display=swap`;
    document.head.appendChild(link);
  }, [config.layout.fontFamily]);

  useEffect(() => {
    if (!page.timer?.enabled || !page.timer.endTime) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, page.timer!.endTime! - Date.now());
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, [page.timer?.enabled, page.timer?.endTime]);

  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const { layout, logo } = config;

  // Clean size maps — tuned for 1920×1080 canvas
  const titleSizeMap: Record<string, string> = {
    'SMALL': '5rem',
    'MEDIUM': '8rem',
    'LARGE': '10rem',
    'EXTRA LARGE': '12rem',
    // Legacy underscore format fallback
    'EXTRA_LARGE': '12rem',
  };

  const subtitleSizeMap: Record<string, string> = {
    'SMALL': '2rem',
    'MEDIUM': '3rem',
    'LARGE': '4rem',
  };

  const logoSizeMap: Record<string, string> = {
    'SMALL': '100px',
    'MEDIUM': '200px',
    'LARGE': '300px',
  };

  const hasBgImage = layout.bgImageUrl && layout.bgImageUrl.trim() !== '';

  const getLogoStyle = () => {
    const base: React.CSSProperties = { position: 'absolute' };
    switch (logo.position) {
      case 'TOP_LEFT': return { ...base, top: '40px', left: '40px' };
      case 'TOP_RIGHT': return { ...base, top: '40px', right: '40px' };
      case 'BOTTOM_LEFT': return { ...base, bottom: '40px', left: '40px' };
      case 'BOTTOM_RIGHT': return { ...base, bottom: '40px', right: '40px' };
      default: return {};
    }
  };

  // Build text shadows
  let titleShadow = 'none';
  let subtitleShadow = 'none';

  if (layout.glow === 'SUBTLE') {
    titleShadow = `0 0 20px ${layout.accentColor}80`;
    subtitleShadow = `0 0 10px ${layout.textColor}80`;
  } else if (layout.glow === 'NEON') {
    titleShadow = `0 0 10px ${layout.accentColor}, 0 0 40px ${layout.accentColor}`;
    subtitleShadow = `0 0 10px ${layout.textColor}, 0 0 20px ${layout.textColor}`;
  }

  if (layout.dropShadow) {
    titleShadow = titleShadow === 'none' ? '4px 4px 0px rgba(0,0,0,0.8)' : `${titleShadow}, 4px 4px 0px rgba(0,0,0,0.8)`;
    subtitleShadow = subtitleShadow === 'none' ? '2px 2px 0px rgba(0,0,0,0.8)' : `${subtitleShadow}, 2px 2px 0px rgba(0,0,0,0.8)`;
  }

  const timerIsActive = page.timer?.enabled && page.timer.endTime;
  const timerExpired = timerIsActive && timeLeft <= 0;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        color: layout.textColor,
        fontFamily: layout.fontFamily,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        textAlign: 'center',
        padding: '2rem',
        overflow: 'hidden',
      }}
    >
      {/* Background Layer */}
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: layout.bgColor,
          backgroundImage: hasBgImage ? `url(${layout.bgImageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: layout.bgOpacity ?? 1,
          zIndex: 0,
        }}
      />

      {/* Corner Logo */}
      {logo.enabled && logo.position !== 'CENTER' && logo.imageUrl && (
        <div style={{ ...getLogoStyle(), zIndex: 10 }}>
          <img src={logo.imageUrl} alt="Logo" style={{ maxHeight: logoSizeMap[logo.size], objectFit: 'contain' }} />
        </div>
      )}

      {/* Center content */}
      <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        {logo.enabled && logo.position === 'CENTER' && logo.imageUrl && (
          <div style={{ marginBottom: '2rem' }}>
            <img src={logo.imageUrl} alt="Logo" style={{ maxHeight: logoSizeMap[logo.size], objectFit: 'contain' }} />
          </div>
        )}
        
        {page.subtitle && (
          <h2
            style={{
              fontSize: subtitleSizeMap[layout.subtitleSize] || '3rem',
              fontWeight: 500,
              margin: 0,
              marginBottom: '1rem',
              lineHeight: 1.2,
              opacity: layout.subtitleOpacity ?? 0.9,
              textShadow: subtitleShadow,
            }}
          >
            {page.subtitle}
          </h2>
        )}

        {page.title && (
          <h1
            style={{
              fontSize: titleSizeMap[layout.titleSize] || '12rem',
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.1,
              textTransform: 'uppercase',
              textShadow: titleShadow,
              color: layout.accentColor,
              opacity: layout.titleOpacity ?? 1,
            }}
          >
            {page.title}
          </h1>
        )}

        {timerIsActive && (
          <div
            style={{
              fontSize: titleSizeMap[layout.titleSize] || '12rem',
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              margin: 0,
              marginTop: '2rem',
              lineHeight: 1.1,
              textShadow: titleShadow,
              color: layout.timerColor || layout.textColor,
              opacity: (timerExpired ? 0.4 : 1) * (layout.timerOpacity ?? 1),
            }}
          >
            {formatTime(timeLeft)}
          </div>
        )}
      </div>
    </div>
  );
}
