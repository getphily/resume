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


import { useRouter } from 'next/navigation';
import { Monitor } from 'lucide-react';
import { StudioShell } from '@/components/StudioShell';

function ScreenStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');

  const [session, setSession] = useState<any>(null);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [config, setConfig] = useState<ScreenConfig>(DEFAULT_SCREEN_CONFIG);
  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [selectedPanel, setSelectedPanel] = useState<'pages' | 'global'>('pages');
  const [previewPageId, setPreviewPageId] = useState<string>('starting-soon');

  const update = (patch: Partial<ScreenConfig>) => setConfig({ ...config, ...patch });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (queryId && session) {
        const { data } = await supabase.from('widget_configs').select('id, config').eq('id', queryId).single();
        if (data) {
          setActiveConfigId(data.id);
          setConfig(data.config as ScreenConfig);
          if (data.config.pages?.length > 0) {
            setPreviewPageId(data.config.pages[0].id);
          }
        } else {
          toast.error('Screen not found.');
          router.push('/dashboard');
        }
      } else {
        setConfig({ ...DEFAULT_SCREEN_CONFIG, name: 'New Screen Set' });
      }
      setIsInitializing(false);
    });
  }, [queryId, router]);

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
      toast.success('Screen saved!');
    } else {
      const { data, error } = await supabase.from('widget_configs').insert({
        user_id: session.user.id,
        widget_type: 'screen',
        config
      }).select('id').single();
      
      if (error) toast.error('Failed to create screen.');
      else if (data) {
        setActiveConfigId(data.id);
        toast.success('New screen created!');
        router.replace(`/screen?id=${data.id}`);
      }
    }
    setSaving(false);
  };

  const handleCopy = () => {
    if (!activeConfigId) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/widgets/embed/screen?id=${activeConfigId}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    toast.success('Widget URL copied to clipboard!');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const activePageObj = config.pages.find(p => p.id === previewPageId) || config.pages[0];
  const updateActivePage = (patch: Partial<ScreenPage>) => {
    update({ pages: config.pages.map(p => p.id === previewPageId ? { ...p, ...patch } : p) });
  };
  
  const updateTimer = (patch: Partial<ScreenPage['timer']>) => {
    const currentTimer = activePageObj.timer || { enabled: false, durationMinutes: 5, endTime: null };
    updateActivePage({ timer: { ...currentTimer, ...patch } as any });
  };

  const settingsPanel = (
    <div className="flex flex-col gap-4 pb-10">
      <div className="flex gap-1 p-1 bg-muted rounded-md shrink-0">
        <button
          type="button"
          onClick={() => setSelectedPanel('pages')}
          className={cn("py-1.5 flex-1 text-xs font-semibold rounded-sm transition-all", selectedPanel === 'pages' ? "bg-background shadow-2xs text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          Pages & Content
        </button>
        <button
          type="button"
          onClick={() => setSelectedPanel('global')}
          className={cn("py-1.5 flex-1 text-xs font-semibold rounded-sm transition-all", selectedPanel === 'global' ? "bg-background shadow-2xs text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          Global Settings
        </button>
      </div>

      {selectedPanel === 'pages' && (
        <>
          {/* Active Page Selector */}
          <Card className="border-border bg-card p-4 flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Screen</span>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {config.pages.map((p) => (
                <Button
                  key={p.id}
                  variant={previewPageId === p.id ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setPreviewPageId(p.id)}
                  className="h-10 text-xs font-semibold px-2"
                >
                  {p.name}
                </Button>
              ))}
            </div>
          </Card>

          {/* Active Page Properties */}
          <Card className="border-border bg-card p-5 flex flex-col gap-5">
            <h3 className="text-xs  uppercase tracking-wider text-muted-foreground m-0">Edit: {activePageObj.name}</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Headline</label>
              <Input value={activePageObj.title} onChange={e => updateActivePage({ title: e.target.value })} className="h-9 text-xs" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Subtext / Message</label>
              <Input value={activePageObj.subtitle} onChange={e => updateActivePage({ subtitle: e.target.value })} className="h-9 text-xs" />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-xs font-semibold text-foreground">Show Countdown Timer</span>
              <Switch checked={activePageObj.timer?.enabled ?? false} onCheckedChange={c => updateTimer({ enabled: c })} />
            </div>

            {activePageObj.timer?.enabled && (
              <div className="flex flex-col gap-1.5 pl-4 border-l-2 border-border">
                <label className="text-xs font-semibold text-foreground">Timer Duration (Minutes)</label>
                <div className="flex gap-2 items-center">
                  <Input type="number" min={1} value={activePageObj.timer.durationMinutes} onChange={e => updateTimer({ durationMinutes: parseInt(e.target.value) || 5 })} className="h-9 text-xs flex-1" />
                  <span className="text-xs font-semibold text-muted-foreground">min</span>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {selectedPanel === 'global' && (
        <>
          <Card className="border-border bg-card p-5 flex flex-col gap-4">
            <h3 className="text-xs  uppercase tracking-wider text-muted-foreground m-0">Presets</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(BROADCAST_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    update({ layout: preset as any });
                    toast.success('Preset applied');
                  }}
                  className="px-3 py-2 text-xs font-semibold rounded-md border border-border bg-muted/50 hover:bg-muted hover:border-primary/50 transition-colors text-left truncate"
                >
                  {key}
                </button>
              ))}
            </div>
          </Card>

          <Card className="border-border bg-card p-5 flex flex-col gap-5">
            <h3 className="text-xs  uppercase tracking-wider text-muted-foreground m-0">Typography & Colors</h3>
            <TextFormattingToolbar
              fontFamily={config.layout.fontFamily}
              textColor={config.layout.textColor}
              bold={true}
              italic={false}
              textTransform="none"
              onChange={patch => update({ layout: { ...config.layout, ...patch } })}
            />
            <div className="pt-2 border-t border-border flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Background Color</label>
              <ColorInputWithPalette value={config.layout.bgColor} onChange={c => update({ layout: { ...config.layout, bgColor: c } })} />
            </div>
            <div className="pt-2 border-t border-border flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Accent Color</label>
              <ColorInputWithPalette value={config.layout.accentColor} onChange={c => update({ layout: { ...config.layout, accentColor: c } })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Background Image (URL)</label>
              <ImageUploadOrUrl label="Background Image" value={config.layout.bgImageUrl || ''} onChange={url => update({ layout: { ...config.layout, bgImageUrl: url } })} />
            </div>
          </Card>
        </>
      )}
    </div>
  );

  const previewCanvas = (
    <div className="w-full h-full flex items-center justify-center p-0">
      <div className="w-full h-full border border-border shadow-2xl relative overflow-hidden flex items-center justify-center">
        <ScreenPreview config={config} activePageId={previewPageId} />
      </div>
    </div>
  );

  if (isInitializing) return <div className="p-10 text-sm text-muted-foreground">Loading Screen Studio...</div>;

  return (
    <StudioShell
      title="Screen Studio"
      icon={<Monitor className="w-4 h-4" />}
      widgetName={config.name || ''}
      onNameChange={(n) => update({ name: n })}
      onSave={handleManualSave}
      isSaving={saving}
      hasId={!!activeConfigId}
      onCopyUrl={handleCopy}
      copySuccess={copySuccess}
      settingsPanel={settingsPanel}
      previewCanvas={previewCanvas}
    />
  );
}

export default function ScreenBuilder() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted-foreground">Loading studio...</div>}>
      <ScreenStudioContent />
    </Suspense>
  );
}
