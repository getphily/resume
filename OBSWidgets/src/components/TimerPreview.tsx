'use client';

import { useState, useEffect, useRef } from 'react';
import { TimerConfig } from '@/types/timer';

const GOOGLE_FONT_MAP: Record<string, string> = {
  'Inter': 'Inter:wght@400;500;600;700;800',
  'Outfit': 'Outfit:wght@400;500;600;700;800',
  'Bebas Neue': 'Bebas+Neue',
  'Roboto Mono': 'Roboto+Mono:wght@400;500;700',
  'Roboto': 'Roboto:wght@400;700',
  'Poppins': 'Poppins:wght@400;700',
  'Montserrat': 'Montserrat:wght@400;700',
  'Open Sans': 'Open+Sans:wght@400;700',
  'Lato': 'Lato:wght@400;700',
  'Raleway': 'Raleway:wght@400;700',
  'Nunito': 'Nunito:wght@400;700',
  'Playfair Display': 'Playfair+Display:wght@400;700',
  'Oswald': 'Oswald:wght@400;700',
  'Fira Code': 'Fira+Code:wght@400;700',
};

interface TimerPreviewProps {
  config: TimerConfig;
  scale?: number;
  // Let the builder pass in the state (running, paused)
  previewState?: 'STOPPED' | 'RUNNING' | 'PAUSED' | 'EXPIRED';
  previewTimeLeft?: number;
}

export function TimerPreview({ config, scale = 1, previewState, previewTimeLeft }: TimerPreviewProps) {
  
  const [actualTimeLeft, setActualTimeLeft] = useState(config.durationSeconds);
  const totalDuration = config.durationSeconds;
  
  const currentState = previewState || config.state;
  const isEmbed = previewState === undefined; // If no previewState provided, we are in embed (or using live config)

  // Calculate time left continuously if running
  useEffect(() => {
    if (isEmbed) {
      if (config.state === 'RUNNING' && config.endTime) {
        const updateTimer = () => {
          const remaining = Math.max(0, Math.ceil((config.endTime! - Date.now()) / 1000));
          setActualTimeLeft(remaining);
        };
        updateTimer();
        const interval = setInterval(updateTimer, 100);
        return () => clearInterval(interval);
      } else if (config.state === 'PAUSED' && config.pausedTimeLeft !== null) {
        setActualTimeLeft(config.pausedTimeLeft);
      } else if (config.state === 'STOPPED') {
        setActualTimeLeft(config.durationSeconds);
      } else if (config.state === 'EXPIRED') {
        setActualTimeLeft(0);
      }
    }
  }, [isEmbed, config.state, config.endTime, config.pausedTimeLeft, config.durationSeconds]);
  
  const timeLeft = isEmbed ? actualTimeLeft : (previewTimeLeft !== undefined ? previewTimeLeft : actualTimeLeft);
  
  // Also load fonts
  useEffect(() => {
    const fontSlug = GOOGLE_FONT_MAP[config.layout.fontFamily];
    if (!fontSlug) return;
    
    const linkId = `gfont-${config.layout.fontFamily.replace(/\s/g, '-')}`;
    if (document.getElementById(linkId)) return;
    
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontSlug}&display=swap`;
    document.head.appendChild(link);
  }, [config.layout.fontFamily]);

  // Determine colors based on state
  let primaryColor = config.layout.runningColor;
  let bgThemeColor = config.layout.bgColor;
  
  if (currentState === 'PAUSED' || currentState === 'STOPPED') {
    primaryColor = config.layout.pausedColor;
  } else if (currentState === 'EXPIRED') {
    primaryColor = config.layout.expiredColor;
    bgThemeColor = `${config.layout.expiredColor}20`; // Light tint of red
  }
  
  // To match the screenshot, the track color is slightly visible
  const trackColor = config.layout.trackColor;

  // Format time
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '0';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) {
      return `${m}:${s.toString().padStart(2, '0')}`;
    }
    return `${s}`;
  };

  // SVG Progress circle calculation
  const strokeWidth = 6;
  const radius = 50;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Progress goes from 1 to 0. 
  const progress = totalDuration > 0 ? timeLeft / totalDuration : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: bgThemeColor,
      fontFamily: config.layout.fontFamily,
      position: 'relative',
      borderRadius: `${16 * scale}px`,
      opacity: config.layout.opacity,
      transition: 'background-color 0.3s ease',
    }}>
      
      {/* Circle Timer */}
      <div style={{ position: 'relative', width: 'min(80vw, 80vh)', height: 'min(80vw, 80vh)', maxHeight: '400px', maxWidth: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Background track */}
          <circle 
            stroke={trackColor} 
            strokeWidth={strokeWidth} 
            fill="transparent" 
            r={normalizedRadius} 
            cx="50" 
            cy="50" 
          />
          {/* Progress arc */}
          <circle 
            stroke={primaryColor} 
            strokeWidth={strokeWidth} 
            fill="transparent" 
            strokeDasharray={`${circumference} ${circumference}`} 
            style={{ 
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s ease'
            }} 
            r={normalizedRadius} 
            cx="50" 
            cy="50" 
            strokeLinecap="round" 
            transform="rotate(-90 50 50)" 
          />
        </svg>
        
        {/* Time Text */}
        <div style={{ 
          fontSize: `clamp(3rem, 15vmin, 8rem)`, 
          fontWeight: (config.layout.bold ?? true) ? 800 : 500,
          fontStyle: (config.layout.italic ?? false) ? 'italic' : 'normal',
          textTransform: config.layout.textTransform ?? 'none',
          color: config.layout.textColor,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          zIndex: 1
        }}>
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
}
