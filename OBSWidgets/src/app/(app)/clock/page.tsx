'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { ColorInputWithPalette } from '@/components/ColorInputWithPalette';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CLOCK_PRESETS } from '@/lib/presets';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import ClockPreview from '@/components/ClockPreview';
import { StudioShell } from '@/components/StudioShell';

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

function ClockStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');

  const [session, setSession] = useState<any>(null);
  
  // Editor State
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
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

  const activeConfigObj = { name, timeFormat, timezone, showSeconds, showDate, fontFamily, sizeScale, textColor, opacity, outline, dropShadow, glow, blinkingColon, bgMode, bgColor };

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadEditor = useCallback((id: string | null, c: any) => {
    setActiveConfigId(id);
    setName(c.name || 'My Clock'); 
    setTimeFormat(c.timeFormat || '12HR'); 
    setTimezone(c.timezone || 'LOCAL'); 
    setShowSeconds(c.showSeconds ?? true); 
    setShowDate(c.showDate ?? false);
    setFontFamily(c.fontFamily || 'Roboto Mono'); 
    setSizeScale(c.sizeScale ?? 1.0); 
    setTextColor(c.textColor || '#FF5900'); 
    setOpacity(c.opacity ?? 100); 
    setOutline(c.outline ?? false); 
    setDropShadow(c.dropShadow ?? false); 
    setGlow(c.glow || 'OFF'); 
    setBlinkingColon(c.blinkingColon ?? false);
    setBgMode(c.bgMode || 'SOLID'); 
    setBgColor(c.bgColor || '#0a0a0a');
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (queryId && session) {
        // Load existing
        const { data } = await supabase.from('widget_configs').select('id, config').eq('id', queryId).single();
        if (data) {
          loadEditor(data.id, data.config);
        } else {
          toast.error('Clock not found or access denied.');
          router.push('/dashboard');
        }
      } else {
        // Blank slate (unsaved)
        loadEditor(null, { name: 'New Clock Widget' });
      }
      setIsInitializing(false);
    });
  }, [queryId, router, loadEditor]);

  // Auto-save logic (only if activeConfigId exists)
  useEffect(() => {
    if (!activeConfigId || !session || isInitializing) return;
    const saveConfig = async () => {
      setSaving(true);
      await supabase.from('widget_configs').update({ config: activeConfigObj }).eq('id', activeConfigId);
      setSaving(false);
    };
    const debounceTimer = setTimeout(() => { saveConfig(); }, 1000);
    return () => clearTimeout(debounceTimer);
  }, [name, timeFormat, timezone, showSeconds, showDate, fontFamily, sizeScale, textColor, opacity, outline, dropShadow, glow, blinkingColon, bgMode, bgColor, activeConfigId, session, isInitializing]);

  const handleManualSave = async () => {
    if (!session) {
      toast.error('Please sign in to save widgets.');
      router.push('/auth');
      return;
    }
    
    setSaving(true);
    if (activeConfigId) {
      await supabase.from('widget_configs').update({ config: activeConfigObj }).eq('id', activeConfigId);
      toast.success('Clock saved!');
    } else {
      // Create new
      const { data, error } = await supabase.from('widget_configs').insert({
        user_id: session.user.id,
        widget_type: 'clock',
        config: activeConfigObj
      }).select('id').single();
      
      if (error) {
        toast.error('Failed to create clock.');
      } else if (data) {
        setActiveConfigId(data.id);
        toast.success('New clock created!');
        router.replace(`/clock?id=${data.id}`);
      }
    }
    setSaving(false);
  };

  const handleCopyUrl = () => {
    if (!activeConfigId) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/embed/clock?id=${activeConfigId}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    toast.success('OBS Browser Source URL copied!');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const applyPreset = (preset: any) => {
    setTimeFormat(preset.timeFormat);
    setFontFamily(preset.fontFamily);
    setTextColor(preset.textColor);
    setGlow(preset.glow);
    setDropShadow(preset.dropShadow);
    setOutline(preset.outline);
    setBlinkingColon(preset.blinkingColon);
    setOpacity(100);
    if (preset.bgMode) setBgMode(preset.bgMode);
    if (preset.bgColor) setBgColor(preset.bgColor);
    toast.success('Preset applied');
  };

  const settingsPanel = (
    <>
      {/* Configuration Cards */}
      <Card className="border-border bg-card p-5 flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(CLOCK_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-3 py-2 text-xs font-semibold rounded-md border border-border bg-muted/50 hover:bg-muted hover:border-primary/50 transition-colors text-left truncate"
            >
              {key}
            </button>
          ))}
        </div>
      </Card>

      <Card className="border-border bg-card p-5 flex flex-col gap-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">Time Settings</h3>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Time Format</label>
          <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-md">
            <button
              type="button"
              onClick={() => setTimeFormat('12HR')}
              className={cn("py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer", timeFormat === '12HR' ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground")}
            >
              12-Hour
            </button>
            <button
              type="button"
              onClick={() => setTimeFormat('24HR')}
              className={cn("py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer", timeFormat === '24HR' ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground")}
            >
              24-Hour
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Timezone</label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOCAL">Local System Time</SelectItem>
              <SelectItem value="UTC">UTC (GMT)</SelectItem>
              <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
              <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
              <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
              <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
              <SelectItem value="Europe/Paris">Central Europe (CET)</SelectItem>
              <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
              <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-foreground">Show Seconds</span>
          <Switch aria-label="Show Seconds" checked={showSeconds} onCheckedChange={setShowSeconds} />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-foreground">Show Date</span>
          <Switch aria-label="Show Date" checked={showDate} onCheckedChange={setShowDate} />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-foreground">Blinking Colon</span>
          <Switch aria-label="Blinking Colon" checked={blinkingColon} onCheckedChange={setBlinkingColon} />
        </div>
      </Card>

      <Card className="border-border bg-card p-5 flex flex-col gap-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">Styling</h3>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Font Family</label>
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GOOGLE_FONTS.map(f => (
                <SelectItem key={f} value={f} style={{ fontFamily: getFontFamily(f) }} className="text-xs">
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground">Size Scale</span>
            <span className="text-xs font-mono text-muted-foreground">{sizeScale}x</span>
          </div>
          <Slider aria-label="Size Scale" min={0.5} max={2.0} step={0.1} value={[sizeScale]} onValueChange={([val]) => setSizeScale(val)} />
        </div>

        <div className="pt-2 border-t border-border flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Digit Color</label>
          <ColorInputWithPalette 
            value={textColor} 
            onChange={setTextColor} 
            opacity={opacity / 100}
            onOpacityChange={val => setOpacity(Math.round(val * 100))}
          />
        </div>

        <div className="pt-2 border-t border-border flex flex-col gap-2">
          <label className="text-xs font-semibold text-foreground">Background</label>
          <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-md mb-2">
            <button
              type="button"
              onClick={() => setBgMode('SOLID')}
              className={cn("py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer", bgMode === 'SOLID' ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground")}
            >
              Solid Color
            </button>
            <button
              type="button"
              onClick={() => setBgMode('TRANSPARENT')}
              className={cn("py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer", bgMode === 'TRANSPARENT' ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground")}
            >
              Transparent (OBS)
            </button>
          </div>
          {bgMode === 'SOLID' && (
            <ColorInputWithPalette value={bgColor} onChange={setBgColor} />
          )}
        </div>

        <div className="pt-2 border-t border-border flex flex-col gap-3">
          <span className="text-xs font-semibold text-foreground">Special Effects</span>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">Glow Aura</span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-md">
              {(['OFF', 'SUBTLE', 'NEON'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGlow(g)}
                  className={cn("py-1 text-xs font-semibold rounded-sm transition-all cursor-pointer capitalize", glow === g ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground")}
                >
                  {g.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-foreground">Text Drop Shadow</span>
            <Switch aria-label="Drop Shadow" checked={dropShadow} onCheckedChange={setDropShadow} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-foreground">Black Outline</span>
            <Switch aria-label="Outline" checked={outline} onCheckedChange={setOutline} />
          </div>
        </div>
      </Card>
    </>
  );

  const previewCanvas = (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-4 overflow-hidden">
      <div 
        aria-hidden="true" 
        className="preview-window-container w-full max-w-4xl aspect-video rounded-xl flex items-center justify-center shadow-lg border border-border bg-black overflow-hidden"
      >
        <ClockPreview config={activeConfigObj} time={time} scale={1.5} />
      </div>
    </div>
  );

  if (isInitializing) {
    return <div className="p-10 text-sm text-muted-foreground">Loading Clock Studio...</div>;
  }

  return (
    <StudioShell
      title="Clock Studio"
      icon={<Clock className="w-4 h-4" />}
      widgetName={name}
      onNameChange={setName}
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

export default function ClockCustomizer() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted-foreground">Loading studio...</div>}>
      <ClockStudioContent />
    </Suspense>
  );
}
