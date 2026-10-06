'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import ChyronPreview from '@/components/ChyronPreview';
import { ColorInputWithPalette } from '@/components/ColorInputWithPalette';
import { TextFormattingToolbar } from '@/components/TextFormattingToolbar';
import { ObsExportCard } from '@/components/ObsExportCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { BROADCAST_PRESETS } from '@/lib/presets';
import type { ChyronConfig, CrawlBlock } from '@/types/chyron';
import { DEFAULT_CHYRON_CONFIG } from '@/types/chyron';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  Check, 
  Copy, 
  Maximize2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LAYER_LABELS: Record<string, string> = {
  title: 'Title Bar',
  subheader: 'Subheader',
  logo: 'Logo Bug',
  clock: 'Clock / Date',
  crawl: 'Crawl Ticker',
};

// ─── Properties: Title ─────────────────────────────────────────────
function TitleProperties({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const t = config.title;
  const update = (patch: Partial<typeof t>) => onChange({ ...config, title: { ...t, ...patch } });

  return (
    <Card className="border-border bg-card p-5 flex flex-col gap-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">Title Bar</h3>
      <TextFormattingToolbar
        text={t.text}
        fontFamily={t.fontFamily}
        fontSize={t.fontSize}
        bold={t.bold}
        textTransform={t.textTransform as any}
        textColor={t.textColor}
        bgColor={t.bgColor}
        showBgColor={true}
        onChange={update}
      />
    </Card>
  );
}

// ─── Properties: Subheader ─────────────────────────────────────────────
function SubheaderProperties({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const s = config.subheader;
  const update = (patch: Partial<typeof s>) => onChange({ ...config, subheader: { ...s, ...patch } });

  return (
    <Card className="border-border bg-card p-5 flex flex-col gap-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">Subheader</h3>
      <TextFormattingToolbar
        text={s.text}
        fontFamily={s.fontFamily}
        fontSize={s.fontSize}
        bold={s.bold}
        textTransform={s.textTransform as any}
        textColor={s.textColor}
        bgColor={s.bgColor}
        showBgColor={true}
        onChange={update}
      />
    </Card>
  );
}

// ─── Properties: Logo ──────────────────────────────────────────────
function LogoProperties({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const l = config.logo;
  const update = (patch: Partial<typeof l>) => onChange({ ...config, logo: { ...l, ...patch } });

  return (
    <Card className="border-border bg-card p-5 flex flex-col gap-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">Logo Bug</h3>
      
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[180px] flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Mode</label>
          <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-md">
            <button
              type="button"
              onClick={() => update({ mode: 'TEXT' })}
              className={cn(
                "py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer",
                l.mode === 'TEXT' ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              TEXT
            </button>
            <button
              type="button"
              onClick={() => update({ mode: 'IMAGE' })}
              className={cn(
                "py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer",
                l.mode === 'IMAGE' ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              IMAGE
            </button>
          </div>
        </div>
        
        <div className="flex-2 min-w-[260px] flex flex-col gap-1.5">
          {l.mode === 'TEXT' ? (
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Logo Text</label>
              <Input value={l.text} onChange={e => update({ text: e.target.value })} placeholder="e.g. CNN, LIVE, C-SPAN" className="h-9 text-xs" />
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Image URL</label>
              <div className="flex gap-2">
                <Input value={l.imageUrl} onChange={e => update({ imageUrl: e.target.value })} placeholder="Paste image URL" className="flex-1 h-9 text-xs" />
                <label className="cursor-pointer flex items-center px-3 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-md text-xs font-semibold shrink-0 transition-colors">
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const toastId = toast.loading('Uploading image...');
                    try {
                      const fileExt = file.name.split('.').pop();
                      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
                      const { error } = await supabase.storage.from('assets').upload(`chyron/${fileName}`, file, { upsert: true });
                      if (error) {
                        const { error: error2 } = await supabase.storage.from('images').upload(`chyron/${fileName}`, file, { upsert: true });
                        if (error2) throw error2;
                        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(`chyron/${fileName}`);
                        update({ imageUrl: publicUrl });
                      } else {
                        const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(`chyron/${fileName}`);
                        update({ imageUrl: publicUrl });
                      }
                      toast.success('Image uploaded!', { id: toastId });
                    } catch (err: any) {
                      toast.error(`Upload failed: ${err.message}.`, { id: toastId, duration: 5000 });
                    }
                  }} />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-muted/40 border border-border rounded-lg flex-wrap">
        {/* Toggles */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="icon" 
              variant={l.spanRows ? "secondary" : "ghost"} 
              onClick={() => update({ spanRows: !l.spanRows })}
              className={cn("h-8 w-8", l.spanRows ? "text-primary bg-primary/10" : "text-muted-foreground")}
              aria-label="Span All Rows"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Span All Rows</p></TooltipContent>
        </Tooltip>

        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Font dropdown for text mode */}
        {l.mode === 'TEXT' && (
          <div className="w-28">
            <Select value={l.fontFamily || 'Inter'} onValueChange={val => update({ fontFamily: val })}>
              <SelectTrigger className="h-8 text-xs border-0 bg-transparent hover:bg-muted font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter" className="text-xs">Inter</SelectItem>
                <SelectItem value="Outfit" className="text-xs">Outfit</SelectItem>
                <SelectItem value="Bebas Neue" className="text-xs">Bebas Neue</SelectItem>
                <SelectItem value="Roboto Mono" className="text-xs">Roboto Mono</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Position */}
        <div className="w-24">
          <Select value={l.position || 'LEFT'} onValueChange={val => update({ position: val as any })}>
            <SelectTrigger className="h-8 text-xs border-0 bg-transparent hover:bg-muted font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LEFT" className="text-xs">Left</SelectItem>
              <SelectItem value="RIGHT" className="text-xs">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Colors */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
                  <span className="font-bold">T</span>
                  <div className="w-3.5 h-3.5 rounded-xs border border-border" style={{ backgroundColor: l.textColor }} />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Text Color</p></TooltipContent>
          </Tooltip>
          <PopoverContent sideOffset={5} className="w-64 p-4">
            <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Text Color</span>
            <ColorInputWithPalette value={l.textColor} onChange={val => update({ textColor: val })} />
          </PopoverContent>
        </Popover>

        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
                  <span className="font-bold">BG</span>
                  <div className="w-3.5 h-3.5 rounded-xs border border-border" style={{ backgroundColor: l.bgColor }} />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Background Color</p></TooltipContent>
          </Tooltip>
          <PopoverContent sideOffset={5} className="w-64 p-4">
            <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Background Color</span>
            <ColorInputWithPalette value={l.bgColor} onChange={val => update({ bgColor: val })} />
          </PopoverContent>
        </Popover>
      </div>
    </Card>
  );
}

// ─── Properties: Clock ─────────────────────────────────────────────
function ClockProperties({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const c = config.clock;
  const update = (patch: Partial<typeof c>) => onChange({ ...config, clock: { ...c, ...patch } });

  return (
    <Card className="border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">Clock / Date</h3>
        <div className="flex items-center gap-2">
          <Switch checked={c.enabled !== false} onCheckedChange={checked => update({ enabled: checked })} />
          <span className="text-xs font-bold text-muted-foreground uppercase">Enable Clock</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-muted/40 border border-border rounded-lg flex-wrap">
        {/* Format */}
        <div className="w-24">
          <Select value={c.format} onValueChange={val => update({ format: val as any })}>
            <SelectTrigger className="h-8 text-xs border-0 bg-transparent hover:bg-muted font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12HR" className="text-xs">12 HR</SelectItem>
              <SelectItem value="24HR" className="text-xs">24 HR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Timezone */}
        <div className="w-28">
          <Select value={c.timezone} onValueChange={val => update({ timezone: val })}>
            <SelectTrigger className="h-8 text-xs border-0 bg-transparent hover:bg-muted font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOCAL" className="text-xs">Local Time</SelectItem>
              <SelectItem value="UTC" className="text-xs">UTC</SelectItem>
              <SelectItem value="America/New_York" className="text-xs">EST</SelectItem>
              <SelectItem value="America/Los_Angeles" className="text-xs">PST</SelectItem>
              <SelectItem value="Europe/London" className="text-xs">GMT</SelectItem>
              <SelectItem value="Asia/Tokyo" className="text-xs">JST</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Position */}
        <div className="w-24">
          <Select value={c.position} onValueChange={val => update({ position: val as any })}>
            <SelectTrigger className="h-8 text-xs border-0 bg-transparent hover:bg-muted font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LEFT" className="text-xs">Left Align</SelectItem>
              <SelectItem value="RIGHT" className="text-xs">Right Align</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Colors */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
                  <span className="font-bold">T</span>
                  <div className="w-3.5 h-3.5 rounded-xs border border-border" style={{ backgroundColor: c.textColor }} />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Text Color</p></TooltipContent>
          </Tooltip>
          <PopoverContent sideOffset={5} className="w-64 p-4">
            <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Text Color</span>
            <ColorInputWithPalette value={c.textColor} onChange={val => update({ textColor: val })} />
          </PopoverContent>
        </Popover>

        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
                  <span className="font-bold">BG</span>
                  <div className="w-3.5 h-3.5 rounded-xs border border-border" style={{ backgroundColor: c.bgColor }} />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Background Color</p></TooltipContent>
          </Tooltip>
          <PopoverContent sideOffset={5} className="w-64 p-4">
            <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Background Color</span>
            <ColorInputWithPalette value={c.bgColor} onChange={val => update({ bgColor: val })} />
          </PopoverContent>
        </Popover>
      </div>
    </Card>
  );
}

// ─── Properties: Crawl Blocks Manager ──────────────────────────────
function CrawlBlocksManager({
  config,
  onChange,
  expandedId: propExpandedId,
  setExpandedId: propSetExpandedId,
}: {
  config: ChyronConfig;
  onChange: (c: ChyronConfig) => void;
  expandedId?: string | null;
  setExpandedId?: (id: string | null) => void;
}) {
  const [localExpandedId, setLocalExpandedId] = useState<string | null>(null);
  const expandedId = propExpandedId !== undefined ? propExpandedId : localExpandedId;
  const setExpandedId = propSetExpandedId || setLocalExpandedId;
  const [selectedBlockIds, setSelectedBlockIds] = useState<Set<string>>(new Set());
  const cr = config.crawl;

  const updateBlock = (id: string, patch: Partial<CrawlBlock>) => {
    const newBlocks = cr.blocks.map(b => b.id === id ? { ...b, ...patch } : b);
    onChange({ ...config, crawl: { ...cr, blocks: newBlocks } });
  };

  const deleteBlock = (id: string) => {
    if (cr.blocks.length <= 1) {
      toast.error('You need at least one crawl block');
      return;
    }
    onChange({ ...config, crawl: { ...cr, blocks: cr.blocks.filter(b => b.id !== id) } });
  };

  const addBlockAt = (index: number) => {
    const newBlock: CrawlBlock = {
      id: `block-${Date.now()}`,
      label: `Block ${cr.blocks.length + 1}`,
      text: 'NEW CRAWL TEXT',
      enabled: true,
    };
    const newBlocks = [...cr.blocks];
    newBlocks.splice(index, 0, newBlock);
    onChange({ ...config, crawl: { ...cr, blocks: newBlocks } });
    setExpandedId(newBlock.id);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newBlocks = Array.from(cr.blocks);
    const [reorderedItem] = newBlocks.splice(result.source.index, 1);
    newBlocks.splice(result.destination.index, 0, reorderedItem);
    onChange({ ...config, crawl: { ...cr, blocks: newBlocks } });
  };

  const bulkDeleteBlocks = () => {
    let remainingBlocks = cr.blocks.filter(b => !selectedBlockIds.has(b.id));
    if (remainingBlocks.length === 0) {
      remainingBlocks = [{
        id: `block-${Date.now()}`,
        label: `Block 1`,
        text: 'NEW CRAWL TEXT',
        enabled: true,
      }];
    }
    onChange({ ...config, crawl: { ...cr, blocks: remainingBlocks } });
    setSelectedBlockIds(new Set());
    setExpandedId(null);
  };

  return (
    <Card className="border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">Crawl Blocks</h3>
          <Badge variant="secondary" className="text-[10px] font-semibold text-primary bg-primary/10">
            {cr.blocks.length} {cr.blocks.length === 1 ? 'Block' : 'Blocks'}
          </Badge>
        </div>
        <Button onClick={() => addBlockAt(0)} size="sm" className="h-8 gap-1.5 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> Add Block
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="crawl-blocks-accordion">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-2">
              {cr.blocks.map((block, i) => (
                <Draggable key={block.id} draggableId={block.id} index={i}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "flex flex-col rounded-lg border border-border overflow-hidden transition-all",
                        block.enabled ? "bg-card" : "bg-muted/40 opacity-60"
                      )}
                      style={provided.draggableProps.style}
                    >
                      {/* Header (Accordion Toggle) */}
                      <div
                        onClick={() => setExpandedId(expandedId === block.id ? null : block.id)}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors",
                          expandedId === block.id ? "bg-muted/60" : "hover:bg-muted/30"
                        )}
                      >
                        <div {...provided.dragHandleProps} className="text-muted-foreground cursor-grab p-1">
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>

                        <div onClick={(e) => e.stopPropagation()} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedBlockIds.has(block.id)}
                            onChange={(e) => {
                              const newSet = new Set(selectedBlockIds);
                              if (e.target.checked) newSet.add(block.id);
                              else newSet.delete(block.id);
                              setSelectedBlockIds(newSet);
                            }}
                            className="cursor-pointer w-4 h-4 rounded text-primary"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); updateBlock(block.id, { enabled: !block.enabled }); }}
                          className="bg-transparent border-0 cursor-pointer p-1 text-muted-foreground hover:text-foreground shrink-0"
                        >
                          {block.enabled ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>

                        <span className="flex-1 font-semibold text-xs text-foreground truncate">
                          {block.label || 'Unnamed Block'}
                        </span>

                        <span className={cn(
                          "text-[10px] text-muted-foreground transition-transform",
                          expandedId === block.id && "rotate-180"
                        )}>
                          ▼
                        </span>
                      </div>

                      {/* Body */}
                      {expandedId === block.id && (
                        <div className="p-4 bg-muted/20 border-t border-border flex flex-col gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase">Block Label</label>
                            <Input 
                              value={block.label || ''} 
                              onChange={e => updateBlock(block.id, { label: e.target.value })} 
                              placeholder="e.g. Headlines, Sponsors, Socials"
                              className="h-8 text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase">Crawl Text</label>
                            <Input 
                              value={block.text || ''} 
                              onChange={e => updateBlock(block.id, { text: e.target.value })} 
                              placeholder="Type scrolling ticker text here..."
                              className="h-8 text-xs font-mono"
                            />
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-border mt-1">
                            <span className="text-[11px] text-muted-foreground">Block #{i + 1}</span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => deleteBlock(block.id)}
                              className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete Block
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {selectedBlockIds.size > 0 && (
        <div className="pt-2 border-t border-border flex justify-end">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={bulkDeleteBlocks}
            className="h-8 text-xs gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedBlockIds.size})
          </Button>
        </div>
      )}
    </Card>
  );
}

// ─── Properties: Crawl + Nested Block Manager ──────────────────────
function CrawlProperties({
  config,
  onChange,
  expandedBlockId,
  setExpandedBlockId,
}: {
  config: ChyronConfig;
  onChange: (c: ChyronConfig) => void;
  expandedBlockId?: string | null;
  setExpandedBlockId?: (id: string | null) => void;
}) {
  const cr = config.crawl;
  const updateCrawl = (patch: Partial<typeof cr>) => onChange({ ...config, crawl: { ...cr, ...patch } });

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Crawl Settings */}
      <Card className="border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">Crawl Settings</h3>
          <Badge variant={cr.enabled ? "default" : "secondary"} className="text-[10px]">
            {cr.enabled ? "Active" : "Disabled"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 border border-border rounded-lg flex-wrap">
          {/* Speed */}
          <div className="w-24">
            <Select value={cr.speed} onValueChange={val => updateCrawl({ speed: val as any })}>
              <SelectTrigger className="h-8 text-xs border-0 bg-transparent hover:bg-muted font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SLOW" className="text-xs">Slow</SelectItem>
                <SelectItem value="NORMAL" className="text-xs">Normal</SelectItem>
                <SelectItem value="FAST" className="text-xs">Fast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-px h-4 bg-border mx-0.5" />

          {/* Separator */}
          <div className="w-28">
            <Select value={cr.separator} onValueChange={val => updateCrawl({ separator: val })}>
              <SelectTrigger className="h-8 text-xs border-0 bg-transparent hover:bg-muted font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ★ " className="text-xs">★ Star</SelectItem>
                <SelectItem value=" | " className="text-xs">| Pipe</SelectItem>
                <SelectItem value=" /// " className="text-xs">/// Slashes</SelectItem>
                <SelectItem value=" ••• " className="text-xs">••• Dots</SelectItem>
                <SelectItem value="   " className="text-xs">(Space)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-px h-4 bg-border mx-0.5" />

          {/* Font Family */}
          <div className="w-28">
            <Select value={cr.fontFamily} onValueChange={val => updateCrawl({ fontFamily: val })}>
              <SelectTrigger className="h-8 text-xs border-0 bg-transparent hover:bg-muted font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter" className="text-xs">Inter</SelectItem>
                <SelectItem value="Outfit" className="text-xs">Outfit</SelectItem>
                <SelectItem value="Roboto Mono" className="text-xs">Roboto Mono</SelectItem>
                <SelectItem value="Bebas Neue" className="text-xs">Bebas Neue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="w-24">
            <Select value={cr.fontSize === 0.82 ? '0.82' : cr.fontSize === 1.2 ? '1.2' : '1.0'} onValueChange={val => updateCrawl({ fontSize: parseFloat(val) })}>
              <SelectTrigger className="h-8 text-xs border-0 bg-transparent hover:bg-muted font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.82" className="text-xs">Small</SelectItem>
                <SelectItem value="1.0" className="text-xs">Medium</SelectItem>
                <SelectItem value="1.2" className="text-xs">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-px h-4 bg-border mx-0.5" />

          {/* Colors */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
                    <span className="font-bold">T</span>
                    <div className="w-3.5 h-3.5 rounded-xs border border-border" style={{ backgroundColor: cr.textColor }} />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Text Color</p></TooltipContent>
            </Tooltip>
            <PopoverContent sideOffset={5} className="w-64 p-4">
              <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Text Color</span>
              <ColorInputWithPalette value={cr.textColor} onChange={val => updateCrawl({ textColor: val })} />
            </PopoverContent>
          </Popover>

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
                    <span className="font-bold">BG</span>
                    <div className="w-3.5 h-3.5 rounded-xs border border-border" style={{ backgroundColor: cr.bgColor }} />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Background Color</p></TooltipContent>
            </Tooltip>
            <PopoverContent sideOffset={5} className="w-64 p-4">
              <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Background Color</span>
              <ColorInputWithPalette value={cr.bgColor} onChange={val => updateCrawl({ bgColor: val })} />
            </PopoverContent>
          </Popover>
        </div>
      </Card>

      {/* 2. Elegantly Nested Crawl Blocks Manager */}
      <CrawlBlocksManager 
        config={config} 
        onChange={onChange}
        expandedId={expandedBlockId}
        setExpandedId={setExpandedBlockId}
      />
    </div>
  );
}

// ─── Properties: Global Layout ─────────────────────────────────────
function LayoutProperties({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const ly = config.layout;
  const update = (patch: Partial<typeof ly>) => onChange({ ...config, layout: { ...ly, ...patch } });

  return (
    <div className="flex flex-col gap-4">
      {/* Curated Broadcast Themes */}
      <Card className="border-border bg-card p-5 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Curated Broadcast Themes
          </span>
          <Badge variant="secondary" className="text-[10px] font-semibold text-primary bg-primary/10">
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
                onChange({
                  ...config,
                  layout: {
                    ...config.layout,
                    bgColor: preset.bgColor,
                    accentColor: preset.accentColor,
                  },
                  title: {
                    ...config.title,
                    bgColor: preset.bgColor,
                    textColor: preset.textColor,
                  },
                  subheader: {
                    ...config.subheader,
                    bgColor: preset.bgColor,
                    textColor: '#94a3b8',
                  },
                  logo: {
                    ...config.logo,
                    bgColor: preset.accentColor,
                    textColor: '#ffffff',
                  },
                  clock: {
                    ...config.clock,
                    bgColor: preset.bgColor === '#111111' ? '#1f2937' : '#0f172a',
                    textColor: preset.textColor,
                  },
                  crawl: {
                    ...config.crawl,
                    bgColor: preset.bgColor === '#111111' ? '#18181b' : '#0f172a',
                    textColor: preset.textColor,
                  }
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

      <Card className="border-border bg-card p-5 flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">Layout & Background</h3>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Chyron Name</label>
          <Input value={config.name} onChange={e => onChange({ ...config, name: e.target.value })} className="h-9 text-xs" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Background Mode</label>
          <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-md">
            <button
              type="button"
              onClick={() => update({ bgMode: 'TRANSPARENT' })}
              className={cn(
                "py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer",
                ly.bgMode === 'TRANSPARENT' ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              TRANSPARENT
            </button>
            <button
              type="button"
              onClick={() => update({ bgMode: 'SOLID' })}
              className={cn(
                "py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer",
                ly.bgMode === 'SOLID' ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              SOLID
            </button>
          </div>
        </div>
        {ly.bgMode === 'SOLID' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Background Color</label>
            <ColorInputWithPalette value={ly.bgColor} onChange={val => update({ bgColor: val })} />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Accent Color</label>
          <ColorInputWithPalette value={ly.accentColor} onChange={val => update({ accentColor: val })} />
          <p className="text-[11px] text-muted-foreground mt-1">Used for accent stripes and borders between layers</p>
        </div>
      </Card>
    </div>
  );
}

function ChyronCardPreview({ config }: { config: ChyronConfig }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) {
          setScale(w / 1920);
        }
      }
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="preview-window-container w-full aspect-[16/5] rounded-md overflow-hidden flex items-end justify-center relative border border-border"
    >
      <div style={{ width: 1920 * scale, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
        <ChyronPreview config={config} scale={scale} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════
function ChyronBuilderContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');

  const [session, setSession] = useState<any>(null);
  const [configsList, setConfigsList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [config, setConfig] = useState<ChyronConfig>(DEFAULT_CHYRON_CONFIG);
  const [selectedLayer, setSelectedLayer] = useState<string | null>('crawl');
  const [selectedPanel, setSelectedPanel] = useState<'layer' | 'layout' | 'export' | 'crawlBlocks'>('layer');
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [isCrawlExpanded, setIsCrawlExpanded] = useState<boolean>(true);

  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setLoadingList(false); return; }
      setSession(session);
      fetchConfigs(session.user.id, queryId);
    });
  }, [queryId]);

  const fetchConfigs = async (userId: string, targetId?: string | null) => {
    setLoadingList(true);
    const { data } = await supabase
      .from('widget_configs')
      .select('id, config, widget_type')
      .eq('user_id', userId)
      .in('widget_type', ['crawl', 'chyron'])
      .order('created_at', { ascending: true });
    const list = data || [];
    setConfigsList(list);
    setLoadingList(false);

    const toOpen = targetId || queryId;
    if (toOpen && list.length > 0) {
      const match = list.find(c => c.id === toOpen);
      if (match) {
        loadEditor(match.id, match.config);
      }
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
    const timer = setTimeout(saveConfig, 800);
    return () => clearTimeout(timer);
  }, [config, activeConfigId, session]);

  const handleCreateNew = async () => {
    if (!session || configsList.length >= 3) return;
    const newConfig = { ...DEFAULT_CHYRON_CONFIG, name: `Chyron ${configsList.length + 1}` };
    const { data } = await supabase
      .from('widget_configs')
      .insert({ user_id: session.user.id, widget_type: 'crawl', config: newConfig })
      .select('id')
      .single();
    if (data) {
      setConfigsList([...configsList, { id: data.id, config: newConfig, widget_type: 'crawl' }]);
      loadEditor(data.id, newConfig);
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

  const loadEditor = (id: string, c: any) => {
    setActiveConfigId(id);
    
    const loadedOrder = c?.layerOrder || DEFAULT_CHYRON_CONFIG.layerOrder;
    const finalOrder = [...loadedOrder];
    ['title', 'subheader', 'crawl', 'logo', 'clock'].forEach(l => {
      if (!finalOrder.includes(l as any)) finalOrder.push(l as any);
    });

    const mergedConfig: ChyronConfig = {
      ...DEFAULT_CHYRON_CONFIG,
      ...(c || {}),
      layout: { ...DEFAULT_CHYRON_CONFIG.layout, ...(c?.layout || {}) },
      title: { ...DEFAULT_CHYRON_CONFIG.title, ...(c?.title || {}) },
      subheader: { ...DEFAULT_CHYRON_CONFIG.subheader, ...(c?.subheader || {}) },
      logo: { ...DEFAULT_CHYRON_CONFIG.logo, ...(c?.logo || {}) },
      clock: { ...DEFAULT_CHYRON_CONFIG.clock, ...(c?.clock || {}) },
      crawl: { 
        ...DEFAULT_CHYRON_CONFIG.crawl, 
        ...(c?.crawl || {}),
        blocks: (Array.isArray(c?.crawl?.blocks) && c.crawl.blocks.length > 0)
          ? c.crawl.blocks
          : DEFAULT_CHYRON_CONFIG.crawl.blocks
      },
      layerOrder: finalOrder,
    };
    setConfig(mergedConfig);
    setSelectedLayer('title');
    setSelectedPanel('layer');
  };

  const deleteConfig = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-1">
          <p className="m-0 text-sm font-semibold text-foreground">Delete this chyron?</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await supabase.from('widget_configs').delete().eq('id', id);
                setConfigsList(configsList.filter(c => c.id !== id));
                if (activeConfigId === id) setActiveConfigId(null);
                toast.success('Chyron deleted');
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/widgets/embed/crawl?id=${activeConfigId}`);
    setCopySuccess(true);
    toast.success('URL copied to clipboard!');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    if (result.source.droppableId === 'layers-list') {
      const items = Array.from(config.layerOrder);
      ['title', 'subheader', 'crawl', 'logo', 'clock'].forEach(l => {
        if (!items.includes(l as any)) items.push(l as any);
      });
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setConfig({ ...config, layerOrder: items as any });
    }
  };

  const toggleLayer = (layerId: string) => {
    const key = layerId as keyof Pick<ChyronConfig, 'title' | 'subheader' | 'logo' | 'clock' | 'crawl'>;
    const layer = config[key];
    if (layer && 'enabled' in layer) {
      setConfig({ ...config, [key]: { ...layer, enabled: !layer.enabled } });
    }
  };

  const toggleBlockEnabled = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = config.crawl.blocks.map(b => b.id === blockId ? { ...b, enabled: !b.enabled } : b);
    setConfig({ ...config, crawl: { ...config.crawl, blocks: updated } });
  };

  const addBlockFromSidebar = () => {
    const newBlock: CrawlBlock = {
      id: `block-${Date.now()}`,
      label: `Block ${config.crawl.blocks.length + 1}`,
      text: 'NEW CRAWL TEXT',
      enabled: true,
    };
    setConfig({
      ...config,
      crawl: {
        ...config.crawl,
        blocks: [...config.crawl.blocks, newBlock],
      },
    });
    setSelectedLayer('crawl');
    setSelectedPanel('layer');
    setExpandedBlockId(newBlock.id);
  };

  if (!session) {
    return (
      <main className="p-10">
        <p className="text-sm text-muted-foreground">Please <Link href="/auth" className="text-primary underline">Sign In</Link></p>
      </main>
    );
  }

  // ── 1. CATALOG / DASHBOARD VIEW ──
  if (!activeConfigId) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Broadcast Overlays
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Chyron Builder
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Broadcast lower thirds with animated headline titles, subheaders, logo bugs, live clocks, and continuous scrolling ticker crawls.
            </p>
          </div>
          {configsList.length < 3 && (
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Create Chyron</span>
            </Button>
          )}
        </div>

        {/* Storage Capacity Banner */}
        <div className="flex justify-between items-center mb-6 p-3.5 bg-card rounded-lg border border-border shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground">Storage Capacity</span>
          <span className={cn("text-xs font-bold", configsList.length >= 3 ? "text-red-500" : "text-primary")}>
            {configsList.length} / 3 Chyrons Used
          </span>
        </div>

        {/* Content Grid */}
        {loadingList ? (
          <p className="text-sm text-muted-foreground">Loading chyrons...</p>
        ) : configsList.length === 0 ? (
          <Card className="text-center py-16 px-6 border-dashed border-border bg-card">
            <p className="text-sm font-medium text-foreground mb-4">You don&apos;t have any chyrons created yet.</p>
            <Button onClick={handleCreateNew}>Create Your First Chyron</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configsList.map(c => (
              <Card 
                key={c.id} 
                onClick={() => loadEditor(c.id, c.config)} 
                className="cursor-pointer border-border bg-card hover:shadow-md transition-all flex flex-col p-5 group"
              >
                <ChyronCardPreview config={c.config} />

                <div className="flex justify-between items-center mt-3 mb-2">
                  <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {c.config.name || 'Unnamed Chyron'}
                  </span>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={e => deleteConfig(c.id, e)} 
                    title="Delete chyron"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground mb-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      c.config.crawl?.enabled ? "bg-emerald-500" : "bg-muted-foreground/30"
                    )} />
                    <span className="truncate">
                      {c.config.crawl?.enabled 
                        ? `${c.config.crawl.blocks?.filter((b: any) => b.enabled).length || 0} Active Crawl Blocks` 
                        : 'Crawl Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      c.config.logo?.enabled ? "bg-amber-500" : "bg-muted-foreground/30"
                    )} />
                    <span>{c.config.logo?.enabled ? 'Logo Enabled' : 'Logo Disabled'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-border" onClick={e => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={typeof window !== 'undefined' ? `${window.location.origin}/widgets/embed/crawl?id=${c.id}` : ''}
                      onClick={e => (e.target as HTMLInputElement).select()}
                      className="h-8 text-xs font-mono flex-1 bg-muted/40"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={e => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(`${window.location.origin}/widgets/embed/crawl?id=${c.id}`);
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
                  Create New Chyron
                </span>
                <span className="text-xs text-muted-foreground mt-1 text-center">
                  Add another lower third widget (up to 3)
                </span>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── 2. WORKSPACE / EDITOR VIEW ──
  return (
    <div className="flex w-full h-full overflow-hidden bg-background text-foreground">

      {/* ── LEFT SIDEBAR ──────────────────────────────────────── */}
      <aside className="w-80 border-r border-border flex flex-col bg-card shrink-0 select-none z-10">
        <div className="p-4 border-b border-border flex flex-col gap-2">
          <Button variant="ghost" size="sm" onClick={handleBackToList} className="w-fit text-xs text-muted-foreground hover:text-foreground -ml-2 gap-1.5 h-8">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Chyrons
          </Button>
          <input
            type="text"
            value={config.name || ''}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            placeholder="Chyron Name"
            className="font-bold text-base text-foreground bg-transparent border-0 border-b border-transparent hover:border-border focus:border-primary focus:outline-hidden px-0 py-0.5 w-full truncate transition-colors"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col">
              {/* LAYERS header */}
              <div className="px-4 pt-4 pb-2 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                Layers
              </div>

              {/* Layer rows */}
              <Droppable droppableId="layers-list">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {['title', 'subheader', 'crawl', 'logo', 'clock']
                      .sort((a, b) => {
                        const idxA = config.layerOrder.indexOf(a as any);
                        const idxB = config.layerOrder.indexOf(b as any);
                        if (idxA === -1 && idxB === -1) return 0;
                        if (idxA === -1) return 1;
                        if (idxB === -1) return -1;
                        return idxA - idxB;
                      })
                      .map((layerId, i) => {
                        const key = layerId as keyof Pick<ChyronConfig, 'title' | 'subheader' | 'logo' | 'clock' | 'crawl'>;
                        const layer = config[key];
                        const isEnabled = layer && 'enabled' in layer ? layer.enabled : true;
                        const isSelected = selectedPanel === 'layer' && selectedLayer === layerId;

                        return (
                          <Draggable key={layerId} draggableId={layerId} index={i}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={provided.draggableProps.style}
                              >
                                <div
                                  onClick={() => { setSelectedLayer(layerId); setSelectedPanel('layer'); }}
                                  className={cn(
                                    "flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer transition-colors border-l-2",
                                    isSelected
                                      ? "bg-primary/10 border-primary text-primary"
                                      : snapshot.isDragging
                                      ? "bg-muted border-transparent"
                                      : "hover:bg-muted/40 border-transparent text-foreground",
                                    !isEnabled && "opacity-40"
                                  )}
                                >
                                  {/* Drag Handle */}
                                  <div
                                    {...provided.dragHandleProps}
                                    className="text-muted-foreground hover:text-foreground cursor-grab p-0.5"
                                  >
                                    <GripVertical className="w-3.5 h-3.5" />
                                  </div>

                                  {/* Visibility toggle */}
                                  <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); toggleLayer(layerId); }}
                                    className="bg-transparent border-0 cursor-pointer p-0.5 text-muted-foreground hover:text-foreground shrink-0"
                                    aria-label={isEnabled ? `Hide ${LAYER_LABELS[layerId]}` : `Show ${LAYER_LABELS[layerId]}`}
                                  >
                                    {isEnabled ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5" />}
                                  </button>

                                  {/* Label */}
                                  <span className="flex-1 text-xs font-semibold truncate">
                                    {LAYER_LABELS[layerId] || layerId}
                                  </span>

                                  {layerId === 'crawl' && (
                                    <div 
                                      className="flex items-center gap-1 cursor-pointer" 
                                      onClick={e => { e.stopPropagation(); setIsCrawlExpanded(!isCrawlExpanded); }}
                                    >
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-bold">
                                        {config.crawl.blocks.length}
                                      </Badge>
                                      <span className={cn(
                                        "text-[8px] text-muted-foreground transition-transform inline-block p-0.5",
                                        isCrawlExpanded ? "rotate-0" : "-rotate-90"
                                      )}>
                                        ▼
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* NESTED CRAWL BLOCKS UNDERNEATH CRAWL TICKER IN LAYERS PANEL */}
                                {layerId === 'crawl' && isCrawlExpanded && (
                                  <div className="flex flex-col pl-8 pr-3 pb-2 gap-1 relative">
                                    {/* Vertical tree hierarchy line */}
                                    <div className="absolute left-6 top-0 bottom-3 w-px bg-border" />

                                    {config.crawl.blocks.map((block) => {
                                      const isBlockActive = selectedPanel === 'layer' && selectedLayer === 'crawl' && expandedBlockId === block.id;

                                      return (
                                        <div
                                          key={block.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedLayer('crawl');
                                            setSelectedPanel('layer');
                                            setExpandedBlockId(block.id);
                                          }}
                                          className={cn(
                                            "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors border-l-2",
                                            isBlockActive
                                              ? "bg-primary/10 border-primary text-primary font-bold"
                                              : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground font-medium",
                                            !block.enabled && "opacity-50"
                                          )}
                                        >
                                          <button
                                            type="button"
                                            onClick={(e) => toggleBlockEnabled(block.id, e)}
                                            className="bg-transparent border-0 cursor-pointer p-0 text-muted-foreground hover:text-foreground shrink-0"
                                            title={block.enabled ? "Hide block" : "Show block"}
                                          >
                                            {block.enabled ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3" />}
                                          </button>

                                          <span className="flex-1 truncate">
                                            {block.label || 'Unnamed Block'}
                                          </span>
                                        </div>
                                      );
                                    })}

                                    {/* Quick Add Block in sidebar */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addBlockFromSidebar();
                                      }}
                                      className="flex items-center gap-1 px-2 py-1.5 mt-1 border border-dashed border-border rounded-md text-[11px] font-semibold text-primary hover:bg-primary/5 cursor-pointer text-left transition-colors"
                                    >
                                      <span>+</span> Add Block
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <div className="h-px bg-border my-2" />

              <div className="p-2 flex flex-col gap-1">
                <span className="px-3 pt-2 pb-1 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                  Global
                </span>
                <Button
                  variant={selectedPanel === 'layout' ? 'secondary' : 'ghost'}
                  onClick={() => { setSelectedPanel('layout'); setSelectedLayer(null); }}
                  className={cn(
                    "w-full justify-start text-xs font-semibold h-9",
                    selectedPanel === 'layout' && "bg-primary/10 text-primary border-l-2 border-primary"
                  )}
                >
                  Layout & Background
                </Button>
                <Button
                  variant={selectedPanel === 'export' ? 'secondary' : 'ghost'}
                  onClick={() => { setSelectedPanel('export'); setSelectedLayer(null); }}
                  className={cn(
                    "w-full justify-start text-xs font-semibold h-9",
                    selectedPanel === 'export' && "bg-primary/10 text-primary border-l-2 border-primary"
                  )}
                >
                  Export & OBS
                </Button>
              </div>
            </div>
          </DragDropContext>
        </div>
        
        <div className="p-4 border-t border-border mt-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToList}
            className="w-full text-xs font-semibold h-9 gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Chyrons
          </Button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-background">
        {/* Live Preview Header */}
        <div className="sticky top-0 z-20 shrink-0 py-5 px-8 flex flex-col justify-center items-center border-b border-border bg-card shadow-xs">
          <div className="flex w-full max-w-4xl justify-between items-center mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Live Monitor Preview
            </span>
            <span className={cn(
              "text-xs font-bold flex items-center gap-1.5",
              saving ? "text-amber-500" : "text-emerald-500"
            )}>
              <span className={cn("w-2 h-2 rounded-full", saving ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
              {saving ? 'SAVING...' : 'LIVE SYNCED'}
            </span>
          </div>
          <div className="w-full max-w-4xl mb-3">
            <ChyronCardPreview config={config} />
          </div>
          <div className="flex gap-2 w-full max-w-4xl">
            <Input
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}/widgets/embed/crawl?id=${activeConfigId}` : ''}
              onClick={e => (e.target as HTMLInputElement).select()}
              className="h-9 text-xs font-mono flex-1 bg-background"
            />
            <Button
              size="sm"
              onClick={handleCopy}
              className={cn(
                "h-9 px-4 text-xs font-bold gap-1.5 shrink-0 transition-colors",
                copySuccess ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              )}
            >
              {copySuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied URL
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Widget URL
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
          {selectedPanel === 'layer' && selectedLayer === 'title' && (
            <TitleProperties config={config} onChange={setConfig} />
          )}
          {selectedPanel === 'layer' && selectedLayer === 'subheader' && (
            <SubheaderProperties config={config} onChange={setConfig} />
          )}
          {selectedPanel === 'layer' && selectedLayer === 'logo' && (
            <LogoProperties config={config} onChange={setConfig} />
          )}
          {selectedPanel === 'layer' && selectedLayer === 'clock' && (
            <ClockProperties config={config} onChange={setConfig} />
          )}
          {((selectedPanel === 'layer' && selectedLayer === 'crawl') || selectedPanel === 'crawlBlocks') && (
            <CrawlProperties 
              config={config} 
              onChange={setConfig} 
              expandedBlockId={expandedBlockId}
              setExpandedBlockId={setExpandedBlockId}
            />
          )}
          {selectedPanel === 'layout' && (
            <LayoutProperties config={config} onChange={setConfig} />
          )}
          {selectedPanel === 'export' && activeConfigId && (
            <ObsExportCard
              url={typeof window !== 'undefined' ? `${window.location.origin}/widgets/embed/crawl?id=${activeConfigId}` : ''}
              dimensions="1920 × 200"
              allowTransparency={true}
              notes={["Designed to overlay seamlessly at the bottom of your 1920×1080 stream canvas."]}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function ChyronBuilder() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading Chyron Studio...</div>}>
      <ChyronBuilderContent />
    </Suspense>
  );
}
