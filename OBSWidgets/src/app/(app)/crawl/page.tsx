'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { DragHandleDots2Icon, ClockIcon, CalendarIcon, ArrowLeftIcon } from '@radix-ui/react-icons';
import * as Popover from '@radix-ui/react-popover';
import ChyronPreview from '@/components/ChyronPreview';
import { ColorInputWithPalette } from '@/components/ColorInputWithPalette';
import { TextFormattingToolbar } from '@/components/TextFormattingToolbar';
import { ObsExportCard } from '@/components/ObsExportCard';
import { Card, TextField, SegmentedControl, Switch, Text, Heading, Button, IconButton, Flex, Box, Grid, Select, RadioCards, CheckboxCards, Slider, Tooltip, Badge } from '@radix-ui/themes';
import { BROADCAST_PRESETS } from '@/lib/presets';
import type { ChyronConfig, CrawlBlock } from '@/types/chyron';
import { DEFAULT_CHYRON_CONFIG } from '@/types/chyron';

// ─── Drag Handle Icon ──────────────────────────────────────────────
const DragHandle = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.4, cursor: 'grab', flexShrink: 0 }}>
    <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
    <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
    <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
  </svg>
);

// ─── Eye Toggle Icon ───────────────────────────────────────────────
const EyeIcon = ({ visible }: { visible: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: visible ? 1 : 0.3 }}>
    {visible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

// ─── Trash Icon ────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);



const LAYER_LABELS: Record<string, string> = {
  title: 'Title Bar',
  logo: 'Logo Bug',
  clock: 'Clock / Date',
  crawl: 'Crawl Ticker',
};

// ─── Properties: Title ─────────────────────────────────────────────
function TitleProperties({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const t = config.title;
  const update = (patch: Partial<typeof t>) => onChange({ ...config, title: { ...t, ...patch } });

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>TITLE BAR</h3>
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

// ─── Properties: Logo ──────────────────────────────────────────────
function LogoProperties({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const l = config.logo;
  const update = (patch: Partial<typeof l>) => onChange({ ...config, logo: { ...l, ...patch } });

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>LOGO BUG</h3>
      
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>MODE</label>
          <SegmentedControl.Root size="1" value={l.mode} onValueChange={val => update({ mode: val as any })} style={{ width: '100%' }}>
            <SegmentedControl.Item value="TEXT">TEXT</SegmentedControl.Item>
            <SegmentedControl.Item value="IMAGE">IMAGE</SegmentedControl.Item>
          </SegmentedControl.Root>
        </div>
        
        <div style={{ flex: 2, minWidth: '300px' }}>
          {l.mode === 'TEXT' ? (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>LOGO TEXT</label>
              <TextField.Root size="2" value={l.text} onChange={e => update({ text: e.target.value })} placeholder="e.g. CNN, LIVE, C-SPAN" />
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>IMAGE URL</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <TextField.Root size="2" value={l.imageUrl} onChange={e => update({ imageUrl: e.target.value })} placeholder="Paste image URL" style={{ flex: 1 }} />
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 12px', backgroundColor: 'var(--module-grey)', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
                  UPLOAD
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const toastId = toast.loading('Uploading image...');
                    try {
                      const fileExt = file.name.split('.').pop();
                      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
                      const { data, error } = await supabase.storage.from('assets').upload(`chyron/${fileName}`, file, { upsert: true });
                      if (error) {
                        const { data: data2, error: error2 } = await supabase.storage.from('images').upload(`chyron/${fileName}`, file, { upsert: true });
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

      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        padding: '4px', 
        width: '100%', 
        borderRadius: '6px', 
        backgroundColor: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        flexWrap: 'wrap',
        gap: '4px'
      }}>
        {/* Toggles */}
        <Flex gap="1" align="center">
          <Tooltip content="Span All Rows">
            <IconButton 
              variant={l.spanRows ? "soft" : "ghost"} 
              color={l.spanRows ? "blue" : "gray"}
              onClick={() => update({ spanRows: !l.spanRows })}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </IconButton>
          </Tooltip>
          {l.mode === 'IMAGE' && (
            <Tooltip content="Show LIVE Badge">
              <IconButton 
                variant={l.showLiveBadge !== false ? "soft" : "ghost"} 
                color={l.showLiveBadge !== false ? "blue" : "gray"}
                onClick={() => update({ showLiveBadge: l.showLiveBadge === false })}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
              </IconButton>
            </Tooltip>
          )}
        </Flex>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Font & Position & Aspect Ratio */}
        <Tooltip content="Font Family">
          <Select.Root size="1" value={l.fontFamily} onValueChange={val => update({ fontFamily: val })}>
            <Select.Trigger variant="ghost" color="gray" />
            <Select.Content>
              <Select.Item value="Inter">Inter</Select.Item>
              <Select.Item value="Outfit">Outfit</Select.Item>
              <Select.Item value="Bebas Neue">Bebas Neue</Select.Item>
            </Select.Content>
          </Select.Root>
        </Tooltip>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

        <Tooltip content="Position">
          <Select.Root size="1" value={l.position} onValueChange={val => update({ position: val as any })}>
            <Select.Trigger variant="ghost" color="gray" />
            <Select.Content>
              <Select.Item value="LEFT">Left</Select.Item>
              <Select.Item value="RIGHT">Right</Select.Item>
            </Select.Content>
          </Select.Root>
        </Tooltip>

        {l.mode === 'IMAGE' && (
          <>
            <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />
            <Tooltip content="Aspect Ratio">
              <Select.Root size="1" value={l.aspectRatio || '1:1'} onValueChange={val => update({ aspectRatio: val as any })}>
                <Select.Trigger variant="ghost" color="gray" />
                <Select.Content>
                  <Select.Item value="1:1">1:1 Square</Select.Item>
                  <Select.Item value="16:9">16:9 Wide</Select.Item>
                </Select.Content>
              </Select.Root>
            </Tooltip>
          </>
        )}

        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Colors */}
        <Popover.Root>
          <Tooltip content="Text Color">
            <Popover.Trigger asChild>
              <IconButton variant="ghost" color="gray" aria-label="Text Color" style={{ display: 'flex', gap: '6px', alignItems: 'center', width: 'auto', padding: '0 8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>T</span>
                <div style={{ width: '14px', height: '14px', backgroundColor: l.textColor, borderRadius: '3px', border: '1px solid var(--border-subtle)' }} />
              </IconButton>
            </Popover.Trigger>
          </Tooltip>
          <Popover.Portal>
            <Popover.Content sideOffset={5} style={{ backgroundColor: 'var(--bg-panel)', padding: '15px', borderRadius: '8px', zIndex: 100, border: '1px solid var(--border-subtle)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>TEXT COLOR</label>
              <ColorInputWithPalette value={l.textColor} onChange={val => update({ textColor: val })} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <Popover.Root>
          <Tooltip content="Background Color">
            <Popover.Trigger asChild>
              <IconButton variant="ghost" color="gray" aria-label="Background Color" style={{ display: 'flex', gap: '6px', alignItems: 'center', width: 'auto', padding: '0 8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>BG</span>
                <div style={{ width: '14px', height: '14px', backgroundColor: l.bgColor, borderRadius: '3px', border: '1px solid var(--border-subtle)' }} />
              </IconButton>
            </Popover.Trigger>
          </Tooltip>
          <Popover.Portal>
            <Popover.Content sideOffset={5} style={{ backgroundColor: 'var(--bg-panel)', padding: '15px', borderRadius: '8px', zIndex: 100, border: '1px solid var(--border-subtle)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>BACKGROUND</label>
              <ColorInputWithPalette value={l.bgColor} onChange={val => update({ bgColor: val })} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

      </div>
    </Card>
  );
}

// ─── Properties: Subheader ─────────────────────────────────────────────
function SubheaderProperties({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const s = config.subheader;
  const update = (patch: Partial<typeof s>) => onChange({ ...config, subheader: { ...s, ...patch } });

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>SUBHEADER</h3>
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

// ─── Properties: Clock ─────────────────────────────────────────────
function ClockProperties({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const c = config.clock;
  const update = (patch: Partial<typeof c>) => onChange({ ...config, clock: { ...c, ...patch } });

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>CLOCK / DATE</h3>
        <Flex align="center" gap="2">
          <Switch size="1" checked={c.enabled !== false} onCheckedChange={checked => update({ enabled: checked })} />
          <Text size="2" weight="bold" color="gray">ENABLE CLOCK</Text>
        </Flex>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        padding: '4px', 
        width: '100%', 
        borderRadius: '6px', 
        backgroundColor: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        flexWrap: 'wrap',
        gap: '4px'
      }}>
        {/* Format */}
        <Tooltip content="Time Format">
          <Select.Root size="1" value={c.format} onValueChange={val => update({ format: val as any })}>
            <Select.Trigger variant="ghost" color="gray" />
            <Select.Content>
              <Select.Item value="12HR">12 HR</Select.Item>
              <Select.Item value="24HR">24 HR</Select.Item>
            </Select.Content>
          </Select.Root>
        </Tooltip>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Timezone */}
        <Tooltip content="Timezone">
          <Select.Root size="1" value={c.timezone} onValueChange={val => update({ timezone: val })}>
            <Select.Trigger variant="ghost" color="gray" />
            <Select.Content>
              <Select.Item value="LOCAL">Local Time</Select.Item>
              <Select.Item value="UTC">UTC</Select.Item>
              <Select.Item value="America/New_York">EST</Select.Item>
              <Select.Item value="America/Los_Angeles">PST</Select.Item>
              <Select.Item value="Europe/London">GMT</Select.Item>
              <Select.Item value="Asia/Tokyo">JST</Select.Item>
            </Select.Content>
          </Select.Root>
        </Tooltip>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Position */}
        <Tooltip content="Position">
          <Select.Root size="1" value={c.position} onValueChange={val => update({ position: val as any })}>
            <Select.Trigger variant="ghost" color="gray" />
            <Select.Content>
              <Select.Item value="LEFT">Left Align</Select.Item>
              <Select.Item value="RIGHT">Right Align</Select.Item>
            </Select.Content>
          </Select.Root>
        </Tooltip>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Size */}
        <Tooltip content="Font Size">
          <Select.Root size="1" value={c.fontSize === 0.82 ? '0.82' : c.fontSize === 1.2 ? '1.2' : '1.0'} onValueChange={val => update({ fontSize: parseFloat(val) })}>
            <Select.Trigger variant="ghost" color="gray" />
            <Select.Content>
              <Select.Item value="0.82">Small</Select.Item>
              <Select.Item value="1.0">Medium</Select.Item>
              <Select.Item value="1.2">Large</Select.Item>
            </Select.Content>
          </Select.Root>
        </Tooltip>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Toggles */}
        <Flex gap="1" align="center">
          <Tooltip content="Show Seconds">
            <IconButton 
              variant={c.showSeconds ? "soft" : "ghost"} 
              color={c.showSeconds ? "blue" : "gray"}
              onClick={() => update({ showSeconds: !c.showSeconds })}
            >
              <ClockIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content="Show Date">
            <IconButton 
              variant={c.showDate ? "soft" : "ghost"} 
              color={c.showDate ? "blue" : "gray"}
              onClick={() => update({ showDate: !c.showDate })}
            >
              <CalendarIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content="Blink Colon">
            <IconButton 
              variant={c.blinkColon ? "soft" : "ghost"} 
              color={c.blinkColon ? "blue" : "gray"}
              onClick={() => update({ blinkColon: !c.blinkColon })}
            >
              <span style={{ fontWeight: 'bold' }}>:</span>
            </IconButton>
          </Tooltip>
        </Flex>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Colors */}
        <Popover.Root>
          <Tooltip content="Text Color">
            <Popover.Trigger asChild>
              <IconButton variant="ghost" color="gray" aria-label="Text Color" style={{ display: 'flex', gap: '6px', alignItems: 'center', width: 'auto', padding: '0 8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>T</span>
                <div style={{ width: '14px', height: '14px', backgroundColor: c.textColor, borderRadius: '3px', border: '1px solid var(--border-subtle)' }} />
              </IconButton>
            </Popover.Trigger>
          </Tooltip>
          <Popover.Portal>
            <Popover.Content sideOffset={5} style={{ backgroundColor: 'var(--bg-panel)', padding: '15px', borderRadius: '8px', zIndex: 100, border: '1px solid var(--border-subtle)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>TEXT COLOR</label>
              <ColorInputWithPalette value={c.textColor} onChange={val => update({ textColor: val })} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <Popover.Root>
          <Tooltip content="Background Color">
            <Popover.Trigger asChild>
              <IconButton variant="ghost" color="gray" aria-label="Background Color" style={{ display: 'flex', gap: '6px', alignItems: 'center', width: 'auto', padding: '0 8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>BG</span>
                <div style={{ width: '14px', height: '14px', backgroundColor: c.bgColor, borderRadius: '3px', border: '1px solid var(--border-subtle)' }} />
              </IconButton>
            </Popover.Trigger>
          </Tooltip>
          <Popover.Portal>
            <Popover.Content sideOffset={5} style={{ backgroundColor: 'var(--bg-panel)', padding: '15px', borderRadius: '8px', zIndex: 100, border: '1px solid var(--border-subtle)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>BACKGROUND</label>
              <ColorInputWithPalette value={c.bgColor} onChange={val => update({ bgColor: val })} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

      </div>
    </Card>
  );
}

// ─── Properties: Crawl + Block Manager ─────────────────────────────
function CrawlProperties({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const cr = config.crawl;
  const updateCrawl = (patch: Partial<typeof cr>) => onChange({ ...config, crawl: { ...cr, ...patch } });

  const addBlock = () => {
    const newBlock: CrawlBlock = {
      id: `block-${Date.now()}`,
      label: `Block ${cr.blocks.length + 1}`,
      text: 'NEW CRAWL TEXT',
      enabled: true,
    };
    updateCrawl({ blocks: [...cr.blocks, newBlock] });
  };

  const updateBlock = (id: string, patch: Partial<CrawlBlock>) => {
    updateCrawl({ blocks: cr.blocks.map(b => b.id === id ? { ...b, ...patch } : b) });
  };

  const deleteBlock = (id: string) => {
    if (cr.blocks.length <= 1) {
      toast.error('You need at least one crawl block');
      return;
    }
    updateCrawl({ blocks: cr.blocks.filter(b => b.id !== id) });
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= cr.blocks.length) return;
    const newBlocks = [...cr.blocks];
    const [moved] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, moved);
    updateCrawl({ blocks: newBlocks });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Crawl Settings */}
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>CRAWL SETTINGS</h3>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          padding: '4px', 
          width: '100%', 
          borderRadius: '6px', 
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          flexWrap: 'wrap',
          gap: '4px'
        }}>
          {/* Speed */}
          <Tooltip content="Scroll Speed">
            <Select.Root size="1" value={cr.speed} onValueChange={val => updateCrawl({ speed: val as any })}>
              <Select.Trigger variant="ghost" color="gray" />
              <Select.Content>
                <Select.Item value="SLOW">Slow</Select.Item>
                <Select.Item value="NORMAL">Normal</Select.Item>
                <Select.Item value="FAST">Fast</Select.Item>
              </Select.Content>
            </Select.Root>
          </Tooltip>

          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

          {/* Separator */}
          <Tooltip content="Item Separator">
            <Select.Root size="1" value={cr.separator} onValueChange={val => updateCrawl({ separator: val })}>
              <Select.Trigger variant="ghost" color="gray" />
              <Select.Content>
                <Select.Item value=" ★ ">★ Star</Select.Item>
                <Select.Item value=" | ">| Pipe</Select.Item>
                <Select.Item value=" /// ">/// Slashes</Select.Item>
                <Select.Item value=" ••• ">••• Dots</Select.Item>
                <Select.Item value="   "> (Space)</Select.Item>
              </Select.Content>
            </Select.Root>
          </Tooltip>

          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

          {/* Font & Size */}
          <Tooltip content="Font Family">
            <Select.Root size="1" value={cr.fontFamily} onValueChange={val => updateCrawl({ fontFamily: val })}>
              <Select.Trigger variant="ghost" color="gray" />
              <Select.Content>
                <Select.Item value="Inter">Inter</Select.Item>
                <Select.Item value="Outfit">Outfit</Select.Item>
                <Select.Item value="Roboto Mono">Roboto Mono</Select.Item>
                <Select.Item value="Bebas Neue">Bebas Neue</Select.Item>
              </Select.Content>
            </Select.Root>
          </Tooltip>

          <Tooltip content="Font Size">
            <Select.Root size="1" value={cr.fontSize === 0.82 ? '0.82' : cr.fontSize === 1.2 ? '1.2' : '1.0'} onValueChange={val => updateCrawl({ fontSize: parseFloat(val) })}>
              <Select.Trigger variant="ghost" color="gray" />
              <Select.Content>
                <Select.Item value="0.82">Small</Select.Item>
                <Select.Item value="1.0">Medium</Select.Item>
                <Select.Item value="1.2">Large</Select.Item>
              </Select.Content>
            </Select.Root>
          </Tooltip>

          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

          {/* Colors */}
          <Popover.Root>
            <Tooltip content="Text Color">
              <Popover.Trigger asChild>
                <IconButton variant="ghost" color="gray" aria-label="Text Color" style={{ display: 'flex', gap: '6px', alignItems: 'center', width: 'auto', padding: '0 8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>T</span>
                  <div style={{ width: '14px', height: '14px', backgroundColor: cr.textColor, borderRadius: '3px', border: '1px solid var(--border-subtle)' }} />
                </IconButton>
              </Popover.Trigger>
            </Tooltip>
            <Popover.Portal>
              <Popover.Content sideOffset={5} style={{ backgroundColor: 'var(--bg-panel)', padding: '15px', borderRadius: '8px', zIndex: 100, border: '1px solid var(--border-subtle)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>TEXT COLOR</label>
                <ColorInputWithPalette value={cr.textColor} onChange={val => updateCrawl({ textColor: val })} />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <Popover.Root>
            <Tooltip content="Background Color">
              <Popover.Trigger asChild>
                <IconButton variant="ghost" color="gray" aria-label="Background Color" style={{ display: 'flex', gap: '6px', alignItems: 'center', width: 'auto', padding: '0 8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>BG</span>
                  <div style={{ width: '14px', height: '14px', backgroundColor: cr.bgColor, borderRadius: '3px', border: '1px solid var(--border-subtle)' }} />
                </IconButton>
              </Popover.Trigger>
            </Tooltip>
            <Popover.Portal>
              <Popover.Content sideOffset={5} style={{ backgroundColor: 'var(--bg-panel)', padding: '15px', borderRadius: '8px', zIndex: 100, border: '1px solid var(--border-subtle)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>BACKGROUND</label>
                <ColorInputWithPalette value={cr.bgColor} onChange={val => updateCrawl({ bgColor: val })} />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

        </div>
      </Card>
    </div>
  );
}

// ─── Properties: Crawl Blocks Manager ──────────────────────────────
function CrawlBlocksManager({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
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

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedBlockIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedBlockIds(newSet);
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
    setShowBulkDeleteConfirm(false);
    setSelectedBlockIds(new Set());
    setExpandedId(null);
  };

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>CRAWL BLOCKS</h3>
        <Button onClick={() => addBlockAt(0)} size="1" color="amber" variant="solid" style={{ fontWeight: 700 }}>
          + ADD BLOCK
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="crawl-blocks-accordion">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cr.blocks.map((block, i) => (
                  <Draggable key={block.id} draggableId={block.id} index={i}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          display: 'flex', flexDirection: 'column',
                          backgroundColor: block.enabled ? '#f8fafc' : '#f1f5f9',
                          borderRadius: '8px', border: '1px solid var(--border-subtle)',
                          opacity: block.enabled ? 1 : 0.6,
                          overflow: 'hidden',
                          ...provided.draggableProps.style,
                        }}
                      >
                        {/* Header (Accordion Toggle) */}
                        <div
                          onClick={() => setExpandedId(expandedId === block.id ? null : block.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 16px', cursor: 'pointer',
                            backgroundColor: expandedId === block.id ? 'var(--module-grey)' : 'transparent',
                          }}
                        >
                          <div {...provided.dragHandleProps} style={{ color: 'var(--text-muted)', cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                            <DragHandleDots2Icon />
                          </div>

                          <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedBlockIds.has(block.id)}
                              onChange={(e) => {
                                const newSet = new Set(selectedBlockIds);
                                if (e.target.checked) newSet.add(block.id);
                                else newSet.delete(block.id);
                                setSelectedBlockIds(newSet);
                              }}
                              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                            />
                          </div>

                          <button
                            onClick={e => { e.stopPropagation(); updateBlock(block.id, { enabled: !block.enabled }); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                          >
                            <EyeIcon visible={block.enabled} />
                          </button>

                          <span style={{ flex: 1, fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                            {block.label || 'Unnamed Block'}
                          </span>

                          <span style={{ color: 'var(--text-muted)', transform: expandedId === block.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                            ▼
                          </span>
                        </div>

                        {/* Body */}
                        {expandedId === block.id && (
                          <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>LABEL</label>
                              <TextField.Root
                                size="2"
                                value={block.label}
                                onChange={e => updateBlock(block.id, { label: e.target.value })}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>CRAWL TEXT</label>
                              <textarea
                                value={block.text}
                                onChange={e => updateBlock(block.id, { text: e.target.value })}
                                rows={3}
                                className="form-input"
                                style={{ resize: 'vertical', fontSize: '14px', width: '100%' }}
                              />
                            </div>

                            <Button
                              onClick={() => deleteBlock(block.id)}
                              size="1"
                              color="red"
                              variant="soft"
                              style={{ width: '100%', marginTop: '5px' }}
                            >
                              DELETE BLOCK
                            </Button>
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

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-rigid)' }}>
        {selectedBlockIds.size > 0 && (
          !showBulkDeleteConfirm ? (
            <Button
              onClick={() => setShowBulkDeleteConfirm(true)}
              size="2"
              color="red"
              variant="outline"
              style={{ width: '100%' }}
            >
              DELETE SELECTED ({selectedBlockIds.size})
            </Button>
          ) : (
            <Box p="3" style={{ backgroundColor: 'var(--red-3)', borderRadius: '8px', border: '1px solid var(--red-6)' }}>
              <Text size="2" weight="bold" color="red" mb="2" as="p">
                Are you sure you want to delete {selectedBlockIds.size} block{selectedBlockIds.size !== 1 ? 's' : ''}? This action cannot be undone.
              </Text>
              <Flex gap="2">
                <Button
                  onClick={bulkDeleteBlocks}
                  size="2"
                  color="red"
                  variant="solid"
                  style={{ flex: 1, cursor: 'pointer' }}
                >
                  YES, DELETE
                </Button>
                <Button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  size="2"
                  color="red"
                  variant="soft"
                  style={{ flex: 1, cursor: 'pointer' }}
                >
                  CANCEL
                </Button>
              </Flex>
            </Box>
          )
        )}
        {selectedBlockIds.size === 0 && (
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Select blocks to bulk delete
          </p>
        )}
      </div>
    </Card>
  );
}

// ─── Properties: Global Layout ─────────────────────────────────────
function LayoutProperties({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const ly = config.layout;
  const update = (patch: Partial<typeof ly>) => onChange({ ...config, layout: { ...ly, ...patch } });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Curated Broadcast Themes */}
      <Card size="2" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Flex justify="between" align="center">
          <Heading size="3" style={{ color: 'var(--text-secondary)' }}>CURATED BROADCAST THEMES</Heading>
          <Badge color="indigo" size="1" variant="surface">1-Click Apply</Badge>
        </Flex>
        <Text size="2" color="gray">
          Apply harmonious broadcast palettes designed for professional stream aesthetics:
        </Text>
        <Grid columns="2" gap="2">
          {BROADCAST_PRESETS.map(preset => (
            <Button
              key={preset.name}
              variant="surface"
              size="2"
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
              style={{ justifyContent: 'flex-start', gap: '8px', cursor: 'pointer', height: 'auto', padding: '8px 10px' }}
            >
              <Flex gap="1" align="center">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: preset.accentColor }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: preset.bgColor, border: '1px solid var(--border-subtle)' }} />
              </Flex>
              <Text size="2" weight="medium">{preset.name}</Text>
            </Button>
          ))}
        </Grid>
      </Card>

      <Card style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>LAYOUT & BACKGROUND</h3>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>CHYRON NAME</label>
          <TextField.Root size="2" value={config.name} onChange={e => onChange({ ...config, name: e.target.value })} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>BACKGROUND MODE</label>
          <SegmentedControl.Root size="1" value={ly.bgMode} onValueChange={val => update({ bgMode: val as any })} style={{ width: '100%' }}>
            <SegmentedControl.Item value="TRANSPARENT">TRANSPARENT</SegmentedControl.Item>
            <SegmentedControl.Item value="SOLID">SOLID</SegmentedControl.Item>
          </SegmentedControl.Root>
        </div>
        {ly.bgMode === 'SOLID' && (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>BACKGROUND COLOR</label>
            <ColorInputWithPalette value={ly.bgColor} onChange={val => update({ bgColor: val })} />
          </div>
        )}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>ACCENT COLOR</label>
          <ColorInputWithPalette value={ly.accentColor} onChange={val => update({ accentColor: val })} />
          <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>Used for accent stripes and borders between layers</p>
        </div>
      </Card>
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
  const [selectedLayer, setSelectedLayer] = useState<string | null>('title');
  const [selectedPanel, setSelectedPanel] = useState<'layer' | 'layout' | 'export' | 'crawlBlocks'>('layer');

  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // ── Auth ────────────────────────────────────────────────────────
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

  // ── Autosave ───────────────────────────────────────────────────
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

  // ── Create / Load / Delete ─────────────────────────────────────
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
    
    // Inject any missing layers into the loaded order
    const loadedOrder = c?.layerOrder || DEFAULT_CHYRON_CONFIG.layerOrder;
    const finalOrder = [...loadedOrder];
    ['title', 'subheader', 'crawl', 'logo', 'clock'].forEach(l => {
      if (!finalOrder.includes(l as any)) finalOrder.push(l as any);
    });

    // Merge with defaults to handle missing fields from older configs
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
        <div>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 500 }}>Delete this chyron?</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await supabase.from('widget_configs').delete().eq('id', id);
                setConfigsList(configsList.filter(c => c.id !== id));
                if (activeConfigId === id) setActiveConfigId(null);
                toast.success('Chyron deleted');
              }}
              style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
            >Delete</button>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{ padding: '6px 12px', background: '#f8fafc', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
            >Cancel</button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/widgets/embed/crawl?id=${activeConfigId}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // ── Layer reorder ──────────────────────────────────────────────
  const moveLayer = (layerId: string, direction: -1 | 1) => {
    const order = [...config.layerOrder];
    ['title', 'subheader', 'crawl', 'logo', 'clock'].forEach(l => {
      if (!order.includes(l as any)) order.push(l as any);
    });
    const idx = order.indexOf(layerId as any);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= order.length) return;
    [order[idx], order[newIdx]] = [order[newIdx], order[idx]];
    setConfig({ ...config, layerOrder: order });
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
    } else if (result.source.droppableId === 'blocks-list') {
      const newBlocks = Array.from(config.crawl.blocks);
      const [reorderedItem] = newBlocks.splice(result.source.index, 1);
      newBlocks.splice(result.destination.index, 0, reorderedItem);
      setConfig({ ...config, crawl: { ...config.crawl, blocks: newBlocks } });
    }
  };

  const toggleLayer = (layerId: string) => {
    const key = layerId as keyof Pick<ChyronConfig, 'title' | 'subheader' | 'logo' | 'clock' | 'crawl'>;
    const layer = config[key];
    if (layer && 'enabled' in layer) {
      setConfig({ ...config, [key]: { ...layer, enabled: !layer.enabled } });
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  if (!session) return <main style={{ padding: '40px' }}><p>Please <Link href="/auth">Sign In</Link></p></main>;

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>

      {/* ── LEFT SIDEBAR ──────────────────────────────────────── */}
      <aside style={{
        width: '280px', borderRight: '1px solid var(--border-rigid)',
        display: 'flex', flexDirection: 'column', backgroundColor: 'var(--module-bg)',
        flexShrink: 0,
      }}>
        {activeConfigId ? (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-rigid)' }}>
            <Button variant="ghost" size="2" onClick={handleBackToList} style={{ marginLeft: '-8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
              <ArrowLeftIcon /> Back to Chyrons
            </Button>
            <Heading size="3">{config.name || 'Chyron'}</Heading>
          </div>
        ) : (
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-rigid)' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'uppercase' }}>YOUR CHYRONS</h2>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeConfigId ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* LAYERS header */}
                <div style={{ padding: '16px 20px 8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                  LAYERS
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
                                  onClick={() => { setSelectedLayer(layerId); setSelectedPanel('layer'); }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '12px 16px',
                                    backgroundColor: isSelected ? 'var(--module-grey)' : (snapshot.isDragging ? 'var(--module-grey)' : 'transparent'),
                                    borderLeft: isSelected ? '3px solid var(--active-amber)' : '3px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.15s ease',
                                    opacity: isEnabled ? 1 : 0.4,
                                    boxShadow: snapshot.isDragging ? '0 5px 15px rgba(0,0,0,0.2)' : 'none',
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  {/* Drag Handle */}
                                  <div
                                    {...provided.dragHandleProps}
                                    style={{
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      color: 'var(--text-muted)',
                                      cursor: 'grab',
                                    }}
                                  >
                                    <DragHandleDots2Icon />
                                  </div>

                                  {/* Visibility toggle */}
                                  <button
                                    onClick={e => { e.stopPropagation(); toggleLayer(layerId); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
                                    aria-label={isEnabled ? `Hide ${LAYER_LABELS[layerId]}` : `Show ${LAYER_LABELS[layerId]}`}
                                  >
                                    <EyeIcon visible={isEnabled} />
                                  </button>

                                  {/* Label */}
                                  <span style={{
                                    flex: 1, fontSize: '13px', fontWeight: 600,
                                    color: isSelected ? 'var(--active-amber)' : 'var(--text-primary)',
                                  }}>
                                    {LAYER_LABELS[layerId] || layerId}
                                  </span>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Divider */}
                <div style={{ borderTop: '1px solid var(--border-rigid)', margin: '8px 0' }} />

                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ padding: '8px 12px 4px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                    GLOBAL
                  </div>
                  <Button
                    size="3"
                    variant={selectedPanel === 'crawlBlocks' ? 'soft' : 'ghost'}
                    color={selectedPanel === 'crawlBlocks' ? 'amber' : 'gray'}
                    onClick={() => { setSelectedPanel('crawlBlocks'); setSelectedLayer(null); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '16px' }}
                  >
                    <Text weight="bold" size="2">Crawl Blocks</Text>
                  </Button>
                  <Button
                    size="3"
                    variant={selectedPanel === 'layout' ? 'soft' : 'ghost'}
                    color={selectedPanel === 'layout' ? 'amber' : 'gray'}
                    onClick={() => { setSelectedPanel('layout'); setSelectedLayer(null); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '16px' }}
                  >
                    <Text weight="bold" size="2">Layout & Background</Text>
                  </Button>
                  <Button
                    size="3"
                    variant={selectedPanel === 'export' ? 'soft' : 'ghost'}
                    color={selectedPanel === 'export' ? 'amber' : 'gray'}
                    onClick={() => { setSelectedPanel('export'); setSelectedLayer(null); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '16px' }}
                  >
                    <Text weight="bold" size="2">Export & OBS</Text>
                  </Button>
                </div>
              </div>
            </DragDropContext>
          ) : (
            <div style={{ padding: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '15px' }}>
                Build a broadcast-style chyron with a title bar, logo, clock, and scrolling crawl.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                <span>STORAGE</span>
                <span style={{ color: configsList.length >= 3 ? '#ef4444' : 'var(--vocals-green)' }}>{configsList.length} / 3 USED</span>
              </div>
            </div>
          )}
        </div>
        
        {activeConfigId && (
          <div style={{ padding: '20px', borderTop: '1px solid var(--border-rigid)', marginTop: 'auto' }}>
            <button onClick={handleBackToList} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, width: '100%', padding: '10px', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--module-grey)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              &larr; BACK TO CHYRONS
            </button>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: 'var(--chassis-black)' }}>

        {!activeConfigId ? (
          /* ── Dashboard View ─────────────────────────────────── */
          <div style={{ padding: '40px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
            {loadingList ? <p>Loading...</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {configsList.map(c => (
                  <Card key={c.id} onClick={() => loadEditor(c.id, c.config)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease', padding: 0 }} className="hover-card">
                    <Box p="4">
                      <div className="preview-window-container" style={{ width: '100%', aspectRatio: '16/5', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}>
                        <ChyronPreview config={c.config} scale={0.35} />
                      </div>
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <Text size="3" weight="bold">{c.config.name || 'Unnamed'}</Text>
                        <IconButton size="1" color="gray" variant="ghost" onClick={e => deleteConfig(c.id, e)} title="Delete chyron">
                          <TrashIcon />
                        </IconButton>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.config.crawl.enabled ? 'var(--vocals-green)' : 'var(--border-rigid)' }} />
                          {c.config.crawl.enabled ? `${c.config.crawl.blocks.filter((b: any) => b.enabled).length} Active Crawl Blocks` : 'Crawl Disabled'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.config.logo.enabled ? 'var(--active-amber)' : 'var(--border-rigid)' }} />
                          {c.config.logo.enabled ? 'Logo Enabled' : 'Logo Disabled'}
                        </div>
                      </div>

                      <Flex gap="2" onClick={e => e.stopPropagation()} style={{ marginTop: 'auto' }}>
                        <TextField.Root
                          size="1"
                          readOnly
                          value={typeof window !== 'undefined' ? `${window.location.origin}/widgets/embed/crawl?id=${c.id}` : ''}
                          onClick={e => (e.target as HTMLInputElement).select()}
                          style={{ flex: 1 }}
                        />
                        <Button
                          size="1"
                          variant="solid"
                          color="gray"
                          onClick={e => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`${window.location.origin}/widgets/embed/crawl?id=${c.id}`);
                            toast.success('URL copied to clipboard!');
                          }}
                        >
                          COPY
                        </Button>
                      </Flex>
                    </Box>
                  </Card>
                ))}
                {configsList.length < 3 && (
                  <Card onClick={handleCreateNew} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px', border: '2px dashed var(--border-rigid)', background: 'transparent' }}>
                    <Text color="amber" weight="bold">+ CREATE NEW CHYRON</Text>
                  </Card>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── Editor View ────────────────────────────────────── */
          <>
            {/* Live Preview Header */}
            <div style={{
              position: 'sticky', top: 0, zIndex: 10,
              flex: '0 0 auto', padding: '40px 20px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-panel)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              <div style={{ display: 'flex', width: '100%', maxWidth: '960px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{config.name.toUpperCase()}</h2>
                <span style={{ color: saving ? 'var(--active-amber)' : 'var(--vocals-green)', fontSize: '12px', fontWeight: 700 }}>
                  {saving ? 'SAVING...' : '✓ SAVED'}
                </span>
              </div>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden', width: '100%', maxWidth: '960px', marginBottom: '16px' }} className="preview-window-container">
                <ChyronPreview config={config} scale={0.5} />
              </div>
              <Flex gap="2" style={{ width: '100%', maxWidth: '960px' }}>
                <TextField.Root
                  size="2"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/widgets/embed/crawl?id=${activeConfigId}` : ''}
                  onClick={e => (e.target as HTMLInputElement).select()}
                  style={{ flex: 1 }}
                />
                <Button
                  size="2"
                  onClick={handleCopy}
                  variant="solid"
                  color={copySuccess ? 'green' : undefined}
                  style={{ padding: '0 20px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {copySuccess ? '✓ COPIED URL' : 'COPY WIDGET URL'}
                </Button>
              </Flex>
            </div>

            {/* Properties Panel */}
            <div style={{ flex: 1, padding: '30px 40px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
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
              {selectedPanel === 'layer' && selectedLayer === 'crawl' && (
                <CrawlProperties config={config} onChange={setConfig} />
              )}
              {selectedPanel === 'layout' && (
                <LayoutProperties config={config} onChange={setConfig} />
              )}
              {selectedPanel === 'crawlBlocks' && (
                <CrawlBlocksManager config={config} onChange={setConfig} />
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
          </>
        )}

      </main>
    </div>
  );
}

export default function ChyronBuilder() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Loading Chyron Studio...</div>}>
      <ChyronBuilderContent />
    </Suspense>
  );
}
