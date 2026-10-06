'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

import { TimerConfig, DEFAULT_TIMER_CONFIG } from '@/types/timer';
import { TimerPreview } from '@/components/TimerPreview';
import { TextFormattingToolbar } from '@/components/TextFormattingToolbar';
import { ColorInputWithPalette } from '@/components/ColorInputWithPalette';
import { playTimerAlarm } from '@/lib/sound';
import { TIMER_PRESETS } from '@/lib/presets';
import { cn } from '@/lib/utils';
import { StudioShell } from '@/components/StudioShell';

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
    <div className="flex flex-col gap-4 pb-4">
      
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
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────

function TimerStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');

  const [session, setSession] = useState<any>(null);
  
  // Editor State
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Settings
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_TIMER_CONFIG);
  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const loadEditor = useCallback((id: string | null, c: TimerConfig) => {
    setConfig({ ...c, id: id || undefined });
    setActiveConfigId(id);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (queryId && session) {
        const { data } = await supabase.from('widget_configs').select('id, config').eq('id', queryId).single();
        if (data) {
          loadEditor(data.id, data.config as TimerConfig);
        } else {
          toast.error('Timer not found or access denied.');
          router.push('/dashboard');
        }
      } else {
        loadEditor(null, { ...DEFAULT_TIMER_CONFIG, name: 'New Timer Widget' });
      }
      setIsInitializing(false);
    });
  }, [queryId, router, loadEditor]);

  // Auto-save logic
  useEffect(() => {
    if (!activeConfigId || !session || isInitializing) return;
    const saveConfig = async () => {
      setSaving(true);
      await supabase.from('widget_configs').update({ config }).eq('id', activeConfigId);
      setSaving(false);
    };
    const debounceTimer = setTimeout(() => { saveConfig(); }, 1000);
    return () => clearTimeout(debounceTimer);
  }, [config, activeConfigId, session, isInitializing]);

  const handleManualSave = async () => {
    if (!session) {
      toast.error('Please sign in to save widgets.');
      router.push('/auth');
      return;
    }
    
    setSaving(true);
    if (activeConfigId) {
      await supabase.from('widget_configs').update({ config }).eq('id', activeConfigId);
      toast.success('Timer saved!');
    } else {
      const { data, error } = await supabase.from('widget_configs').insert({
        user_id: session.user.id,
        widget_type: 'timer',
        config
      }).select('id').single();
      
      if (error) {
        toast.error('Failed to create timer.');
      } else if (data) {
        setActiveConfigId(data.id);
        toast.success('New timer created!');
        router.replace(`/timer?id=${data.id}`);
      }
    }
    setSaving(false);
  };

  const handleCopyUrl = () => {
    if (!activeConfigId) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/embed/timer?id=${activeConfigId}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    toast.success('OBS Browser Source URL copied!');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleNameChange = (name: string) => {
    setConfig({ ...config, name });
  };

  const settingsPanel = (
    <>
      <Card className="border-border bg-card p-4 flex flex-col gap-3 shadow-md bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
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
              "flex-1 gap-1.5 h-9 text-xs font-semibold",
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
              "flex-1 gap-1.5 h-9 text-xs font-semibold",
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
            className="flex-1 gap-1.5 h-9 text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
      </Card>

      <GlobalSettings config={config} setConfig={setConfig} />
    </>
  );

  const previewCanvas = (
    <div className="w-full h-full flex items-center justify-center">
      <TimerPreview config={config} />
    </div>
  );

  if (isInitializing) {
    return <div className="p-10 text-sm text-muted-foreground">Loading Timer Studio...</div>;
  }

  return (
    <StudioShell
      title="Timer Studio"
      icon={<Clock className="w-4 h-4" />}
      widgetName={config.name || ''}
      onNameChange={handleNameChange}
      onSave={handleManualSave}
      isSaving={saving}
      hasId={!!activeConfigId}
      onCopyUrl={handleCopyUrl}
      copySuccess={copySuccess}
      settingsPanel={settingsPanel}
      previewCanvas={previewCanvas}
    />
  );
}

export default function TimerCustomizer() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted-foreground">Loading studio...</div>}>
      <TimerStudioContent />
    </Suspense>
  );
}
