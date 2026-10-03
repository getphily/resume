'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { ScreenPreview } from '@/components/ScreenPreview';
import { ColorInputWithPalette } from '@/components/ColorInputWithPalette';
import { TextFormattingToolbar } from '@/components/TextFormattingToolbar';
import { ImageUploadOrUrl } from '@/components/ImageUploadOrUrl';
import { ObsExportCard } from '@/components/ObsExportCard';
import { DEFAULT_SCREEN_CONFIG, ScreenConfig, ScreenPage } from '@/types/screen';
import { BROADCAST_PRESETS } from '@/lib/presets';
import { Flex, Box, Card, SegmentedControl, Switch, Button, Heading, Text, Tabs, TextField, Slider, Tooltip, IconButton, Select, Badge, Grid } from '@radix-ui/themes';
import { TrashIcon, ArrowLeftIcon, PlusIcon, DesktopIcon, PlayIcon, ResetIcon, MagicWandIcon } from '@radix-ui/react-icons';

function ScreenCustomizerContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');

  const [session, setSession] = useState<any>(null);
  const [configsList, setConfigsList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  
  // Editor State
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [previewPageId, setPreviewPageId] = useState<string>('starting-soon');
  const [activeTab, setActiveTab] = useState<string>('pages');
  
  // Settings
  const [config, setConfig] = useState<ScreenConfig>(DEFAULT_SCREEN_CONFIG);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setLoadingList(false); return; }
      setSession(session);
      fetchConfigs(session.user.id, queryId);
    });
  }, [queryId]);

  const fetchConfigs = async (userId: string, targetId?: string | null) => {
    setLoadingList(true);
    const { data } = await supabase.from('widget_configs').select('id, config').eq('user_id', userId).eq('widget_type', 'screen').order('created_at', { ascending: true });
    const list = data || [];
    setConfigsList(list);
    setLoadingList(false);

    const toOpen = targetId || queryId;
    if (toOpen && list.length > 0) {
      const match = list.find((c: any) => c.id === toOpen);
      if (match) {
        loadEditor(match.id, match.config);
      }
    }
  };

  const handleBackToList = () => {
    setActiveConfigId(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      window.history.pushState({}, '', url.pathname);
    }
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
      toast.success('New screenset created!');
    }
  };

  const loadEditor = (id: string, c: ScreenConfig) => {
    setActiveConfigId(id); 
    setConfig(c);
    setPreviewPageId(c.pages.length > 0 ? c.pages[0].id : '');
  };

  const deleteConfig = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast(
      (t) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Delete this screenset?</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
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
              style={{ padding: '6px 12px', background: 'var(--bg-panel)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center' }
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
    const newPage: ScreenPage = { 
      id: newId, 
      name: `Page ${config.pages.length + 1}`, 
      title: 'STREAM TITLE', 
      subtitle: 'Optional subtitle text...',
      timer: { enabled: false, durationMinutes: 5, endTime: null }
    };
    setConfig(prev => ({
      ...prev,
      pages: [...prev.pages, newPage]
    }));
    setPreviewPageId(newId);
    toast.success('New page added to screenset');
  };

  const deletePage = (id: string) => {
    if (config.pages.length <= 1) {
      toast.error('You need at least one page in your screenset');
      return;
    }
    setConfig(prev => ({
      ...prev,
      pages: prev.pages.filter(p => p.id !== id)
    }));
    if (previewPageId === id) {
      const remaining = config.pages.filter(p => p.id !== id);
      setPreviewPageId(remaining.length > 0 ? remaining[0].id : '');
    }
    toast.success('Page deleted');
  };

  const updateLayout = (patch: Partial<ScreenConfig['layout']>) => {
    setConfig(prev => ({ ...prev, layout: { ...prev.layout, ...patch } }));
  };

  if (!session) return <main style={{ padding: '40px' }}><p>Please <Link href="/auth">Sign In</Link></p></main>;

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      
      {/* ── 1. CATALOG VIEW ── */}
      {!activeConfigId ? (
        <Box p="6" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          <Flex justify="between" align="end" mb="5">
            <Box>
              <Text size="2" color="gray" mb="1" style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>WIDGETS</Text>
              <Heading size="7">Screen Sets</Heading>
              <Text size="2" color="gray" mt="1">Full-screen 1920×1080 overlay presets for Starting Soon, Be Right Back, and Goodbye pages.</Text>
            </Box>
            {configsList.length < 5 && (
              <Button size="3" onClick={handleCreateNew} style={{ cursor: 'pointer' }}>
                <PlusIcon /> Create Screenset
              </Button>
            )}
          </Flex>

          <Flex justify="between" align="center" mb="4" p="3" style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <Text size="2" weight="medium" color="gray">Storage Capacity</Text>
            <Text size="2" weight="bold" color={configsList.length >= 5 ? "red" : "indigo"}>
              {configsList.length} / 5 Screensets Used
            </Text>
          </Flex>

          {loadingList ? (
            <Text color="gray">Loading your screensets...</Text>
          ) : configsList.length === 0 ? (
            <Card size="4" style={{ textAlign: 'center', backgroundColor: 'var(--bg-panel)', padding: '60px 20px', border: '1px dashed var(--border-subtle)' }}>
              <Text size="3" color="gray" mb="4" style={{ display: 'block' }}>You don&apos;t have any screensets created yet.</Text>
              <Button onClick={handleCreateNew} size="3" variant="solid">Create Your First Screenset</Button>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {configsList.map(c => (
                <Card 
                  key={c.id} 
                  onClick={() => loadEditor(c.id, c.config)} 
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-panel)' }}
                  className="hover-card"
                >
                  <Box p="3">
                    <div className="preview-window-container" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                      <div style={{ transform: 'scale(0.16)', transformOrigin: 'center center', width: '1920px', height: '1080px' }}>
                         <ScreenPreview config={c.config} />
                      </div>
                    </div>
                    <Flex justify="between" align="center">
                      <Flex direction="column" gap="0">
                        <Text size="3" weight="bold">{c.config.name || 'Unnamed Screenset'}</Text>
                        <Text size="1" color="gray">{c.config.pages?.length || 0} Pages</Text>
                      </Flex>
                      <IconButton size="2" color="red" variant="ghost" onClick={(e) => deleteConfig(c.id, e)} title="Delete screenset">
                        <TrashIcon />
                      </IconButton>
                    </Flex>
                  </Box>
                </Card>
              ))}
            </div>
          )}
        </Box>
      ) : (
        /* ── 2. SPLIT WORKSPACE EDITOR VIEW ── */
        <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
          
          {/* LEFT: Tabbed Settings Inspector (460px) */}
          <div style={{ 
            width: '460px', 
            minWidth: '400px',
            backgroundColor: 'var(--bg-panel)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <Button variant="ghost" size="2" onClick={handleBackToList} style={{ marginLeft: '-8px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <ArrowLeftIcon /> Back to Screensets
              </Button>
              <TextField.Root 
                size="3" 
                placeholder="Screenset Name" 
                value={config.name} 
                onChange={e => setConfig({ ...config, name: e.target.value })} 
                style={{ fontWeight: 'bold', fontSize: '1.2rem' }}
              />
            </div>

            {/* Navigation Tabs */}
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
              <Box px="4" pt="3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <Tabs.List size="2">
                  <Tabs.Trigger value="pages">Pages &amp; Text</Tabs.Trigger>
                  <Tabs.Trigger value="global">Global Styles</Tabs.Trigger>
                  <Tabs.Trigger value="logo">Logo &amp; Brand</Tabs.Trigger>
                  <Tabs.Trigger value="export">OBS Export</Tabs.Trigger>
                </Tabs.List>
              </Box>

              {/* TAB 1: Pages & Content */}
              <Tabs.Content value="pages">
                <Box p="4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Flex justify="between" align="center">
                    <Heading size="3" style={{ color: 'var(--text-secondary)' }}>PAGES IN SCREENSET</Heading>
                    <Button size="1" onClick={addPage} style={{ cursor: 'pointer' }}>
                      <PlusIcon /> Add Page
                    </Button>
                  </Flex>

                  {config.pages.map((page, idx) => {
                    const currentTimer = {
                      enabled: page.timer?.enabled ?? false,
                      durationMinutes: page.timer?.durationMinutes ?? 5,
                      endTime: page.timer?.endTime ?? null,
                    };

                    const isSelected = previewPageId === page.id;

                    return (
                      <Card 
                        key={page.id} 
                        size="2" 
                        style={{ 
                          border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '12px',
                          backgroundColor: isSelected ? 'var(--bg-main)' : 'var(--bg-panel)'
                        }}
                      >
                        <Flex justify="between" align="center">
                          <Flex align="center" gap="2">
                            <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'var(--border-subtle)', padding: '2px 6px', borderRadius: '4px' }}>
                              #{idx + 1}
                            </span>
                            <Text size="2" weight="bold">{page.name}</Text>
                          </Flex>
                          <Flex align="center" gap="2">
                            <Button 
                              size="1" 
                              variant={isSelected ? "solid" : "soft"} 
                              color={isSelected ? "indigo" : "gray"}
                              onClick={() => setPreviewPageId(page.id)}
                            >
                              {isSelected ? "Previewing" : "Preview"}
                            </Button>
                            {config.pages.length > 1 && (
                              <IconButton size="1" color="red" variant="ghost" onClick={() => deletePage(page.id)}>
                                <TrashIcon />
                              </IconButton>
                            )}
                          </Flex>
                        </Flex>

                        <Box>
                          <Text as="label" size="1" weight="bold" color="gray" mb="1" style={{ display: 'block' }}>PAGE NAME (INTERNAL)</Text>
                          <TextField.Root size="2" value={page.name} onChange={e => updatePage(page.id, { name: e.target.value })} />
                        </Box>

                        <Box>
                          <Text as="label" size="1" weight="bold" color="gray" mb="1" style={{ display: 'block' }}>MAIN TITLE</Text>
                          <TextField.Root size="2" value={page.title} onChange={e => updatePage(page.id, { title: e.target.value })} />
                        </Box>

                        <Box>
                          <Text as="label" size="1" weight="bold" color="gray" mb="1" style={{ display: 'block' }}>SUBTITLE (OPTIONAL)</Text>
                          <TextField.Root size="2" value={page.subtitle} onChange={e => updatePage(page.id, { subtitle: e.target.value })} placeholder="e.g. Stream will begin shortly..." />
                        </Box>

                        {/* Page Timer Setting */}
                        <Box p="3" style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                          <Flex justify="between" align="center" mb="2">
                            <Text size="2" weight="medium">Include Countdown Timer</Text>
                            <Switch 
                              size="2" 
                              checked={currentTimer.enabled} 
                              onCheckedChange={checked => updatePage(page.id, { timer: { ...currentTimer, enabled: checked } })} 
                            />
                          </Flex>

                          {currentTimer.enabled && (
                            <Flex direction="column" gap="2" pt="2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                              <Flex align="center" gap="2">
                                <Text size="1" color="gray" style={{ minWidth: '70px' }}>Duration:</Text>
                                <TextField.Root 
                                  type="number" 
                                  size="1" 
                                  min={1}
                                  value={currentTimer.durationMinutes} 
                                  onChange={e => updatePage(page.id, { timer: { ...currentTimer, durationMinutes: Math.max(1, parseInt(e.target.value) || 1) } })}
                                  style={{ width: '80px' }}
                                />
                                <Text size="1" color="gray">minutes</Text>
                              </Flex>

                              <Flex gap="2" mt="1">
                                <Button 
                                  size="1" 
                                  color="indigo" 
                                  onClick={() => {
                                    updatePage(page.id, { timer: { ...currentTimer, endTime: Date.now() + (currentTimer.durationMinutes * 60000) } });
                                    toast.success('Timer started for page');
                                  }}
                                >
                                  <PlayIcon /> Start Timer
                                </Button>
                                <Button 
                                  size="1" 
                                  variant="soft" 
                                  color="gray"
                                  onClick={() => {
                                    updatePage(page.id, { timer: { ...currentTimer, endTime: null } });
                                    toast('Timer reset');
                                  }}
                                >
                                  <ResetIcon /> Reset
                                </Button>
                              </Flex>
                            </Flex>
                          )}
                        </Box>
                      </Card>
                    );
                  })}
                </Box>
              </Tabs.Content>

              {/* TAB 2: Global Styles */}
              <Tabs.Content value="global">
                <Box p="4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Curated Broadcast Themes */}
                  <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Flex justify="between" align="center">
                      <Heading size="3" style={{ color: 'var(--text-secondary)' }}>CURATED BROADCAST THEMES</Heading>
                      <Badge color="indigo" size="1" variant="surface">1-Click Apply</Badge>
                    </Flex>
                    <Text size="2" color="gray">
                      Apply harmonious broadcast palettes designed for professional stream aesthetics:
                    </Text>
                    <Grid columns="2" gap="2">
                      {BROADCAST_PRESETS.map(preset => (
                        <Button
                          key={preset.name}
                          variant="surface"
                          size="2"
                          onClick={() => {
                            updateLayout({
                              bgColor: preset.bgColor,
                              accentColor: preset.accentColor,
                              textColor: preset.textColor,
                              timerColor: preset.accentColor,
                              glow: preset.glow,
                            });
                            toast.success(`Applied ${preset.name} palette!`);
                          }}
                          style={{ justifyContent: 'flex-start', gap: '8px', cursor: 'pointer', height: 'auto', padding: '8px 10px' }}
                        >
                          <Flex gap="1" align="center">
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: preset.accentColor }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: preset.bgColor, border: '1px solid var(--border-subtle)' }} />
                          </Flex>
                          <Text size="2" weight="medium">{preset.name}</Text>
                        </Button>
                      ))}
                    </Grid>
                  </Card>

                  {/* Background Properties */}
                  <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <Heading size="3" style={{ color: 'var(--text-secondary)' }}>BACKGROUND</Heading>
                    
                    <Box>
                      <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>BACKGROUND COLOR &amp; OPACITY</Text>
                      <ColorInputWithPalette 
                        value={config.layout.bgColor} 
                        onChange={val => updateLayout({ bgColor: val })} 
                        opacity={config.layout.bgOpacity ?? 1}
                        onOpacityChange={val => updateLayout({ bgOpacity: val })}
                      />
                    </Box>

                    <Box pt="2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <ImageUploadOrUrl 
                        label="BACKGROUND IMAGE OVERLAY"
                        value={config.layout.bgImageUrl || ''} 
                        onChange={val => updateLayout({ bgImageUrl: val })} 
                      />
                    </Box>
                  </Card>

                  {/* Effects */}
                  <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <Heading size="3" style={{ color: 'var(--text-secondary)' }}>SPECIAL EFFECTS</Heading>
                    
                    <Flex justify="between" align="center">
                      <Text size="2" weight="medium">Text Drop Shadow</Text>
                      <Switch size="2" checked={config.layout.dropShadow} onCheckedChange={checked => updateLayout({ dropShadow: checked })} />
                    </Flex>

                    <Box pt="2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <Text size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>GLOW INTENSITY</Text>
                      <SegmentedControl.Root size="2" value={config.layout.glow || 'OFF'} onValueChange={val => updateLayout({ glow: val as any })}>
                        <SegmentedControl.Item value="OFF">Off</SegmentedControl.Item>
                        <SegmentedControl.Item value="SUBTLE">Subtle</SegmentedControl.Item>
                        <SegmentedControl.Item value="NEON">Neon</SegmentedControl.Item>
                      </SegmentedControl.Root>
                    </Box>
                  </Card>

                  {/* Title Typography */}
                  <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Heading size="3" style={{ color: 'var(--text-secondary)' }}>TITLE TYPOGRAPHY</Heading>
                    <TextFormattingToolbar
                      fontFamily={config.layout.fontFamily}
                      fontSize={config.layout.titleSize}
                      textColor={config.layout.accentColor}
                      opacity={config.layout.titleOpacity ?? 1}
                      bold={config.layout.titleBold ?? true}
                      italic={config.layout.titleItalic ?? false}
                      textTransform={config.layout.titleTransform ?? 'uppercase'}
                      onChange={patch => updateLayout({ 
                        ...(patch.fontFamily && { fontFamily: patch.fontFamily }),
                        ...(patch.fontSize && { titleSize: patch.fontSize }),
                        ...(patch.textColor && { accentColor: patch.textColor }),
                        ...(patch.opacity !== undefined && { titleOpacity: patch.opacity }),
                        ...(patch.bold !== undefined && { titleBold: patch.bold }),
                        ...(patch.italic !== undefined && { titleItalic: patch.italic }),
                        ...(patch.textTransform !== undefined && { titleTransform: patch.textTransform }),
                      })}
                    />
                  </Card>

                  {/* Subtitle Typography */}
                  <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Heading size="3" style={{ color: 'var(--text-secondary)' }}>SUBTITLE TYPOGRAPHY</Heading>
                    <TextFormattingToolbar
                      fontFamily={config.layout.fontFamily}
                      fontSize={config.layout.subtitleSize}
                      textColor={config.layout.textColor}
                      opacity={config.layout.subtitleOpacity ?? 1}
                      bold={config.layout.subtitleBold ?? false}
                      italic={config.layout.subtitleItalic ?? false}
                      textTransform={config.layout.subtitleTransform ?? 'none'}
                      onChange={patch => updateLayout({ 
                        ...(patch.fontFamily && { fontFamily: patch.fontFamily }),
                        ...(patch.fontSize && { subtitleSize: patch.fontSize }),
                        ...(patch.textColor && { textColor: patch.textColor }),
                        ...(patch.opacity !== undefined && { subtitleOpacity: patch.opacity }),
                        ...(patch.bold !== undefined && { subtitleBold: patch.bold }),
                        ...(patch.italic !== undefined && { subtitleItalic: patch.italic }),
                        ...(patch.textTransform !== undefined && { subtitleTransform: patch.textTransform }),
                      })}
                    />
                  </Card>

                  {/* Timer Typography */}
                  <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Heading size="3" style={{ color: 'var(--text-secondary)' }}>COUNTDOWN TYPOGRAPHY</Heading>
                    <TextFormattingToolbar
                      fontFamily={config.layout.fontFamily}
                      fontSize="MEDIUM"
                      textColor={config.layout.timerColor || config.layout.textColor}
                      opacity={config.layout.timerOpacity ?? 1}
                      bold={config.layout.timerBold ?? true}
                      italic={config.layout.timerItalic ?? false}
                      textTransform={config.layout.timerTransform ?? 'none'}
                      onChange={patch => updateLayout({ 
                        ...(patch.fontFamily && { fontFamily: patch.fontFamily }),
                        ...(patch.textColor && { timerColor: patch.textColor }),
                        ...(patch.opacity !== undefined && { timerOpacity: patch.opacity }),
                        ...(patch.bold !== undefined && { timerBold: patch.bold }),
                        ...(patch.italic !== undefined && { timerItalic: patch.italic }),
                        ...(patch.textTransform !== undefined && { timerTransform: patch.textTransform }),
                      })}
                    />
                  </Card>

                </Box>
              </Tabs.Content>

              {/* TAB 3: Logo & Brand */}
              <Tabs.Content value="logo">
                <Box p="4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Flex justify="between" align="center">
                      <Heading size="3" style={{ color: 'var(--text-secondary)' }}>LOGO DISPLAY</Heading>
                      <Switch 
                        size="2" 
                        checked={config.logo.enabled} 
                        onCheckedChange={checked => setConfig({ ...config, logo: { ...config.logo, enabled: checked } })} 
                      />
                    </Flex>

                    {config.logo.enabled && (
                      <Flex direction="column" gap="4">
                        <ImageUploadOrUrl 
                          label="LOGO IMAGE"
                          value={config.logo.imageUrl || ''} 
                          onChange={val => setConfig({ ...config, logo: { ...config.logo, imageUrl: val } })} 
                        />

                        <Box>
                          <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>CORNER PLACEMENT</Text>
                          <Select.Root 
                            size="2" 
                            value={config.logo.position} 
                            onValueChange={val => setConfig({ ...config, logo: { ...config.logo, position: val as any } })}
                          >
                            <Select.Trigger style={{ width: '100%' }} />
                            <Select.Content>
                              <Select.Item value="TOP_LEFT">Top Left</Select.Item>
                              <Select.Item value="TOP_RIGHT">Top Right</Select.Item>
                              <Select.Item value="CENTER">Center (Above Title)</Select.Item>
                              <Select.Item value="BOTTOM_LEFT">Bottom Left</Select.Item>
                              <Select.Item value="BOTTOM_RIGHT">Bottom Right</Select.Item>
                            </Select.Content>
                          </Select.Root>
                        </Box>

                        <Box>
                          <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>LOGO SCALE</Text>
                          <SegmentedControl.Root 
                            size="2" 
                            value={config.logo.size} 
                            onValueChange={val => setConfig({ ...config, logo: { ...config.logo, size: val as any } })}
                          >
                            <SegmentedControl.Item value="SMALL">Small</SegmentedControl.Item>
                            <SegmentedControl.Item value="MEDIUM">Medium</SegmentedControl.Item>
                            <SegmentedControl.Item value="LARGE">Large</SegmentedControl.Item>
                          </SegmentedControl.Root>
                        </Box>
                      </Flex>
                    )}
                  </Card>
                </Box>
              </Tabs.Content>

              {/* TAB 4: OBS Export */}
              <Tabs.Content value="export">
                <Box p="4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Heading size="3" style={{ color: 'var(--text-secondary)' }}>OBS BROWSER SOURCE URLS</Heading>
                  <Text size="2" color="gray">
                    Each page in this screenset has its own dedicated 1920×1080 embed URL. Copy each URL and paste into an OBS Browser Source for each stream scene.
                  </Text>

                  {config.pages.map(page => (
                    <ObsExportCard
                      key={page.id}
                      title={`${page.name.toUpperCase()} OVERLAY`}
                      url={`${typeof window !== 'undefined' ? window.location.origin : ''}/widgets/embed/screen?id=${activeConfigId}&page=${page.id}`}
                      dimensions="1920 × 1080"
                      allowTransparency={true}
                    />
                  ))}
                </Box>
              </Tabs.Content>
            </Tabs.Root>

          </div>

          {/* RIGHT: Live Preview Canvas */}
          <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            {/* Top Preview Header & Page Switcher */}
            <Flex justify="between" align="center" px="5" py="3" style={{ backgroundColor: 'var(--bg-panel)', borderBottom: '1px solid var(--border-subtle)', zIndex: 10 }}>
              <Flex align="center" gap="2" wrap="wrap">
                <Text size="1" weight="bold" color="gray" mr="2" style={{ textTransform: 'uppercase' }}>PAGE:</Text>
                {config.pages.map(page => (
                  <Button 
                    key={page.id}
                    size="1"
                    variant={previewPageId === page.id ? "solid" : "soft"}
                    color={previewPageId === page.id ? "indigo" : "gray"}
                    onClick={() => setPreviewPageId(page.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {page.name}
                  </Button>
                ))}
              </Flex>

              <Text size="1" color="gray" weight="bold">
                {saving ? 'AUTOSAVING...' : 'LIVE SYNCED'}
              </Text>
            </Flex>

            {/* Centered Preview Canvas Container */}
            <div style={{ flex: 1, padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div 
                className="preview-window-container" 
                style={{ 
                  width: '100%', 
                  maxWidth: '850px', 
                  aspectRatio: '16/9', 
                  borderRadius: '16px', 
                  boxShadow: '0 20px 50px rgba(0,0,0,0.12)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div style={{ width: '850px', height: '478px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ transform: 'scale(0.4427)', transformOrigin: 'top left', width: '1920px', height: '1080px' }}>
                    <ScreenPreview config={config} activePageId={previewPageId} />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default function ScreenCustomizer() {
  return (
    <Suspense fallback={<Box p="6"><Text color="gray">Loading screenset editor...</Text></Box>}>
      <ScreenCustomizerContent />
    </Suspense>
  );
}
