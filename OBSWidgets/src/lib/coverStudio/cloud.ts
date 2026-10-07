import { supabase } from '@/lib/supabase';
import type { CoverConfig } from './types';

/**
 * Supabase persistence for the Podcast Cover Studio.
 * Schema + policies live in `supabase_podcast_covers.sql`.
 *
 * Storage layout (public bucket, write access limited to own folder):
 *   podcast-covers/<user_id>/background   uploaded background photo
 *   podcast-covers/<user_id>/host         host photo / background-removed cutout
 *   podcast-covers/<user_id>/cover        final exported cover (used as show artwork)
 */

export const COVER_BUCKET = 'podcast-covers';
const TABLE = 'podcast_cover_designs';
const MAX_SIDE = 3000;

export type CoverAssetKind = 'bg' | 'host' | 'cover';

const ASSET_FILE: Record<CoverAssetKind, string> = {
  bg: 'background',
  host: 'host',
  cover: 'cover',
};

/** Public URLs of the uploaded source images (null = none). */
export interface CoverAssetUrls {
  bg: string | null;
  host: string | null;
}

export interface CloudCoverDesign {
  config: Partial<CoverConfig>;
  bg_image_url: string | null;
  host_image_url: string | null;
}

/** Overlay a (possibly older / partial) saved config on top of a complete base config. */
export function mergeCoverConfig(base: CoverConfig, saved: Partial<CoverConfig> | null | undefined): CoverConfig {
  if (!saved) return base;
  return {
    ...base,
    ...saved,
    bg: { ...base.bg, ...saved.bg, gradient: { ...base.bg.gradient, ...saved.bg?.gradient } },
    host: { ...base.host, ...saved.host },
    title: { ...base.title, ...saved.title },
    withText: { ...base.withText, ...saved.withText },
    hostName: { ...base.hostName, ...saved.hostName },
    badge: { ...base.badge, ...saved.badge },
  };
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

/** Upload (or overwrite) one asset and return its public URL. */
export async function uploadCoverAsset(userId: string, kind: CoverAssetKind, blob: Blob): Promise<string> {
  const path = `${userId}/${ASSET_FILE[kind]}`;
  const { error } = await supabase.storage.from(COVER_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: blob.type || 'image/jpeg',
    cacheControl: '3600',
  });
  if (error) throw error;
  const { data } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);
  // Fixed path + upsert means the CDN/browser may serve a stale copy; version the URL.
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function removeCoverAsset(userId: string, kind: CoverAssetKind): Promise<void> {
  const { error } = await supabase.storage.from(COVER_BUCKET).remove([`${userId}/${ASSET_FILE[kind]}`]);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Saved design (database row)
// ---------------------------------------------------------------------------

export async function loadCoverDesign(userId: string): Promise<CloudCoverDesign | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('config, bg_image_url, host_image_url')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as CloudCoverDesign | null) ?? null;
}

export async function saveCoverDesign(userId: string, config: CoverConfig, urls: CoverAssetUrls): Promise<void> {
  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      config,
      bg_image_url: urls.bg,
      host_image_url: urls.host,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Image helpers
// ---------------------------------------------------------------------------

/**
 * Load a remote image for canvas use. `crossOrigin` is REQUIRED — without it the
 * canvas becomes tainted and `toDataURL()` / `toBlob()` throw a SecurityError on export.
 */
export function loadRemoteImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

export function isRemoteSrc(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Canvas export failed'))), type, quality);
  });
}

/** Stay safely under the bucket's 10 MB limit. */
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Re-encode no larger than MAX_SIDE (keeps uploads small and predictable). JPEG is flattened onto white; PNG keeps transparency. */
async function toBoundedBlob(img: HTMLImageElement, type: 'image/jpeg' | 'image/png'): Promise<Blob> {
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  if (type === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvasToBlob(canvas, type, type === 'image/jpeg' ? 0.9 : undefined);
}

/**
 * Turn an in-memory (blob:/data:) image into an upload-ready Blob.
 * - Background: always a bounded JPEG.
 * - Host: a PNG (e.g. a background-removed cutout) keeps its transparency — used as-is when
 *   small enough, otherwise re-encoded as a bounded PNG. Anything else becomes a bounded JPEG.
 */
export async function prepareUploadBlob(kind: 'bg' | 'host', img: HTMLImageElement): Promise<Blob> {
  if (kind === 'host') {
    const original = await (await fetch(img.src)).blob();
    if (original.type === 'image/png') {
      return original.size <= MAX_UPLOAD_BYTES ? original : toBoundedBlob(img, 'image/png');
    }
  }
  return toBoundedBlob(img, 'image/jpeg');
}

/**
 * Download a (possibly cross-origin) image URL as a file. `<a download>` is ignored for
 * cross-origin URLs, so fetch it as a blob first. The extension is derived from the image type.
 */
export async function downloadImageUrl(url: string, baseName: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status})`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = `${baseName}${blob.type === 'image/png' ? '.png' : '.jpg'}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
