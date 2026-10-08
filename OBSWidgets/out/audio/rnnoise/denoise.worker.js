/*
 * Third-party notice
 * ------------------
 * rnnoise.js (renamed from .mjs so any server serves a JS MIME type) / rnnoise.wasm / rnnoise_simd.wasm are the unmodified build artifacts of
 * @shiguredo/rnnoise-wasm v2022.2.0 (Apache-2.0, see ./LICENSE), which wraps Xiph's RNNoise
 * (BSD-3-Clause). Vendored here so the worker can load them from a static path
 * (this app is a Next.js static export with no bundler asset pipeline for workers).
 *
 * Contract: input channels are mono Float32 at 48 kHz in [-1, 1].
 * RNNoise processes fixed 480-sample frames and has ~480 samples (10 ms) of algorithmic delay,
 * which this worker removes so the output is sample-aligned with the input.
 */
import { Rnnoise } from './rnnoise.js';

const LATENCY = 480;

self.onmessage = async ({ data: { channels } }) => {
  try {
    const rn = await Rnnoise.load(); // resolves the .wasm next to this file
    const F = rn.frameSize; // 480
    const out = [];
    const framesPerChannel = Math.ceil((channels[0].length + LATENCY) / F);
    const totalFrames = framesPerChannel * channels.length;
    let doneFrames = 0;

    for (const x of channels) {
      const state = rn.createDenoiseState();
      const y = new Float32Array(x.length);
      const frame = new Float32Array(F);
      for (let i = 0; i < x.length + LATENCY; i += F) {
        frame.fill(0);
        const n = Math.max(0, Math.min(F, x.length - i));
        for (let j = 0; j < n; j++) frame[j] = x[i + j] * 32768; // RNNoise expects 16-bit range
        state.processFrame(frame);
        for (let j = 0; j < F; j++) {
          const o = i + j - LATENCY; // shift out the algorithmic delay
          if (o >= 0 && o < y.length) y[o] = frame[j] / 32768;
        }
        doneFrames++;
        if (doneFrames % 400 === 0) self.postMessage({ type: 'progress', value: doneFrames / totalFrames });
      }
      state.destroy();
      out.push(y);
    }
    self.postMessage({ type: 'done', channels: out }, out.map(c => c.buffer));
  } catch (e) {
    self.postMessage({ type: 'error', message: String(e && e.message ? e.message : e) });
  }
};
