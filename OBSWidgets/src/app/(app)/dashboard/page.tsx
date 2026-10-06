'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TOOLSETS, getToolset } from '@/lib/toolsets';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  GripVertical, 
  Trash2, 
  Pencil, 
  Clock, 
  Timer, 
  Tv, 
  Monitor, 
  Plus, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ClockPreview } from '@/components/ClockPreview';
import { TimerPreview } from '@/components/TimerPreview';
import ChyronPreview from '@/components/ChyronPreview';
import { ScreenPreview } from '@/components/ScreenPreview';
import { ObsExportCard } from '@/components/ObsExportCard';

function WidgetMiniThumbnail({ item, time }: { item: any; time: Date | null }) {
  const type = item.widget_type;

  return (
    <div 
      aria-hidden="true" 
      className="preview-window-container w-24 h-14 shrink-0 rounded-md overflow-hidden flex items-center justify-center border border-border bg-[#0a0a0c]"
    >
      {type === 'clock' && (
        <div className="scale-[0.24] origin-center">
          <ClockPreview config={item.config} time={time} scale={1} />
        </div>
      )}
      {type === 'timer' && (
        <div className="scale-[0.25] origin-center w-48 h-48 flex items-center justify-center">
          <TimerPreview config={item.config} scale={0.5} />
        </div>
      )}
      {(type === 'crawl' || type === 'chyron') && (
        <div className="w-full h-full flex items-end">
          <ChyronPreview config={item.config} scale={0.06} />
        </div>
      )}
      {type === 'screen' && (
        <div className="scale-[0.05] origin-center w-[1920px] h-[1080px]">
          <ScreenPreview config={item.config} />
        </div>
      )}
    </div>
  );
}

function SortableWidgetCard({ item, copyUrl, copySuccess, isSelected, onToggleSelect, onDelete, time }: any) {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: transform ? 1 : 0,
    position: 'relative' as const,
  };

  const getPrimaryEmbedUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const prefix = typeof window !== 'undefined' && window.location.pathname.startsWith('/widgets') 
      ? `${origin}/widgets/embed` 
      : `${origin}/embed`;
    if (item.widget_type === 'screen') {
      const firstPageId = item.config.pages?.[0]?.id || 'starting-soon';
      return `${prefix}/screen?id=${item.id}&page=${firstPageId}`;
    }
    const embedType = (item.widget_type === 'chyron' || item.widget_type === 'crawl') ? 'crawl' : item.widget_type;
    return `${prefix}/${embedType}?id=${item.id}`;
  };

  const primaryUrl = getPrimaryEmbedUrl();
  const isCopied = copySuccess === item.id;

  const badgeVariant = 
    item.widget_type === 'screen' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' : 
    item.widget_type === 'timer' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : 
    (item.widget_type === 'crawl' || item.widget_type === 'chyron') ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' : 
    'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="border-border bg-card shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-4"
    >
      <div className="flex justify-between items-center gap-3 flex-wrap">
        
        {/* Left: Drag + Select + Thumbnail + Title */}
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1" title="Drag to reorder">
            <GripVertical className="w-4 h-4" />
          </div>
          
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={() => onToggleSelect(item.id)} 
            aria-label={`Select ${item.config.name || 'widget'}`}
          />
          
          <WidgetMiniThumbnail item={item} time={time} />

          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-sm uppercase font-bold tracking-wider px-2 py-0 h-4 border ${badgeVariant}`}>
                {(item.widget_type === 'crawl' || item.widget_type === 'chyron') ? 'CHYRON' : item.widget_type.toUpperCase()}
              </Badge>
              {item.widget_type === 'screen' && (
                <span className="text-xs text-muted-foreground">
                  {item.config.pages?.length || 1} Pages
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm truncate text-foreground">
              {item.config.name || 'Unnamed Widget'}
            </h3>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant={isCopied ? "default" : "secondary"}
                onClick={() => copyUrl(item.id, primaryUrl)}
                className={`h-8 gap-1.5 text-xs font-medium ${isCopied ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy OBS Browser Source URL</p>
            </TooltipContent>
          </Tooltip>

          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium">
            <Link href={`/${(item.widget_type === 'chyron' || item.widget_type === 'crawl') ? 'crawl' : item.widget_type}?id=${item.id}`}>
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => onDelete(item.id)}
                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                aria-label="Delete widget"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete widget</p>
            </TooltipContent>
          </Tooltip>

          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Toggle details"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded Accordion: Full OBS Embed Details */}
      {expanded && (
        <div className="mt-1 pt-3 border-t border-border">
          {item.widget_type === 'screen' ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground mb-1">
                This screenset contains multiple overlays. Copy the exact page URL you need for your stream scene:
              </p>
              {item.config.pages?.map((page: any) => (
                <ObsExportCard
                  key={page.id}
                  title={`${page.name.toUpperCase()} PAGE EMBED`}
                  url={`${typeof window !== 'undefined' ? window.location.origin : ''}/widgets/embed/screen?id=${item.id}&page=${page.id}`}
                  dimensions="1920 × 1080"
                  allowTransparency={true}
                />
              ))}
            </div>
          ) : (
            <ObsExportCard
              title={`${(item.widget_type === 'crawl' || item.widget_type === 'chyron') ? 'CHYRON' : item.widget_type.toUpperCase()} EMBED URL`}
              url={primaryUrl}
              dimensions={(item.widget_type === 'crawl' || item.widget_type === 'chyron') ? '1920 × 200' : '1920 × 1080'}
              allowTransparency={true}
            />
          )}
        </div>
      )}
    </Card>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const setId = searchParams.get('set');
  const toolId = searchParams.get('tool');
  const toolset = getToolset(setId);
  const activeTool = toolset?.tools.find((t) => t.id === toolId);
  const [session, setSession] = useState<any>(null);
  const [configsList, setConfigsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [time, setTime] = useState<Date | null>(null);
  const router = useRouter();

  const visibleTypes = toolset
    ? (activeTool ? activeTool.widgetTypes : toolset.tools.flatMap((t) => t.widgetTypes ?? [])) ?? []
    : null;
  const visibleList = visibleTypes ? configsList.filter((c) => visibleTypes.includes(c.widget_type)) : configsList;
  const showSaved = !toolset || toolset.id === 'broadcast';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        fetchConfigs(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchConfigs(session.user.id);
      } else {
        setConfigsList([]);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchConfigs = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('widget_configs')
      .select('id, config, widget_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    const sorted = (data || []).sort((a, b) => {
      const orderA = a.config.sortOrder ?? 999;
      const orderB = b.config.sortOrder ?? 999;
      return orderA - orderB;
    });

    setConfigsList(sorted);
    setLoading(false);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = configsList.findIndex(i => i.id === active.id);
      const newIndex = configsList.findIndex(i => i.id === over.id);
      const newList = arrayMove(configsList, oldIndex, newIndex);
      setConfigsList(newList);

      for (let i = 0; i < newList.length; i++) {
        const item = newList[i];
        if (item.config.sortOrder !== i) {
          item.config.sortOrder = i;
          await supabase.from('widget_configs').update({ config: item.config }).eq('id', item.id);
        }
      }
      toast.success('Widget order saved');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const deleteSingle = (id: string) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-1">
          <p className="m-0 text-sm font-semibold text-foreground">Delete this widget?</p>
          <p className="m-0 text-xs text-muted-foreground">This action cannot be undone.</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await supabase.from('widget_configs').delete().eq('id', id);
                setConfigsList(configsList.filter(c => c.id !== id));
                setSelectedIds(selectedIds.filter(i => i !== id));
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

  const deleteSelected = async () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-1">
          <p className="m-0 text-sm font-semibold text-foreground">
            Delete {selectedIds.length} widget{selectedIds.length > 1 ? 's' : ''}?
          </p>
          <p className="m-0 text-xs text-muted-foreground">
            This action cannot be undone.
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                for (const id of selectedIds) {
                  await supabase.from('widget_configs').delete().eq('id', id);
                }
                setConfigsList(configsList.filter(c => !selectedIds.includes(c.id)));
                setSelectedIds([]);
                toast.success('Deleted successfully');
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

  const copyUrl = (key: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopySuccess(key);
    toast.success('OBS Browser Source URL copied to clipboard!', { position: 'top-center', duration: 2000 });
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <div className="flex flex-col min-h-full w-full p-6 max-w-7xl mx-auto">
      {/* Dashboard Top Header */}
      <div className="flex justify-between items-start md:items-end mb-8 flex-wrap gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              {toolset ? 'Toolset Dashboard' : 'Creator Studio'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {activeTool ? activeTool.name : toolset ? toolset.name : 'User Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeTool
              ? `${activeTool.desc}. Manage your saved ${activeTool.name.toLowerCase()} configurations and copy browser source URLs.`
              : toolset
                ? toolset.tagline
                : 'Pick a toolset to open its dashboard, or review everything you have saved across the platform.'}
          </p>
        </div>

        {toolset && (activeTool || toolset.tools.length === 1) && (
          <Button asChild size="sm" className="font-semibold gap-1.5 shadow-xs">
            <Link href={(activeTool ?? toolset.tools[0]).path}>
              Open {(activeTool ?? toolset.tools[0]).name}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        )}

        {!session && !loading && (
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="font-semibold shadow-xs">
              <Link href="/auth">Sign In to Save Overlays</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Overview: one card per toolset */}
      {!toolset && (
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 m-0">Your Toolsets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TOOLSETS.map((ts) => {
              const SetIcon = ts.icon;
              return (
                <Link key={ts.id} href={`/dashboard?set=${ts.id}`} className="no-underline group">
                  <Card className="border-border bg-card shadow-xs hover:border-primary/50 transition-all p-5 flex flex-row items-start gap-4 h-full">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <SetIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-foreground m-0">{ts.name}</h3>
                        {ts.status === 'dev' && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">In Development</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed m-0">{ts.tagline}</p>
                      <span className="text-[11px] text-muted-foreground mt-1">
                        {ts.tools.length === 1 ? '1 tool' : `${ts.tools.length} tools`}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Single-tool / in-development toolsets (no saved widgets yet) */}
      {toolset && !showSaved && (
        <Card className="border-border bg-card shadow-xs p-6 flex flex-col gap-3 max-w-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground m-0">About this toolset</h2>
          <p className="text-sm text-foreground m-0">{toolset.tagline}</p>
          <p className="text-xs text-muted-foreground m-0">
            {toolset.status === 'dev'
              ? 'This toolset is still in development. Saved projects will appear here once it launches.'
              : 'This toolset runs entirely in the browser, so there is nothing to save here yet.'}
          </p>
          <div>
            <Button asChild size="sm" className="gap-1.5">
              <Link href={toolset.tools[0].path}>
                Open {toolset.tools[0].name}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Quick Launch / Create New Widgets Section (Broadcast Studio hub only) */}
      {toolset?.id === 'broadcast' && !activeTool && (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground m-0">
            Create New Broadcast Widget
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Clock Widget Card */}
          <Card className="border-border bg-card shadow-xs hover:border-primary/50 transition-all flex flex-col p-4">
            <div aria-hidden="true" className="preview-window-container aspect-video mb-3.5 rounded-md overflow-hidden flex items-center justify-center">
              <div className="font-mono text-2xl text-amber-500 font-bold">
                12:34
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Clock Widget</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1">
                Digital stream clock with timezones, seconds, dates, and glowing neon FX.
              </p>
              <Button asChild size="sm" className="w-full mt-auto">
                <Link href="/clock">Launch Clock Studio</Link>
              </Button>
            </div>
          </Card>

          {/* Timer Widget Card */}
          <Card className="border-border bg-card shadow-xs hover:border-primary/50 transition-all flex flex-col p-4">
            <div aria-hidden="true" className="preview-window-container aspect-video mb-3.5 rounded-md flex items-center justify-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg width="64" height="64" className="absolute top-0 left-0">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" className="text-border" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="175" strokeDashoffset="42" strokeLinecap="round" transform="rotate(-90 32 32)" />
                </svg>
                <span className="text-sm font-bold text-foreground">4:47</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Timer Widget</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1">
                Countdown timer and stopwatch with SVG progress ring and chime alarms.
              </p>
              <Button asChild size="sm" className="w-full mt-auto">
                <Link href="/timer">Launch Timer Studio</Link>
              </Button>
            </div>
          </Card>

          {/* Chyron Builder Card */}
          <Card className="border-border bg-card shadow-xs hover:border-primary/50 transition-all flex flex-col p-4">
            <div aria-hidden="true" className="preview-window-container aspect-video mb-3.5 rounded-md flex flex-col justify-end items-stretch overflow-hidden">
              <div className="bg-[#1a1a2e] w-full border-l-4 border-red-500 px-2 py-1 flex items-center justify-between">
                <span className="text-white text-[9px] font-extrabold tracking-wide">BREAKING NEWS</span>
                <span className="text-white text-[8px] font-mono bg-red-600 px-1 py-0.5 rounded font-bold">LIVE</span>
              </div>
              <div className="bg-[#0f172a] w-full border-t-2 border-red-500 px-2 py-0.5 overflow-hidden">
                <span className="text-white text-[8px] font-semibold whitespace-nowrap">SCROLLING TICKER TEXT ★</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Chyron Builder</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1">
                Broadcast lower thirds with headlines, logo bug, clock, and scrolling crawl.
              </p>
              <Button asChild size="sm" className="w-full mt-auto">
                <Link href="/crawl">Launch Chyron Studio</Link>
              </Button>
            </div>
          </Card>

          {/* Screen Sets Card */}
          <Card className="border-border bg-card shadow-xs hover:border-primary/50 transition-all flex flex-col p-4">
            <div aria-hidden="true" className="preview-window-container aspect-video mb-3.5 rounded-md flex items-center justify-center">
              <div className="text-center">
                <div className="text-base font-extrabold text-blue-500 uppercase leading-tight">STARTING SOON</div>
                <div className="text-sm text-muted-foreground mt-0.5">Stream begins shortly...</div>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Screen Sets</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1">
                Full-screen Starting Soon, BRB, and Goodbye overlays with countdowns.
              </p>
              <Button asChild size="sm" className="w-full mt-auto">
                <Link href="/screen">Launch Screen Studio</Link>
              </Button>
            </div>
          </Card>

        </div>
      </div>
      )}

      {/* Saved Widgets Section */}
      {showSaved && (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground m-0">
              {activeTool ? `Saved ${activeTool.name}s` : toolset ? 'Saved Broadcast Widgets' : 'Your Saved Widgets'} ({visibleList.length})
            </h2>
            {session && (
              <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                Synced to Cloud
              </Badge>
            )}
          </div>

          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={deleteSelected} className="gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="p-8 text-center border border-border rounded-xl bg-card">
            <p className="text-sm text-muted-foreground m-0">Loading your saved widgets...</p>
          </div>
        ) : !session ? (
          <Card className="text-center py-12 px-6 border-dashed border-border bg-card">
            <p className="text-base font-semibold text-foreground mb-1">Sign in to view and save your broadcast widgets</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              When signed in, your custom widgets are securely synced with cloud backup, drag-and-drop ordering, and instant OBS browser source URLs.
            </p>
            <Button asChild>
              <Link href="/auth">Sign In or Create Account</Link>
            </Button>
          </Card>
        ) : visibleList.length === 0 ? (
          <Card className="text-center py-12 px-6 border-dashed border-border bg-card">
            <p className="text-base font-semibold text-foreground mb-1">No saved widgets yet</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Select any of the creator studios above to configure your custom broadcast graphics and save them here.
            </p>
            <Button asChild variant="outline">
              <Link href={activeTool?.path ?? '/crawl'}>{activeTool ? `Create Your First ${activeTool.name}` : 'Create Your First Chyron'}</Link>
            </Button>
          </Card>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={visibleList.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-3.5">
                {visibleList.map((item) => (
                  <SortableWidgetCard 
                    key={item.id} 
                    item={item} 
                    copyUrl={copyUrl} 
                    copySuccess={copySuccess} 
                    isSelected={selectedIds.includes(item.id)}
                    onToggleSelect={toggleSelect}
                    onDelete={deleteSingle}
                    time={time}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted-foreground">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
