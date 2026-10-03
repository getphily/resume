'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button, IconButton, Flex, Box, Text, Tooltip, Switch, SegmentedControl, Popover, Slider, Card, TextField, Heading, Badge, Grid } from '@radix-ui/themes';
import { TrashIcon, PlusIcon, ArrowLeftIcon, SpeakerLoudIcon, PlayIcon, PauseIcon, ResetIcon } from '@radix-ui/react-icons';
import toast from 'react-hot-toast';

import { TimerConfig, DEFAULT_TIMER_CONFIG } from '@/types/timer';
import { TimerPreview } from '@/components/TimerPreview';
import { TextFormattingToolbar } from '@/components/TextFormattingToolbar';
import { ColorInputWithPalette } from '@/components/ColorInputWithPalette';
import { ObsExportCard } from '@/components/ObsExportCard';
import { playTimerAlarm } from '@/lib/sound';
import { TIMER_PRESETS } from '@/lib/presets';

// ─── Settings Inspector Component ───────────────────────────────────────────

function GlobalSettings({ config, setConfig }: { config: TimerConfig, setConfig: (c: TimerConfig) => void }) {
  const update = (patch: Partial<TimerConfig['layout']>) => setConfig({ ...config, layout: { ...config.layout, ...patch } });
  const updateSound = (patch: Partial<TimerConfig['sound']>) => setConfig({ ...config, sound: { ...config.sound, ...patch } });

  const totalMinutes = Math.floor(config.durationSeconds / 60);
  const totalRemainingSeconds = config.durationSeconds % 60;

  const setMinutesAndSeconds = (m: number, s: number) => {
    const total = Math.max(1, (m * 60) + s);
    setConfig({ ...config, durationSeconds: total });
  };

  return (
    <Box p="4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Timer Mode & Duration */}
      <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Heading size="3" style={{ color: 'var(--text-secondary)' }}>MODE & DURATION</Heading>
        
        <Box>
          <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>TIMER MODE</Text>
          <SegmentedControl.Root size="2" value={config.mode} onValueChange={v => setConfig({ ...config, mode: v as any })}>
            <SegmentedControl.Item value="TIMER">Countdown Timer</SegmentedControl.Item>
            <SegmentedControl.Item value="STOPWATCH">Count-Up Stopwatch</SegmentedControl.Item>
          </SegmentedControl.Root>
        </Box>

        {config.mode === 'TIMER' && (
          <Box pt="2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>QUICK PRESETS</Text>
            <Flex gap="2" wrap="wrap" mb="3">
              {[60, 180, 300, 600, 900].map(secs => (
                <Button 
                  key={secs} 
                  size="1" 
                  variant={config.durationSeconds === secs ? "solid" : "soft"} 
                  color={config.durationSeconds === secs ? "indigo" : "gray"}
                  onClick={() => setConfig({ ...config, durationSeconds: secs })}
                  style={{ cursor: 'pointer' }}
                >
                  {secs / 60} min
                </Button>
              ))}
            </Flex>

            <Flex gap="3" align="center">
              <Box style={{ flex: 1 }}>
                <Text size="1" weight="bold" color="gray" mb="1" style={{ display: 'block' }}>MINUTES</Text>
                <TextField.Root 
                  type="number" 
                  size="2"
                  min={0}
                  value={totalMinutes} 
                  onChange={e => setMinutesAndSeconds(parseInt(e.target.value) || 0, totalRemainingSeconds)} 
                />
              </Box>
              <Text size="4" weight="bold" color="gray" style={{ paddingTop: '16px' }}>:</Text>
              <Box style={{ flex: 1 }}>
                <Text size="1" weight="bold" color="gray" mb="1" style={{ display: 'block' }}>SECONDS</Text>
                <TextField.Root 
                  type="number" 
                  size="2"
                  min={0}
                  max={59}
                  value={totalRemainingSeconds} 
                  onChange={e => setMinutesAndSeconds(totalMinutes, Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))} 
                />
              </Box>
            </Flex>
          </Box>
        )}
      </Card>

      {/* Curated Timer Themes */}
      <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Flex justify="between" align="center">
          <Heading size="3" style={{ color: 'var(--text-secondary)' }}>CURATED TIMER THEMES</Heading>
          <Badge color="indigo" size="1" variant="surface">1-Click Apply</Badge>
        </Flex>
        <Text size="2" color="gray">
          Instant color states for running, paused, and expired milestones:
        </Text>
        <Grid columns="2" gap="2">
          {TIMER_PRESETS.map(preset => (
            <Button
              key={preset.name}
              variant="surface"
              size="2"
              onClick={() => {
                update({
                  runningColor: preset.runningColor,
                  pausedColor: preset.pausedColor,
                  expiredColor: preset.expiredColor,
                  trackColor: preset.trackColor,
                  bgColor: preset.bgColor,
                });
                toast.success(`Applied ${preset.name} theme!`);
              }}
              style={{ justifyContent: 'flex-start', gap: '8px', cursor: 'pointer', height: 'auto', padding: '8px 10px' }}
            >
              <Flex gap="1" align="center">
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: preset.runningColor }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: preset.pausedColor }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: preset.expiredColor }} />
              </Flex>
              <Text size="2" weight="medium">{preset.name}</Text>
            </Button>
          ))}
        </Grid>
      </Card>

      {/* 2. Color Palettes & Ring */}
      <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Heading size="3" style={{ color: 'var(--text-secondary)' }}>COLOR STATES & RING</Heading>
        
        {/* Running Color */}
        <Box>
          <Flex justify="between" align="center" mb="1">
            <Text size="2" weight="medium">Active Countdown Color</Text>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: config.layout.runningColor, border: '1px solid var(--border-subtle)' }} />
          </Flex>
          <ColorInputWithPalette value={config.layout.runningColor} onChange={e => update({ runningColor: e })} />
        </Box>

        {/* Paused Color */}
        <Box pt="2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Flex justify="between" align="center" mb="1">
            <Text size="2" weight="medium">Paused State Color</Text>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: config.layout.pausedColor, border: '1px solid var(--border-subtle)' }} />
          </Flex>
          <ColorInputWithPalette value={config.layout.pausedColor} onChange={e => update({ pausedColor: e })} />
        </Box>

        {/* Expired Color */}
        <Box pt="2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Flex justify="between" align="center" mb="1">
            <Text size="2" weight="medium">Expired (Time Up) Color</Text>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: config.layout.expiredColor, border: '1px solid var(--border-subtle)' }} />
          </Flex>
          <ColorInputWithPalette value={config.layout.expiredColor} onChange={e => update({ expiredColor: e })} />
        </Box>

        {/* Track Ring Color */}
        <Box pt="2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Flex justify="between" align="center" mb="1">
            <Text size="2" weight="medium">Background Track Ring</Text>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: config.layout.trackColor, border: '1px solid var(--border-subtle)' }} />
          </Flex>
          <ColorInputWithPalette value={config.layout.trackColor} onChange={e => update({ trackColor: e })} />
        </Box>

        {/* Overall Background Color & Opacity */}
        <Box pt="2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Flex justify="between" align="center" mb="1">
            <Text size="2" weight="medium">Canvas Background</Text>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: config.layout.bgColor, border: '1px solid var(--border-subtle)' }} />
          </Flex>
          <ColorInputWithPalette 
            value={config.layout.bgColor} 
            onChange={e => update({ bgColor: e })} 
            opacity={config.layout.opacity ?? 1}
            onOpacityChange={val => update({ opacity: val })}
          />
        </Box>
      </Card>

      {/* 3. Sound Alarm Settings */}
      <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Flex justify="between" align="center">
          <Heading size="3" style={{ color: 'var(--text-secondary)' }}>ALARM SOUND</Heading>
          <Switch size="2" checked={config.sound.enabled} onCheckedChange={c => updateSound({ enabled: c })} />
        </Flex>
        
        {config.sound.enabled && (
          <Flex direction="column" gap="3">
            <Box>
              <Text size="1" weight="medium" color="gray" mb="2" style={{ display: 'block' }}>CHIME STYLE</Text>
              <SegmentedControl.Root size="1" value={config.sound.type} onValueChange={v => updateSound({ type: v as any })}>
                <SegmentedControl.Item value="BELL">Bell</SegmentedControl.Item>
                <SegmentedControl.Item value="DIGITAL">Digital</SegmentedControl.Item>
                <SegmentedControl.Item value="GONG">Gong</SegmentedControl.Item>
                <SegmentedControl.Item value="CLASSIC">Classic</SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>

            <Box>
              <Flex justify="between" align="center" mb="1">
                <Text size="1" weight="medium" color="gray">VOLUME ({Math.round(config.sound.volume * 100)}%)</Text>
                <Button 
                  size="1" 
                  variant="ghost" 
                  onClick={() => {
                    playTimerAlarm(config.sound.type, config.sound.volume);
                    toast('Testing alarm tone...', { icon: '🔔', duration: 1500 });
                  }}
                  style={{ cursor: 'pointer', gap: '4px' }}
                >
                  <SpeakerLoudIcon /> Test Tone
                </Button>
              </Flex>
              <Slider size="1" min={0.1} max={1} step={0.05} value={[config.sound.volume]} onValueChange={([v]) => updateSound({ volume: v })} />
            </Box>
          </Flex>
        )}
      </Card>

      {/* 4. Typography */}
      <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Heading size="3" style={{ color: 'var(--text-secondary)' }}>TIMER TYPOGRAPHY</Heading>
        <TextFormattingToolbar
          fontFamily={config.layout.fontFamily}
          textColor={config.layout.textColor}
          bold={config.layout.bold ?? true}
          italic={config.layout.italic ?? false}
          textTransform={config.layout.textTransform ?? 'none'}
          onChange={patch => update({ 
            ...(patch.fontFamily && { fontFamily: patch.fontFamily }),
            ...(patch.textColor && { textColor: patch.textColor }),
            ...(patch.bold !== undefined && { bold: patch.bold }),
            ...(patch.italic !== undefined && { italic: patch.italic }),
            ...(patch.textTransform !== undefined && { textTransform: patch.textTransform })
          })}
        />
      </Card>

      {/* 5. Export to OBS */}
      <ObsExportCard
        url={`${typeof window !== 'undefined' ? window.location.origin : ''}/widgets/embed/timer?id=${config.id || ''}`}
        dimensions="1920 × 1080"
        allowTransparency={true}
        notes={[
          'Transparent background allows the timer circle to overlay gameplay or camera feeds cleanly.',
          'Start, pause, and reset controls on this dashboard update the live OBS display instantly.'
        ]}
      />

    </Box>
  );
}

// ─── Main Page Component ────────────────────────────────────────────

function TimerCustomizerContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');

  const [session, setSession] = useState<any>(null);
  const [configsList, setConfigsList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  
  // Editor State
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  
  // Settings
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_TIMER_CONFIG);
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
    const { data } = await supabase.from('widget_configs').select('id, config').eq('user_id', userId).eq('widget_type', 'timer').order('created_at', { ascending: true });
    const list = data || [];
    setConfigsList(list);
    setLoadingList(false);

    const toOpen = targetId || queryId;
    if (toOpen && list.length > 0) {
      const match = list.find(c => c.id === toOpen);
      if (match) {
        loadEditor(match.id, match.config as TimerConfig);
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

  const createConfig = async () => {
    if (!session) return;
    const { data, error } = await supabase.from('widget_configs').insert({
      user_id: session.user.id,
      widget_type: 'timer',
      config: DEFAULT_TIMER_CONFIG
    }).select().single();
    if (!error && data) {
      setConfigsList(prev => [...prev, data]);
      setActiveConfigId(data.id);
      setConfig(data.config as TimerConfig);
      toast.success('New timer created!');
    }
  };

  const deleteConfig = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast(
      (t) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Delete this timer widget?</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await supabase.from('widget_configs').delete().eq('id', id);
                setConfigsList(prev => prev.filter(c => c.id !== id));
                if (activeConfigId === id) setActiveConfigId(null);
                toast.success('Timer deleted');
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

  const loadEditor = (id: string, c: TimerConfig) => {
    setConfig({ ...c, id });
    setActiveConfigId(id);
  };

  if (loadingList) {
    return <Box p="6"><Text color="gray">Loading timer widgets...</Text></Box>;
  }

  // --- List / Catalog View ---
  if (!activeConfigId) {
    return (
      <Box p="6" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <Flex justify="between" align="end" mb="5">
          <Box>
            <Text size="2" color="gray" mb="1" style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>WIDGETS</Text>
            <Heading size="7">Timer Widgets</Heading>
            <Text size="2" color="gray" mt="1">Sleek countdown timer and stopwatch with SVG progress ring, state colors, and alarms.</Text>
          </Box>
          <Button onClick={createConfig} size="3" style={{ cursor: 'pointer' }}>
            <PlusIcon /> Create Timer
          </Button>
        </Flex>

        {configsList.length === 0 ? (
          <Card size="4" style={{ textAlign: 'center', backgroundColor: 'var(--bg-panel)', padding: '60px 20px', border: '1px dashed var(--border-subtle)' }}>
            <Text size="3" color="gray" mb="4" style={{ display: 'block' }}>You don&apos;t have any timers created yet.</Text>
            <Button onClick={createConfig} size="3" variant="solid">Create Your First Timer</Button>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {configsList.map(c => (
              <Card 
                key={c.id} 
                style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-panel)', cursor: 'pointer' }}
                onClick={() => loadEditor(c.id, c.config)}
                className="hover-card"
              >
                <Box p="3">
                  <div className="preview-window-container" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <div style={{ transform: 'scale(0.55)', transformOrigin: 'center center', width: '320px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TimerPreview config={c.config} />
                    </div>
                  </div>
                  <Flex justify="between" align="center">
                    <Text size="3" weight="bold">{c.config.name || 'Untitled Timer'}</Text>
                    <IconButton color="red" variant="ghost" onClick={(e) => deleteConfig(c.id, e)} title="Delete timer">
                      <TrashIcon />
                    </IconButton>
                  </Flex>
                </Box>
              </Card>
            ))}
          </div>
        )}
      </Box>
    );
  }

  // --- Unified Split-Screen Editor View ---
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      
      {/* LEFT: Properties Inspector (420px) */}
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
            <ArrowLeftIcon /> Back to Timers
          </Button>
          <TextField.Root 
            size="3" 
            placeholder="Timer Name" 
            value={config.name} 
            onChange={e => setConfig({ ...config, name: e.target.value })} 
            style={{ fontWeight: 'bold', fontSize: '1.2rem' }}
          />
        </div>

        <GlobalSettings config={config} setConfig={setConfig} />
      </div>

      {/* RIGHT: Live Preview Canvas */}
      <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Control Bar */}
        <Flex justify="between" align="center" px="5" py="3" style={{ backgroundColor: 'var(--bg-panel)', borderBottom: '1px solid var(--border-subtle)', zIndex: 10 }}>
          <Flex align="center" gap="4">
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              LIVE STREAM CONTROLS
            </span>
            
            <Flex gap="2">
              <Button 
                variant={config.state === 'RUNNING' ? 'solid' : 'soft'} 
                color="blue"
                size="2"
                onClick={() => {
                  let endTime = Date.now() + (config.durationSeconds * 1000);
                  if (config.state === 'PAUSED' && config.pausedTimeLeft) {
                    endTime = Date.now() + (config.pausedTimeLeft * 1000);
                  }
                  setConfig(c => ({ ...c, state: 'RUNNING', endTime, pausedTimeLeft: null }));
                  toast.success('Timer running in OBS');
                }}
              >
                <PlayIcon /> Start
              </Button>
              <Button 
                variant={config.state === 'PAUSED' ? 'solid' : 'soft'} 
                color="orange"
                size="2"
                disabled={config.state === 'STOPPED' || config.state === 'EXPIRED'}
                onClick={() => {
                  const remaining = config.endTime ? Math.max(0, Math.ceil((config.endTime - Date.now()) / 1000)) : 0;
                  setConfig(c => ({ ...c, state: 'PAUSED', pausedTimeLeft: remaining }));
                  toast('Timer paused');
                }}
              >
                <PauseIcon /> Pause
              </Button>
              <Button 
                variant="soft" 
                color="gray"
                size="2"
                onClick={() => {
                  setConfig(c => ({ ...c, state: 'STOPPED', endTime: null, pausedTimeLeft: null }));
                  toast('Timer reset');
                }}
              >
                <ResetIcon /> Reset
              </Button>
            </Flex>
          </Flex>

          <Text size="1" color="gray" weight="bold">
            {saving ? 'AUTOSAVING...' : 'LIVE SYNCED'}
          </Text>
        </Flex>

        {/* Centered Canvas Container with Checkerboard Pattern */}
        <div style={{ flex: 1, padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div 
            className="preview-window-container" 
            style={{ 
              width: '100%', 
              maxWidth: '750px', 
              aspectRatio: '16/9', 
              borderRadius: '16px', 
              boxShadow: '0 20px 50px rgba(0,0,0,0.12)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '20px'
            }}
          >
             <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <TimerPreview config={config} />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function TimerCustomizer() {
  return (
    <Suspense fallback={<Box p="6"><Text color="gray">Loading timer editor...</Text></Box>}>
      <TimerCustomizerContent />
    </Suspense>
  );
}
