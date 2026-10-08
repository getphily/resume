/**
 * "Magic Polish" — automatic spoken-word mastering. UI-free.
 *
 * Pipeline (validated by spike; see Magic_Polish_Mastering_Plan.md):
 *   resample→48 kHz → RNNoise (Web Worker, WASM) → [OfflineAudioContext: HPF 80 Hz → compressor]
 *   → scan the RENDERED peak → apply one gain so the peak lands exactly on the ceiling.
 *
 * Why the peak scan comes last: DynamicsCompressorNode applies automatic, level-dependent makeup
 * gain, so normalising before it misses the target (measured −3.3 dBFS instead of −1.0).
 */

export type MasterPreset = 'gentle' | 'podcast' | 'broadcast';
export type MasterStage = 'prepare' | 'denoise' | 'compress' | 'level' | 'done';

export interface MasterSettings {
  denoise: boolean;
  /** 0..1 wet/dry mix of the noise-reduced signal. */
  denoiseStrength: number;
  preset: MasterPreset;
  /** Output peak ceiling in dBFS (negative). */
  ceilingDb: number;
}

export const DEFAULT_MASTER_SETTINGS: MasterSettings = {
  denoise: true,
  denoiseStrength: 1,
  preset: 'podcast',
  ceilingDb: -1,
};

/** Starting points for spoken word — tune by ear. */
export const COMPRESSOR_PRESETS: Record<MasterPreset, { threshold: number; ratio: number; knee: number; attack: number; release: number }> = {
  gentle: { threshold: -20, ratio: 2, knee: 20, attack: 0.015, release: 0.3 },
  podcast: { threshold: -24, ratio: 3, knee: 12, attack: 0.01, release: 0.25 },
  broadcast: { threshold: -28, ratio: 4, knee: 6, attack: 0.005, release: 0.2 },
};

export const MASTER_SAMPLE_RATE = 48_000; // RNNoise requires 48 kHz
/** DynamicsCompressorNode look-ahead, measured at 288 samples (6 ms) @ 48 kHz. */
const COMPRESSOR_LOOKAHEAD = 288;
const DENOISE_WORKER_URL = '/audio/rnnoise/denoise.worker.js';

// ---------------------------------------------------------------------------
// Peak scan + normalisation
// ---------------------------------------------------------------------------

/** Highest absolute sample across every channel. */
export function scanPeak(channels: Float32Array[]): number {
  let peak = 0;
  for (const ch of channels) {
    for (let i = 0; i < ch.length; i++) {
      const v = Math.abs(ch[i]);
      if (v > peak) peak = v;
    }
  }
  return peak;
}

export const dbToLinear = (db: number): number => Math.pow(10, db / 20);
export const linearToDb = (lin: number): number => 20 * Math.log10(Math.max(lin, 1e-9));

/** Multiplier that moves `peak` to `targetDb` dBFS. Guards silence and runaway boost. */
export function normalizeGain(peak: number, targetDb = -1, maxBoostDb = 30): number {
  if (peak < 1e-5) return 1; // silence: never amplify the noise floor
  return Math.min(dbToLinear(targetDb) / peak, dbToLinear(maxBoostDb));
}

// ---------------------------------------------------------------------------
// Stages
// ---------------------------------------------------------------------------

async function resampleTo(input: AudioBuffer, rate: number): Promise<AudioBuffer> {
  if (input.sampleRate === rate) return input;
  const ctx = new OfflineAudioContext(input.numberOfChannels, Math.ceil(input.duration * rate), rate);
  const src = new AudioBufferSourceNode(ctx, { buffer: input });
  src.connect(ctx.destination);
  src.start();
  return ctx.startRendering();
}

function denoiseInWorker(
  channels: Float32Array[],
  onProgress: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<Float32Array[]> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Cancelled', 'AbortError'));
    const worker = new Worker(DENOISE_WORKER_URL, { type: 'module' });
    const onAbort = () => {
      worker.terminate();
      reject(new DOMException('Cancelled', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    const finish = () => signal?.removeEventListener('abort', onAbort);

    worker.onmessage = ({ data }) => {
      if (data.type === 'progress') onProgress(data.value);
      else if (data.type === 'done') {
        finish();
        worker.terminate();
        resolve(data.channels as Float32Array[]);
      } else if (data.type === 'error') {
        finish();
        worker.terminate();
        reject(new Error(data.message));
      }
    };
    worker.onerror = e => {
      finish();
      worker.terminate();
      reject(new Error(e.message || 'Noise reduction worker failed'));
    };
    const copies = channels.map(c => c.slice()); // transfer copies; keep originals for the dry/wet mix
    worker.postMessage({ channels: copies }, copies.map(c => c.buffer));
  });
}

/** Wait a tick so progress UI can paint between heavy synchronous stages. */
const nextFrame = () => new Promise<void>(r => setTimeout(r, 0));

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Returns a NEW polished AudioBuffer at 48 kHz; the input is never mutated. */
export async function masterAudio(
  input: AudioBuffer,
  settings: MasterSettings,
  onProgress: (stage: MasterStage, fraction: number) => void,
  signal?: AbortSignal,
): Promise<AudioBuffer> {
  onProgress('prepare', 0);
  const source = await resampleTo(input, MASTER_SAMPLE_RATE);
  const n = source.length;
  const chCount = source.numberOfChannels;
  let channels: Float32Array[] = Array.from({ length: chCount }, (_, c) => source.getChannelData(c));

  // 1 — Noise reduction (Worker + RNNoise WASM)
  if (settings.denoise && settings.denoiseStrength > 0) {
    onProgress('denoise', 0);
    const wet = await denoiseInWorker(channels, p => onProgress('denoise', p), signal);
    const k = Math.min(1, Math.max(0, settings.denoiseStrength));
    channels = channels.map((dry, c) => {
      if (k >= 1) return wet[c];
      const mixed = new Float32Array(n);
      for (let i = 0; i < n; i++) mixed[i] = wet[c][i] * k + dry[i] * (1 - k);
      return mixed;
    });
  }
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');

  // 2 — Offline graph: highpass → compressor
  onProgress('compress', 0);
  await nextFrame();
  const staged = new AudioBuffer({ length: n, numberOfChannels: chCount, sampleRate: MASTER_SAMPLE_RATE });
  channels.forEach((c, i) => staged.getChannelData(i).set(c));

  const ctx = new OfflineAudioContext(chCount, n + COMPRESSOR_LOOKAHEAD, MASTER_SAMPLE_RATE);
  const node = new AudioBufferSourceNode(ctx, { buffer: staged });
  const hpf = new BiquadFilterNode(ctx, { type: 'highpass', frequency: 80, Q: 0.707 });
  const comp = new DynamicsCompressorNode(ctx, COMPRESSOR_PRESETS[settings.preset]);
  node.connect(hpf).connect(comp).connect(ctx.destination);
  node.start();
  const rendered = await ctx.startRendering();
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');

  // 3 — Measure the REAL output, then level it onto the ceiling
  onProgress('level', 0);
  await nextFrame();
  const out = new AudioBuffer({ length: n, numberOfChannels: chCount, sampleRate: MASTER_SAMPLE_RATE });
  const slices: Float32Array[] = Array.from({ length: chCount }, (_, c) =>
    rendered.getChannelData(c).slice(COMPRESSOR_LOOKAHEAD, COMPRESSOR_LOOKAHEAD + n),
  );
  const gain = normalizeGain(scanPeak(slices), settings.ceilingDb);
  slices.forEach((ch, c) => {
    for (let i = 0; i < ch.length; i++) ch[i] *= gain;
    out.getChannelData(c).set(ch);
  });

  onProgress('done', 1);
  return out;
}
