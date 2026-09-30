'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
      width: `${300 * scale}px`, height: `${200 * scale}px`, 
      backgroundColor: config.bgMode === 'TRANSPARENT' ? 'transparent' : (config.bgColor || '#0a0a0a'),
      border: config.bgMode === 'TRANSPARENT' ? '1px dashed rgba(255,255,255,0.2)' : '1px solid var(--border-rigid)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;700&family=VT323&display=swap');`}</style>
      <div style={{ fontFamily: getFontFamily(config.fontFamily || 'Roboto Mono'), color: finalTextColor, fontSize: `${baseFontSize * scale}rem`, textShadow, lineHeight: 1, ...outlineStyle }}>
        {formattedTime}
      </div>
      {config.showDate && (
        <div style={{ fontFamily: getFontFamily(config.fontFamily || 'Roboto Mono'), color: finalTextColor, fontSize: `${(baseFontSize * 0.4) * scale}rem`, marginTop: '10px', textShadow, ...outlineStyle }}>
          {formattedDate}
        </div>
      )}
    </div>
  );
}

export default function ClockCustomizer() {
  const [session, setSession] = useState<any>(null);
  const [configsList, setConfigsList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  
  // Editor State
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'DATA' | 'TYPO' | 'FX' | 'BG' | 'EXPORT'>('DATA');
  
  // Settings
  const [name, setName] = useState('My Clock');
  const [timeFormat, setTimeFormat] = useState<'12HR' | '24HR'>('12HR');
  const [timezone, setTimezone] = useState('LOCAL');
  const [showSeconds, setShowSeconds] = useState(true);
  const [showDate, setShowDate] = useState(false);
  const [fontFamily, setFontFamily] = useState('Roboto Mono');
  const [sizeScale, setSizeScale] = useState(1.0);
  const [textColor, setTextColor] = useState('#FF5900');
  const [opacity, setOpacity] = useState(100);
  const [outline, setOutline] = useState(false);
  const [dropShadow, setDropShadow] = useState(false);
  const [glow, setGlow] = useState<'OFF' | 'SUBTLE' | 'NEON'>('OFF');
  const [blinkingColon, setBlinkingColon] = useState(false);
  const [bgMode, setBgMode] = useState<'SOLID' | 'TRANSPARENT'>('SOLID');
  const [bgColor, setBgColor] = useState('#0a0a0a');
  
  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setLoadingList(false); return; }
      setSession(session);
      fetchConfigs(session.user.id);
    });
  }, []);

  const fetchConfigs = async (userId: string) => {
    setLoadingList(true);
    const { data } = await supabase.from('widget_configs').select('id, config').eq('user_id', userId).eq('widget_type', 'clock').order('created_at', { ascending: true });
    setConfigsList(data || []);
    setLoadingList(false);
  };

  const activeConfigObj = { name, timeFormat, timezone, showSeconds, showDate, fontFamily, sizeScale, textColor, opacity, outline, dropShadow, glow, blinkingColon, bgMode, bgColor };

  useEffect(() => {
    if (!activeConfigId || !session) return;
    const saveConfig = async () => {
      setSaving(true);
      await supabase.from('widget_configs').update({ config: activeConfigObj }).eq('id', activeConfigId);
      setConfigsList(prev => prev.map(c => c.id === activeConfigId ? { ...c, config: activeConfigObj } : c));
      setSaving(false);
    };
    const debounceTimer = setTimeout(() => { saveConfig(); }, 800);
    return () => clearTimeout(debounceTimer);
  }, [name, timeFormat, timezone, showSeconds, showDate, fontFamily, sizeScale, textColor, opacity, outline, dropShadow, glow, blinkingColon, bgMode, bgColor, activeConfigId, session]);

  const handleCreateNew = async () => {
    if (!session || configsList.length >= 3) return;
    const newConfig = { name: `Clock ${configsList.length + 1}`, timeFormat: '12HR', timezone: 'LOCAL', showSeconds: true, showDate: false, fontFamily: 'Roboto Mono', sizeScale: 1.0, textColor: '#FF5900', opacity: 100, outline: false, dropShadow: false, glow: 'OFF', blinkingColon: false, bgMode: 'SOLID', bgColor: '#0a0a0a' };
    const { data } = await supabase.from('widget_configs').insert({ user_id: session.user.id, widget_type: 'clock', config: newConfig }).select('id').single();
    if (data) {
      setConfigsList([...configsList, { id: data.id, config: newConfig }]);
      loadEditor(data.id, newConfig);
    }
  };

  const loadEditor = (id: string, c: any) => {
    setActiveConfigId(id); setActiveTab('DATA');
    setName(c.name || 'My Clock'); setTimeFormat(c.timeFormat || '12HR'); setTimezone(c.timezone || 'LOCAL'); setShowSeconds(c.showSeconds ?? true); setShowDate(c.showDate ?? false);
    setFontFamily(c.fontFamily || 'Roboto Mono'); setSizeScale(c.sizeScale ?? 1.0); setTextColor(c.textColor || '#FF5900'); setOpacity(c.opacity ?? 100); setOutline(c.outline ?? false); setDropShadow(c.dropShadow ?? false); setGlow(c.glow || 'OFF'); setBlinkingColon(c.blinkingColon ?? false);
    setBgMode(c.bgMode || 'SOLID'); setBgColor(c.bgColor || '#0a0a0a');
  };

  const deleteConfig = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this widget?")) return;
    await supabase.from('widget_configs').delete().eq('id', id);
    setConfigsList(configsList.filter(c => c.id !== id));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/embed/clock/${activeConfigId}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const TabButton = ({ tab, label }: { tab: typeof activeTab, label: string }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      style={{
        display: 'block', width: '100%', textAlign: 'left', padding: '15px 20px', background: activeTab === tab ? 'var(--module-grey)' : 'transparent',
        border: 'none', borderBottom: '1px solid var(--border-rigid)', color: activeTab === tab ? 'var(--active-amber)' : 'var(--text-secondary)',
        fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.1s'
      }}
    >
      {label}
    </button>
  );

  if (!session) return <main style={{ padding: '40px' }}><p>Please <Link href="/auth">Sign In</Link></p></main>;

  return (
    <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '30px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '10px', display: 'inline-block' }}>
          &larr; BACK TO CATALOG
        </Link>
        <h2>{activeConfigId ? `EDIT: ${name.toUpperCase()}` : 'YOUR SAVED CLOCKS'}</h2>
      </div>

      {/* DASHBOARD VIEW */}
      {!activeConfigId && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Save up to 3 clock configurations.</p>
            <span style={{ fontWeight: 'bold', color: configsList.length >= 3 ? '#FF0000' : 'var(--vocals-green)' }}>{configsList.length} / 3 USED</span>
          </div>
          {loadingList ? <p>Loading...</p> : (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {configsList.map(c => (
                <div key={c.id} className="panel" onClick={() => loadEditor(c.id, c.config)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                  <ClockPreview config={c.config} time={time} scale={0.6} />
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>{c.config.name || 'Unnamed'}</span>
                    <button onClick={(e) => deleteConfig(c.id, e)} style={{ background: 'none', border: 'none', color: '#FF0000', cursor: 'pointer' }}>X</button>
                  </div>
                </div>
              ))}
              {configsList.length < 3 && (
                <div className="panel" onClick={handleCreateNew} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px', minWidth: '200px', border: '2px dashed var(--border-rigid)', background: 'transparent' }}>
                  <span style={{ color: 'var(--active-amber)', fontWeight: 'bold' }}>+ CREATE NEW CLOCK</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3-COLUMN EDITOR VIEW */}
      {activeConfigId && (
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          
          {/* COLUMN 1: SIDEBAR MENU */}
          <div style={{ flex: '0 0 250px', backgroundColor: 'var(--chassis-black)', border: '1px solid var(--border-rigid)', borderRadius: '6px', overflow: 'hidden' }}>
            <TabButton tab="DATA" label="1. DATA & FORMATTING" />
            <TabButton tab="TYPO" label="2. TYPOGRAPHY" />
            <TabButton tab="FX" label="3. EFFECTS & COLOR" />
            <TabButton tab="BG" label="4. BACKGROUND" />
            <TabButton tab="EXPORT" label="5. EXPORT & OBS" />
            <button 
              onClick={() => setActiveConfigId(null)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '15px 20px', background: 'rgba(0,0,0,0.2)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)', borderTop: '1px solid var(--border-rigid)' }}
            >
              &larr; Back to Dashboard
            </button>
          </div>

          {/* COLUMN 2: ACTIVE SETTINGS WORK AREA */}
          <div className="panel" style={{ flex: '1 1 auto', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {activeTab === 'DATA' && (
              <>
                <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>DATA & FORMATTING</h3>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>WIDGET NAME</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>FORMAT</label>
                    <select style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-rigid)' }} value={timeFormat} onChange={e => setTimeFormat(e.target.value as '12HR'|'24HR')}>
                      <option value="12HR">12 Hour</option>
                      <option value="24HR">24 Hour</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TIMEZONE</label>
                    <select style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-rigid)' }} value={timezone} onChange={e => setTimezone(e.target.value)}>
                      <option value="LOCAL">Local Time</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">EST (New York)</option>
                      <option value="America/Los_Angeles">PST (Los Angeles)</option>
                      <option value="Europe/London">GMT (London)</option>
                      <option value="Asia/Tokyo">JST (Tokyo)</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={showSeconds} onChange={e => setShowSeconds(e.target.checked)} /> SHOW SECONDS
                  </label>
                  <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={showDate} onChange={e => setShowDate(e.target.checked)} /> SHOW DATE
                  </label>
                </div>
              </>
            )}

            {activeTab === 'TYPO' && (
              <>
                <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>TYPOGRAPHY</h3>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>FONT FAMILY</label>
                  <select style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-rigid)' }} value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
                    <option value="Roboto Mono">Roboto Mono (Digital)</option>
                    <option value="Inter">Inter (Clean)</option>
                    <option value="Outfit">Outfit (Bold)</option>
                    <option value="VT323">VT323 (Retro)</option>
                    <option value="Bebas Neue">Bebas Neue (Cinematic)</option>
                  </select>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SCALE (SIZE): {sizeScale.toFixed(1)}x</label>
                  <input type="range" min="0.5" max="2.0" step="0.1" value={sizeScale} onChange={e => setSizeScale(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>
              </>
            )}

            {activeTab === 'FX' && (
              <>
                <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>EFFECTS & COLOR</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TEXT COLOR</label>
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ height: '40px', padding: '0', cursor: 'pointer' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>OPACITY: {opacity}%</label>
                    <input type="range" min="10" max="100" step="5" value={opacity} onChange={e => setOpacity(parseInt(e.target.value))} style={{ width: '100%' }} />
                  </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>GLOW EFFECT</label>
                  <div className="segmented-control">
                    <button className={glow === 'OFF' ? 'active' : ''} onClick={() => setGlow('OFF')}>OFF</button>
                    <button className={glow === 'SUBTLE' ? 'active' : ''} onClick={() => setGlow('SUBTLE')}>SUBTLE</button>
                    <button className={glow === 'NEON' ? 'active' : ''} onClick={() => setGlow('NEON')}>NEON</button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                  <label style={{ display: 'flex', gap: '5px', alignItems: 'center', fontSize: '0.8rem' }}>
                    <input type="checkbox" checked={outline} onChange={e => setOutline(e.target.checked)} /> OUTLINE
                  </label>
                  <label style={{ display: 'flex', gap: '5px', alignItems: 'center', fontSize: '0.8rem' }}>
                    <input type="checkbox" checked={dropShadow} onChange={e => setDropShadow(e.target.checked)} /> DROP SHADOW
                  </label>
                  <label style={{ display: 'flex', gap: '5px', alignItems: 'center', fontSize: '0.8rem' }}>
                    <input type="checkbox" checked={blinkingColon} onChange={e => setBlinkingColon(e.target.checked)} /> BLINK COLON
                  </label>
                </div>
              </>
            )}

            {activeTab === 'BG' && (
              <>
                <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>BACKGROUND</h3>
                <div>
                  <div className="segmented-control">
                    <button className={bgMode === 'SOLID' ? 'active' : ''} onClick={() => setBgMode('SOLID')}>SOLID</button>
                    <button className={bgMode === 'TRANSPARENT' ? 'active' : ''} onClick={() => setBgMode('TRANSPARENT')}>TRANSPARENT</button>
                  </div>
                </div>
                {bgMode === 'SOLID' && (
                  <div style={{ marginTop: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>BG COLOR</label>
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ height: '40px', padding: '0', cursor: 'pointer' }} />
                  </div>
                )}
              </>
            )}

            {activeTab === 'EXPORT' && (
              <>
                <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>EXPORT TO OBS</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Copy this URL and paste it into an OBS Browser Source. Set the dimensions to 1920x1080 (or your stream size), and check the box to "Allow transparency".
                </p>
                <div style={{ backgroundColor: '#0a0a0a', padding: '15px', border: '1px solid var(--vocals-green)' }}>
                  <p style={{ color: 'var(--vocals-green)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>OBS EMBED URL:</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" readOnly value={`${window.location.origin}/embed/clock/${activeConfigId}`} onClick={(e) => (e.target as HTMLInputElement).select()} style={{ flex: 1, borderColor: 'var(--vocals-green)' }} />
                    <button className="btn-amber" onClick={handleCopy} style={{ margin: 0, padding: '8px 12px', backgroundColor: copySuccess ? 'var(--vocals-green)' : 'var(--module-grey)', color: copySuccess ? '#000' : 'var(--text-primary)', borderColor: copySuccess ? 'var(--vocals-green)' : 'var(--border-rigid)' }}>
                      {copySuccess ? 'COPIED!' : 'COPY'}
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* COLUMN 3: LIVE PREVIEW */}
          <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'sticky', top: '40px' }}>
            <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>LIVE PREVIEW</h3>
            <div style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAMElEQVQ4T2NkYOD4z8DAwMgw0oBhw8GwwcCAgZGRkRGmw8HAgIFxGMEowUY2w0Y/A3N3GgX28m8/AAAAAElFTkSuQmCC")', backgroundSize: '20px 20px', border: '2px solid var(--border-rigid)' }}>
              <ClockPreview config={activeConfigObj} time={time} scale={1} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                {saving ? 'Autosaving...' : 'All changes saved to cloud'}
              </span>
            </div>
          </div>

        </div>
      )}

    </main>
  );
}
