/**
 * audioAnalyser.js — Pure utility functions for multi-band audio analysis.
 *
 * Provides bass / mid / high energy, overall volume (RMS),
 * beat detection (energy-spike vs. rolling average), and
 * kick detection (sub-bass spike).
 */

/** Number of previous frames we average for beat detection. */
const HISTORY_SIZE = 60

/**
 * Split the full FFT spectrum into three bands and compute energies.
 *
 * @param {Uint8Array} data  – Frequency data from AnalyserNode.getByteFrequencyData()
 * @param {number}     bins  – Total number of frequency bins (analyser.frequencyBinCount)
 * @returns {{ bass: number, mid: number, high: number, volume: number, spectrum: Uint8Array }}
 *   Energies are normalised 0‑1.
 */
export function analyseBands(data, bins) {
  // Band boundaries (approximate Hz ranges for 44.1 kHz sample-rate, 2048 fftSize):
  // bin 0–10  → ~0–215 Hz   (bass)
  // bin 11–80 → ~215–1720 Hz (mids)
  // bin 81–250 → ~1720–5380 Hz (highs) (stop at 250 to avoid high frequency silence dragging average down)
  const bassEnd = Math.min(11, bins)
  const midEnd  = Math.min(80, bins)
  const highEnd = Math.min(250, bins)

  let bassSum = 0
  let midMax  = 0
  let highMax = 0
  let totalSum = 0

  for (let i = 0; i < highEnd; i++) {
    const v = data[i]
    totalSum += v
    if (i < bassEnd) {
      bassSum += v
    } else if (i < midEnd) {
      if (v > midMax) midMax = v
    } else {
      if (v > highMax) highMax = v
    }
  }

  // Get remaining bins just for RMS
  for (let i = highEnd; i < bins; i++) {
    totalSum += data[i]
  }

  const bass = bassSum  / (bassEnd * 255)
  const mid  = Math.min(1.0, (midMax / 255) * 1.3)
  const high = Math.min(1.0, (highMax / 255) * 2.5)

  // RMS-style volume (0‑1)
  let rms = 0
  for (let i = 0; i < bins; i++) {
    const n = data[i] / 255
    rms += n * n
  }
  const volume = Math.sqrt(rms / bins)

  return { bass, mid, high, volume, spectrum: data }
}

/**
 * Creates a beat / kick detector backed by a rolling average history.
 */
export function createBeatDetector() {
  const history = new Float32Array(HISTORY_SIZE)
  const kickHistory = new Float32Array(HISTORY_SIZE)
  let idx = 0
  let count = 0

  /**
   * @param {number} bass   – Current bass energy 0‑1
   * @param {number} volume – Current overall volume 0‑1
   * @returns {{ isBeat: boolean, isKick: boolean }}
   */
  function detect(bass, volume) {
    // Rolling average
    const filled = Math.min(count, HISTORY_SIZE)

    let avgVol = 0
    let avgBass = 0
    for (let i = 0; i < filled; i++) {
      avgVol  += history[i]
      avgBass += kickHistory[i]
    }
    avgVol  = filled > 0 ? avgVol  / filled : 0
    avgBass = filled > 0 ? avgBass / filled : 0

    // Spike detection — beat if volume > 1.4× rolling avg, kick if bass > 1.6× rolling avg
    const isBeat = volume > avgVol * 1.4 && volume > 0.12
    const isKick = bass   > avgBass * 1.6 && bass   > 0.2

    // Update rolling buffer
    history[idx % HISTORY_SIZE]     = volume
    kickHistory[idx % HISTORY_SIZE] = bass
    idx++
    count++

    return { isBeat, isKick }
  }

  return { detect }
}
