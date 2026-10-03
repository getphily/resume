'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import * as Popover from '@radix-ui/react-popover';
import { ColorInputWithPalette } from '@/components/ColorInputWithPalette';
import { ObsExportCard } from '@/components/ObsExportCard';
import { Card, TextField, SegmentedControl, Switch, Text, Button, IconButton, Flex, Box, Select, Slider, Heading, Tooltip, Badge, Grid } from '@radix-ui/themes';
import { CLOCK_PRESETS } from '@/lib/presets';
import { TrashIcon, ClockIcon, CalendarIcon, ArrowLeftIcon, PlusIcon } from '@radix-ui/react-icons';

const GOOGLE_FONTS = [
  'Roboto Mono', 'Inter', 'Outfit', 'Bebas Neue', 'VT323',
  'Poppins', 'Montserrat', 'Open Sans', 'Lato', 'Raleway',
  'Nunito', 'Playfair Display', 'Oswald', 'Fira Code'
];

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

function ClockCustomizerContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');

  const [session, setSession] = useState<any>(null);
  const [configsList, setConfigsList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  
  // Editor State
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  
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
      fetchConfigs(session.user.id, queryId);
    });
  }, [queryId]);

  const fetchConfigs = async (userId: string, targetId?: string | null) => {
    setLoadingList(true);
    const { data } = await supabase.from('widget_configs').select('id, config').eq('user_id', userId).eq('widget_type', 'clock').order('created_at', { ascending: true });
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
      toast.success('New clock created!');
    }
  };

  const loadEditor = (id: string, c: any) => {
    setActiveConfigId(id);
    setName(c.name || 'My Clock'); setTimeFormat(c.timeFormat || '12HR'); setTimezone(c.timezone || 'LOCAL'); setShowSeconds(c.showSeconds ?? true); setShowDate(c.showDate ?? false);
    setFontFamily(c.fontFamily || 'Roboto Mono'); setSizeScale(c.sizeScale ?? 1.0); setTextColor(c.textColor || '#FF5900'); setOpacity(c.opacity ?? 100); setOutline(c.outline ?? false); setDropShadow(c.dropShadow ?? false); setGlow(c.glow || 'OFF'); setBlinkingColon(c.blinkingColon ?? false);
    setBgMode(c.bgMode || 'SOLID'); setBgColor(c.bgColor || '#0a0a0a');
  };

  const deleteConfig = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast(
      (t) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Delete this clock widget?</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button 
              onClick={async () => {
                toast.dismiss(t.id);
                await supabase.from('widget_configs').delete().eq('id', id);
                setConfigsList(configsList.filter(c => c.id !== id));
                if (activeConfigId === id) setActiveConfigId(null);
                toast.success('Widget deleted');
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

  if (!session) return <main style={{ padding: '40px' }}><p>Please <Link href="/auth">Sign In</Link></p></main>;

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      
      {/* ── CATALOG VIEW ── */}
      {!activeConfigId ? (
        <Box p="6" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          <Flex justify="between" align="end" mb="5">
            <Box>
              <Text size="2" color="gray" mb="1" style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>WIDGETS</Text>
              <Heading size="7">Clock Widgets</Heading>
              <Text size="2" color="gray" mt="1">Digital clock overlay with customizable fonts, timezones, and glowing broadcast styles.</Text>
            </Box>
            {configsList.length < 3 && (
              <Button size="3" onClick={handleCreateNew} style={{ cursor: 'pointer' }}>
                <PlusIcon /> Create Clock
              </Button>
            )}
          </Flex>

          <Flex justify="between" align="center" mb="4" p="3" style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <Text size="2" weight="medium" color="gray">Storage Capacity</Text>
            <Text size="2" weight="bold" color={configsList.length >= 3 ? "red" : "indigo"}>
              {configsList.length} / 3 Clocks Used
            </Text>
          </Flex>

          {loadingList ? (
            <Text color="gray">Loading your clocks...</Text>
          ) : configsList.length === 0 ? (
            <Card size="4" style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border-subtle)', backgroundColor: 'var(--bg-panel)' }}>
              <Text size="3" color="gray" mb="4" style={{ display: 'block' }}>You don&apos;t have any clock widgets created yet.</Text>
              <Button onClick={handleCreateNew} size="3" variant="solid">Create Your First Clock</Button>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {configsList.map(c => (
                <Card key={c.id} onClick={() => loadEditor(c.id, c.config)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease', backgroundColor: 'var(--bg-panel)' }} className="hover-card">
                  <Box p="3">
                    <div className="preview-window-container" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                      <ClockPreview config={c.config} time={time} scale={0.55} />
                    </div>
                    <Flex justify="between" align="center">
                      <Text size="3" weight="bold">{c.config.name || 'Unnamed Clock'}</Text>
                      <IconButton size="2" color="red" variant="ghost" onClick={(e) => deleteConfig(c.id, e)} title="Delete widget">
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
        /* ── SPLIT WORKSPACE EDITOR VIEW ── */
        <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
          
          {/* LEFT: Controls Inspector (420px) */}
          <div style={{ 
            width: '420px', 
            minWidth: '380px',
            backgroundColor: 'var(--bg-panel)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <Button variant="ghost" size="2" onClick={handleBackToList} style={{ marginLeft: '-8px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <ArrowLeftIcon /> Back to Clocks
              </Button>
              <TextField.Root 
                size="3" 
                placeholder="Clock Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                style={{ fontWeight: 'bold', fontSize: '1.2rem' }}
              />
            </div>

            <Box p="4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Card 1: Time & Display Properties */}
              <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Heading size="3" style={{ color: 'var(--text-secondary)' }}>TIME SETTINGS</Heading>
                
                <Flex direction="column" gap="3">
                  <Box>
                    <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>FORMAT</Text>
                    <SegmentedControl.Root size="2" value={timeFormat} onValueChange={(val: '12HR' | '24HR') => setTimeFormat(val)}>
                      <SegmentedControl.Item value="12HR">12-Hour (AM/PM)</SegmentedControl.Item>
                      <SegmentedControl.Item value="24HR">24-Hour (Military)</SegmentedControl.Item>
                    </SegmentedControl.Root>
                  </Box>

                  <Box>
                    <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>TIMEZONE</Text>
                    <Select.Root size="2" value={timezone} onValueChange={setTimezone}>
                      <Select.Trigger style={{ width: '100%' }} />
                      <Select.Content>
                        <Select.Item value="LOCAL">Local Computer Time</Select.Item>
                        <Select.Item value="UTC">UTC (Universal)</Select.Item>
                        <Select.Item value="America/New_York">Eastern (EST/EDT)</Select.Item>
                        <Select.Item value="America/Chicago">Central (CST/CDT)</Select.Item>
                        <Select.Item value="America/Denver">Mountain (MST/MDT)</Select.Item>
                        <Select.Item value="America/Los_Angeles">Pacific (PST/PDT)</Select.Item>
                        <Select.Item value="Europe/London">London (GMT/BST)</Select.Item>
                        <Select.Item value="Asia/Tokyo">Tokyo (JST)</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  <Flex justify="between" align="center" pt="2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <Text size="2" weight="medium">Show Seconds</Text>
                    <Switch size="2" checked={showSeconds} onCheckedChange={setShowSeconds} />
                  </Flex>

                  <Flex justify="between" align="center">
                    <Text size="2" weight="medium">Show Date</Text>
                    <Switch size="2" checked={showDate} onCheckedChange={setShowDate} />
                  </Flex>

                  <Flex justify="between" align="center">
                    <Text size="2" weight="medium">Blink Colon (:)</Text>
                    <Switch size="2" checked={blinkingColon} onCheckedChange={setBlinkingColon} />
                  </Flex>
                </Flex>
              </Card>

              {/* Card: Curated Clock Themes */}
              <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Flex justify="between" align="center">
                  <Heading size="3" style={{ color: 'var(--text-secondary)' }}>CURATED CLOCK THEMES</Heading>
                  <Badge color="indigo" size="1" variant="surface">1-Click Apply</Badge>
                </Flex>
                <Text size="2" color="gray">
                  Quick broadcast and stream looks tuned for legibility:
                </Text>
                <Grid columns="2" gap="2">
                  {CLOCK_PRESETS.map(preset => (
                    <Button
                      key={preset.name}
                      variant="surface"
                      size="2"
                      onClick={() => {
                        setTextColor(preset.textColor);
                        setBgColor(preset.bgColor);
                        setGlow(preset.glow);
                        toast.success(`Applied ${preset.name} theme!`);
                      }}
                      style={{ justifyContent: 'flex-start', gap: '8px', cursor: 'pointer', height: 'auto', padding: '8px 10px' }}
                    >
                      <Flex gap="1" align="center">
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: preset.textColor }} />
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: preset.bgColor, border: '1px solid var(--border-subtle)' }} />
                      </Flex>
                      <Text size="2" weight="medium">{preset.name}</Text>
                    </Button>
                  ))}
                </Grid>
              </Card>

              {/* Card 2: Typography & Styling */}
              <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Heading size="3" style={{ color: 'var(--text-secondary)' }}>TYPOGRAPHY & STYLES</Heading>
                
                <Box>
                  <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>FONT FAMILY</Text>
                  <Select.Root size="2" value={fontFamily} onValueChange={setFontFamily}>
                    <Select.Trigger style={{ width: '100%' }} />
                    <Select.Content>
                      {GOOGLE_FONTS.map(f => (
                        <Select.Item key={f} value={f} style={{ fontFamily: getFontFamily(f) }}>
                          {f}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>

                <Box>
                  <Flex justify="between" align="center" mb="2">
                    <Text as="label" size="2" weight="bold" color="gray">SIZE SCALE</Text>
                    <Text size="1" color="gray">{sizeScale}x</Text>
                  </Flex>
                  <Slider min={0.5} max={2.0} step={0.1} value={[sizeScale]} onValueChange={([val]) => setSizeScale(val)} />
                </Box>

                <Box pt="2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>DIGIT COLOR</Text>
                  <ColorInputWithPalette 
                    value={textColor} 
                    onChange={setTextColor} 
                    opacity={opacity / 100}
                    onOpacityChange={val => setOpacity(Math.round(val * 100))}
                  />
                </Box>

                <Box pt="2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>BACKGROUND</Text>
                  <SegmentedControl.Root size="2" value={bgMode} onValueChange={setBgMode as any} mb="3">
                    <SegmentedControl.Item value="SOLID">Solid Color</SegmentedControl.Item>
                    <SegmentedControl.Item value="TRANSPARENT">Transparent (OBS)</SegmentedControl.Item>
                  </SegmentedControl.Root>
                  {bgMode === 'SOLID' && (
                    <ColorInputWithPalette value={bgColor} onChange={setBgColor} />
                  )}
                </Box>

                <Box pt="2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>SPECIAL EFFECTS</Text>
                  <Flex direction="column" gap="3">
                    <Box>
                      <Text size="1" weight="medium" color="gray" mb="1" style={{ display: 'block' }}>Glow Aura</Text>
                      <SegmentedControl.Root size="1" value={glow} onValueChange={setGlow as any}>
                        <SegmentedControl.Item value="OFF">Off</SegmentedControl.Item>
                        <SegmentedControl.Item value="SUBTLE">Subtle</SegmentedControl.Item>
                        <SegmentedControl.Item value="NEON">Neon</SegmentedControl.Item>
                      </SegmentedControl.Root>
                    </Box>
                    <Flex justify="between" align="center">
                      <Text size="2" weight="medium">Text Drop Shadow</Text>
                      <Switch size="2" checked={dropShadow} onCheckedChange={setDropShadow} />
                    </Flex>
                    <Flex justify="between" align="center">
                      <Text size="2" weight="medium">Black Outline</Text>
                      <Switch size="2" checked={outline} onCheckedChange={setOutline} />
                    </Flex>
                  </Flex>
                </Box>
              </Card>

              {/* Card 3: OBS Export */}
              <ObsExportCard
                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/widgets/embed/clock?id=${activeConfigId}`}
                dimensions="1920 × 1080"
                allowTransparency={true}
              />

            </Box>
          </div>

          {/* RIGHT: Live Canvas Preview Pane */}
          <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Header info */}
            <Flex justify="between" align="center" px="5" py="3" style={{ backgroundColor: 'var(--bg-panel)', borderBottom: '1px solid var(--border-subtle)' }}>
              <Flex align="center" gap="3">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <Text size="2" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Preview: {name}
                </Text>
              </Flex>
              <Text size="1" color="gray" weight="bold">
                {saving ? 'AUTOSAVING...' : 'LIVE SYNCED'}
              </Text>
            </Flex>

            {/* Centered Preview Canvas */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', overflow: 'hidden' }}>
              <div 
                className="preview-window-container" 
                style={{ 
                  width: '100%', 
                  maxWidth: '750px', 
                  aspectRatio: '16/9', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
              >
                <ClockPreview config={activeConfigObj} time={time} scale={1.3} />
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default function ClockCustomizer() {
  return (
    <Suspense fallback={<Box p="6"><Text color="gray">Loading clock editor...</Text></Box>}>
      <ClockCustomizerContent />
    </Suspense>
  );
}
