import { supabase } from '@/lib/supabase';

/** Shared save helpers so the export row and the Magic Polish panel behave identically. */

export const AUDIO_BUCKET = 'podcast-audio';
/** Matches the bucket's file_size_limit in supabase_podcast_audio.sql. */
export const MAX_CLOUD_BYTES = 50 * 1024 * 1024;

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'recording';
}

export function timestampSuffix(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

/** e.g. my-show-polished-20261007-181042 */
export function makeFileName(base: string, tag?: string): string {
  return `${base}${tag ? `-${tag}` : ''}-${timestampSuffix()}`;
}

/** Upload to the signed-in user's private Supabase folder. Throws an Error with a user-friendly message. */
export async function saveToCloud(blob: Blob, name: string): Promise<void> {
  if (blob.size > MAX_CLOUD_BYTES) {
    throw new Error(`This file is ${(blob.size / 1048576).toFixed(0)} MB; cloud saves are limited to 50 MB. Download it or save to Google Drive instead.`);
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Sign in to save audio to the cloud.');
  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(`${session.user.id}/${name}`, blob, { contentType: 'audio/wav', upsert: false });
  if (error) throw error;
}
