import { supabase } from '../supabase';
import { MediaAsset, MediaStorageSummary, MediaKind, MediaSource } from './types';

// Hard limits for the UI (enforced roughly client-side before reserving)
export const MEDIA_LIMITS = {
  image: 25 * 1024 * 1024, // 25 MB
  audio: 100 * 1024 * 1024, // 100 MB
  video: 200 * 1024 * 1024, // 200 MB
};

export async function getMediaStorageSummary(): Promise<MediaStorageSummary> {
  const { data, error } = await supabase.rpc('media_storage_summary');
  if (error) throw error;
  return data as MediaStorageSummary;
}

export async function reserveMediaAsset(
  kind: MediaKind,
  mime: string,
  size: number,
  name: string,
  source: MediaSource = 'upload'
): Promise<{ id: string; storage_path: string }> {
  // Rough client-side check to fail fast
  if (size > MEDIA_LIMITS[kind]) {
    const limitMB = Math.round(MEDIA_LIMITS[kind] / (1024 * 1024));
    throw new Error(`File is too large. Max size for ${kind} is ${limitMB}MB.`);
  }

  const { data, error } = await supabase.rpc('reserve_media_asset', {
    p_kind: kind,
    p_mime: mime,
    p_size: size,
    p_name: name,
    p_source: source,
  });
  if (error) throw error;
  return data as { id: string; storage_path: string };
}

export async function finalizeMediaAsset(
  id: string,
  meta?: {
    thumb_path?: string;
    width?: number;
    height?: number;
    duration_ms?: number;
    peaks?: number[];
  }
): Promise<void> {
  const { error } = await supabase.rpc('finalize_media_asset', {
    p_id: id,
    p_thumb_path: meta?.thumb_path,
    p_width: meta?.width,
    p_height: meta?.height,
    p_duration_ms: meta?.duration_ms,
    p_peaks: meta?.peaks ? JSON.stringify(meta.peaks) : null,
  });
  if (error) throw error;
}

export async function getMediaAssets(options?: {
  kind?: MediaKind;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<MediaAsset[]> {
  let query = supabase
    .from('media_assets')
    .select('*')
    .is('deleted_at', null)
    .eq('status', 'ready')
    .order('created_at', { ascending: false });

  if (options?.kind) {
    query = query.eq('kind', options.kind);
  }
  if (options?.search) {
    // using simple ILIKE for basic title search
    query = query.ilike('title', `%${options.search}%`);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as MediaAsset[];
}

// Generates a short-lived signed URL for a private media asset
// In a real app we'd batch these and cache them.
export async function getAssetSignedUrl(asset: MediaAsset): Promise<string> {
  if (asset.public_path) {
    // Return public URL if published
    const { data } = supabase.storage.from('media-public').getPublicUrl(asset.public_path);
    return data.publicUrl;
  }
  
  const { data, error } = await supabase.storage
    .from(asset.storage_bucket)
    .createSignedUrl(asset.storage_path, 3600); // 1 hour

  if (error) throw error;
  return data.signedUrl;
}

export async function updateMediaAsset(id: string, updates: Partial<MediaAsset>): Promise<void> {
  const { error } = await supabase.from('media_assets').update({
    ...updates,
    updated_at: new Date().toISOString()
  }).eq('id', id);
  if (error) throw error;
}

export async function trashMediaAsset(id: string): Promise<void> {
  const { error } = await supabase.from('media_assets').update({
    deleted_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', id);
  if (error) throw error;
}
