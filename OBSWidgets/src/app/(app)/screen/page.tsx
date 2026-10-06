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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Trash2, ArrowLeft, Plus, Play, RotateCcw, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

function ScreenCardPreview({ config, activePageId }: { config: ScreenConfig; activePageId?: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) setScale(w / 1920);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      aria-hidden="true" className="preview-window-container w-full aspect-video rounded-md overflow-hidden relative border border-border"
    >
      <div 
        style={{ 
          width: 1920, 
          height: 1080, 
          transform: `scale(${scale})`, 
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        <ScreenPreview config={config} activePageId={activePageId} />
      </div>
    </div>
  );
}

function ScreenEditorPreview({ config, activePageId }: { config: ScreenConfig; activePageId?: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) setScale(w / 1920);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      aria-hidden="true" className="preview-window-container w-full max-w-4xl aspect-video rounded-xl shadow-lg border border-border overflow-hidden relative"
    >
      <div 
        style={{ 
          width: 1920, 
          height: 1080, 
          transform: `scale(${scale})`, 
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        <ScreenPreview config={config} activePageId={activePageId} />
      </div>
    </div>
  );
}

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
        <div className="flex flex-col gap-2 p-1">
          <p className="m-0 text-sm font-semibold text-foreground">Delete this screenset?</p>
          <p className="m-0 text-xs text-muted-foreground">This action cannot be undone.</p>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={async () => {
                toast.dismiss(t.id);
                await supabase.from('widget_configs').delete().eq('id', id);
                setConfigsList(configsList.filter(c => c.id !== id));
                if (activeConfigId === id) setActiveConfigId(null);
                toast.success('Screenset deleted');
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

  if (!session) {
    return (
      <div className="p-10">
        <p className="text-sm text-muted-foreground">Please <Link href="/auth" className="text-primary underline">Sign In</Link></p>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full overflow-hidden bg-background text-foreground">
      
      {/* ── 1. CATALOG VIEW ── */}
      {!activeConfigId ? (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col">
          <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Broadcast Overlays</span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Screen Sets</h1>
              <p className="text-sm text-muted-foreground mt-1">Full-screen 1920×1080 overlay presets for Starting Soon, Be Right Back, and Goodbye pages.</p>
            </div>
            {configsList.length < 5 && (
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="w-4 h-4" /> Create Screenset
              </Button>
            )}
          </div>

          <div className="flex justify-between items-center mb-6 p-4 bg-card rounded-xl border border-border shadow-xs">
            <span className="text-xs font-semibold text-muted-foreground">Storage Allocation</span>
            <span className={cn("text-xs font-bold", configsList.length >= 5 ? "text-red-500" : "text-primary")}>
              {configsList.length} / 5 Screensets Used
            </span>
          </div>

          {loadingList ? (
            <p className="text-sm text-muted-foreground">Loading your screensets...</p>
          ) : configsList.length === 0 ? (
            <Card className="text-center py-16 px-6 border-dashed border-border bg-card rounded-2xl">
              <p className="text-sm font-medium text-foreground mb-4">You don&apos;t have any screensets created yet.</p>
              <Button onClick={handleCreateNew}>Create Your First Screenset</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {configsList.map(c => {
                const firstPageId = c.config.pages?.[0]?.id || 'starting-soon';
                const embedUrl = typeof window !== 'undefined' ? `${window.location.origin}/widgets/embed/screen?id=${c.id}&page=${firstPageId}` : '';

                return (
                  <Card 
                    key={c.id} 
                    onClick={() => loadEditor(c.id, c.config)} 
                    className="cursor-pointer border-border bg-card rounded-2xl shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col p-5 group"
                  >
                    <ScreenCardPreview config={c.config} activePageId={firstPageId} />

                    <div className="flex justify-between items-center mt-3 mb-2">
                      <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {c.config.name || 'Unnamed Screenset'}
                      </span>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={(e) => deleteConfig(c.id, e)} 
                        title="Delete screenset"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground mb-4 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate">{c.config.pages?.length || 0} Pages (Active: {c.config.pages?.[0]?.name || 'Page 1'})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                        <span className="truncate">{c.config.layout?.bgImageUrl ? 'Custom Background Image' : 'Solid Color Fill'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-border" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={embedUrl}
                          onClick={e => (e.target as HTMLInputElement).select()}
                          className="h-8 text-xs font-mono flex-1 bg-muted/40"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={e => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(embedUrl);
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

              {configsList.length < 5 && (
                <Card 
                  onClick={handleCreateNew} 
                  className="cursor-pointer border-dashed border-2 border-border hover:border-primary/50 bg-transparent flex flex-col items-center justify-center min-h-[300px] p-6 transition-all hover:bg-muted/30 group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    Create New Screenset
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 text-center">
                    Add another screen set overlay (up to 5)
                  </span>
                </Card>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ── 2. SPLIT WORKSPACE EDITOR VIEW ── */
        <div className="flex w-full h-full overflow-hidden">
          
          {/* LEFT: Tabbed Settings Inspector (460px) */}
          <div className="w-[460px] min-w-[400px] bg-card border-r border-border flex flex-col overflow-y-auto shrink-0 z-10">
            <div className="p-5 border-b border-border flex flex-col gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToList} 
                className="w-fit text-xs text-muted-foreground hover:text-foreground -ml-2 gap-1.5 h-8"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Screensets
              </Button>
              <Input 
                placeholder="Screenset Name" 
                value={config.name} 
                onChange={e => setConfig({ ...config, name: e.target.value })} 
                className="font-bold text-base h-10"
              />
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-4 pt-2 border-b border-border">
                <TabsList className="grid grid-cols-4 w-full h-9">
                  <TabsTrigger value="pages" className="text-xs">Pages</TabsTrigger>
                  <TabsTrigger value="global" className="text-xs">Styles</TabsTrigger>
                  <TabsTrigger value="logo" className="text-xs">Logo</TabsTrigger>
                  <TabsTrigger value="export" className="text-xs">Export</TabsTrigger>
                </TabsList>
              </div>

              {/* TAB 1: Pages & Content */}
              <TabsContent value="pages" className="p-4 flex flex-col gap-4 m-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Pages in Screenset
                  </span>
                  <Button size="sm" onClick={addPage} className="h-8 gap-1.5 text-xs font-semibold">
                    <Plus className="w-3.5 h-3.5" /> Add Page
                  </Button>
                </div>

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
                      className={cn(
                        "p-4 flex flex-col gap-3 transition-all",
                        isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card"
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-foreground">{page.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant={isSelected ? "default" : "secondary"} 
                            onClick={() => setPreviewPageId(page.id)}
                            className="h-7 text-xs font-medium"
                          >
                            {isSelected ? "Previewing" : "Preview"}
                          </Button>
                          {config.pages.length > 1 && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => deletePage(page.id)}
                              className="h-7 w-7 text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-muted-foreground uppercase">Page Name (Internal)</label>
                        <Input aria-label="Page Name" value={page.name} onChange={e => updatePage(page.id, { name: e.target.value })}  />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-muted-foreground uppercase">Main Title</label>
                        <Input aria-label="Main Title" value={page.title} onChange={e => updatePage(page.id, { title: e.target.value })}  />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-muted-foreground uppercase">Subtitle (Optional)</label>
                        <Input aria-label="Subtitle" value={page.subtitle} onChange={e => updatePage(page.id, { subtitle: e.target.value })} placeholder="e.g. Stream will begin shortly..."  />
                      </div>

                      {/* Page Timer Setting */}
                      <div className="p-3 bg-muted/40 rounded-md border border-border flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-foreground">Include Countdown Timer</span>
                          <Switch aria-label="Include Timer" 
                            checked={currentTimer.enabled} 
                            onCheckedChange={checked => updatePage(page.id, { timer: { ...currentTimer, enabled: checked } })} 
                          />
                        </div>

                        {currentTimer.enabled && (
                          <div className="flex flex-col gap-2 pt-2 border-t border-border">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground min-w-[60px]">Duration:</span>
                              <Input 
                                type="number" 
                                min={1}
                                value={currentTimer.durationMinutes} 
                                onChange={e => updatePage(page.id, { timer: { ...currentTimer, durationMinutes: Math.max(1, parseInt(e.target.value) || 1) } })}
                                className="w-20 h-7 text-xs"
                              />
                              <span className="text-xs text-muted-foreground">minutes</span>
                            </div>

                            <div className="flex gap-2 mt-1">
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  updatePage(page.id, { timer: { ...currentTimer, endTime: Date.now() + (currentTimer.durationMinutes * 60000) } });
                                  toast.success('Timer started for page');
                                }}
                                className="h-7 text-xs gap-1 font-semibold"
                              >
                                <Play className="w-3 h-3" /> Start Timer
                              </Button>
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                onClick={() => {
                                  updatePage(page.id, { timer: { ...currentTimer, endTime: null } });
                                  toast('Timer reset');
                                }}
                                className="h-7 text-xs gap-1 font-semibold"
                              >
                                <RotateCcw className="w-3 h-3" /> Reset
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </TabsContent>

              {/* TAB 2: Global Styles */}
              <TabsContent value="global" className="p-4 flex flex-col gap-4 m-0">
                {/* Curated Broadcast Themes */}
                <Card className="border-border bg-card p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Curated Broadcast Themes
                    </span>
                    <Badge variant="secondary" className="text-sm font-semibold text-primary bg-primary/10">
                      1-Click Apply
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Apply harmonious broadcast palettes designed for professional stream aesthetics:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {BROADCAST_PRESETS.map(preset => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
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
                        className="justify-start gap-2 h-auto py-2 px-2.5 text-xs font-medium"
                      >
                        <div className="flex gap-1 items-center shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.accentColor }} />
                          <div className="w-2.5 h-2.5 rounded-full border border-border" style={{ backgroundColor: preset.bgColor }} />
                        </div>
                        <span className="truncate">{preset.name}</span>
                      </Button>
                    ))}
                  </div>
                </Card>

                {/* Background Properties */}
                <Card className="border-border bg-card p-4 flex flex-col gap-3.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Background
                  </span>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground">Background Color &amp; Opacity</label>
                    <ColorInputWithPalette 
                      value={config.layout.bgColor} 
                      onChange={val => updateLayout({ bgColor: val })} 
                      opacity={config.layout.bgOpacity ?? 1}
                      onOpacityChange={val => updateLayout({ bgOpacity: val })}
                    />
                  </div>

                  <div className="pt-2 border-t border-border">
                    <ImageUploadOrUrl 
                      label="Background Image Overlay"
                      value={config.layout.bgImageUrl || ''} 
                      onChange={val => updateLayout({ bgImageUrl: val })} 
                    />
                  </div>
                </Card>

                {/* Effects */}
                <Card className="border-border bg-card p-4 flex flex-col gap-3.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Special Effects
                  </span>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-foreground">Text Drop Shadow</span>
                    <Switch aria-label="Include Timer" checked={config.layout.dropShadow} onCheckedChange={checked => updateLayout({ dropShadow: checked })} />
                  </div>

                  <div className="pt-2 border-t border-border flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground">Glow Intensity</label>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-md">
                      {(['OFF', 'SUBTLE', 'NEON'] as const).map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => updateLayout({ glow: g })}
                          className={cn(
                            "py-1 text-xs font-semibold rounded-sm transition-all cursor-pointer capitalize",
                            (config.layout.glow || 'OFF') === g ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {g.toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Title Typography */}
                <Card className="border-border bg-card p-4 flex flex-col gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Title Typography
                  </span>
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
                <Card className="border-border bg-card p-4 flex flex-col gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Subtitle Typography
                  </span>
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
                <Card className="border-border bg-card p-4 flex flex-col gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Countdown Typography
                  </span>
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
              </TabsContent>

              {/* TAB 3: Logo & Brand */}
              <TabsContent value="logo" className="p-4 flex flex-col gap-4 m-0">
                <Card className="border-border bg-card p-4 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Logo Display
                    </span>
                    <Switch aria-label="Include Timer" 
                      checked={config.logo.enabled} 
                      onCheckedChange={checked => setConfig({ ...config, logo: { ...config.logo, enabled: checked } })} 
                    />
                  </div>

                  {config.logo.enabled && (
                    <div className="flex flex-col gap-4">
                      <ImageUploadOrUrl 
                        label="Logo Image"
                        value={config.logo.imageUrl || ''} 
                        onChange={val => setConfig({ ...config, logo: { ...config.logo, imageUrl: val } })} 
                      />

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-foreground">Corner Placement</label>
                        <Select 
                          value={config.logo.position} 
                          onValueChange={val => setConfig({ ...config, logo: { ...config.logo, position: val as any } })}
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TOP_LEFT">Top Left</SelectItem>
                            <SelectItem value="TOP_RIGHT">Top Right</SelectItem>
                            <SelectItem value="CENTER">Center (Above Title)</SelectItem>
                            <SelectItem value="BOTTOM_LEFT">Bottom Left</SelectItem>
                            <SelectItem value="BOTTOM_RIGHT">Bottom Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-foreground">Logo Scale</label>
                        <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-md">
                          {(['SMALL', 'MEDIUM', 'LARGE'] as const).map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setConfig({ ...config, logo: { ...config.logo, size: s } })}
                              className={cn(
                                "py-1 text-xs font-semibold rounded-sm transition-all cursor-pointer capitalize",
                                config.logo.size === s ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {s.toLowerCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* TAB 4: OBS Export */}
              <TabsContent value="export" className="p-4 flex flex-col gap-4 m-0">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    OBS Browser Source URLs
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Each page in this screenset has its own dedicated 1920×1080 embed URL. Copy each URL and paste into an OBS Browser Source for each stream scene.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {config.pages.map(page => (
                    <ObsExportCard
                      key={page.id}
                      title={`${page.name.toUpperCase()} OVERLAY`}
                      url={`${typeof window !== 'undefined' ? window.location.origin : ''}/widgets/embed/screen?id=${activeConfigId}&page=${page.id}`}
                      dimensions="1920 × 1080"
                      allowTransparency={true}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>

          </div>

          {/* RIGHT: Live Preview Canvas */}
          <div className="flex-1 bg-muted/30 flex flex-col relative overflow-hidden">
            
            {/* Top Preview Header & Page Switcher */}
            <div className="flex justify-between items-center px-6 py-3.5 bg-card border-b border-border z-10 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-muted-foreground uppercase mr-1">Page:</span>
                {config.pages.map(page => (
                  <Button 
                    key={page.id}
                    size="sm"
                    variant={previewPageId === page.id ? "default" : "secondary"}
                    onClick={() => setPreviewPageId(page.id)}
                    className="h-7 text-xs font-medium"
                  >
                    {page.name}
                  </Button>
                ))}
              </div>

              <span className="text-sm font-bold text-muted-foreground">
                {saving ? 'AUTOSAVING...' : 'LIVE SYNCED'}
              </span>
            </div>

            {/* Centered Preview Canvas Container */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center gap-4 overflow-hidden">
              <ScreenEditorPreview config={config} activePageId={previewPageId} />
              
              <div className="flex gap-2 w-full max-w-4xl">
                <Input
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/widgets/embed/screen?id=${activeConfigId}&page=${previewPageId}` : ''}
                  onClick={e => (e.target as HTMLInputElement).select()}
                  className="h-9 text-xs font-mono flex-1 bg-background"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const url = `${window.location.origin}/widgets/embed/screen?id=${activeConfigId}&page=${previewPageId}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Current page URL copied to clipboard!');
                  }}
                  className="h-9 px-4 text-xs font-bold gap-1.5 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Page URL
                </Button>
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
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading screenset editor...</div>}>
      <ScreenCustomizerContent />
    </Suspense>
  );
}
