import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { CoverConfig, CoverImages } from '@/lib/coverStudio/types';
import { CANVAS, DEFAULT_CONFIG, PREVIEW_CSS, PREVIEW_SCALE } from '@/lib/coverStudio/defaults';
import { drawCover, ensureFonts } from '@/lib/coverStudio/draw';
import {
  CoverAssetKind,
  CoverAssetUrls,
  canvasToBlob,
  isRemoteSrc,
  loadCoverDesign,
  loadRemoteImage,
  mergeCoverConfig,
  prepareUploadBlob,
  removeCoverAsset,
  saveCoverDesign,
  uploadCoverAsset,
} from '@/lib/coverStudio/cloud';
import { toast } from 'react-hot-toast';
import { Check, CloudOff, Loader2 } from 'lucide-react';

import { BackgroundTab } from './BackgroundTab';
import { HostPhotoTab } from './HostPhotoTab';
import { TextTab } from './TextTab';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ColorInputWithPalette } from '@/components/ColorInputWithPalette';

interface CoverStudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showTitle: string;
  showHost: string;
  /** Supabase auth user id. When null the studio works locally (localStorage only). */
  userId: string | null;
  onApply: (artworkUrl: string) => void;
}

type SyncStatus = 'loading' | 'saving' | 'saved' | 'error';

const EMPTY_IMAGES: CoverImages = { bg: null, host: null };
const EMPTY_URLS: CoverAssetUrls = { bg: null, host: null };
const LOCAL_CONFIG_KEY = 'podcast_cover_studio_config';
const ASSET_LABEL: Record<'bg' | 'host', string> = { bg: 'background', host: 'host photo' };

export function CoverStudioDialog({ open, onOpenChange, showTitle, showHost, userId, onApply }: CoverStudioDialogProps) {
  // State (not a ref): the dialog content is portaled and mounts AFTER `open` flips, so a plain ref
  // is still null when the draw effect first runs and the preview would stay blank.
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [dragTarget, setDragTarget] = useState<'background' | 'host'>('host');

  // Seed configuration
  const initialConfig = useMemo(() => {
    const config = JSON.parse(JSON.stringify(DEFAULT_CONFIG)) as CoverConfig;
    if (showTitle && showTitle.toLowerCase() !== 'untitled show') {
      config.title.text = showTitle;
    }
    if (showHost && showHost.toLowerCase() !== 'unknown host') {
      config.hostName.text = showHost;
    }
    return config;
  }, [showTitle, showHost]);

  const [cfg, setCfg] = useState<CoverConfig>(initialConfig);
  const [images, setImages] = useState<CoverImages>(EMPTY_IMAGES);
  // Public Supabase URLs of the uploaded source photos (persisted in the DB row).
  const [assetUrls, setAssetUrls] = useState<CoverAssetUrls>(EMPTY_URLS);
  // The user id whose cloud design has been loaded. Autosave is blocked until this matches
  // the signed-in user, so we never overwrite a saved design with unloaded defaults.
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
  const [applying, setApplying] = useState(false);

  // Latest values for async callbacks (updated in an effect, never during render).
  const imagesRef = useRef(images);
  const assetUrlsRef = useRef(assetUrls);
  useEffect(() => { imagesRef.current = images; }, [images]);
  useEffect(() => { assetUrlsRef.current = assetUrls; }, [assetUrls]);
  // Per-asset serial queue so overlapping uploads/removals to the same storage path can't race.
  const queueRef = useRef<Record<'bg' | 'host', Promise<void>>>({ bg: Promise.resolve(), host: Promise.resolve() });

  useEffect(() => {
    if (!open || !canvasEl) return;
    
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    
    ensureFonts(cfg).then(() => {
      drawCover(ctx, cfg, images, { scale: PREVIEW_SCALE, showPlaceholder: true });
    }).catch(err => {
      console.error("Failed to load fonts", err);
      // fallback draw
      drawCover(ctx, cfg, images, { scale: PREVIEW_SCALE, showPlaceholder: true });
    });
  }, [cfg, images, open, canvasEl]);

  // Local cache of the design settings. This is the store for signed-out users and a
  // quick first paint for signed-in ones; the cloud copy wins once it loads.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CONFIG_KEY);
      if (saved) {
        setCfg(prev => {
          const merged = mergeCoverConfig(prev, JSON.parse(saved));
          if (showTitle && showTitle.toLowerCase() !== 'untitled show') merged.title.text = showTitle;
          if (showHost && showHost.toLowerCase() !== 'unknown host') merged.hostName.text = showHost;
          return merged;
        });
      }
    } catch {}
  }, []); // Run only on mount

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(cfg));
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [cfg]);

  // Sync props to cfg whenever they change
  useEffect(() => {
    setCfg(prev => {
      const next = { ...prev };
      let changed = false;
      if (showTitle && showTitle.toLowerCase() !== 'untitled show' && next.title.text !== showTitle) {
        next.title = { ...next.title, text: showTitle };
        changed = true;
      }
      if (showHost && showHost.toLowerCase() !== 'unknown host' && next.hostName.text !== showHost) {
        next.hostName = { ...next.hostName, text: showHost };
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [showTitle, showHost]);

  // Signed out, or switched to a different account: drop the previous user's cloud state
  // so it can never be saved into someone else's row.
  useEffect(() => {
    if (hydratedFor && hydratedFor !== userId) {
      setHydratedFor(null);
      setImages(EMPTY_IMAGES);
      setAssetUrls(EMPTY_URLS);
      setCfg(initialConfig);
    }
  }, [userId, hydratedFor, initialConfig]);

  // Load the saved design + photos from Supabase the first time the dialog opens for this user.
  useEffect(() => {
    if (!open || !userId || hydratedFor === userId) return;
    let cancelled = false;
    setSyncStatus('loading');

    (async () => {
      try {
        const design = await loadCoverDesign(userId);
        if (cancelled) return;
        if (design) {
          setCfg(prev => {
            const merged = mergeCoverConfig(prev, design.config);
            if (showTitle && showTitle.toLowerCase() !== 'untitled show') merged.title.text = showTitle;
            if (showHost && showHost.toLowerCase() !== 'unknown host') merged.hostName.text = showHost;
            return merged;
          });
          setAssetUrls({ bg: design.bg_image_url, host: design.host_image_url });
          // A missing/broken photo resolves to null and is cleaned up by the asset sync below.
          const [bg, host] = await Promise.all([
            design.bg_image_url ? loadRemoteImage(design.bg_image_url).catch(() => null) : null,
            design.host_image_url ? loadRemoteImage(design.host_image_url).catch(() => null) : null,
          ]);
          if (cancelled) return;
          setImages({ bg, host });
        }
        setHydratedFor(userId);
        setSyncStatus('saved');
      } catch (err) {
        if (cancelled) return;
        console.error('[CoverStudio] Failed to load saved design from Supabase', err);
        setSyncStatus('error');
        // hydratedFor stays unset on purpose: no autosave until a load succeeds (retried on next open).
        toast.error("Couldn't reach cloud storage — your design is still saved in this browser.", {
          position: 'top-center',
          id: 'cover-cloud-load',
        });
      }
    })();

    return () => { cancelled = true; };
  }, [open, userId, hydratedFor]);

  // Keep Supabase Storage in step with the in-memory photos:
  //  - a new local (blob:/data:) image  -> upload it, remember its public URL
  //  - an image that was removed        -> delete the stored file and forget the URL
  //  - an image restored from the cloud -> nothing to do
  const syncAsset = useCallback((kind: 'bg' | 'host', img: HTMLImageElement | null) => {
    if (!userId) return;

    queueRef.current[kind] = queueRef.current[kind].then(async () => {
      // Skip work that was superseded while waiting in the queue.
      if (imagesRef.current[kind] !== img) return;

      if (!img) {
        if (!assetUrlsRef.current[kind]) return;
        setAssetUrls(prev => ({ ...prev, [kind]: null }));
        try { await removeCoverAsset(userId, kind as CoverAssetKind); } catch (err) {
          console.error(`[CoverStudio] Failed to delete ${kind} from storage`, err);
        }
        return;
      }

      if (isRemoteSrc(img.src)) return;

      setSyncStatus('saving');
      try {
        const blob = await prepareUploadBlob(kind, img);
        const url = await uploadCoverAsset(userId, kind, blob);
        if (imagesRef.current[kind] === img) setAssetUrls(prev => ({ ...prev, [kind]: url }));
      } catch (err) {
        console.error(`[CoverStudio] Failed to upload ${kind} to storage`, err);
        setSyncStatus('error');
        toast.error(`Couldn't upload your ${ASSET_LABEL[kind]} to the cloud. It will be lost if you close this page.`, {
          position: 'top-center',
          id: `cover-upload-${kind}`,
        });
      }
    });
  }, [userId]);

  const cloudReady = Boolean(userId) && hydratedFor === userId;

  useEffect(() => { if (cloudReady) syncAsset('bg', images.bg); }, [cloudReady, images.bg, syncAsset]);
  useEffect(() => { if (cloudReady) syncAsset('host', images.host); }, [cloudReady, images.host, syncAsset]);

  // Debounced autosave of the design settings + photo URLs to the database.
  useEffect(() => {
    if (!userId || !cloudReady) return;
    setSyncStatus('saving');
    const t = setTimeout(async () => {
      try {
        await saveCoverDesign(userId, cfg, assetUrls);
        setSyncStatus('saved');
      } catch (err) {
        console.error('[CoverStudio] Failed to save design to Supabase', err);
        setSyncStatus('error');
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [cfg, assetUrls, userId, cloudReady]);

  const renderExportCanvas = async () => {
    await ensureFonts(cfg);
    const canvas = document.createElement('canvas');
    canvas.width = 3000;
    canvas.height = 3000;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 3000, 3000);
    drawCover(ctx, cfg, images, { scale: 1, showPlaceholder: false });
    return canvas;
  };

  const handleDownload = async () => {
    try {
      const canvas = await renderExportCanvas();
      const titleSlug = cfg.title.text ? cfg.title.text.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'untitled';
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/jpeg', 0.88);
      a.download = `${titleSlug}_cover_3000.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('[CoverStudio] Export failed', err);
      toast.error("Couldn't export the cover. Try re-uploading your photos.", { position: 'top-center' });
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const canvas = await renderExportCanvas();
      let artworkUrl: string | null = null;

      if (userId) {
        try {
          const blob = await canvasToBlob(canvas, 'image/jpeg', 0.88);
          artworkUrl = await uploadCoverAsset(userId, 'cover', blob);
        } catch (err) {
          console.error('[CoverStudio] Failed to upload final cover', err);
          toast.error("Couldn't save the cover to the cloud — saving it in this browser instead.", { position: 'top-center' });
        }
      }

      onApply(artworkUrl ?? canvas.toDataURL('image/jpeg', 0.88));
      toast.success('Cover applied!', { position: 'top-center' });
      onOpenChange(false);
    } catch (err) {
      console.error('[CoverStudio] Export failed', err);
      toast.error("Couldn't export the cover. Try re-uploading your photos.", { position: 'top-center' });
    } finally {
      setApplying(false);
    }
  };

  const handleReset = () => {
    const seed = JSON.parse(JSON.stringify(DEFAULT_CONFIG)) as CoverConfig;
    if (showTitle && showTitle.toLowerCase() !== 'untitled show') seed.title.text = showTitle;
    if (showHost && showHost.toLowerCase() !== 'unknown host') seed.hostName.text = showHost;
    setCfg(seed);
    setImages({ bg: null, host: null });
    toast('Reset to template', { position: 'top-center', icon: '🔄' });
  };

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: dragTarget === 'background' ? cfg.bg.imgX : cfg.host.cx,
      initialY: dragTarget === 'background' ? cfg.bg.imgY : cfg.host.bottom,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    // Scale from CSS space (e.g., 300px) to internal space (3000px)
    const ratio = CANVAS / PREVIEW_CSS;
    
    if (dragTarget === 'background' && cfg.bg.type === 'image') {
      setCfg(prev => ({
        ...prev,
        bg: { ...prev.bg, imgX: dragStart.current.initialX + (dx * ratio), imgY: dragStart.current.initialY + (dy * ratio) }
      }));
    } else if (dragTarget === 'host' && cfg.host.enabled !== false) {
      setCfg(prev => ({
        ...prev,
        host: { ...prev.host, cx: dragStart.current.initialX + (dx * ratio), bottom: dragStart.current.initialY + (dy * ratio) }
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Cover Studio</DialogTitle>
          <DialogDescription>
            Build a template cover for your show.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-[320px_minmax(0,1fr)] gap-6 mt-4 items-start">
          {/* Left: Preview */}
          <div className="flex flex-col items-center md:sticky md:top-0">
            <div className="border border-border rounded-md shadow-sm overflow-hidden" style={{ width: PREVIEW_CSS, height: PREVIEW_CSS }}>
              <canvas
                ref={setCanvasEl}
                width={CANVAS * PREVIEW_SCALE} // 600 (3000 x 0.2)
                height={CANVAS * PREVIEW_SCALE}
                className={cn(
                  "w-[300px] h-[300px]",
                  "cursor-grab active:cursor-grabbing"
                )}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Drag to move:</span>
              <ToggleGroup type="single" value={dragTarget} onValueChange={(v) => v && setDragTarget(v as any)} className="bg-muted/50 p-1 rounded-lg">
                <ToggleGroupItem value="host" className="h-7 text-xs px-2">Host Photo</ToggleGroupItem>
                <ToggleGroupItem value="background" className="h-7 text-xs px-2">Background</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <p className="text-[10px] text-muted-foreground text-center mt-3 max-w-[260px] leading-tight">
              Exports 3000×3000 JPG, ready for Apple Podcasts &amp; Spotify.
            </p>
            <p
              className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {!userId ? (
                <>
                  <CloudOff className="w-3.5 h-3.5" />
                  Sign in to save your design and photos to the cloud.
                </>
              ) : syncStatus === 'error' ? (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-destructive" />
                  Cloud save unavailable — saved in this browser only.
                </>
              ) : syncStatus === 'saved' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Saved to your account
                </>
              ) : (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {syncStatus === 'loading' ? 'Loading your saved design…' : 'Saving…'}
                </>
              )}
            </p>
          </div>

          {/* Right: Tools Panel */}
          <div className="min-w-0 max-h-[520px] overflow-y-auto pr-3 space-y-4">
            
            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-bold mb-4 text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/80" /> Background
              </h3>
              <BackgroundTab cfg={cfg} setCfg={setCfg} images={images} setImages={setImages} />
            </div>

            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-bold mb-4 text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/80" /> Host Photo
              </h3>
              <HostPhotoTab cfg={cfg} setCfg={setCfg} images={images} setImages={setImages} />
            </div>

            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-bold mb-4 text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/80" /> Title Formatting
              </h3>
              <TextTab 
                layer={cfg.title} 
                kind="title" 
                onChange={(patch) => setCfg(prev => ({ ...prev, title: { ...prev.title, ...patch } }))} 
              />
            </div>

            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-bold mb-4 text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/80" /> "With" Text Formatting
              </h3>
              <TextTab 
                layer={cfg.withText} 
                kind="single" 
                onChange={(patch) => setCfg(prev => ({ ...prev, withText: { ...prev.withText, ...patch } }))} 
              />
            </div>

            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-bold mb-4 text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/80" /> Host Name Formatting
              </h3>
              <div className="flex flex-col gap-5">
                <TextTab 
                  layer={cfg.hostName} 
                  kind="single" 
                  onChange={(patch) => setCfg(prev => ({ ...prev, hostName: { ...prev.hostName, ...patch } }))} 
                />
                
                {/* Badge Box Controls */}
                <div className="pt-4 border-t flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-foreground cursor-pointer" htmlFor="badge-toggle">Show Background Box</label>
                    <Switch 
                      id="badge-toggle"
                      checked={cfg.badge.enabled}
                      onCheckedChange={(c) => setCfg(prev => ({ ...prev, badge: { ...prev.badge, enabled: c } }))}
                    />
                  </div>
                  {cfg.badge.enabled && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Box Color</label>
                      <ColorInputWithPalette 
                        value={cfg.badge.color}
                        onChange={(c) => setCfg(prev => ({ ...prev, badge: { ...prev.badge, color: c } }))}
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 pt-2">
                    <label className="text-xs font-bold text-foreground">Horizontal Position</label>
                    <Slider 
                      value={[cfg.badge.x]} min={0} max={2500} step={10} 
                      onValueChange={(val) => setCfg(prev => ({ ...prev, badge: { ...prev.badge, x: val[0] } }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Vertical Position</label>
                    <Slider 
                      value={[cfg.badge.baselineY]} min={900} max={2500} step={10} 
                      onValueChange={(val) => setCfg(prev => ({ ...prev, badge: { ...prev.badge, baselineY: val[0] } }))}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <DialogFooter className="mt-6 flex gap-2">
          <Button variant="outline" onClick={handleReset}>Reset to template</Button>
          <Button variant="secondary" onClick={handleDownload}>Download</Button>
          <Button onClick={handleApply} disabled={applying}>{applying ? 'Applying…' : 'Apply to show artwork'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
