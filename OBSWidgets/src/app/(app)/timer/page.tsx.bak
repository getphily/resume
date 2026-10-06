'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Plus, 
  ArrowLeft, 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

import { TimerConfig, DEFAULT_TIMER_CONFIG } from '@/types/timer';
import { TimerPreview } from '@/components/TimerPreview';
import { TextFormattingToolbar } from '@/components/TextFormattingToolbar';
import { ColorInputWithPalette } from '@/components/ColorInputWithPalette';
import { ObsExportCard } from '@/components/ObsExportCard';
import { playTimerAlarm } from '@/lib/sound';
import { TIMER_PRESETS } from '@/lib/presets';
import { cn } from '@/lib/utils';

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
    <div className="p-4 flex flex-col gap-4">
      
      {/* 1. Timer Mode & Duration */}
      <Card className="border-border bg-card p-4 flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Mode & Duration
        </span>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Timer Mode</label>
          <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-md">
            <button
              type="button"
              onClick={() => setConfig({ ...config, mode: 'TIMER' })}
              className={cn(
                "py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer",
                config.mode === 'TIMER' ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Countdown Timer
            </button>
            <button
              type="button"
              onClick={() => setConfig({ ...config, mode: 'STOPWATCH' })}
              className={cn(
                "py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer",
                config.mode === 'STOPWATCH' ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Count-Up Stopwatch
            </button>
          </div>
        </div>

        {config.mode === 'TIMER' && (
          <div className="pt-2 border-t border-border flex flex-col gap-3">
            <label className="text-xs font-semibold text-foreground">Quick Presets</label>
            <div className="flex gap-1.5 flex-wrap">
              {[60, 180, 300, 600, 900].map(secs => (
                <Button 
                  key={secs} 
                  size="sm" 
                  variant={config.durationSeconds === secs ? "default" : "secondary"} 
                  onClick={() => setConfig({ ...config, durationSeconds: secs })}
                  className="h-7 px-2.5 text-xs font-semibold"
                >
                  {secs / 60} min
                </Button>
              ))}
            </div>

            <div className="flex gap-3 items-center">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-sm font-bold text-muted-foreground uppercase">Minutes</span>
                <Input aria-label="Timer URL" 
                  type="number" 
                  min={0}
                  value={totalMinutes} 
                  onChange={e => setMinutesAndSeconds(parseInt(e.target.value) || 0, totalRemainingSeconds)} 
                  className="h-9 text-xs"
                />
              </div>
              <span className="text-lg font-bold text-muted-foreground pt-4">:</span>
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-sm font-bold text-muted-foreground uppercase">Seconds</span>
                <Input aria-label="Timer URL" 
                  type="number" 
                  min={0}
                  max={59}
                  value={totalRemainingSeconds} 
                  onChange={e => setMinutesAndSeconds(totalMinutes, Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))} 
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Curated Timer Themes */}
      <Card className="border-border bg-card p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Curated Timer Themes
          </span>
          <Badge variant="secondary" className="text-sm font-semibold text-primary bg-primary/10">
            1-Click Apply
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Instant color states for running, paused, and expired milestones:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TIMER_PRESETS.map(preset => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
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
              className="justify-start gap-2 h-auto py-2 px-2.5 text-xs font-medium"
            >
              <div className="flex gap-1 items-center shrink-0">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.runningColor }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.pausedColor }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.expiredColor }} />
              </div>
              <span className="truncate">{preset.name}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* 2. Color Palettes & Ring */}
      <Card className="border-border bg-card p-4 flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Color States & Ring
        </span>
        
        {/* Running Color */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-foreground">Active Countdown Color</span>
            <div className="w-4 h-4 rounded-xs border border-border" style={{ backgroundColor: config.layout.runningColor }} />
          </div>
          <ColorInputWithPalette value={config.layout.runningColor} onChange={e => update({ runningColor: e })} />
        </div>

        {/* Paused Color */}
        <div className="pt-2 border-t border-border flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-foreground">Paused State Color</span>
            <div className="w-4 h-4 rounded-xs border border-border" style={{ backgroundColor: config.layout.pausedColor }} />
          </div>
          <ColorInputWithPalette value={config.layout.pausedColor} onChange={e => update({ pausedColor: e })} />
        </div>

        {/* Expired Color */}
        <div className="pt-2 border-t border-border flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-foreground">Expired (Time Up) Color</span>
            <div className="w-4 h-4 rounded-xs border border-border" style={{ backgroundColor: config.layout.expiredColor }} />
          </div>
          <ColorInputWithPalette value={config.layout.expiredColor} onChange={e => update({ expiredColor: e })} />
        </div>

        {/* Track Ring Color */}
        <div className="pt-2 border-t border-border flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-foreground">Background Track Ring</span>
            <div className="w-4 h-4 rounded-xs border border-border" style={{ backgroundColor: config.layout.trackColor }} />
          </div>
          <ColorInputWithPalette value={config.layout.trackColor} onChange={e => update({ trackColor: e })} />
        </div>

        {/* Canvas Background Color & Opacity */}
        <div className="pt-2 border-t border-border flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-foreground">Canvas Background</span>
            <div className="w-4 h-4 rounded-xs border border-border" style={{ backgroundColor: config.layout.bgColor }} />
          </div>
          <ColorInputWithPalette 
            value={config.layout.bgColor} 
            onChange={e => update({ bgColor: e })} 
            opacity={config.layout.opacity ?? 1}
            onOpacityChange={val => update({ opacity: val })}
          />
        </div>
      </Card>

      {/* 3. Sound Alarm Settings */}
      <Card className="border-border bg-card p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Alarm Sound
          </span>
          <Switch aria-label="Enable Sound" checked={config.sound.enabled} onCheckedChange={c => updateSound({ enabled: c })} />
        </div>
        
        {config.sound.enabled && (
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Chime Style</label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-muted rounded-md">
                {(['BELL', 'DIGITAL', 'GONG', 'CLASSIC'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateSound({ type: t })}
                    className={cn(
                      "py-1 text-sm font-semibold rounded-sm transition-all cursor-pointer capitalize",
                      config.sound.type === t ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">
                  Volume ({Math.round(config.sound.volume * 100)}%)
                </span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    playTimerAlarm(config.sound.type, config.sound.volume);
                    toast('Testing alarm tone...', { icon: '🔔', duration: 1500 });
                  }}
                  className="h-7 text-xs gap-1.5 text-primary hover:text-primary"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Test Tone
                </Button>
              </div>
              <Slider aria-label="Volume" min={0.1} max={1} step={0.05} value={[config.sound.volume]} onValueChange={([v]) => updateSound({ volume: v })} />
            </div>
          </div>
        )}
      </Card>

      {/* 4. Typography */}
      <Card className="border-border bg-card p-4 flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Timer Typography
        </span>
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

    </div>
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
        <div className="flex flex-col gap-2 p-1">
          <p className="m-0 text-sm font-semibold text-foreground">Delete this timer widget?</p>
          <p className="m-0 text-xs text-muted-foreground">This action cannot be undone.</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await supabase.from('widget_configs').delete().eq('id', id);
                setConfigsList(prev => prev.filter(c => c.id !== id));
                if (activeConfigId === id) setActiveConfigId(null);
                toast.success('Timer deleted');
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold cursor-pointer transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-md text-xs font-semibold cursor-pointer transition-colors"
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
    return <div className="p-6 text-sm text-muted-foreground">Loading timer widgets...</div>;
  }

  // --- List / Catalog View ---
  if (!activeConfigId) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col">
        <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Widgets</span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Timer Widgets</h1>
            <p className="text-sm text-muted-foreground mt-1">Sleek countdown timer and stopwatch with SVG progress ring, state colors, and alarms.</p>
          </div>
          {configsList.length < 3 && (
            <Button onClick={createConfig} className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Create Timer</span>
            </Button>
          )}
        </div>

        <div className="flex justify-between items-center mb-6 p-4 bg-card rounded-xl border border-border shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground">Storage Allocation</span>
          <span className={cn("text-xs font-bold", configsList.length >= 3 ? "text-red-500" : "text-primary")}>
            {configsList.length} / 3 Timers Used
          </span>
        </div>

        {configsList.length === 0 ? (
          <Card className="text-center py-16 px-6 border-dashed border-border bg-card rounded-2xl">
            <p className="text-sm font-medium text-foreground mb-4">You don&apos;t have any timers created yet.</p>
            <Button onClick={createConfig}>Create Your First Timer</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configsList.map(c => {
              const countdown = c.config.countdown || {};
              const durationStr = `${countdown.hours ? `${countdown.hours}h ` : ''}${countdown.minutes || 0}m ${countdown.seconds ? `${countdown.seconds}s` : ''}`.trim();

              return (
                <Card 
                  key={c.id} 
                  className="cursor-pointer border-border bg-card rounded-2xl shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col p-5 group"
                  onClick={() => loadEditor(c.id, c.config)}
                >
                  <div aria-hidden="true" className="preview-window-container w-full aspect-video rounded-xl overflow-hidden flex items-center justify-center mb-4 border border-border">
                    <div className="scale-[0.55] origin-center w-80 h-44 flex items-center justify-center">
                      <TimerPreview config={c.config} />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {c.config.name || 'Untitled Timer'}
                    </span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={(e) => deleteConfig(c.id, e)} 
                      title="Delete timer"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground mb-4 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">Default Duration: {durationStr || '5m'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="truncate">{c.config.sound?.enabled ? 'Sound Alarm Active' : 'Silent Alarm'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-border" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <Input aria-label="Timer URL"
                        readOnly
                        value={typeof window !== 'undefined' ? `${window.location.origin}/widgets/embed/timer?id=${c.id}` : ''}
                        onClick={e => (e.target as HTMLInputElement).select()}
                        className="h-8 text-xs font-mono flex-1 bg-muted/40"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={e => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(`${window.location.origin}/widgets/embed/timer?id=${c.id}`);
                          toast.success('URL copied to clipboard!');
                        }}
                        className="h-8 text-xs font-semibold px-3 shrink-0"
                      >
                        Copy
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadEditor(c.id, c.config)}
                      className="w-full text-xs font-semibold h-8 mt-1 group-hover:border-primary/40 transition-colors"
                    >
                      Open in Studio →
                    </Button>
                  </div>
                </Card>
              );
            })}

            {configsList.length < 3 && (
              <Card 
                onClick={createConfig} 
                className="cursor-pointer border-dashed border-2 border-border hover:border-primary/50 bg-transparent flex flex-col items-center justify-center min-h-[300px] p-6 transition-all hover:bg-muted/30 group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  Create New Timer
                </span>
                <span className="text-xs text-muted-foreground mt-1 text-center">
                  Add another timer widget (up to 3)
                </span>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- Unified Split-Screen Editor View ---
  return (
    <div className="flex w-full h-full overflow-hidden bg-background text-foreground">
      
      {/* LEFT: Properties Inspector (420px) */}
      <div className="w-[420px] min-w-[380px] bg-card border-r border-border flex flex-col overflow-y-auto shrink-0 z-10">
        <div className="p-5 border-b border-border flex flex-col gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToList} 
            className="w-fit text-xs text-muted-foreground hover:text-foreground -ml-2 gap-1.5 h-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Timers
          </Button>
          <Input aria-label="Timer URL" 
            placeholder="Timer Name" 
            value={config.name} 
            onChange={e => setConfig({ ...config, name: e.target.value })} 
            className="font-bold text-base h-10"
          />
        </div>

        <GlobalSettings config={config} setConfig={setConfig} />
      </div>

      {/* RIGHT: Live Preview Canvas */}
      <div className="flex-1 bg-muted/30 flex flex-col relative overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="flex justify-between items-center px-6 py-3.5 bg-card border-b border-border z-10 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
              Live Stream Controls
            </span>
            
            <div className="flex gap-2">
              <Button 
                variant={config.state === 'RUNNING' ? 'default' : 'secondary'} 
                size="sm"
                onClick={() => {
                  let endTime = Date.now() + (config.durationSeconds * 1000);
                  if (config.state === 'PAUSED' && config.pausedTimeLeft) {
                    endTime = Date.now() + (config.pausedTimeLeft * 1000);
                  }
                  setConfig(c => ({ ...c, state: 'RUNNING', endTime, pausedTimeLeft: null }));
                  toast.success('Timer running in OBS');
                }}
                className={cn(
                  "gap-1.5 h-8 text-xs font-semibold",
                  config.state === 'RUNNING' && "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                <Play className="w-3.5 h-3.5" /> Start
              </Button>
              <Button 
                variant={config.state === 'PAUSED' ? 'default' : 'secondary'} 
                size="sm"
                disabled={config.state === 'STOPPED' || config.state === 'EXPIRED'}
                onClick={() => {
                  const remaining = config.endTime ? Math.max(0, Math.ceil((config.endTime - Date.now()) / 1000)) : 0;
                  setConfig(c => ({ ...c, state: 'PAUSED', pausedTimeLeft: remaining }));
                  toast('Timer paused');
                }}
                className={cn(
                  "gap-1.5 h-8 text-xs font-semibold",
                  config.state === 'PAUSED' && "bg-amber-600 hover:bg-amber-700 text-white"
                )}
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  setConfig(c => ({ ...c, state: 'STOPPED', endTime: null, pausedTimeLeft: null }));
                  toast('Timer reset');
                }}
                className="gap-1.5 h-8 text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </Button>
            </div>
          </div>

          <span className="text-sm font-bold text-muted-foreground">
            {saving ? 'AUTOSAVING...' : 'LIVE SYNCED'}
          </span>
        </div>

        {/* Centered Canvas Container with Checkerboard Pattern */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center gap-4 overflow-hidden">
          <div 
            aria-hidden="true" className="preview-window-container w-full max-w-2xl aspect-video rounded-xl shadow-lg border border-border flex items-center justify-center p-5"
          >
             <div className="w-full h-full flex items-center justify-center">
               <TimerPreview config={config} />
             </div>
          </div>
          <div className="flex gap-2 w-full max-w-2xl">
            <Input aria-label="Timer URL"
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}/widgets/embed/timer?id=${activeConfigId}` : ''}
              onClick={e => (e.target as HTMLInputElement).select()}
              className="h-9 text-xs font-mono flex-1 bg-background"
            />
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/widgets/embed/timer?id=${activeConfigId}`);
                toast.success('Widget URL copied to clipboard!');
              }}
              className="h-9 px-4 text-xs font-bold gap-1.5 shrink-0"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Widget URL
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function TimerCustomizer() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading timer editor...</div>}>
      <TimerCustomizerContent />
    </Suspense>
  );
}
