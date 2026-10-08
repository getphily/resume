/**
 * Pure audio helpers for the Podcast Audio Studio.
 *
 * Editing is non-destructive: every function returns a NEW AudioBuffer and never mutates
 * its input, so the editor can keep a history stack for undo/redo.
 */

import type { Range } from './transcript';

/**
 * Clamp ranges to [0, duration], drop empty ones, sort by start and merge overlaps.
 * Needed because users can drag overlapping regions.
 */
export function normalizeRanges(ranges: Range[], duration: number): Range[] {
  const clamped = ranges
    .map(r => ({
      start: Math.max(0, Math.min(r.start, r.end)),
      end: Math.min(duration, Math.max(r.start, r.end)),
    }))
    .filter(r => r.end - r.start > 0.001)
    .sort((a, b) => a.start - b.start);

  const merged: Range[] = [];
  for (const r of clamped) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) last.end = Math.max(last.end, r.end);
    else merged.push({ ...r });
  }
  return merged;
}

/** The parts of [0, duration] NOT covered by `ranges` (ranges must already be normalized). */
export function invertRanges(ranges: Range[], duration: number): Range[] {
  const out: Range[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) out.push({ start: cursor, end: r.start });
    cursor = r.end;
  }
  if (cursor < duration) out.push({ start: cursor, end: duration });
  return out;
}

/**
 * Build a new buffer by concatenating the given segments (in order) of `source`.
 * This is the core splice primitive — Trim and Remove are both expressed with it.
 */
export function concatSegments(source: AudioBuffer, segments: Range[]): AudioBuffer | null {
  const { sampleRate, numberOfChannels } = source;
  
  // 8ms crossfade = 0.008 * sampleRate samples
  const xfadeSamples = Math.floor(0.008 * sampleRate);

  const sampleRanges = segments
    .map(s => ({
      from: Math.max(0, Math.round(s.start * sampleRate)),
      to: Math.min(source.length, Math.round(s.end * sampleRate)),
    }))
    .filter(s => s.to > s.from);

  if (sampleRanges.length === 0) return null;

  // totalLength = sum(lengths) - (num_segments - 1) * xfadeSamples
  const totalLength = sampleRanges.reduce((sum, s) => sum + (s.to - s.from), 0) - (sampleRanges.length - 1) * xfadeSamples;
  if (totalLength <= 0) return null;

  const out = new AudioBuffer({ length: totalLength, numberOfChannels, sampleRate });
  for (let c = 0; c < numberOfChannels; c++) {
    const src = source.getChannelData(c);
    const dst = out.getChannelData(c);
    let write = 0;
    
    for (let i = 0; i < sampleRanges.length; i++) {
      const s = sampleRanges[i];
      const len = s.to - s.from;
      
      if (i === 0) {
        dst.set(src.subarray(s.from, s.to), write);
        write += len;
      } else {
        write -= xfadeSamples;
        for (let j = 0; j < xfadeSamples; j++) {
          const t = j / xfadeSamples;
          const gain1 = Math.cos(t * 0.5 * Math.PI);
          const gain2 = Math.cos((1.0 - t) * 0.5 * Math.PI);
          dst[write + j] = dst[write + j] * gain1 + src[s.from + j] * gain2;
        }
        dst.set(src.subarray(s.from + xfadeSamples, s.to), write + xfadeSamples);
        write += len;
      }
    }
  }
  return out;
}

/** Remove the given ranges and stitch the remainder together. Returns null if nothing would be left. */
export function removeRanges(source: AudioBuffer, ranges: Range[]): AudioBuffer | null {
  const normalized = normalizeRanges(ranges, source.duration);
  if (normalized.length === 0) return source;
  return concatSegments(source, invertRanges(normalized, source.duration));
}

/** Keep only the given ranges (discarding everything else), joined in time order. */
export function keepRanges(source: AudioBuffer, ranges: Range[]): AudioBuffer | null {
  const normalized = normalizeRanges(ranges, source.duration);
  if (normalized.length === 0) return source;
  return concatSegments(source, normalized);
}

/** Decode any browser-supported audio Blob (mp3, wav, webm/opus from MediaRecorder, m4a...). */
export async function decodeBlob(blob: Blob): Promise<AudioBuffer> {
  const arrayBuffer = await blob.arrayBuffer();
  const Ctx: typeof AudioContext =
    window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  try {
    return await ctx.decodeAudioData(arrayBuffer);
  } finally {
    ctx.close().catch(() => {});
  }
}

/** Encode an AudioBuffer as a 16-bit PCM WAV Blob (channels interleaved). */
export function encodeWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = buffer.length * blockAlign;

  const view = new DataView(new ArrayBuffer(44 + dataSize));
  const writeString = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c));

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

/** m:ss.t formatting for the transport clock. */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, '0')}`;
}
