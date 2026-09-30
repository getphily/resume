'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

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
      width: `${400 * scale}px`, height: `${200 * scale}px`, 
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
    toast(
      (t) => (
        <div>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 500 }}>Delete this widget?</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={async () => {
                toast.dismiss(t.id);
                await supabase.from('widget_configs').delete().eq('id', id);
                setConfigsList(configsList.filter(c => c.id !== id));
                toast.success('Widget deleted');
              }} 
              style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
            >
              Delete
            </button>
            <button 
              onClick={() => toast.dismiss(t.id)} 
              style={{ padding: '6px 12px', background: 'var(--bg-main)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/widgets/embed/clock?id=${activeConfigId}`);
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
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      
      {/* LEFT SIDEBAR */}
      <aside style={{ width: '280px', borderRight: '1px solid var(--border-rigid)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--module-bg)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-rigid)' }}>
          {activeConfigId ? (
            <button onClick={() => setActiveConfigId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              &larr; BACK TO DASHBOARD
            </button>
          ) : (
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>YOUR CLOCKS</h2>
          )}
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeConfigId ? (
            <>
              <TabButton tab="DATA" label="1. DATA & FORMATTING" />
              <TabButton tab="TYPO" label="2. TYPOGRAPHY" />
              <TabButton tab="FX" label="3. EFFECTS & COLOR" />
              <TabButton tab="BG" label="4. BACKGROUND" />
              <TabButton tab="EXPORT" label="5. EXPORT & OBS" />
            </>
          ) : (
            <div style={{ padding: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>
                Select a clock to edit, or create a new one.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                <span>STORAGE</span>
                <span style={{ color: configsList.length >= 3 ? '#FF0000' : 'var(--vocals-green)' }}>{configsList.length} / 3 USED</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* HERO SECTION */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: 'var(--chassis-black)' }}>
        
        {!activeConfigId ? (
          /* DASHBOARD VIEW */
          <div style={{ padding: '40px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
            {loadingList ? <p>Loading...</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {configsList.map(c => (
                  <div key={c.id} className="panel" onClick={() => loadEditor(c.id, c.config)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', padding: '20px', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'}>
                    <div className="preview-window-container" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}>
                      <ClockPreview config={c.config} time={time} scale={0.5} />
                    </div>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '15px' }}>{c.config.name || 'Unnamed'}</span>
                      <button onClick={(e) => deleteConfig(c.id, e)} className="btn-delete" aria-label="Delete widget" title="Delete widget">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {configsList.length < 3 && (
                  <div className="panel" onClick={handleCreateNew} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', border: '2px dashed var(--border-rigid)', background: 'transparent' }}>
                    <span style={{ color: 'var(--active-amber)', fontWeight: 'bold' }}>+ CREATE NEW CLOCK</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* EDITOR VIEW */
          <>
            {/* Live Preview Header Area */}
            <div style={{ 
              flex: '0 0 auto', 
              padding: '60px 20px', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-panel)'
            }}>
              <div style={{ display: 'flex', width: '100%', maxWidth: '800px', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>{name.toUpperCase()}</h2>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {saving ? 'AUTOSAVING...' : 'SAVED'}
                </span>
              </div>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }} className="preview-window-container">
                <ClockPreview config={activeConfigObj} time={time} scale={1.5} />
              </div>
            </div>

            {/* Settings Workspace Area */}
            <div style={{ flex: 1, padding: '40px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              
              {activeTab === 'DATA' && (
                <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>DATA & FORMATTING</h3>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>WIDGET NAME</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input" />
                  </div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>FORMAT</label>
                      <select className="form-select" value={timeFormat} onChange={e => setTimeFormat(e.target.value as '12HR'|'24HR')}>
                        <option value="12HR">12 Hour</option>
                        <option value="24HR">24 Hour</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>TIMEZONE</label>
                      <select className="form-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
                        <option value="LOCAL">Local Time</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">EST (New York)</option>
                        <option value="America/Los_Angeles">PST (Los Angeles)</option>
                        <option value="Europe/London">GMT (London)</option>
                        <option value="Asia/Tokyo">JST (Tokyo)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-checkbox-group">
                    <label className="form-checkbox-label">
                      <input type="checkbox" checked={showSeconds} onChange={e => setShowSeconds(e.target.checked)} />
                      SHOW SECONDS
                    </label>
                    <label className="form-checkbox-label">
                      <input type="checkbox" checked={showDate} onChange={e => setShowDate(e.target.checked)} />
                      SHOW DATE
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'TYPO' && (
                <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>TYPOGRAPHY</h3>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>FONT FAMILY</label>
                    <select className="form-select" value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
                      <option value="Roboto Mono">Roboto Mono (Digital)</option>
                      <option value="Inter">Inter (Clean)</option>
                      <option value="Outfit">Outfit (Bold)</option>
                      <option value="VT323">VT323 (Retro)</option>
                      <option value="Bebas Neue">Bebas Neue (Cinematic)</option>
                    </select>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '15px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SCALE (SIZE): {sizeScale.toFixed(1)}x</label>
                    <input type="range" min="0.5" max="2.0" step="0.1" value={sizeScale} onChange={e => setSizeScale(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
                  </div>
                </div>
              )}

              {activeTab === 'FX' && (
                <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>EFFECTS & COLOR</h3>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TEXT COLOR</label>
                      <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: '100%', height: '50px', padding: '0', cursor: 'pointer', border: '1px solid var(--border-rigid)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '15px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>OPACITY: {opacity}%</label>
                      <input type="range" min="10" max="100" step="5" value={opacity} onChange={e => setOpacity(parseInt(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
                    </div>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>GLOW EFFECT</label>
                    <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
                      <button style={{ flex: 1 }} className={glow === 'OFF' ? 'active' : ''} onClick={() => setGlow('OFF')}>OFF</button>
                      <button style={{ flex: 1 }} className={glow === 'SUBTLE' ? 'active' : ''} onClick={() => setGlow('SUBTLE')}>SUBTLE</button>
                      <button style={{ flex: 1 }} className={glow === 'NEON' ? 'active' : ''} onClick={() => setGlow('NEON')}>NEON</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '15px', padding: '15px', backgroundColor: 'var(--module-grey)', border: '1px solid var(--border-rigid)' }}>
                    <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={outline} onChange={e => setOutline(e.target.checked)} style={{ transform: 'scale(1.2)' }} /> OUTLINE
                    </label>
                    <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={dropShadow} onChange={e => setDropShadow(e.target.checked)} style={{ transform: 'scale(1.2)' }} /> DROP SHADOW
                    </label>
                    <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={blinkingColon} onChange={e => setBlinkingColon(e.target.checked)} style={{ transform: 'scale(1.2)' }} /> BLINK COLON
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'BG' && (
                <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>BACKGROUND</h3>
                  <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>BACKGROUND MODE</label>
                    <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
                      <button style={{ flex: 1 }} className={bgMode === 'SOLID' ? 'active' : ''} onClick={() => setBgMode('SOLID')}>SOLID COLOR</button>
                      <button style={{ flex: 1 }} className={bgMode === 'TRANSPARENT' ? 'active' : ''} onClick={() => setBgMode('TRANSPARENT')}>TRANSPARENT</button>
                    </div>
                  </div>
                  {bgMode === 'SOLID' && (
                    <div style={{ marginTop: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>BG COLOR</label>
                      <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '100%', height: '50px', padding: '0', cursor: 'pointer', border: '1px solid var(--border-rigid)' }} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'EXPORT' && (
                <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>EXPORT TO OBS</h3>
                  <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    Copy this URL and paste it into a new <strong>Browser Source</strong> in OBS Studio. 
                  </p>
                  <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '20px' }}>
                    <li>Set the Dimensions to <strong>1920x1080</strong> (or your stream size)</li>
                    <li>Ensure <strong>"Allow transparency"</strong> is checked</li>
                    <li>Any changes you make here will instantly sync to OBS!</li>
                  </ul>
                  <div style={{ backgroundColor: 'var(--bg-panel)', padding: '20px', border: '1px solid var(--border-subtle)', borderRadius: '8px', marginTop: '10px' }}>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 600 }}>YOUR UNIQUE WIDGET URL:</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="text" readOnly value={`${window.location.origin}/widgets/embed/clock?id=${activeConfigId}`} onClick={(e) => (e.target as HTMLInputElement).select()} style={{ flex: 1, padding: '12px', fontSize: '1rem', cursor: 'text' }} />
                      <button className="btn-primary" onClick={handleCopy} style={{ margin: 0, padding: '0 25px', backgroundColor: copySuccess ? '#0070f3' : 'var(--accent-primary)', color: '#fff', border: 'none', fontWeight: 'bold' }}>
                        {copySuccess ? 'COPIED!' : 'COPY'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </main>

    </div>
  );
}
