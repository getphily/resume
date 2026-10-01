'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import ChyronPreview from '@/components/ChyronPreview';
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

// ─── Layer Names ───────────────────────────────────────────────────
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
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>TITLE BAR</h3>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>HEADLINE TEXT</label>
        <input type="text" className="form-input" value={t.text} onChange={e => update({ text: e.target.value })} />
      </div>
      <div style={{ display: 'flex', gap: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>FONT</label>
          <select className="form-select" value={t.fontFamily} onChange={e => update({ fontFamily: e.target.value })}>
            <option value="Inter">Inter</option>
            <option value="Outfit">Outfit</option>
            <option value="Roboto Mono">Roboto Mono</option>
            <option value="Bebas Neue">Bebas Neue</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>TEXT TRANSFORM</label>
          <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
            <button style={{ flex: 1 }} className={t.textTransform === 'uppercase' ? 'active' : ''} onClick={() => update({ textTransform: 'uppercase' })}>UPPER</button>
            <button style={{ flex: 1 }} className={t.textTransform === 'none' ? 'active' : ''} onClick={() => update({ textTransform: 'none' })}>Normal</button>
          </div>
        </div>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>HEADLINE SIZE</label>
        <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
          <button style={{ flex: 1 }} className={t.fontSize === 0.82 ? 'active' : ''} onClick={() => update({ fontSize: 0.82 })}>SMALL</button>
          <button style={{ flex: 1 }} className={t.fontSize === 1.0 ? 'active' : ''} onClick={() => update({ fontSize: 1.0 })}>MEDIUM</button>
          <button style={{ flex: 1 }} className={t.fontSize === 1.2 ? 'active' : ''} onClick={() => update({ fontSize: 1.2 })}>LARGE</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>TEXT COLOR</label>
          <input type="color" value={t.textColor} onChange={e => update({ textColor: e.target.value })} style={{ width: '100%', height: '44px', padding: '2px', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '6px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>BACKGROUND</label>
          <input type="color" value={t.bgColor} onChange={e => update({ bgColor: e.target.value })} style={{ width: '100%', height: '44px', padding: '2px', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '6px' }} />
        </div>
      </div>
      <div className="form-checkbox-group">
        <label className="form-checkbox-label">
          <input type="checkbox" checked={t.bold} onChange={e => update({ bold: e.target.checked })} />
          BOLD
        </label>
      </div>
    </div>
  );
}

// ─── Properties: Logo ──────────────────────────────────────────────
function LogoProperties({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const l = config.logo;
  const update = (patch: Partial<typeof l>) => onChange({ ...config, logo: { ...l, ...patch } });

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>LOGO BUG</h3>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>MODE</label>
        <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
          <button style={{ flex: 1 }} className={l.mode === 'TEXT' ? 'active' : ''} onClick={() => update({ mode: 'TEXT' })}>TEXT</button>
          <button style={{ flex: 1 }} className={l.mode === 'IMAGE' ? 'active' : ''} onClick={() => update({ mode: 'IMAGE' })}>IMAGE</button>
        </div>
      </div>
      {l.mode === 'TEXT' ? (
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>LOGO TEXT</label>
          <input type="text" className="form-input" value={l.text} onChange={e => update({ text: e.target.value })} placeholder="e.g. CNN, LIVE, C-SPAN" />
        </div>
      ) : (
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>IMAGE URL</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" className="form-input" value={l.imageUrl} onChange={e => update({ imageUrl: e.target.value })} placeholder="Paste image URL" style={{ flex: 1 }} />
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 12px', backgroundColor: 'var(--module-grey)', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
              UPLOAD
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const toastId = toast.loading('Uploading image...');
                try {
                  const fileExt = file.name.split('.').pop();
                  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
                  // Fallback bucket name is 'images', we assume user has it or we just try
                  const { data, error } = await supabase.storage.from('assets').upload(`chyron/${fileName}`, file, { upsert: true });
                  if (error) {
                    // Try alternative bucket if assets doesn't exist
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
                  toast.error(`Upload failed: ${err.message}. Ensure a public 'assets' or 'images' storage bucket exists.`, { id: toastId, duration: 5000 });
                }
              }} />
            </label>
          </div>
        </div>
      )}
      <div className="form-checkbox-group">
        <label className="form-checkbox-label">
          <input type="checkbox" checked={l.spanRows || false} onChange={e => update({ spanRows: e.target.checked })} />
          SPAN ALL ROWS (Makes logo fill height)
        </label>
        {l.mode === 'IMAGE' && (
          <label className="form-checkbox-label" style={{ marginTop: '10px' }}>
            <input type="checkbox" checked={l.showLiveBadge !== false} onChange={e => update({ showLiveBadge: e.target.checked })} />
            SHOW "LIVE" BADGE OVERLAY
          </label>
        )}
      </div>
      {l.mode === 'IMAGE' && (
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>ASPECT RATIO</label>
          <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
            <button style={{ flex: 1 }} className={l.aspectRatio !== '16:9' ? 'active' : ''} onClick={() => update({ aspectRatio: '1:1' })}>1:1 (SQUARE)</button>
            <button style={{ flex: 1 }} className={l.aspectRatio === '16:9' ? 'active' : ''} onClick={() => update({ aspectRatio: '16:9' })}>16:9 (WIDE)</button>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>POSITION</label>
          <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
            <button style={{ flex: 1 }} className={l.position === 'LEFT' ? 'active' : ''} onClick={() => update({ position: 'LEFT' })}>LEFT</button>
            <button style={{ flex: 1 }} className={l.position === 'RIGHT' ? 'active' : ''} onClick={() => update({ position: 'RIGHT' })}>RIGHT</button>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>FONT</label>
          <select className="form-select" value={l.fontFamily} onChange={e => update({ fontFamily: e.target.value })}>
            <option value="Inter">Inter</option>
            <option value="Outfit">Outfit</option>
            <option value="Bebas Neue">Bebas Neue</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>TEXT COLOR</label>
          <input type="color" value={l.textColor} onChange={e => update({ textColor: e.target.value })} style={{ width: '100%', height: '44px', padding: '2px', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '6px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>BACKGROUND</label>
          <input type="color" value={l.bgColor} onChange={e => update({ bgColor: e.target.value })} style={{ width: '100%', height: '44px', padding: '2px', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '6px' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Properties: Subheader ─────────────────────────────────────────────
function SubheaderProperties({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const s = config.subheader;
  const update = (patch: Partial<typeof s>) => onChange({ ...config, subheader: { ...s, ...patch } });

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>SUBHEADER</h3>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>SUBHEADER TEXT</label>
        <input type="text" className="form-input" value={s.text} onChange={e => update({ text: e.target.value })} placeholder="e.g. LIVE FROM OAKLAND, CA" />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>FONT SIZE</label>
        <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
          <button style={{ flex: 1 }} className={s.fontSize === 0.82 ? 'active' : ''} onClick={() => update({ fontSize: 0.82 })}>SMALL</button>
          <button style={{ flex: 1 }} className={s.fontSize === 1.0 ? 'active' : ''} onClick={() => update({ fontSize: 1.0 })}>MEDIUM</button>
          <button style={{ flex: 1 }} className={s.fontSize === 1.2 ? 'active' : ''} onClick={() => update({ fontSize: 1.2 })}>LARGE</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>FONT</label>
          <select className="form-select" value={s.fontFamily} onChange={e => update({ fontFamily: e.target.value })}>
            <option value="Inter">Inter</option>
            <option value="Outfit">Outfit</option>
            <option value="Bebas Neue">Bebas Neue</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>TRANSFORM</label>
          <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
            <button style={{ flex: 1 }} className={s.textTransform === 'uppercase' ? 'active' : ''} onClick={() => update({ textTransform: 'uppercase' })}>UPPER</button>
            <button style={{ flex: 1 }} className={s.textTransform === 'none' ? 'active' : ''} onClick={() => update({ textTransform: 'none' })}>Normal</button>
          </div>
        </div>
      </div>
      <div className="form-checkbox-group">
        <label className="form-checkbox-label">
          <input type="checkbox" checked={s.bold} onChange={e => update({ bold: e.target.checked })} />
          BOLD TEXT
        </label>
      </div>
      <div style={{ display: 'flex', gap: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>TEXT COLOR</label>
          <input type="color" value={s.textColor} onChange={e => update({ textColor: e.target.value })} style={{ width: '100%', height: '44px', padding: '2px', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '6px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>BACKGROUND</label>
          <input type="color" value={s.bgColor} onChange={e => update({ bgColor: e.target.value })} style={{ width: '100%', height: '44px', padding: '2px', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '6px' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Properties: Clock ─────────────────────────────────────────────
function ClockProperties({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const c = config.clock;
  const update = (patch: Partial<typeof c>) => onChange({ ...config, clock: { ...c, ...patch } });

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>CLOCK / DATE</h3>
        <label className="form-checkbox-label" style={{ margin: 0, padding: 0 }}>
          <input type="checkbox" checked={c.enabled !== false} onChange={e => update({ enabled: e.target.checked })} />
          ENABLE CLOCK
        </label>
      </div>
      <div style={{ display: 'flex', gap: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>FORMAT</label>
          <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
            <button style={{ flex: 1 }} className={c.format === '12HR' ? 'active' : ''} onClick={() => update({ format: '12HR' })}>12 HR</button>
            <button style={{ flex: 1 }} className={c.format === '24HR' ? 'active' : ''} onClick={() => update({ format: '24HR' })}>24 HR</button>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>TIMEZONE</label>
          <select className="form-select" value={c.timezone} onChange={e => update({ timezone: e.target.value })}>
            <option value="LOCAL">Local Time</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">EST (New York)</option>
            <option value="America/Los_Angeles">PST (Los Angeles)</option>
            <option value="Europe/London">GMT (London)</option>
            <option value="Asia/Tokyo">JST (Tokyo)</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>POSITION</label>
          <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
            <button style={{ flex: 1 }} className={c.position === 'LEFT' ? 'active' : ''} onClick={() => update({ position: 'LEFT' })}>LEFT</button>
            <button style={{ flex: 1 }} className={c.position === 'RIGHT' ? 'active' : ''} onClick={() => update({ position: 'RIGHT' })}>RIGHT</button>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>SIZE</label>
          <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
            <button style={{ flex: 1 }} className={c.fontSize === 0.82 ? 'active' : ''} onClick={() => update({ fontSize: 0.82 })}>SMALL</button>
            <button style={{ flex: 1 }} className={(c.fontSize === undefined || c.fontSize === 1.0) ? 'active' : ''} onClick={() => update({ fontSize: 1.0 })}>MED</button>
            <button style={{ flex: 1 }} className={c.fontSize === 1.2 ? 'active' : ''} onClick={() => update({ fontSize: 1.2 })}>LARGE</button>
          </div>
        </div>
      </div>
      <div className="form-checkbox-group">
        <label className="form-checkbox-label">
          <input type="checkbox" checked={c.showSeconds} onChange={e => update({ showSeconds: e.target.checked })} />
          SHOW SECONDS
        </label>
        <label className="form-checkbox-label">
          <input type="checkbox" checked={c.showDate} onChange={e => update({ showDate: e.target.checked })} />
          SHOW DATE
        </label>
      </div>
      <div style={{ display: 'flex', gap: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>TEXT COLOR</label>
          <input type="color" value={c.textColor} onChange={e => update({ textColor: e.target.value })} style={{ width: '100%', height: '44px', padding: '2px', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '6px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>BACKGROUND</label>
          <input type="color" value={c.bgColor} onChange={e => update({ bgColor: e.target.value })} style={{ width: '100%', height: '44px', padding: '2px', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '6px' }} />
        </div>
      </div>
    </div>
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
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>CRAWL SETTINGS</h3>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>SPEED</label>
            <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
              <button style={{ flex: 1 }} className={cr.speed === 'SLOW' ? 'active' : ''} onClick={() => updateCrawl({ speed: 'SLOW' })}>SLOW</button>
              <button style={{ flex: 1 }} className={cr.speed === 'NORMAL' ? 'active' : ''} onClick={() => updateCrawl({ speed: 'NORMAL' })}>NORMAL</button>
              <button style={{ flex: 1 }} className={cr.speed === 'FAST' ? 'active' : ''} onClick={() => updateCrawl({ speed: 'FAST' })}>FAST</button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>SEPARATOR</label>
            <select className="form-select" value={cr.separator} onChange={e => updateCrawl({ separator: e.target.value })}>
              <option value=" ★ ">★ Star</option>
              <option value=" | ">| Pipe</option>
              <option value=" /// ">/// Slashes</option>
              <option value=" ••• ">••• Dots</option>
              <option value="   ">   (Space)</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>FONT</label>
            <select className="form-select" value={cr.fontFamily} onChange={e => updateCrawl({ fontFamily: e.target.value })}>
              <option value="Inter">Inter</option>
              <option value="Outfit">Outfit</option>
              <option value="Roboto Mono">Roboto Mono</option>
              <option value="Bebas Neue">Bebas Neue</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>FONT SIZE</label>
            <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
              <button style={{ flex: 1 }} className={cr.fontSize === 0.82 ? 'active' : ''} onClick={() => updateCrawl({ fontSize: 0.82 })}>SMALL</button>
              <button style={{ flex: 1 }} className={cr.fontSize === 1.0 ? 'active' : ''} onClick={() => updateCrawl({ fontSize: 1.0 })}>MEDIUM</button>
              <button style={{ flex: 1 }} className={cr.fontSize === 1.2 ? 'active' : ''} onClick={() => updateCrawl({ fontSize: 1.2 })}>LARGE</button>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>TEXT COLOR</label>
            <input type="color" value={cr.textColor} onChange={e => updateCrawl({ textColor: e.target.value })} style={{ width: '100%', height: '44px', padding: '2px', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '6px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>BACKGROUND</label>
            <input type="color" value={cr.bgColor} onChange={e => updateCrawl({ bgColor: e.target.value })} style={{ width: '100%', height: '44px', padding: '2px', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '6px' }} />
          </div>
        </div>
      </div>

      {/* Crawl Block Manager */}
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>CRAWL BLOCKS</h3>
          <button
            onClick={addBlock}
            style={{
              background: 'none', border: '1px solid var(--border-subtle)', color: 'var(--active-amber)',
              padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700,
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--active-amber)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          >
            + ADD BLOCK
          </button>
        </div>

        {cr.blocks.map((block, i) => (
          <div
            key={block.id}
            style={{
              display: 'flex', flexDirection: 'column', gap: '10px',
              padding: '16px', backgroundColor: block.enabled ? '#f8fafc' : '#f1f5f9',
              borderRadius: '8px', border: '1px solid var(--border-subtle)',
              opacity: block.enabled ? 1 : 0.6,
              transition: 'all 0.2s ease',
            }}
          >
            {/* Block header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Reorder buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
                <button
                  onClick={() => moveBlock(i, i - 1)}
                  disabled={i === 0}
                  style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', padding: '2px', color: i === 0 ? '#d1d5db' : 'var(--text-secondary)', fontSize: '10px', lineHeight: 1 }}
                  aria-label="Move block up"
                >▲</button>
                <button
                  onClick={() => moveBlock(i, i + 1)}
                  disabled={i === cr.blocks.length - 1}
                  style={{ background: 'none', border: 'none', cursor: i === cr.blocks.length - 1 ? 'default' : 'pointer', padding: '2px', color: i === cr.blocks.length - 1 ? '#d1d5db' : 'var(--text-secondary)', fontSize: '10px', lineHeight: 1 }}
                  aria-label="Move block down"
                >▼</button>
              </div>

              {/* Toggle */}
              <button
                onClick={() => updateBlock(block.id, { enabled: !block.enabled })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                aria-label={block.enabled ? 'Disable block' : 'Enable block'}
              >
                <EyeIcon visible={block.enabled} />
              </button>

              {/* Label */}
              <input
                type="text"
                value={block.label}
                onChange={e => updateBlock(block.id, { label: e.target.value })}
                style={{
                  flex: 1, background: 'transparent', border: 'none', fontWeight: 700,
                  fontSize: '13px', color: 'var(--text-primary)', outline: 'none',
                  padding: '4px 0',
                }}
                aria-label="Block label"
              />

              {/* Delete */}
              <button
                className="btn-delete"
                onClick={() => deleteBlock(block.id)}
                aria-label="Delete block"
                title="Delete block"
              >
                <TrashIcon />
              </button>
            </div>

            {/* Block text */}
            <textarea
              value={block.text}
              onChange={e => updateBlock(block.id, { text: e.target.value })}
              rows={2}
              className="form-input"
              style={{ resize: 'vertical', fontSize: '13px' }}
              placeholder="Enter crawl text..."
              aria-label="Block text content"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Properties: Global Layout ─────────────────────────────────────
function LayoutProperties({ config, onChange }: { config: ChyronConfig; onChange: (c: ChyronConfig) => void }) {
  const ly = config.layout;
  const update = (patch: Partial<typeof ly>) => onChange({ ...config, layout: { ...ly, ...patch } });

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>LAYOUT & BACKGROUND</h3>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>CHYRON NAME</label>
        <input type="text" className="form-input" value={config.name} onChange={e => onChange({ ...config, name: e.target.value })} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>BACKGROUND MODE</label>
        <div className="segmented-control" style={{ display: 'flex', width: '100%' }}>
          <button style={{ flex: 1 }} className={ly.bgMode === 'TRANSPARENT' ? 'active' : ''} onClick={() => update({ bgMode: 'TRANSPARENT' })}>TRANSPARENT</button>
          <button style={{ flex: 1 }} className={ly.bgMode === 'SOLID' ? 'active' : ''} onClick={() => update({ bgMode: 'SOLID' })}>SOLID</button>
        </div>
      </div>
      {ly.bgMode === 'SOLID' && (
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>BACKGROUND COLOR</label>
          <input type="color" value={ly.bgColor} onChange={e => update({ bgColor: e.target.value })} style={{ width: '100%', height: '44px', padding: '2px', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '6px' }} />
        </div>
      )}
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>ACCENT COLOR</label>
        <input type="color" value={ly.accentColor} onChange={e => update({ accentColor: e.target.value })} style={{ width: '100%', height: '44px', padding: '2px', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '6px' }} />
        <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>Used for accent stripes and borders between layers</p>
      </div>
    </div>
  );
}

// ─── Properties: Export ────────────────────────────────────────────
function ExportProperties({ config, activeConfigId, copySuccess, onCopy }: { config: ChyronConfig; activeConfigId: string; copySuccess: boolean; onCopy: () => void }) {
  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>EXPORT TO OBS</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
        Copy this URL and paste it into a new <strong>Browser Source</strong> in OBS Studio.
      </p>
      <ul style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.8, paddingLeft: '20px' }}>
        <li>Set Dimensions to <strong>1920×200</strong> (or adjust to fit your layout)</li>
        <li>Ensure <strong>&quot;Allow transparency&quot;</strong> is checked</li>
        <li>Changes sync to OBS in real-time!</li>
      </ul>
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', border: '1px solid var(--border-subtle)', borderRadius: '8px', marginTop: '5px' }}>
        <p style={{ color: 'var(--text-primary)', fontSize: '12px', marginBottom: '12px', fontWeight: 600 }}>YOUR UNIQUE WIDGET URL:</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text" readOnly
            value={typeof window !== 'undefined' ? `${window.location.origin}/widgets/embed/crawl?id=${activeConfigId}` : ''}
            onClick={e => (e.target as HTMLInputElement).select()}
            className="form-input"
            style={{ flex: 1, fontSize: '13px', cursor: 'text' }}
          />
          <button
            className="btn-primary"
            onClick={onCopy}
            style={{ margin: 0, padding: '0 20px', backgroundColor: copySuccess ? '#22c55e' : 'var(--accent-primary)', color: '#fff', border: 'none', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px' }}
          >
            {copySuccess ? '✓ COPIED' : 'COPY'}
          </button>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function ChyronBuilder() {
  const [session, setSession] = useState<any>(null);
  const [configsList, setConfigsList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [config, setConfig] = useState<ChyronConfig>(DEFAULT_CHYRON_CONFIG);
  const [selectedLayer, setSelectedLayer] = useState<string | null>('title');
  const [selectedPanel, setSelectedPanel] = useState<'layer' | 'layout' | 'export'>('layer');

  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // ── Auth ────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setLoadingList(false); return; }
      setSession(session);
      fetchConfigs(session.user.id);
    });
  }, []);

  const fetchConfigs = async (userId: string) => {
    setLoadingList(true);
    const { data } = await supabase
      .from('widget_configs')
      .select('id, config')
      .eq('user_id', userId)
      .eq('widget_type', 'chyron')
      .order('created_at', { ascending: true });
    setConfigsList(data || []);
    setLoadingList(false);
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
      .insert({ user_id: session.user.id, widget_type: 'chyron', config: newConfig })
      .select('id')
      .single();
    if (data) {
      setConfigsList([...configsList, { id: data.id, config: newConfig }]);
      loadEditor(data.id, newConfig);
    }
  };

  const loadEditor = (id: string, c: any) => {
    setActiveConfigId(id);
    
    // Inject any missing layers into the loaded order
    const loadedOrder = c.layerOrder || DEFAULT_CHYRON_CONFIG.layerOrder;
    const finalOrder = [...loadedOrder];
    ['title', 'subheader', 'crawl', 'logo', 'clock'].forEach(l => {
      if (!finalOrder.includes(l as any)) finalOrder.push(l as any);
    });

    // Merge with defaults to handle missing fields from older configs
    const mergedConfig: ChyronConfig = {
      ...DEFAULT_CHYRON_CONFIG,
      ...c,
      layout: { ...DEFAULT_CHYRON_CONFIG.layout, ...(c.layout || {}) },
      title: { ...DEFAULT_CHYRON_CONFIG.title, ...(c.title || {}) },
      subheader: { ...DEFAULT_CHYRON_CONFIG.subheader, ...(c.subheader || {}) },
      logo: { ...DEFAULT_CHYRON_CONFIG.logo, ...(c.logo || {}) },
      clock: { ...DEFAULT_CHYRON_CONFIG.clock, ...(c.clock || {}) },
      crawl: { ...DEFAULT_CHYRON_CONFIG.crawl, ...(c.crawl || {}) },
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
    const items = Array.from(config.layerOrder);
    ['title', 'subheader', 'crawl', 'logo', 'clock'].forEach(l => {
      if (!items.includes(l as any)) items.push(l as any);
    });
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setConfig({ ...config, layerOrder: items as any });
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
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-rigid)' }}>
          {activeConfigId ? (
            <button onClick={() => setActiveConfigId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
              &larr; BACK TO DASHBOARD
            </button>
          ) : (
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>YOUR CHYRONS</h2>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeConfigId ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* LAYERS header */}
              <div style={{ padding: '16px 20px 8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                LAYERS
              </div>

              {/* Layer rows */}
              <DragDropContext onDragEnd={onDragEnd}>
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
                                    <GripVertical size={16} />
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
              </DragDropContext>

              {/* Divider */}
              <div style={{ borderTop: '1px solid var(--border-rigid)', margin: '8px 0' }} />

              {/* Global panels */}
              <div style={{ padding: '4px 0' }}>
                <div style={{ padding: '16px 20px 8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                  GLOBAL
                </div>
                <button
                  onClick={() => { setSelectedPanel('layout'); setSelectedLayer(null); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '12px 20px',
                    background: selectedPanel === 'layout' ? 'var(--module-grey)' : 'transparent',
                    border: 'none', borderLeft: selectedPanel === 'layout' ? '3px solid var(--active-amber)' : '3px solid transparent',
                    color: selectedPanel === 'layout' ? 'var(--active-amber)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Layout & Background
                </button>
                <button
                  onClick={() => { setSelectedPanel('export'); setSelectedLayer(null); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '12px 20px',
                    background: selectedPanel === 'export' ? 'var(--module-grey)' : 'transparent',
                    border: 'none', borderLeft: selectedPanel === 'export' ? '3px solid var(--active-amber)' : '3px solid transparent',
                    color: selectedPanel === 'export' ? 'var(--active-amber)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Export & OBS
                </button>
              </div>
            </div>
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
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: 'var(--chassis-black)' }}>

        {!activeConfigId ? (
          /* ── Dashboard View ─────────────────────────────────── */
          <div style={{ padding: '40px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
            {loadingList ? <p>Loading...</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {configsList.map(c => (
                  <div key={c.id} className="panel" onClick={() => loadEditor(c.id, c.config)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', padding: '20px', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'} onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'}>
                    <div className="preview-window-container" style={{ width: '100%', aspectRatio: '16/5', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}>
                      <ChyronPreview config={c.config} scale={0.35} />
                    </div>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '15px' }}>{c.config.name || 'Unnamed'}</span>
                      <button onClick={e => deleteConfig(c.id, e)} className="btn-delete" aria-label="Delete chyron" title="Delete chyron">
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
                {configsList.length < 3 && (
                  <div className="panel" onClick={handleCreateNew} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px', border: '2px dashed var(--border-rigid)', background: 'transparent' }}>
                    <span style={{ color: 'var(--active-amber)', fontWeight: 'bold' }}>+ CREATE NEW CHYRON</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── Editor View ────────────────────────────────────── */
          <>
            {/* Live Preview Header */}
            <div style={{
              flex: '0 0 auto', padding: '40px 20px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-panel)',
            }}>
              <div style={{ display: 'flex', width: '100%', maxWidth: '960px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{config.name.toUpperCase()}</h2>
                <span style={{ color: saving ? 'var(--active-amber)' : 'var(--vocals-green)', fontSize: '12px', fontWeight: 700 }}>
                  {saving ? 'SAVING...' : '✓ SAVED'}
                </span>
              </div>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden', width: '100%', maxWidth: '960px' }} className="preview-window-container">
                <ChyronPreview config={config} scale={0.5} />
              </div>
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
              {selectedPanel === 'export' && activeConfigId && (
                <ExportProperties config={config} activeConfigId={activeConfigId} copySuccess={copySuccess} onCopy={handleCopy} />
              )}
            </div>
          </>
        )}

      </main>
    </div>
  );
}
