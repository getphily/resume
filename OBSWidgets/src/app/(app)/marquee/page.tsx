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

export function MarqueePreview({ config, scale = 1 }: { config: any, scale?: number }) {
  const getAnimationDuration = () => {
    switch (config.speed) {
      case 'SLOW': return '20s';
      case 'FAST': return '5s';
      default: return '10s';
    }
  };

  const baseFontSize = 4 * (config.sizeScale || 1);
  const opacityHex = Math.round((config.opacity ?? 100) / 100 * 255).toString(16).padStart(2, '0');
  const finalTextColor = `${config.textColor || '#00FF00'}${opacityHex}`;
  
  let textShadow = 'none';
  if (config.glow === 'SUBTLE') textShadow = `0 0 ${10 * scale}px ${config.textColor}80`;
  if (config.glow === 'NEON') textShadow = `0 0 ${5 * scale}px ${config.textColor}, 0 0 ${20 * scale}px ${config.textColor}`;
  if (config.dropShadow) textShadow = textShadow === 'none' ? `4px 4px 0px rgba(0,0,0,0.8)` : `${textShadow}, 4px 4px 0px rgba(0,0,0,0.8)`;
  const outlineStyle = config.outline ? { WebkitTextStroke: `${2 * scale}px black` } : {};

  const isThumbnail = scale < 1;

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: isThumbnail ? '100%' : '1920px',
      aspectRatio: '1920 / 300',
      backgroundColor: config.bgMode === 'TRANSPARENT' ? 'transparent' : (config.bgColor || '#0a0a0a'),
      border: config.bgMode === 'TRANSPARENT' ? '1px dashed rgba(255,255,255,0.2)' : '1px solid var(--border-rigid)',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;700&family=VT323&display=swap');
        @keyframes scroll-marquee {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
      `}</style>
      <div style={{ 
        fontFamily: getFontFamily(config.fontFamily || 'Inter'), 
        fontWeight: 800,
        color: finalTextColor, 
        fontSize: `${baseFontSize * scale}rem`,
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        textShadow,
        animation: `scroll-marquee ${getAnimationDuration()} linear infinite`,
        ...outlineStyle
      }}>
        {config.text || 'YOUR CUSTOM TEXT'}
      </div>
    </div>
  );
}

export default function MarqueeCustomizer() {
  const [session, setSession] = useState<any>(null);
  const [configsList, setConfigsList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  
  // Editor State
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'DATA' | 'TYPO' | 'FX' | 'BG' | 'EXPORT'>('DATA');
  
  // Settings
  const [name, setName] = useState('My Marquee');
  const [text, setText] = useState('YOUR CUSTOM SCROLLING TEXT HERE *** NEW UPDATE *** DONATIONS APPRECIATED');
  const [speed, setSpeed] = useState<'SLOW' | 'NORMAL' | 'FAST'>('NORMAL');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [sizeScale, setSizeScale] = useState(1.0);
  const [textColor, setTextColor] = useState('#00FF00');
  const [opacity, setOpacity] = useState(100);
  const [outline, setOutline] = useState(false);
  const [dropShadow, setDropShadow] = useState(false);
  const [glow, setGlow] = useState<'OFF' | 'SUBTLE' | 'NEON'>('OFF');
  const [bgMode, setBgMode] = useState<'SOLID' | 'TRANSPARENT'>('SOLID');
  const [bgColor, setBgColor] = useState('#0a0a0a');
  
  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setLoadingList(false); return; }
      setSession(session);
      fetchConfigs(session.user.id);
    });
  }, []);

  const fetchConfigs = async (userId: string) => {
    setLoadingList(true);
    const { data } = await supabase.from('widget_configs').select('id, config').eq('user_id', userId).eq('widget_type', 'marquee').order('created_at', { ascending: true });
    setConfigsList(data || []);
    setLoadingList(false);
  };

  const activeConfigObj = { name, text, speed, fontFamily, sizeScale, textColor, opacity, outline, dropShadow, glow, bgMode, bgColor };

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
  }, [name, text, speed, fontFamily, sizeScale, textColor, opacity, outline, dropShadow, glow, bgMode, bgColor, activeConfigId, session]);

  const handleCreateNew = async () => {
    if (!session || configsList.length >= 3) return;
    const newConfig = { name: `Marquee ${configsList.length + 1}`, text: 'NEW SCROLLING TEXT', speed: 'NORMAL', fontFamily: 'Inter', sizeScale: 1.0, textColor: '#00FF00', opacity: 100, outline: false, dropShadow: false, glow: 'OFF', bgMode: 'SOLID', bgColor: '#0a0a0a' };
    const { data } = await supabase.from('widget_configs').insert({ user_id: session.user.id, widget_type: 'marquee', config: newConfig }).select('id').single();
    if (data) {
      setConfigsList([...configsList, { id: data.id, config: newConfig }]);
      loadEditor(data.id, newConfig);
    }
  };

  const loadEditor = (id: string, c: any) => {
    setActiveConfigId(id); setActiveTab('DATA');
    setName(c.name || 'My Marquee'); setText(c.text || ''); setSpeed(c.speed || 'NORMAL');
    setFontFamily(c.fontFamily || 'Inter'); setSizeScale(c.sizeScale ?? 1.0); 
    setTextColor(c.textColor || '#00FF00'); setOpacity(c.opacity ?? 100); setOutline(c.outline ?? false); setDropShadow(c.dropShadow ?? false); setGlow(c.glow || 'OFF');
    setBgMode(c.bgMode || 'SOLID'); setBgColor(c.bgColor || '#0a0a0a');
  };

  const deleteConfig = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this widget?")) return;
    await supabase.from('widget_configs').delete().eq('id', id);
    setConfigsList(configsList.filter(c => c.id !== id));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/embed/marquee?id=${activeConfigId}`);
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
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>YOUR MARQUEES</h2>
          )}
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeConfigId ? (
            <>
              <TabButton tab="DATA" label="1. CONTENT & SPEED" />
              <TabButton tab="TYPO" label="2. TYPOGRAPHY" />
              <TabButton tab="FX" label="3. EFFECTS & COLOR" />
              <TabButton tab="BG" label="4. BACKGROUND" />
              <TabButton tab="EXPORT" label="5. EXPORT & OBS" />
            </>
          ) : (
            <div style={{ padding: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>
                Select a marquee to edit, or create a new one.
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
                  <div key={c.id} className="panel" onClick={() => loadEditor(c.id, c.config)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <MarqueePreview config={c.config} scale={0.15} />
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>{c.config.name || 'Unnamed'}</span>
                      <button onClick={(e) => deleteConfig(c.id, e)} style={{ background: 'none', border: 'none', color: '#FF0000', cursor: 'pointer' }}>X</button>
                    </div>
                  </div>
                ))}
                {configsList.length < 3 && (
                  <div className="panel" onClick={handleCreateNew} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px', border: '2px dashed var(--border-rigid)', background: 'transparent' }}>
                    <span style={{ color: 'var(--active-amber)', fontWeight: 'bold' }}>+ CREATE NEW MARQUEE</span>
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
              borderBottom: '1px solid var(--border-rigid)',
              backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAMElEQVQ4T2NkYOD4z8DAwMgw0oBhw8GwwcCAgZGRkRGmw8HAgIFxGMEowUY2w0Y/A3N3GgX28m8/AAAAAElFTkSuQmCC")',
              backgroundSize: '20px 20px'
            }}>
              <div style={{ display: 'flex', width: '100%', maxWidth: '800px', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{name.toUpperCase()}</h2>
                <span style={{ color: 'var(--vocals-green)', fontSize: '0.8rem', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)', textTransform: 'uppercase' }}>
                  {saving ? 'AUTOSAVING...' : 'SAVED'}
                </span>
              </div>
              <div style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: '100%', maxWidth: '960px' }}>
                {/* Scaled preview to fit (0.5 scale = 960x150) */}
                <MarqueePreview config={activeConfigObj} scale={0.5} />
              </div>
            </div>

            {/* Settings Workspace Area */}
            <div style={{ flex: 1, padding: '40px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              
              {activeTab === 'DATA' && (
                <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>CONTENT & SPEED</h3>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>WIDGET NAME</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TEXT TO SCROLL</label>
                    <input type="text" value={text} onChange={e => setText(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SCROLL SPEED</label>
                    <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
                      <button style={{ flex: 1 }} className={speed === 'SLOW' ? 'active' : ''} onClick={() => setSpeed('SLOW')}>SLOW</button>
                      <button style={{ flex: 1 }} className={speed === 'NORMAL' ? 'active' : ''} onClick={() => setSpeed('NORMAL')}>NORMAL</button>
                      <button style={{ flex: 1 }} className={speed === 'FAST' ? 'active' : ''} onClick={() => setSpeed('FAST')}>FAST</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'TYPO' && (
                <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>TYPOGRAPHY</h3>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>FONT FAMILY</label>
                    <select style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-rigid)' }} value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
                      <option value="Inter">Inter (Clean)</option>
                      <option value="Outfit">Outfit (Bold)</option>
                      <option value="Roboto Mono">Roboto Mono (Digital)</option>
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
                    <li>Set the Dimensions to <strong>1920x300</strong> (or your stream width)</li>
                    <li>Ensure <strong>"Allow transparency"</strong> is checked</li>
                    <li>Any changes you make here will instantly sync to OBS!</li>
                  </ul>
                  <div style={{ backgroundColor: '#0a0a0a', padding: '20px', border: '1px solid var(--vocals-green)', borderRadius: '4px', marginTop: '10px' }}>
                    <p style={{ color: 'var(--vocals-green)', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 600 }}>YOUR UNIQUE WIDGET URL:</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="text" readOnly value={`${window.location.origin}/widgets/embed/marquee?id=${activeConfigId}`} onClick={(e) => (e.target as HTMLInputElement).select()} style={{ flex: 1, padding: '12px', fontSize: '1rem', borderColor: 'var(--vocals-green)', backgroundColor: 'rgba(0,255,0,0.05)', color: 'var(--text-primary)' }} />
                      <button className="btn-amber" onClick={handleCopy} style={{ margin: 0, padding: '0 25px', backgroundColor: copySuccess ? 'var(--vocals-green)' : 'var(--active-amber)', color: '#000', border: 'none', fontWeight: 'bold' }}>
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
