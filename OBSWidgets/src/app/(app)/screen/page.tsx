'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { ScreenPreview } from '@/components/ScreenPreview';
import { ColorInputWithPalette } from '@/components/ColorInputWithPalette';
import { TextFormattingToolbar } from '@/components/TextFormattingToolbar';
import { ImageUploadOrUrl } from '@/components/ImageUploadOrUrl';
import { DEFAULT_SCREEN_CONFIG, ScreenConfig, ScreenPage } from '@/types/screen';
import { Flex, Box, Card, Grid, SegmentedControl, Switch, Button, Heading, Text, Tabs, TextField } from '@radix-ui/themes';

// ─── Text Toolbar ───────────────────────────────────────────────────
// Compact, horizontal toolbar with segmented controls per AGENTS.md.
// Row 1: Font | Title Size | Subtitle Size
// Row 2: Title Color | Subtitle Color | Drop Shadow | Glow

function GlobalSettings({ config, setConfig }: { config: ScreenConfig, setConfig: (c: ScreenConfig) => void }) {
  const { layout } = config;
  const update = (patch: Partial<ScreenConfig['layout']>) =>
    setConfig({ ...config, layout: { ...layout, ...patch } });

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>GLOBAL SETTINGS</h3>
      
      {/* Typography & Colors via Toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>TITLE TYPOGRAPHY</label>
          <TextFormattingToolbar
            fontFamily={layout.fontFamily}
            fontSize={layout.titleSize}
            textColor={layout.accentColor}
            opacity={layout.titleOpacity ?? 1}
            onChange={patch => update({ 
              ...(patch.fontFamily && { fontFamily: patch.fontFamily }),
              ...(patch.fontSize && { titleSize: patch.fontSize }),
              ...(patch.textColor && { accentColor: patch.textColor }),
              ...('opacity' in patch && { titleOpacity: patch.opacity })
            })}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>SUBTITLE TYPOGRAPHY</label>
          <TextFormattingToolbar
            fontFamily={layout.fontFamily}
            fontSize={layout.subtitleSize}
            textColor={layout.textColor}
            opacity={layout.subtitleOpacity ?? 1}
            onChange={patch => update({ 
              ...(patch.fontFamily && { fontFamily: patch.fontFamily }),
              ...(patch.fontSize && { subtitleSize: patch.fontSize }),
              ...(patch.textColor && { textColor: patch.textColor }),
              ...('opacity' in patch && { subtitleOpacity: patch.opacity })
            })}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>TIMER TYPOGRAPHY</label>
          <TextFormattingToolbar
            fontFamily={layout.fontFamily}
            fontSize="MEDIUM"
            textColor={layout.timerColor || layout.textColor}
            opacity={layout.timerOpacity ?? 1}
            onChange={patch => update({ 
              ...(patch.fontFamily && { fontFamily: patch.fontFamily }),
              ...(patch.textColor && { timerColor: patch.textColor }),
              ...('opacity' in patch && { timerOpacity: patch.opacity })
            })}
          />
        </div>
      </div>

      <div className="toolbar-divider" />

      {/* Effects */}
      <div className="text-toolbar">
        <div className="toolbar-group">
          <label>Shadow</label>
          <SegmentedControl.Root size="1" value={layout.dropShadow ? 'ON' : 'OFF'} onValueChange={v => update({ dropShadow: v === 'ON' })}>
            <SegmentedControl.Item value="OFF">Off</SegmentedControl.Item>
            <SegmentedControl.Item value="ON">On</SegmentedControl.Item>
          </SegmentedControl.Root>
        </div>

        <div className="toolbar-group">
          <label>Glow</label>
          <SegmentedControl.Root size="1" value={layout.glow} onValueChange={v => update({ glow: v as any })}>
            {(['OFF', 'SUBTLE', 'NEON'] as const).map(gl => (
              <SegmentedControl.Item key={gl} value={gl}>
                {gl.charAt(0) + gl.slice(1).toLowerCase()}
              </SegmentedControl.Item>
            ))}
          </SegmentedControl.Root>
        </div>
      </div>

      <div className="toolbar-divider" />

      {/* Background */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <label style={{ margin: 0, fontWeight: 600, fontSize: '13px', width: '120px' }}>Background Color</label>
            <ColorInputWithPalette value={layout.bgColor} onChange={e => update({ bgColor: e })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Opacity</label>
            <input type="range" min="0" max="1" step="0.05" value={layout.bgOpacity ?? 1} onChange={e => update({ bgOpacity: parseFloat(e.target.value) })} style={{ width: '100px', accentColor: 'var(--accent-primary)' }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <ImageUploadOrUrl 
          label="BACKGROUND IMAGE"
          value={layout.bgImageUrl || ''} 
          onChange={val => update({ bgImageUrl: val })} 
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Overrides background color if provided.</p>
      </div>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────

export default function ScreenCustomizer() {
  const [session, setSession] = useState<any>(null);
  const [configsList, setConfigsList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  
  // Editor State
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PAGES' | 'LOGO' | 'EXPORT'>('PAGES');
  const [previewPageId, setPreviewPageId] = useState<string>('starting-soon');
  
  // Settings
  const [config, setConfig] = useState<ScreenConfig>(DEFAULT_SCREEN_CONFIG);
  
  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setLoadingList(false); return; }
      setSession(session);
      fetchConfigs(session.user.id);
    });
  }, []);

  const fetchConfigs = async (userId: string) => {
    setLoadingList(true);
    const { data } = await supabase.from('widget_configs').select('id, config').eq('user_id', userId).eq('widget_type', 'screen').order('created_at', { ascending: true });
    setConfigsList(data || []);
    setLoadingList(false);
  };

  useEffect(() => {
    if (!activeConfigId || !session) return;
    const saveConfig = async () => {
      setSaving(true);
      await supabase.from('widget_configs').update({ config }).eq('id', activeConfigId);
      setConfigsList(prev => prev.map(c => c.id === activeConfigId ? { ...c, config } : c));
      setSaving(false);
    };
    const debounceTimer = setTimeout(() => { saveConfig(); }, 800);
    return () => clearTimeout(debounceTimer);
  }, [config, activeConfigId, session]);

  const handleCreateNew = async () => {
    if (!session || configsList.length >= 5) return;
    const newConfig = { ...DEFAULT_SCREEN_CONFIG, name: `Screenset ${configsList.length + 1}` };
    const { data } = await supabase.from('widget_configs').insert({ user_id: session.user.id, widget_type: 'screen', config: newConfig }).select('id').single();
    if (data) {
      setConfigsList([...configsList, { id: data.id, config: newConfig }]);
      loadEditor(data.id, newConfig);
    }
  };

  const loadEditor = (id: string, c: ScreenConfig) => {
    setActiveConfigId(id); 
    setActiveTab('PAGES');
    setConfig(c);
    setPreviewPageId(c.pages.length > 0 ? c.pages[0].id : '');
  };

  const deleteConfig = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast(
      (t) => (
        <div>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 500 }}>Delete this screenset?</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={async () => {
                toast.dismiss(t.id);
                await supabase.from('widget_configs').delete().eq('id', id);
                setConfigsList(configsList.filter(c => c.id !== id));
                if (activeConfigId === id) setActiveConfigId(null);
                toast.success('Screenset deleted');
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

  const updatePage = (id: string, updates: Partial<ScreenPage>) => {
    setConfig(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const addPage = () => {
    const newId = `page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setConfig(prev => ({
      ...prev,
      pages: [...prev.pages, { 
        id: newId, 
        name: 'New Page', 
        title: 'NEW PAGE', 
        subtitle: '',
        timer: { enabled: false, durationMinutes: 5, endTime: null }
      }]
    }));
  };

  const deletePage = (id: string) => {
    setConfig(prev => ({
      ...prev,
      pages: prev.pages.filter(p => p.id !== id)
    }));
    // If we're previewing the deleted page, switch to first remaining
    if (previewPageId === id) {
      const remaining = config.pages.filter(p => p.id !== id);
      setPreviewPageId(remaining.length > 0 ? remaining[0].id : '');
    }
  };

  const handleCopy = async (pageId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.href.split('/screen')[0] : '';
    await navigator.clipboard.writeText(`${baseUrl}/embed/screen?id=${activeConfigId}&page=${pageId}`);
    setCopySuccess(pageId);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const TabButton = ({ tab, label }: { tab: typeof activeTab, label: string }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      style={{
        display: 'block', width: '100%', textAlign: 'left', padding: '15px 20px', background: activeTab === tab ? 'var(--bg-main)' : 'transparent',
        border: 'none', borderBottom: '1px solid var(--border-subtle)', color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
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
      <aside style={{ width: '280px', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-panel)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          {activeConfigId ? (
            <button onClick={() => setActiveConfigId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              &larr; BACK TO DASHBOARD
            </button>
          ) : (
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>YOUR SCREEN SETS</h2>
          )}
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeConfigId ? (
            <>
              <TabButton tab="PAGES" label="1. PAGES & LAYOUT" />
              <TabButton tab="LOGO" label="2. LOGO" />
              <TabButton tab="EXPORT" label="3. EXPORT TO OBS" />
            </>
          ) : (
            <div style={{ padding: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>
                Select a screenset to edit, or create a new one.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                <span>STORAGE</span>
                <span style={{ color: configsList.length >= 5 ? '#FF0000' : 'var(--text-primary)' }}>{configsList.length} / 5 USED</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: 'var(--bg-main)' }}>
        
        {!activeConfigId ? (
          /* DASHBOARD VIEW */
          <div style={{ padding: '40px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
            {loadingList ? <p>Loading...</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {configsList.map(c => (
                  <div key={c.id} className="panel" onClick={() => loadEditor(c.id, c.config)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', padding: '20px', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'}>
                    <div className="preview-window-container" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ transform: 'scale(0.15)', transformOrigin: 'center center', width: '1920px', height: '1080px' }}>
                         <ScreenPreview config={c.config} />
                      </div>
                    </div>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '15px' }}>{c.config.name || 'Unnamed'}</span>
                      <button onClick={(e) => deleteConfig(c.id, e)} className="btn-delete" aria-label="Delete screenset" title="Delete screenset">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {configsList.length < 5 && (
                  <div className="panel" onClick={handleCreateNew} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', border: '2px dashed var(--border-subtle)', background: 'transparent' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>+ CREATE NEW SCREENSET</span>
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
              padding: '40px 20px', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-panel)'
            }}>
              <div style={{ display: 'flex', width: '100%', maxWidth: '800px', justifyContent: 'space-between', marginBottom: '20px' }}>
                <input 
                  type="text" 
                  value={config.name} 
                  onChange={e => setConfig({...config, name: e.target.value})} 
                  style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, background: 'transparent', border: 'none', borderBottom: '1px solid transparent', outline: 'none' }} 
                  onFocus={e => e.target.style.borderBottom = '1px solid var(--border-subtle)'}
                  onBlur={e => e.target.style.borderBottom = '1px solid transparent'}
                />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {saving ? 'AUTOSAVING...' : 'SAVED'}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {config.pages.map(page => (
                  <button 
                    key={page.id}
                    onClick={() => setPreviewPageId(page.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: 'none',
                      background: previewPageId === page.id ? 'var(--accent-primary)' : 'var(--bg-main)',
                      color: previewPageId === page.id ? '#fff' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    {page.name}
                  </button>
                ))}
              </div>

              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000' }} className="preview-window-container">
                 <div style={{ width: '480px', height: '270px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ transform: 'scale(0.25)', transformOrigin: 'top left', width: '1920px', height: '1080px' }}>
                       <ScreenPreview config={config} activePageId={previewPageId} />
                    </div>
                 </div>
              </div>
            </div>

            {/* Settings Workspace Area */}
            <div style={{ flex: 1, padding: '40px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              
              {activeTab === 'PAGES' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <GlobalSettings config={config} setConfig={setConfig} />

                  <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>MANAGE PAGES</h3>
                      <button className="btn-primary" onClick={addPage} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>+ ADD PAGE</button>
                    </div>
                    
                    {config.pages.map(page => {
                      const currentTimer = {
                        enabled: page.timer?.enabled ?? false,
                        durationMinutes: page.timer?.durationMinutes ?? 5,
                        endTime: page.timer?.endTime ?? null,
                      };
                      
                      return (
                      <div key={page.id} className="page-card">
                        {config.pages.length > 1 && (
                          <button onClick={() => deletePage(page.id)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                            DELETE
                          </button>
                        )}
                        
                        <div className="page-field">
                          <label>PAGE NAME (Internal)</label>
                          <TextField.Root size="2" value={page.name} onChange={e => updatePage(page.id, { name: e.target.value })} />
                        </div>
                        <div className="page-field">
                          <label>MAIN TITLE</label>
                          <TextField.Root size="2" value={page.title} onChange={e => updatePage(page.id, { title: e.target.value })} />
                        </div>
                        <div className="page-field">
                          <label>SUBTITLE</label>
                          <TextField.Root size="2" value={page.subtitle} onChange={e => updatePage(page.id, { subtitle: e.target.value })} />
                        </div>

                        {/* TIMER CONTROLS */}
                        <div className="timer-controls">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }} checked={currentTimer.enabled} onChange={e => updatePage(page.id, { timer: { ...currentTimer, enabled: e.target.checked } })} />
                              ENABLE TIMER
                            </label>
                            {currentTimer.enabled && currentTimer.endTime && currentTimer.endTime > Date.now() && (
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>● LIVE</span>
                            )}
                          </div>

                          {currentTimer.enabled && (
                            <div className="timer-actions">
                              <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>DURATION (MINUTES)</label>
                                <TextField.Root 
                                  type="number" 
                                  value={currentTimer.durationMinutes} 
                                  onChange={e => updatePage(page.id, { timer: { ...currentTimer, durationMinutes: Number(e.target.value) } })} 
                                  style={{ width: '120px' }} 
                                />
                              </div>
                              <button 
                                className="btn-primary" 
                                onClick={() => updatePage(page.id, { timer: { ...currentTimer, endTime: Date.now() + (currentTimer.durationMinutes * 60000) } })}
                                style={{ padding: '10px 20px', fontWeight: 'bold' }}
                              >
                                START TIMER
                              </button>
                              
                              <button 
                                onClick={() => updatePage(page.id, { timer: { ...currentTimer, endTime: null } })}
                                style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }}
                              >
                                RESET
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              )}

              {activeTab === 'LOGO' && (
                <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>LOGO SETTINGS</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Switch checked={config.logo.enabled} onCheckedChange={checked => setConfig({...config, logo: {...config.logo, enabled: checked}})} />
                      <Text size="2" weight="bold" color="gray">ENABLE LOGO</Text>
                    </div>
                  </div>
                  
                  {config.logo.enabled && (
                    <>
                      <div>
                        <ImageUploadOrUrl 
                          label="LOGO IMAGE"
                          value={config.logo.imageUrl || ''} 
                          onChange={val => setConfig({...config, logo: {...config.logo, imageUrl: val}})} 
                        />
                      </div>
                      
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>POSITION</label>
                          <SegmentedControl.Root size="1" value={config.logo.position} onValueChange={val => setConfig({...config, logo: {...config.logo, position: val as any}})}>
                            {(['TOP_LEFT', 'TOP_RIGHT', 'CENTER', 'BOTTOM_LEFT', 'BOTTOM_RIGHT'] as const).map(pos => (
                              <SegmentedControl.Item key={pos} value={pos}>
                                {pos.replace(/_/g, ' ')}
                              </SegmentedControl.Item>
                            ))}
                          </SegmentedControl.Root>
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>SIZE</label>
                          <SegmentedControl.Root size="1" value={config.logo.size} onValueChange={val => setConfig({...config, logo: {...config.logo, size: val as any}})}>
                            {(['SMALL', 'MEDIUM', 'LARGE'] as const).map(sz => (
                              <SegmentedControl.Item key={sz} value={sz}>{sz}</SegmentedControl.Item>
                            ))}
                          </SegmentedControl.Root>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'EXPORT' && (
                <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>EXPORT TO OBS</h3>
                  <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    Here are the embed URLs for each of your pages. Create a <strong>Browser Source</strong> in OBS for each page you want to use.
                  </p>
                  <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '20px' }}>
                    <li>Set Dimensions to <strong>1920x1080</strong></li>
                    <li>Any global style changes apply to all pages instantly!</li>
                  </ul>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                    {config.pages.map(page => (
                      <div key={page.id} style={{ backgroundColor: 'var(--bg-main)', padding: '15px', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>{page.name.toUpperCase()} WIDGET URL:</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="text" readOnly value={`${typeof window !== 'undefined' ? window.location.href.split('/screen')[0] : ''}/embed/screen?id=${activeConfigId}&page=${page.id}`} onClick={(e) => (e.target as HTMLInputElement).select()} style={{ flex: 1, padding: '12px', fontSize: '1rem', cursor: 'text' }} />
                          <button className="btn-primary" onClick={() => handleCopy(page.id)} style={{ margin: 0, padding: '0 20px', backgroundColor: copySuccess === page.id ? '#10b981' : 'var(--accent-primary)', color: '#fff', border: 'none', fontWeight: 'bold' }}>
                            {copySuccess === page.id ? 'COPIED!' : 'COPY'}
                          </button>
                        </div>
                      </div>
                    ))}
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
