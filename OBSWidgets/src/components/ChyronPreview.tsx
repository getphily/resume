'use client';

import { useState, useEffect } from 'react';
import type { ChyronConfig } from '@/types/chyron';

const getFontFamily = (font: string) => {
  switch (font) {
    case 'Inter': return "'Inter', sans-serif";
    case 'Outfit': return "'Outfit', sans-serif";
    case 'VT323': return "'VT323', monospace";
    case 'Bebas Neue': return "'Bebas Neue', sans-serif";
    case 'Roboto Mono':
    default: return "'Roboto Mono', monospace";
  }
};

// Broadcast sizing constants (at scale=1, i.e. 1920px wide OBS output)
// Title bar: 90px tall
// Crawl bar: 50px tall
// Total chyron: ~140px out of 1080px (~13% of screen height)
const B = {
  titleBarHeight: 90,      // px
  subheaderHeight: 40,     // px
  crawlBarHeight: 50,      // px
  titleFontSize: 2.9,      // rem  → ~46px  (broadcast headline)
  subheaderFontSize: 1.4,  // rem  → ~22px
  crawlFontSize: 1.65,     // rem  → ~26px  (ticker)
  logoFontSize: 2.1,       // rem  → ~34px  (bug text e.g. "LIVE")
  logoImageHeight: 52,     // px
  clockFontSize: 1.5,      // rem  → ~24px  (monospaced clock)
  dateFontSize: 1.1,       // rem  → ~18px
  titlePadH: 22,           // px horizontal padding in title bar
  titleAccentBorder: 5,    // px left accent stripe
  crawlAccentBorder: 3,    // px top accent stripe on crawl bar
  logoPadH: 20,            // px horizontal padding in logo bug
  clockPadH: 18,           // px horizontal padding in clock area
};

// ─── Title Bar Layer ───────────────────────────────────────────────
function TitleLayer({ config, scale }: { config: ChyronConfig; scale: number }) {
  if (!config.title.enabled) return null;
  const { title, logo, clock, layout } = config;

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      alignItems: 'stretch',
      backgroundColor: title.bgColor,
      borderLeft: `${B.titleAccentBorder * scale}px solid ${layout.accentColor}`,
      minHeight: `${B.titleBarHeight * scale}px`,
    }}>
      {/* Logo bug (left position) */}
      {logo.enabled && logo.position === 'LEFT' && !logo.spanRows && (
        <LogoBug config={config} scale={scale} />
      )}

      {/* Title text */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: `${8 * scale}px ${B.titlePadH * scale}px`,
        overflow: 'hidden',
      }}>
        <span style={{
          fontFamily: getFontFamily(title.fontFamily),
          // title.fontSize is a multiplier on top of the broadcast base (2.9rem)
          fontSize: `${title.fontSize * B.titleFontSize * scale}rem`,
          fontWeight: title.bold ? 800 : 600,
          color: title.textColor,
          textTransform: title.textTransform,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '0.03em',
          lineHeight: 1,
        }}>
          {title.text || 'HEADLINE TEXT'}
        </span>
      </div>

      {/* Clock + Logo bug (right position) */}
      <div style={{ display: 'flex', alignItems: 'stretch', marginLeft: 'auto', flexShrink: 0 }}>
        {clock.enabled && clock.position === 'RIGHT' && (
          <ClockLayer config={config} scale={scale} inline />
        )}
        {logo.enabled && logo.position === 'RIGHT' && !logo.spanRows && (
          <LogoBug config={config} scale={scale} />
        )}
      </div>
    </div>
  );
}

// ─── Logo Bug ──────────────────────────────────────────────────────
function LogoBug({ config, scale }: { config: ChyronConfig; scale: number }) {
  const { logo } = config;
  if (!logo.enabled) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: logo.mode === 'IMAGE' ? 'stretch' : 'center',
      justifyContent: 'center',
      padding: logo.mode === 'IMAGE' ? 0 : `${8 * scale}px ${B.logoPadH * scale}px`,
      backgroundColor: logo.bgColor,
      flexShrink: 0,
      minWidth: logo.mode === 'IMAGE' ? 'auto' : `${80 * scale}px`,
      position: 'relative',
    }}>
      {logo.mode === 'IMAGE' && logo.imageUrl ? (
        <>
          {logo.showLiveBadge !== false && (
            <div style={{
              position: 'absolute',
              top: `${16 * scale}px`, // +33%
              left: `${16 * scale}px`, // +33%
              backgroundColor: 'rgba(230, 57, 70, 0.95)',
              color: 'white',
              padding: `${6 * scale}px ${12 * scale}px`, // +50%
              fontSize: `${1.05 * scale}rem`, // +30%
              fontWeight: 800,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.08em',
              borderRadius: `${16 * scale}px`, // Pill shape
              zIndex: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              textTransform: 'uppercase',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              gap: `${8 * scale}px`, // +33%
              backdropFilter: 'blur(4px)',
            }}>
              <div style={{
                width: `${8 * scale}px`, // +33%
                height: `${8 * scale}px`, // +33%
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                animation: 'pulse-dot 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }} />
              LIVE
            </div>
          )}
          <img
            src={logo.imageUrl}
            alt="Logo"
            style={{
              width: logo.spanRows
                ? `${(B.titleBarHeight + (config.subheader.enabled ? B.subheaderHeight : 0) + (config.crawl.enabled ? B.crawlBarHeight : 0)) * scale * (logo.aspectRatio === '16:9' ? 16 / 9 : 1)}px`
                : `${B.titleBarHeight * scale * (logo.aspectRatio === '16:9' ? 16 / 9 : 1)}px`,
              height: logo.spanRows
                ? `${(B.titleBarHeight + (config.subheader.enabled ? B.subheaderHeight : 0) + (config.crawl.enabled ? B.crawlBarHeight : 0)) * scale}px`
                : `${B.titleBarHeight * scale}px`,
              objectFit: 'cover',
            }}
          />
        </>
      ) : (
        <span style={{
          fontFamily: getFontFamily(logo.fontFamily),
          fontSize: `${B.logoFontSize * scale}rem`,
          fontWeight: 800,
          color: logo.textColor,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          lineHeight: 1,
        }}>
          {logo.text || 'LIVE'}
        </span>
      )}
    </div>
  );
}

// ─── Clock Layer ───────────────────────────────────────────────────
function ClockLayer({ config, scale, inline = false }: { config: ChyronConfig; scale: number; inline?: boolean }) {
  const { clock } = config;
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!clock.enabled || !time) return null;

  const getTimeStr = () => {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      ...(clock.showSeconds ? { second: '2-digit' } : {}),
      hour12: clock.format === '12HR',
      ...(clock.timezone !== 'LOCAL' ? { timeZone: clock.timezone } : {}),
    };
    return time.toLocaleTimeString('en-US', options);
  };

  const getDateStr = () => {
    if (!clock.showDate) return null;
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      ...(clock.timezone !== 'LOCAL' ? { timeZone: clock.timezone } : {}),
    };
    return time.toLocaleDateString('en-US', options);
  };

  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: `${3 * scale}px`,
      padding: `${8 * scale}px ${B.clockPadH * scale}px`,
      backgroundColor: clock.bgColor,
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: getFontFamily('Roboto Mono'),
        fontSize: `${B.clockFontSize * scale * (clock.fontSize || 1.0)}rem`,
        fontWeight: 700,
        color: clock.textColor,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        letterSpacing: '0.04em',
        lineHeight: 1,
      }}>
        {getTimeStr().split(':').map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && (
              <span style={clock.blinkColon ? { animation: 'chyron-blink 1s step-end infinite' } : {}}>:</span>
            )}
          </span>
        ))}
      </span>
      {clock.showDate && (
        <span style={{
          fontFamily: getFontFamily('Roboto Mono'),
          fontSize: `${B.dateFontSize * scale * (clock.fontSize || 1.0)}rem`,
          color: clock.textColor,
          opacity: 0.75,
          whiteSpace: 'nowrap',
          letterSpacing: '0.03em',
          lineHeight: 1,
        }}>
          {getDateStr()}
        </span>
      )}
    </div>
  );

  if (inline) return content;

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: clock.position === 'RIGHT' ? 'flex-end' : 'flex-start',
    }}>
      {content}
    </div>
  );
}

// ─── Subheader Layer ───────────────────────────────────────────────
function SubheaderLayer({ config, scale }: { config: ChyronConfig; scale: number }) {
  const { subheader } = config;
  if (!subheader.enabled) return null;

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: subheader.bgColor,
      minHeight: `${B.subheaderHeight * scale}px`,
      padding: `${4 * scale}px ${B.titlePadH * scale}px`,
      borderLeft: `${B.titleAccentBorder * scale}px solid ${config.layout.accentColor}`,
    }}>
      <span style={{
        fontFamily: getFontFamily(subheader.fontFamily),
        fontSize: `${subheader.fontSize * B.subheaderFontSize * scale}rem`,
        fontWeight: subheader.bold ? 700 : 500,
        color: subheader.textColor,
        textTransform: subheader.textTransform,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        letterSpacing: '0.04em',
      }}>
        {subheader.text || 'SUBTITLE TEXT'}
      </span>
    </div>
  );
}

// ─── Crawl Layer ───────────────────────────────────────────────────
function CrawlLayer({ config, scale }: { config: ChyronConfig; scale: number }) {
  const { crawl } = config;
  if (!crawl.enabled) return null;

  const getAnimationDuration = () => {
    switch (crawl.speed) {
      case 'SLOW': return '40s';
      case 'FAST': return '14s';
      default: return '24s';
    }
  };

  const crawlText = crawl.blocks
    .filter(b => b.enabled)
    .map(b => b.text)
    .join(`\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0${crawl.separator}\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`);

  if (!crawlText) return null;

  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      backgroundColor: crawl.bgColor,
      borderTop: `${B.crawlAccentBorder * scale}px solid ${config.layout.accentColor}`,
      minHeight: `${B.crawlBarHeight * scale}px`,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        fontFamily: getFontFamily(crawl.fontFamily),
        // crawl.fontSize is a multiplier on top of the broadcast base (1.65rem)
        fontSize: `${crawl.fontSize * B.crawlFontSize * scale}rem`,
        fontWeight: 700,
        color: crawl.textColor,
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        animation: `scroll-chyron ${getAnimationDuration()} linear infinite`,
        letterSpacing: '0.04em',
        lineHeight: 1,
        paddingLeft: `${16 * scale}px`,
      }}>
        {crawlText}
      </div>
    </div>
  );
}

// ─── Composite Chyron Preview ──────────────────────────────────────
export default function ChyronPreview({ config, scale = 1 }: { config: ChyronConfig; scale?: number }) {
  const layerRenderers: Record<string, React.ReactNode> = {
    title: <TitleLayer key="title" config={config} scale={scale} />,
    subheader: <SubheaderLayer key="subheader" config={config} scale={scale} />,
    crawl: <CrawlLayer key="crawl" config={config} scale={scale} />,
  };

  const layers = config.layerOrder
    .filter(id => id === 'title' || id === 'subheader' || id === 'crawl')
    .map(id => layerRenderers[id]);

  const stack = (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {layers}
    </div>
  );

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: config.logo.spanRows && config.logo.position === 'RIGHT' ? 'row-reverse' : 'row',
      alignItems: 'stretch',
      backgroundColor: config.layout.bgMode === 'TRANSPARENT' ? 'transparent' : config.layout.bgColor,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@500;600;700;800&family=Outfit:wght@500;600;700&family=VT323&display=swap');
        @keyframes scroll-chyron {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
      
      {config.logo.enabled && config.logo.spanRows && (
        <LogoBug config={config} scale={scale} />
      )}
      {stack}
    </div>
  );
}
