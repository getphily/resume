'use client';

import React from 'react';

const getFontFamily = (font: string) => {
  if (!font) return "'Roboto Mono', monospace";
  if (font === 'VT323' || font === 'Roboto Mono' || font === 'Fira Code') return `'${font}', monospace`;
  return `'${font}', sans-serif`;
};

export function ClockPreview({ config, time, scale = 1 }: { config: any, time: Date | null, scale?: number }) {
  if (!time) return null;
  const getTzTime = (d: Date, tz: string) => {
    if (tz === 'LOCAL') return d;
    try { return new Date(d.toLocaleString('en-US', { timeZone: tz })); } catch { return d; }
  };
  const tzTime = getTzTime(time, config.timezone || 'LOCAL');
  let formattedTime = tzTime.toLocaleTimeString('en-US', {
    hour12: config.timeFormat === '12HR',
    hour: 'numeric', minute: '2-digit', second: config.showSeconds ? '2-digit' : undefined,
  });
  if (config.blinkingColon && tzTime.getSeconds() % 2 === 0) formattedTime = formattedTime.replace(':', ' ');
  const formattedDate = tzTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const baseFontSize = 3 * (config.sizeScale || 1);
  const opacityHex = Math.round((config.opacity ?? 100) / 100 * 255).toString(16).padStart(2, '0');
  const finalTextColor = `${config.textColor || '#FF5900'}${opacityHex}`;
  let textShadow = 'none';
  if (config.glow === 'SUBTLE') textShadow = `0 0 ${10 * scale}px ${config.textColor}80`;
  if (config.glow === 'NEON') textShadow = `0 0 ${5 * scale}px ${config.textColor}, 0 0 ${20 * scale}px ${config.textColor}`;
  if (config.dropShadow) textShadow = textShadow === 'none' ? `4px 4px 0px rgba(0,0,0,0.8)` : `${textShadow}, 4px 4px 0px rgba(0,0,0,0.8)`;
  const outlineStyle = config.outline ? { WebkitTextStroke: `${2 * scale}px black` } : {};

  return (
    <div style={{ 
      width: `${400 * scale}px`, height: `${200 * scale}px`, 
      backgroundColor: config.bgMode === 'TRANSPARENT' ? 'transparent' : (config.bgColor || '#0a0a0a'),
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      borderRadius: `${8 * scale}px`
    }}>
      <div style={{ fontFamily: getFontFamily(config.fontFamily || 'Roboto Mono'), color: finalTextColor, fontSize: `${baseFontSize * scale}rem`, textShadow, lineHeight: 1, ...outlineStyle, textAlign: 'center' }}>
        {formattedTime}
      </div>
      {config.showDate && (
        <div style={{ fontFamily: getFontFamily(config.fontFamily || 'Roboto Mono'), color: finalTextColor, fontSize: `${(baseFontSize * 0.35) * scale}rem`, marginTop: `${10 * scale}px`, textShadow, ...outlineStyle, textAlign: 'center' }}>
          {formattedDate}
        </div>
      )}
    </div>
  );
}

export default ClockPreview;
