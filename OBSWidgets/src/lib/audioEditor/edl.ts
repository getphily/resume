import type { Range, Word, StudioState } from './transcript';

/* ---------- range algebra (kept is always sorted + disjoint) ---------- */

export function subtract(kept: Range[], cut: Range): Range[] {
  return kept.flatMap((r) => {
    if (cut.end <= r.start || cut.start >= r.end) return [r];
    const out: Range[] = [];
    if (cut.start > r.start) out.push({ start: r.start, end: cut.start });
    if (cut.end < r.end) out.push({ start: cut.end, end: r.end });
    return out;
  });
}

export function add(kept: Range[], r: Range): Range[] {
  const all = [...kept, r].sort((a, b) => a.start - b.start);
  const out: Range[] = [];
  for (const x of all) {
    const last = out[out.length - 1];
    if (last && x.start <= last.end + 1e-6) {
      last.end = Math.max(last.end, x.end);
    } else {
      out.push({ ...x });
    }
  }
  return out;
}

/* ---------- timeline (what you hear) <-> source (what words reference) ---------- */

export function timelineToSource(kept: Range[], t: number): number {
  let acc = 0;
  for (const r of kept) {
    const len = r.end - r.start;
    if (t < acc + len) return r.start + (t - acc);
    acc += len;
  }
  return kept.length ? kept[kept.length - 1].end : 0;
}

export function sourceToTimeline(kept: Range[], s: number): number | null {
  let acc = 0;
  for (const r of kept) {
    if (s < r.start) return null; // s is inside a deleted gap
    if (s <= r.end) return acc + (s - r.start);
    acc += r.end - r.start;
  }
  return null;
}

/** A waveform region may span several kept segments -> several source ranges. */
export function timelineRangeToSource(kept: Range[], a: number, b: number): Range[] {
  const out: Range[] = [];
  let acc = 0;
  for (const r of kept) {
    const len = r.end - r.start;
    const lo = Math.max(a, acc), hi = Math.min(b, acc + len);
    if (hi > lo) out.push({ start: r.start + (lo - acc), end: r.start + (hi - acc) });
    acc += len;
  }
  return out;
}

/* ---------- AUDIO -> TEXT: derived, never stored ---------- */

export function deriveDeleted(words: Word[], kept: Range[]): Uint8Array {
  const deleted = new Uint8Array(words.length);
  let k = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const dur = Math.max(1e-3, w.end - w.start);
    while (k < kept.length && kept[k].end <= w.start) k++;
    
    let inside = 0;
    for (let j = k; j < kept.length && kept[j].start < w.end; j++) {
      inside += Math.min(w.end, kept[j].end) - Math.max(w.start, kept[j].start);
    }
    deleted[i] = inside / dur < 0.5 ? 1 : 0;
  }
  return deleted;
}

/* ---------- TEXT -> AUDIO ---------- */

const MAX_PAD = 0.15; // never eat more than 150 ms of neighbouring silence per side

/**
 * Cut from the middle of the gap before word i to the middle of the gap after word j.
 * Halving both gaps leaves one natural-length pause where the words were.
 */
export function wordsToCutRange(words: Word[], i: number, j: number): Range {
  const a = words[i].start;
  const b = words[j].end;
  const prev = words[i - 1];
  const next = words[j + 1];
  
  return {
    start: prev ? Math.max(a - MAX_PAD, (prev.end + a) / 2) : Math.max(0, a - MAX_PAD),
    end: next ? Math.min(b + MAX_PAD, (b + next.start) / 2) : b + MAX_PAD,
  };
}

/** Whisper timestamps are approximate: nudge each cut edge to the quietest 5 ms within ±40 ms. */
export function snapToQuiet(ch: Float32Array, sr: number, t: number, radius = 0.04): number {
  const win = Math.round(0.005 * sr);
  const from = Math.max(0, Math.round((t - radius) * sr));
  const to = Math.min(ch.length - win, Math.round((t + radius) * sr));
  
  let best = Math.round(t * sr);
  let bestE = Infinity;
  
  for (let i = from; i <= to; i += win >> 1) {
    let e = 0;
    for (let n = 0; n < win; n++) {
      e += ch[i + n] * ch[i + n];
    }
    if (e < bestE) {
      bestE = e;
      best = i + (win >> 1);
    }
  }
  return best / sr;
}

/* ---------- glue used by the UI ---------- */

export function cutWords(state: StudioState, i: number, j: number): Range {
  const r = wordsToCutRange(state.transcript!.words, i, j);
  const ch = state.source!.getChannelData(0);
  const sr = state.source!.sampleRate;
  return { start: snapToQuiet(ch, sr, r.start), end: snapToQuiet(ch, sr, r.end) };
}

export function cutWaveformRegion(kept: Range[], a: number, b: number): Range[] {
  return timelineRangeToSource(kept, a, b);
}
