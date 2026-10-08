import { pipeline, env, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

env.allowLocalModels = false; // static host: always fetch from the HF hub (then cached)
const SR = 16_000;
let asr: AutomaticSpeechRecognitionPipeline | null = null;
const post = (m: unknown) => (self as unknown as Worker).postMessage(m);

self.onmessage = async ({ data }: MessageEvent) => {
  try {
    if (data.type === 'load') {
      asr = await pipeline('automatic-speech-recognition', data.model, {
        device: data.device, // 'webgpu' | 'wasm'
        dtype: data.device === 'webgpu'
          ? { encoder_model: 'fp32', decoder_model_merged: 'q4' }
          : 'q8',
        progress_callback: (p: any) => {
          if (p.status === 'progress') post({ type: 'download', file: p.file, loaded: p.loaded, total: p.total });
        },
      }) as AutomaticSpeechRecognitionPipeline;
      post({ type: 'ready' });
      return;
    }

    if (data.type === 'transcribe') {
      const audio: Float32Array = data.audio; // mono, 16 kHz, transferred (zero-copy)
      const windows = splitAtSilence(audio, SR, 28, 20); // [[startSample, endSample], ...]
      let n = 0;
      
      for (let k = 0; k < windows.length; k++) {
        const [s, e] = windows[k];
        const chunk = audio.subarray(s, e);
        if (rms(chunk) > 0.003) { // skip silence -> no hallucinations
          const out: any = await asr!(chunk, { return_timestamps: 'word', language: data.language, task: 'transcribe' });
          const offset = s / SR;
          const words = (out.chunks ?? [])
            .map((c: any) => ({
              id: `w${n++}`,
              text: String(c.text).trim(),
              start: offset + c.timestamp[0],
              end: offset + (c.timestamp[1] ?? c.timestamp[0] + 0.2),
              speaker: null,
            }))
            .filter((w: any) => w.text);
          post({ type: 'words', words, progress: (k + 1) / windows.length });
        } else {
          post({ type: 'words', words: [], progress: (k + 1) / windows.length });
        }
      }
      post({ type: 'done' });
    }
  } catch (err: any) {
    post({ type: 'error', message: String(err?.message ?? err) });
  }
};

function rms(x: Float32Array) {
  let s = 0;
  for (let i = 0; i < x.length; i++) s += x[i] * x[i];
  return Math.sqrt(s / x.length);
}

/** Cut near every `maxSec`, at the quietest 200 ms between `minSec` and `maxSec`. */
function splitAtSilence(x: Float32Array, sr: number, maxSec: number, minSec: number): [number, number][] {
  const out: [number, number][] = [];
  const win = Math.round(0.2 * sr);
  const hop = Math.round(0.05 * sr);
  let start = 0;
  
  while (x.length - start > maxSec * sr) {
    let best = start + maxSec * sr;
    let bestE = Infinity;
    
    for (let i = start + minSec * sr; i + win <= start + maxSec * sr; i += hop) {
      const e = rms(x.subarray(i, i + win));
      if (e < bestE) {
        bestE = e;
        best = i + (win >> 1);
      }
    }
    out.push([start, best]);
    start = best;
  }
  
  out.push([start, x.length]);
  return out;
}
