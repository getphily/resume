'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Grid, Card, Heading, Text, Button, Flex, Box, IconButton, Badge, Checkbox, Tooltip } from '@radix-ui/themes';
import { 
  CopyIcon, 
  CheckIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  DragHandleDots2Icon, 
  TrashIcon, 
  Pencil1Icon,
  PlusIcon,
  ClockIcon,
  StopwatchIcon,
  ViewHorizontalIcon,
  DesktopIcon
} from '@radix-ui/react-icons';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { ClockPreview } from '@/app/(app)/clock/page';
import { TimerPreview } from '@/components/TimerPreview';
import ChyronPreview from '@/components/ChyronPreview';
import { ScreenPreview } from '@/components/ScreenPreview';
import { ObsExportCard } from '@/components/ObsExportCard';

function WidgetMiniThumbnail({ item, time }: { item: any; time: Date | null }) {
  const type = item.widget_type;

  return (
    <div 
      className="preview-window-container" 
      style={{ 
        width: '96px', 
        height: '54px', 
        flexShrink: 0, 
        borderRadius: '6px', 
        overflow: 'hidden', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid var(--border-subtle)',
        backgroundColor: '#0a0a0c'
      }}
    >
      {type === 'clock' && (
        <div style={{ transform: 'scale(0.24)', transformOrigin: 'center center' }}>
          <ClockPreview config={item.config} time={time} scale={1} />
        </div>
      )}
      {type === 'timer' && (
        <div style={{ transform: 'scale(0.25)', transformOrigin: 'center center', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TimerPreview config={item.config} scale={0.5} />
        </div>
      )}
      {type === 'crawl' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
          <ChyronPreview config={item.config} scale={0.06} />
        </div>
      )}
      {type === 'screen' && (
        <div style={{ transform: 'scale(0.05)', transformOrigin: 'center center', width: '1920px', height: '1080px' }}>
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
    if (item.widget_type === 'screen') {
      const firstPageId = item.config.pages?.[0]?.id || 'starting-soon';
      return `${origin}/embed/screen?id=${item.id}&page=${firstPageId}`;
    }
    return `${origin}/embed/${item.widget_type}?id=${item.id}`;
  };

  const primaryUrl = getPrimaryEmbedUrl();
  const isCopied = copySuccess === item.id;

  const badgeColor = 
    item.widget_type === 'screen' ? 'blue' : 
    item.widget_type === 'timer' ? 'orange' : 
    item.widget_type === 'crawl' ? 'red' : 'indigo';

  return (
    <Card 
      ref={setNodeRef} 
      style={{ 
        ...style, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        backgroundColor: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }} 
      size="3"
    >
      <Flex justify="between" align="center" gap="3" wrap="wrap">
        
        {/* Left: Drag + Select + Thumbnail + Title */}
        <Flex align="center" gap="3" style={{ flex: '1 1 350px', minWidth: 0 }}>
          <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }} title="Drag to reorder">
            <DragHandleDots2Icon width={20} height={20} style={{ color: 'var(--text-muted)' }} />
          </div>
          
          <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect(item.id)} />
          
          <WidgetMiniThumbnail item={item} time={time} />

          <Flex direction="column" gap="1" style={{ minWidth: 0, flex: 1 }}>
            <Flex align="center" gap="2">
              <Badge size="1" color={badgeColor} variant="surface">
                {item.widget_type.toUpperCase()}
              </Badge>
              {item.widget_type === 'screen' && (
                <Text size="1" color="gray">
                  {item.config.pages?.length || 1} Pages
                </Text>
              )}
            </Flex>
            <Heading size="4" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
              {item.config.name || 'Unnamed Widget'}
            </Heading>
          </Flex>
        </Flex>

        {/* Right: Quick Actions */}
        <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
          <Tooltip content="Copy OBS Browser Source URL">
            <Button 
              size="2" 
              variant={isCopied ? "solid" : "soft"} 
              color={isCopied ? "green" : "indigo"}
              onClick={() => copyUrl(item.id, primaryUrl)}
              style={{ cursor: 'pointer' }}
            >
              {isCopied ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
              {isCopied ? 'Copied' : 'Copy URL'}
            </Button>
          </Tooltip>

          <Button asChild variant="soft" color="gray" size="2">
            <Link href={`/${item.widget_type}?id=${item.id}`}>
              <Pencil1Icon width={15} height={15} /> Edit
            </Link>
          </Button>

          <Tooltip content="Delete widget">
            <IconButton size="2" color="red" variant="ghost" onClick={() => onDelete(item.id)}>
              <TrashIcon width={16} height={16} />
            </IconButton>
          </Tooltip>

          <IconButton 
            size="2" 
            variant="ghost" 
            color="gray" 
            onClick={() => setExpanded(!expanded)}
            aria-label="Toggle details"
          >
            {expanded ? <ChevronUpIcon width={20} height={20} /> : <ChevronDownIcon width={20} height={20} />}
          </IconButton>
        </Flex>
      </Flex>

      {/* Expanded Accordion: Full OBS Embed Details */}
      {expanded && (
        <Box mt="2" pt="3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {item.widget_type === 'screen' ? (
            <Flex direction="column" gap="3">
              <Text size="2" color="gray" mb="1">
                This screenset contains multiple overlays. Copy the exact page URL you need for your stream scene:
              </Text>
              {item.config.pages?.map((page: any) => (
                <ObsExportCard
                  key={page.id}
                  title={`${page.name.toUpperCase()} PAGE EMBED`}
                  url={`${typeof window !== 'undefined' ? window.location.origin : ''}/embed/screen?id=${item.id}&page=${page.id}`}
                  dimensions="1920 × 1080"
                  allowTransparency={true}
                />
              ))}
            </Flex>
          ) : (
            <ObsExportCard
              title={`${item.widget_type.toUpperCase()} EMBED URL`}
              url={primaryUrl}
              dimensions={item.widget_type === 'crawl' ? '1920 × 200' : '1920 × 1080'}
              allowTransparency={true}
            />
          )}
        </Box>
      )}
    </Card>
  );
}

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [configsList, setConfigsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [time, setTime] = useState<Date | null>(null);
  
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

      // Save new order asynchronously
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Delete this widget?</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await supabase.from('widget_configs').delete().eq('id', id);
                setConfigsList(configsList.filter(c => c.id !== id));
                setSelectedIds(selectedIds.filter(i => i !== id));
                toast.success('Widget deleted');
              }}
              style={{
                padding: '6px 12px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                padding: '6px 12px',
                background: 'var(--bg-panel)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
            Delete {selectedIds.length} widget{selectedIds.length > 1 ? 's' : ''}?
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
            This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
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
              style={{
                padding: '6px 12px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                padding: '6px 12px',
                background: 'var(--bg-panel)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
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
    <Box p="6" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <Flex justify="between" align="end" mb="6" wrap="wrap" gap="4">
        <Box>
          <Heading size="7" style={{ color: 'var(--text-primary)' }}>Broadcast Studio Dashboard</Heading>
          <Text size="3" color="gray" mt="1">Create, preview, and manage your live stream OBS browser sources.</Text>
        </Box>
      </Flex>

      {/* Quick Launch / Create New Widgets Section */}
      <Box mb="8">
        <Heading size="4" mb="4" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          Create New Widget
        </Heading>
        
        <Grid columns={{ initial: '1', sm: '2', md: '4' }} gap="4">
          
          {/* Clock Widget Card */}
          <Card size="2" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-subtle)' }}>
            <div className="preview-window-container" style={{ aspectRatio: '16 / 9', marginBottom: '14px', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', color: '#ff5900', fontWeight: 'bold' }}>
                12:34
              </div>
            </div>
            <Flex direction="column" gap="2" style={{ flexGrow: 1 }}>
              <Flex align="center" gap="2">
                <ClockIcon width={16} height={16} color="var(--accent-primary)" />
                <Heading size="3">Clock Widget</Heading>
              </Flex>
              <Text size="2" color="gray" style={{ lineHeight: 1.4, flexGrow: 1 }}>
                Digital stream clock with timezones, seconds, dates, and glowing neon FX.
              </Text>
              <Button asChild size="2" style={{ width: '100%', marginTop: 'auto' }}>
                <Link href="/clock">Manage Clocks</Link>
              </Button>
            </Flex>
          </Card>

          {/* Timer Widget Card */}
          <Card size="2" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-subtle)' }}>
            <div className="preview-window-container" style={{ aspectRatio: '16 / 9', marginBottom: '14px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="70" height="70" style={{ position: 'absolute', top: 0, left: 0 }}>
                  <circle cx="35" cy="35" r="30" fill="none" stroke="var(--border-subtle)" strokeWidth="4" />
                  <circle cx="35" cy="35" r="30" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="188" strokeDashoffset="45" strokeLinecap="round" transform="rotate(-90 35 35)" />
                </svg>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>4:47</span>
              </div>
            </div>
            <Flex direction="column" gap="2" style={{ flexGrow: 1 }}>
              <Flex align="center" gap="2">
                <StopwatchIcon width={16} height={16} color="var(--accent-primary)" />
                <Heading size="3">Timer Widget</Heading>
              </Flex>
              <Text size="2" color="gray" style={{ lineHeight: 1.4, flexGrow: 1 }}>
                Countdown timer and stopwatch with SVG progress ring and chime alarms.
              </Text>
              <Button asChild size="2" style={{ width: '100%', marginTop: 'auto' }}>
                <Link href="/timer">Manage Timers</Link>
              </Button>
            </Flex>
          </Card>

          {/* Chyron Builder Card */}
          <Card size="2" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-subtle)' }}>
            <div className="preview-window-container" style={{ aspectRatio: '16 / 9', marginBottom: '14px', borderRadius: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'stretch', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#1a1a2e', width: '100%', borderLeft: '4px solid #e63946', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                <span style={{ color: '#fff', fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>BREAKING NEWS</span>
                <span style={{ color: '#fff', fontSize: '8px', fontFamily: 'var(--font-mono)', backgroundColor: '#e63946', padding: '1px 4px', borderRadius: '2px', fontWeight: 'bold' }}>LIVE</span>
              </div>
              <div style={{ backgroundColor: '#0f172a', width: '100%', borderTop: '2px solid #e63946', padding: '3px 8px', overflow: 'hidden', boxSizing: 'border-box' }}>
                <span style={{ color: '#fff', fontSize: '8px', fontWeight: 600, whiteSpace: 'nowrap' }}>SCROLLING TICKER TEXT ★</span>
              </div>
            </div>
            <Flex direction="column" gap="2" style={{ flexGrow: 1 }}>
              <Flex align="center" gap="2">
                <ViewHorizontalIcon width={16} height={16} color="var(--accent-primary)" />
                <Heading size="3">Chyron Builder</Heading>
              </Flex>
              <Text size="2" color="gray" style={{ lineHeight: 1.4, flexGrow: 1 }}>
                Broadcast lower thirds with headlines, logo bug, clock, and scrolling crawl.
              </Text>
              <Button asChild size="2" style={{ width: '100%', marginTop: 'auto' }}>
                <Link href="/crawl">Open Builder</Link>
              </Button>
            </Flex>
          </Card>

          {/* Screen Sets Card */}
          <Card size="2" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-subtle)' }}>
            <div className="preview-window-container" style={{ aspectRatio: '16 / 9', marginBottom: '14px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', lineHeight: 1.1 }}>STARTING SOON</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Stream begins shortly...</div>
              </div>
            </div>
            <Flex direction="column" gap="2" style={{ flexGrow: 1 }}>
              <Flex align="center" gap="2">
                <DesktopIcon width={16} height={16} color="var(--accent-primary)" />
                <Heading size="3">Screen Sets</Heading>
              </Flex>
              <Text size="2" color="gray" style={{ lineHeight: 1.4, flexGrow: 1 }}>
                Full-screen Starting Soon, BRB, and Goodbye overlays with countdowns.
              </Text>
              <Button asChild size="2" style={{ width: '100%', marginTop: 'auto' }}>
                <Link href="/screen">Manage Screens</Link>
              </Button>
            </Flex>
          </Card>

        </Grid>
      </Box>

      {/* Saved Widgets Section */}
      <Box mb="8">
        <Flex justify="between" align="center" mb="4" wrap="wrap" gap="3">
          <Flex align="center" gap="3">
            <Heading size="4" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Your Saved Widgets ({configsList.length})
            </Heading>
          </Flex>

          {selectedIds.length > 0 && (
            <Button color="red" variant="solid" onClick={deleteSelected} style={{ cursor: 'pointer' }}>
              <TrashIcon /> Delete Selected ({selectedIds.length})
            </Button>
          )}
        </Flex>
        
        {loading ? (
          <Text color="gray">Loading your saved widgets...</Text>
        ) : configsList.length === 0 ? (
          <Card size="3" style={{ textAlign: 'center', padding: '50px 20px', border: '1px dashed var(--border-subtle)', backgroundColor: 'var(--bg-panel)' }}>
            <Text size="3" color="gray" mb="2" style={{ display: 'block' }}>No saved widgets yet.</Text>
            <Text size="2" color="gray">Click any of the widget types above to configure and save your first OBS overlay!</Text>
          </Card>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={configsList.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {configsList.map((item) => (
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
      </Box>

    </Box>
  );
}
