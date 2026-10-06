'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { ColorInputWithPalette } from '@/components/ColorInputWithPalette';
import { ObsExportCard } from '@/components/ObsExportCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CLOCK_PRESETS } from '@/lib/presets';
import { ArrowLeft, Plus, Trash2, Clock, Sparkles, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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

import ClockPreview from '@/components/ClockPreview';

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
        <div className="flex flex-col gap-2 p-1">
          <p className="m-0 text-sm font-semibold text-foreground">Delete this clock widget?</p>
          <p className="m-0 text-xs text-muted-foreground">This action cannot be undone.</p>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={async () => {
                toast.dismiss(t.id);
                await supabase.from('widget_configs').delete().eq('id', id);
                setConfigsList(configsList.filter(c => c.id !== id));
                if (activeConfigId === id) setActiveConfigId(null);
                toast.success('Widget deleted');
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

  if (!session) {
    return (
      <div className="p-10">
        <p className="text-sm text-muted-foreground">Please <Link href="/auth" className="text-primary underline">Sign In</Link></p>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full overflow-hidden bg-background text-foreground">
      
      {/* ── CATALOG VIEW ── */}
      {!activeConfigId ? (
        <div className="p-6 max-w-5xl mx-auto w-full">
          <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Widgets</span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Clock Widgets</h1>
              <p className="text-sm text-muted-foreground mt-1">Digital clock overlay with customizable fonts, timezones, and glowing broadcast styles.</p>
            </div>
            {configsList.length < 3 && (
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="w-4 h-4" />
                <span>Create Clock</span>
              </Button>
            )}
          </div>

          <div className="flex justify-between items-center mb-6 p-3.5 bg-card rounded-lg border border-border shadow-xs">
            <span className="text-xs font-semibold text-muted-foreground">Storage Capacity</span>
            <span className={cn("text-xs font-bold", configsList.length >= 3 ? "text-red-500" : "text-primary")}>
              {configsList.length} / 3 Clocks Used
            </span>
          </div>

          {loadingList ? (
            <p className="text-sm text-muted-foreground">Loading your clocks...</p>
          ) : configsList.length === 0 ? (
            <Card className="text-center py-16 px-6 border-dashed border-border bg-card">
              <p className="text-sm font-medium text-foreground mb-4">You don&apos;t have any clock widgets created yet.</p>
              <Button onClick={handleCreateNew}>Create Your First Clock</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {configsList.map(c => (
                <Card 
                  key={c.id} 
                  onClick={() => loadEditor(c.id, c.config)} 
                  className="cursor-pointer border-border bg-card hover:shadow-md transition-all flex flex-col p-5 group"
                >
                  <div aria-hidden="true" className="preview-window-container w-full aspect-video rounded-md overflow-hidden flex items-center justify-center mb-3.5 border border-border">
                    <ClockPreview config={c.config} time={time} scale={0.55} />
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {c.config.name || 'Unnamed Clock'}
                    </span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={(e) => deleteConfig(c.id, e)} 
                      title="Delete clock"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground mb-4 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">{c.config.timeFormat === '24HR' ? '24-Hour (Military)' : '12-Hour (AM/PM)'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                      <span className="truncate">{c.config.timezone || 'Local Computer Time'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-border" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <Input aria-label="Clock URL"
                        readOnly
                        value={typeof window !== 'undefined' ? `${window.location.origin}/widgets/embed/clock?id=${c.id}` : ''}
                        onClick={e => (e.target as HTMLInputElement).select()}
                        className="h-8 text-xs font-mono flex-1 bg-muted/40"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={e => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(`${window.location.origin}/widgets/embed/clock?id=${c.id}`);
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
              ))}

              {configsList.length < 3 && (
                <Card 
                  onClick={handleCreateNew} 
                  className="cursor-pointer border-dashed border-2 border-border hover:border-primary/50 bg-transparent flex flex-col items-center justify-center min-h-[300px] p-6 transition-all hover:bg-muted/30 group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    Create New Clock
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 text-center">
                    Add another digital clock widget (up to 3)
                  </span>
                </Card>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ── SPLIT WORKSPACE EDITOR VIEW ── */
        <div className="flex w-full h-full overflow-hidden">
          
          {/* LEFT: Controls Inspector (420px) */}
          <div className="w-[420px] min-w-[380px] bg-card border-r border-border flex flex-col overflow-y-auto shrink-0 z-10">
            <div className="p-5 border-b border-border flex flex-col gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToList} 
                className="w-fit text-xs text-muted-foreground hover:text-foreground -ml-2 gap-1.5 h-8"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Clocks
              </Button>
              <Input aria-label="Clock URL" 
                placeholder="Clock Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="font-bold text-base h-10"
              />
            </div>

            <div className="p-4 flex flex-col gap-4">
              
              {/* Card 1: Time Settings */}
              <Card className="border-border bg-card p-4 flex flex-col gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Time Settings
                </span>
                
                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground">Format</label>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-md">
                      <button
                        type="button"
                        onClick={() => setTimeFormat('12HR')}
                        className={cn(
                          "py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer",
                          timeFormat === '12HR' ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        12-Hour (AM/PM)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimeFormat('24HR')}
                        className={cn(
                          "py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer",
                          timeFormat === '24HR' ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        24-Hour (Military)
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
                        <SelectItem value="LOCAL">Local Computer Time</SelectItem>
                        <SelectItem value="UTC">UTC (Universal)</SelectItem>
                        <SelectItem value="America/New_York">Eastern (EST/EDT)</SelectItem>
                        <SelectItem value="America/Chicago">Central (CST/CDT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain (MST/MDT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific (PST/PDT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-xs font-medium text-foreground">Show Seconds</span>
                    <Switch aria-label="Show Seconds" checked={showSeconds} onCheckedChange={setShowSeconds} />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-foreground">Show Date</span>
                    <Switch aria-label="Show Date" checked={showDate} onCheckedChange={setShowDate} />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-foreground">Blink Colon (:)</span>
                    <Switch aria-label="Blinking Colon" checked={blinkingColon} onCheckedChange={setBlinkingColon} />
                  </div>
                </div>
              </Card>

              {/* Card 2: Curated Themes */}
              <Card className="border-border bg-card p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Curated Clock Themes
                  </span>
                  <Badge variant="secondary" className="text-sm font-semibold text-primary bg-primary/10">
                    1-Click Apply
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Quick broadcast and stream looks tuned for legibility:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CLOCK_PRESETS.map(preset => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTextColor(preset.textColor);
                        setBgColor(preset.bgColor);
                        setGlow(preset.glow);
                        toast.success(`Applied ${preset.name} theme!`);
                      }}
                      className="justify-start gap-2 h-auto py-2 px-2.5 text-xs font-medium"
                    >
                      <div className="flex gap-1 items-center shrink-0">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.textColor }} />
                        <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: preset.bgColor }} />
                      </div>
                      <span className="truncate">{preset.name}</span>
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Card 3: Typography & Styles */}
              <Card className="border-border bg-card p-4 flex flex-col gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Typography & Styles
                </span>
                
                <div className="flex flex-col gap-3.5">
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
                        className={cn(
                          "py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer",
                          bgMode === 'SOLID' ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Solid Color
                      </button>
                      <button
                        type="button"
                        onClick={() => setBgMode('TRANSPARENT')}
                        className={cn(
                          "py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer",
                          bgMode === 'TRANSPARENT' ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                        )}
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
                            className={cn(
                              "py-1 text-xs font-semibold rounded-sm transition-all cursor-pointer capitalize",
                              glow === g ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                            )}
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
                </div>
              </Card>

              {/* Card 4: OBS Export */}
              <ObsExportCard
                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/widgets/embed/clock?id=${activeConfigId}`}
                dimensions="1920 × 1080"
                allowTransparency={true}
              />

            </div>
          </div>

          {/* RIGHT: Live Canvas Preview Pane */}
          <div className="flex-1 bg-muted/30 flex flex-col relative overflow-hidden">
            {/* Header info */}
            <div className="flex justify-between items-center px-6 py-3.5 bg-card border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Live Preview: {name}
                </span>
              </div>
              <span className="text-sm font-bold text-muted-foreground">
                {saving ? 'AUTOSAVING...' : 'LIVE SYNCED'}
              </span>
            </div>

            {/* Centered Preview Canvas */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 overflow-hidden">
              <div 
                aria-hidden="true" className="preview-window-container w-full max-w-2xl aspect-video rounded-xl flex items-center justify-center shadow-lg border border-border"
              >
                <ClockPreview config={activeConfigObj} time={time} scale={1.3} />
              </div>
              <div className="flex gap-2 w-full max-w-2xl">
                <Input aria-label="Clock URL"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/widgets/embed/clock?id=${activeConfigId}` : ''}
                  onClick={e => (e.target as HTMLInputElement).select()}
                  className="h-9 text-xs font-mono flex-1 bg-background"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/widgets/embed/clock?id=${activeConfigId}`);
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
      )}

    </div>
  );
}

export default function ClockCustomizer() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading clock editor...</div>}>
      <ClockCustomizerContent />
    </Suspense>
  );
}
