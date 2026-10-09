'use client';

import React, { useState, useEffect, Suspense } from 'react';
import MediaPicker from "@/components/media/MediaPicker";
import { getAssetPublicUrl } from "@/lib/media/api";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { createPortal } from "react-dom";
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
  Layers, 
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
      <div className="flex justify-between items-center">
        <h3 className="text-xs  uppercase tracking-wider text-muted-foreground m-0">Title Bar</h3>
        <div className="flex items-center gap-2">
          <Switch aria-label="Enable Title Bar" checked={t.enabled !== false} onCheckedChange={checked => update({ enabled: checked })} />
          <span className="text-xs font-bold text-muted-foreground uppercase">Enable Title</span>
        </div>
      </div>
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
      <div className="flex justify-between items-center">
        <h3 className="text-xs  uppercase tracking-wider text-muted-foreground m-0">Subheader</h3>
        <div className="flex items-center gap-2">
          <Switch aria-label="Enable Subheader" checked={s.enabled !== false} onCheckedChange={checked => update({ enabled: checked })} />
          <span className="text-xs font-bold text-muted-foreground uppercase">Enable Subheader</span>
        </div>
      </div>
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
      <div className="flex justify-between items-center">
        <h3 className="text-xs  uppercase tracking-wider text-muted-foreground m-0">Logo Bug</h3>
        <div className="flex items-center gap-2">
          <Switch aria-label="Enable Logo Bug" checked={l.enabled !== false} onCheckedChange={checked => update({ enabled: checked })} />
          <span className="text-xs font-bold text-muted-foreground uppercase">Enable Logo</span>
        </div>
      </div>
      
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
                <MediaPicker 
                  allowedKinds={['image']} 
                  onSelect={(asset) => update({ imageUrl: getAssetPublicUrl(asset) })} 
                  trigger={
                    <div className="cursor-pointer flex items-center px-3 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-md text-xs font-semibold shrink-0 transition-colors h-9">
                      Browse
                    </div>
                  }
                />
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
            <span className="block text-sm font-bold tracking-wider text-muted-foreground uppercase mb-2">Text Color</span>
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
            <span className="block text-sm font-bold tracking-wider text-muted-foreground uppercase mb-2">Background Color</span>
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
        <h3 className="text-xs  uppercase tracking-wider text-muted-foreground m-0">Clock / Date</h3>
        <div className="flex items-center gap-2">
          <Switch aria-label="Enable Row" checked={c.enabled !== false} onCheckedChange={checked => update({ enabled: checked })} />
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
            <span className="block text-sm font-bold tracking-wider text-muted-foreground uppercase mb-2">Text Color</span>
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
            <span className="block text-sm font-bold tracking-wider text-muted-foreground uppercase mb-2">Background Color</span>
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
          <h3 className="text-xs  uppercase tracking-wider text-muted-foreground m-0">Crawl Blocks</h3>
          <Badge variant="secondary" className="text-sm font-semibold text-primary bg-primary/10">
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
                        <div {...provided.dragHandleProps} aria-label="Drag to reorder" className="text-muted-foreground cursor-grab p-1">
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
                          {block.enabled ? <Eye className="w-3.5 h-3.5 text-success" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>

                        <span className="flex-1 font-semibold text-xs text-foreground truncate">
                          {block.label || 'Unnamed Block'}
                        </span>

                        <span className={cn(
                          "text-sm text-muted-foreground transition-transform",
                          expandedId === block.id && "rotate-180"
                        )}>
                          ▼
                        </span>
                      </div>

                      {/* Body */}
                      {expandedId === block.id && (
                        <div className="p-4 bg-muted/20 border-t border-border flex flex-col gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-muted-foreground uppercase">Block Label</label>
                            <Input 
                              value={block.label || ''} 
                              onChange={e => updateBlock(block.id, { label: e.target.value })} 
                              placeholder="e.g. Headlines, Sponsors, Socials"
                              className="h-8 text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-muted-foreground uppercase">Crawl Text</label>
                            <Input 
                              value={block.text || ''} 
                              onChange={e => updateBlock(block.id, { text: e.target.value })} 
                              aria-label="Ticker text" placeholder="Type scrolling ticker text here..."
                              className="font-mono"
                            />
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-border mt-1">
                            <span className="text-sm text-muted-foreground">Block #{i + 1}</span>
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
}: {
  config: ChyronConfig;
  onChange: (c: ChyronConfig) => void;
}) {
  const cr = config.crawl;
  const updateCrawl = (patch: Partial<typeof cr>) => onChange({ ...config, crawl: { ...cr, ...patch } });

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Crawl Settings */}
      <Card className="border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs  uppercase tracking-wider text-muted-foreground m-0">Crawl Settings</h3>
          <Badge variant={cr.enabled ? "default" : "secondary"} className="text-sm">
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
              <span className="block text-sm font-bold tracking-wider text-muted-foreground uppercase mb-2">Text Color</span>
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
              <span className="block text-sm font-bold tracking-wider text-muted-foreground uppercase mb-2">Background Color</span>
              <ColorInputWithPalette value={cr.bgColor} onChange={val => updateCrawl({ bgColor: val })} />
            </PopoverContent>
          </Popover>
        </div>
      </Card>

      {/* 2. Elegantly Nested Crawl Blocks Manager */}
      
    </div>
  );
}

// ─── Properties: Global Layout ─────────────────────────────────────

function CrawlBlockProperties({
  config,
  onChange,
  blockId,
}: {
  config: ChyronConfig;
  onChange: (c: ChyronConfig) => void;
  blockId: string;
}) {
  const cr = config.crawl;
  const block = cr.blocks.find(b => b.id === blockId);
  if (!block) return null;

  const updateBlock = (patch: Partial<CrawlBlock>) => {
    const newBlocks = cr.blocks.map(b => b.id === blockId ? { ...b, ...patch } : b);
    onChange({ ...config, crawl: { ...cr, blocks: newBlocks } });
  };

  const deleteBlock = () => {
    if (cr.blocks.length <= 1) {
      toast.error('You need at least one crawl block');
      return;
    }
    onChange({ ...config, crawl: { ...cr, blocks: cr.blocks.filter(b => b.id !== blockId) } });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border bg-card p-5 flex flex-col gap-4 relative group">
        <div className="flex justify-between items-center mb-2">
          <Input 
            aria-label="Block Label"
            value={block.label} 
            onChange={e => updateBlock({ label: e.target.value })}
            className="h-8 font-bold text-base border-transparent hover:border-border focus-visible:border-border px-1.5 -ml-1.5 bg-transparent shadow-none"
          />
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={deleteBlock}
            className="text-muted-foreground hover:text-destructive shrink-0"
            aria-label="Delete block"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Content (Plain Text or Markdown)</label>
          <textarea
            aria-label="Block Content"
            value={block.text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBlock({ text: e.target.value })}
            placeholder="Type your crawl text here..."
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          />
        </div>
      </Card>
    </div>
  );
}

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
        <h3 className="text-xs  uppercase tracking-wider text-muted-foreground m-0">Layout & Background</h3>
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
          <p className="text-sm text-muted-foreground mt-1">Used for accent stripes and borders between layers</p>
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
      aria-hidden="true" className="preview-window-container w-full h-full rounded-md overflow-hidden flex items-end justify-center relative border border-border"
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

import { StudioShell } from '@/components/StudioShell';

function ChyronStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');

  const [session, setSession] = useState<any>(null);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [config, setConfig] = useState<ChyronConfig>(DEFAULT_CHYRON_CONFIG);
  
  const [selectedLayer, setSelectedLayer] = useState<string | null>('crawl');
  const [selectedPanel, setSelectedPanel] = useState<'layer' | 'layout' | 'export' | 'crawlBlocks'>('layer');
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [isCrawlExpanded, setIsCrawlExpanded] = useState<boolean>(true);

  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (queryId && session) {
        const { data } = await supabase.from('widget_configs').select('id, config').eq('id', queryId).single();
        if (data) {
          setActiveConfigId(data.id);
          setConfig(data.config as ChyronConfig);
        } else {
          toast.error('Chyron not found.');
          router.push('/dashboard');
        }
      } else {
        setConfig({ ...DEFAULT_CHYRON_CONFIG, name: 'New Chyron Widget' });
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
      toast.success('Chyron saved!');
    } else {
      const { data, error } = await supabase.from('widget_configs').insert({
        user_id: session.user.id,
        widget_type: 'crawl',
        config
      }).select('id').single();
      
      if (error) {
        toast.error('Failed to create chyron.');
      } else if (data) {
        setActiveConfigId(data.id);
        toast.success('New chyron created!');
        router.replace(`/crawl?id=${data.id}`);
      }
    }
    setSaving(false);
  };

  const handleCopy = () => {
    if (!activeConfigId) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/widgets/embed/crawl?id=${activeConfigId}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    toast.success('Widget URL copied to clipboard!');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, type } = result;
    
    if (type === 'CRAWL_BLOCK') {
      const reorderedBlocks = Array.from(config.crawl.blocks);
      const [movedBlock] = reorderedBlocks.splice(source.index, 1);
      reorderedBlocks.splice(destination.index, 0, movedBlock);
      setConfig({ ...config, crawl: { ...config.crawl, blocks: reorderedBlocks } });
    } else {
      const fullOrder = ['clock', 'logo', 'title', 'subheader', 'crawl'].sort((a, b) => {
        const idxA = config.layerOrder.indexOf(a as any);
        const idxB = config.layerOrder.indexOf(b as any);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
      const newOrder = Array.from(fullOrder);
      const [removed] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, removed);
      setConfig({ ...config, layerOrder: newOrder as any });
    }
  };

  const toggleBlockEnabled = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfig({
      ...config,
      crawl: {
        ...config.crawl,
        blocks: config.crawl.blocks.map(b => b.id === blockId ? { ...b, enabled: !b.enabled } : b)
      }
    });
  };

  const toggleLayerEnabled = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = layerId as keyof Pick<ChyronConfig, 'title' | 'subheader' | 'logo' | 'clock' | 'crawl'>;
    const currentLayer = config[key];
    if (currentLayer && typeof currentLayer === 'object' && 'enabled' in currentLayer) {
      const isCurrentlyEnabled = currentLayer.enabled !== false;
      setConfig({
        ...config,
        [key]: {
          ...currentLayer,
          enabled: !isCurrentlyEnabled,
        },
      });
    }
  };

  const addBlockFromSidebar = () => {
    const newBlock = {
      id: Math.random().toString(36).substr(2, 9),
      label: `News Item ${config.crawl.blocks.length + 1}`,
      text: '',
      enabled: true,
      color: '#ffffff'
    };
    setConfig({
      ...config,
      crawl: {
        ...config.crawl,
        blocks: [...config.crawl.blocks, newBlock]
      }
    });
    setSelectedLayer(`crawlBlock:${newBlock.id}`);
    setIsCrawlExpanded(true);
    toast.success('Added news block');
  };

  const settingsPanel = (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 p-1 bg-muted rounded-md shrink-0">
        <button
          type="button"
          onClick={() => setSelectedPanel('layer')}
          className={cn("py-1.5 flex-1 text-xs font-semibold rounded-sm transition-all", selectedPanel === 'layer' ? "bg-background shadow-2xs text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          Layers
        </button>
        <button
          type="button"
          onClick={() => { setSelectedPanel('layout'); setSelectedLayer(null); }}
          className={cn("py-1.5 flex-1 text-xs font-semibold rounded-sm transition-all", selectedPanel === 'layout' ? "bg-background shadow-2xs text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          Global Layout
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {selectedPanel === 'layer' && (
          <div className="flex flex-col gap-2 bg-muted/20 border border-border rounded-lg p-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Composition
            </span>
            <Droppable droppableId="layers-list" type="LAYER">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col">
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
                              className={cn(snapshot.isDragging && "z-50 shadow-lg rounded-md bg-card ring-1 ring-border")}
                            >
                              <div
                                onClick={() => { setSelectedLayer(layerId); setSelectedPanel('layer'); }}
                                className={cn(
                                  "flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors border-l-2",
                                  isSelected ? "bg-primary/10 border-primary text-primary" : snapshot.isDragging ? "bg-muted/80 border-transparent text-foreground" : "hover:bg-muted/40 border-transparent text-foreground",
                                  !isEnabled && "bg-muted/50 text-muted-foreground"
                                )}
                              >
                                <div {...provided.dragHandleProps} className="text-muted-foreground cursor-grab min-w-[16px] flex items-center justify-center">
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => toggleLayerEnabled(layerId, e)}
                                  className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  title={isEnabled ? `Hide ${layerId}` : `Show ${layerId}`}
                                  aria-label={isEnabled ? `Hide ${layerId}` : `Show ${layerId}`}
                                >
                                  {isEnabled ? (
                                    <Eye className="w-3.5 h-3.5 text-foreground" />
                                  ) : (
                                    <EyeOff className="w-3.5 h-3.5 text-muted-foreground/60" />
                                  )}
                                </button>
                                <span className="flex-1 text-xs font-semibold capitalize">{layerId}</span>
                              </div>
                              {layerId === 'crawl' && (
                                <div className={cn("ml-8 pl-2 border-l border-border mt-1 flex flex-col gap-1", !isCrawlExpanded && "hidden")}>
                                  <Droppable droppableId="crawl-blocks" type="CRAWL_BLOCK">
                                    {(provided) => (
                                      <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col">
                                        {config.crawl.blocks.map((block, idx) => {
                                          const isBlockActive = selectedLayer === `crawlBlock:${block.id}`;
                                          return (
                                            <Draggable key={block.id} draggableId={block.id} index={idx}>
                                              {(provided, snapshot) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  style={provided.draggableProps.style}
                                                >
                                                  <div
                                                    onClick={(e) => { e.stopPropagation(); setSelectedLayer(`crawlBlock:${block.id}`); setSelectedPanel('layer'); }}
                                                    className={cn("flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs transition-colors rounded-sm", isBlockActive ? "bg-primary/20 text-primary" : "hover:bg-muted", !block.enabled && "opacity-50")}
                                                  >
                                                    <div {...provided.dragHandleProps} className="cursor-grab shrink-0 text-muted-foreground flex items-center justify-center">
                                                       <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                                                    </div>
                                                    <button
                                                      type="button"
                                                      onClick={(e) => toggleBlockEnabled(block.id, e)}
                                                      className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                                      title={block.enabled ? "Hide block" : "Show block"}
                                                      aria-label={block.enabled ? "Hide block" : "Show block"}
                                                    >
                                                      {block.enabled ? (
                                                        <Eye className="w-3.5 h-3.5 text-foreground" />
                                                      ) : (
                                                        <EyeOff className="w-3.5 h-3.5 text-muted-foreground/60" />
                                                      )}
                                                    </button>
                                                    <span className="truncate">{block.label || 'Unnamed'}</span>
                                                  </div>
                                                </div>
                                              )}
                                            </Draggable>
                                          );
                                        })}
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>
                                  <button onClick={(e) => { e.stopPropagation(); addBlockFromSidebar(); }} className="text-xs text-primary hover:underline self-start mt-1 px-2">+ Add Block</button>
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
          </div>
        )}
      </DragDropContext>

      <div className="flex-1 min-h-[400px]">
        {selectedPanel === 'layer' && selectedLayer === 'title' && <TitleProperties config={config} onChange={setConfig} />}
        {selectedPanel === 'layer' && selectedLayer === 'subheader' && <SubheaderProperties config={config} onChange={setConfig} />}
        {selectedPanel === 'layer' && selectedLayer === 'logo' && <LogoProperties config={config} onChange={setConfig} />}
        {selectedPanel === 'layer' && selectedLayer === 'clock' && <ClockProperties config={config} onChange={setConfig} />}
        {selectedPanel === 'layer' && selectedLayer === 'crawl' && <CrawlProperties config={config} onChange={setConfig} />}
        {selectedPanel === 'layer' && selectedLayer?.startsWith('crawlBlock:') && <CrawlBlockProperties config={config} onChange={setConfig} blockId={selectedLayer.replace('crawlBlock:', '')} />}
        {selectedPanel === 'layout' && <LayoutProperties config={config} onChange={setConfig} />}
      </div>
    </div>
  );

  const previewCanvas = (
    <div className="w-full h-full flex items-end justify-center pb-8 px-4 overflow-hidden">
      <div className="w-full max-w-5xl aspect-video shadow-2xl rounded-xl border border-border/50 overflow-hidden relative">
         <ChyronCardPreview config={config} />
      </div>
    </div>
  );

  if (isInitializing) return <div className="p-10 text-sm text-muted-foreground">Loading Chyron Studio...</div>;

  return (
    <StudioShell
      title="Chyron Studio"
      icon={<Layers className="w-4 h-4" />}
      widgetName={config.name || ''}
      onNameChange={(n) => setConfig({ ...config, name: n })}
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

export default function ChyronBuilder() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted-foreground">Loading studio...</div>}>
      <ChyronStudioContent />
    </Suspense>
  );
}
