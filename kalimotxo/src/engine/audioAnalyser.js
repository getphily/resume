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
  // Assuming ~24Hz per bin (48kHz sample rate / 2048 FFT size)
  // Bass: ~0Hz to ~250Hz (bins 0 to 10)
  // Mid: ~250Hz to ~4000Hz (bins 11 to 166)
  // High: ~4000Hz to ~16000Hz (bins 167 to ~660)
  
  const bassEnd = 10
  const midEnd = 166
  const highEnd = 660

  let bassRmsSum = 0
  let midRmsSum = 0
  let highRmsSum = 0
  let totalRmsSum = 0
  
  let bassMax = 0
  let midMax = 0
  let highMax = 0

  for (let i = 0; i < highEnd; i++) {
    const v = data[i] / 255
    const sq = v * v
    totalRmsSum += sq
    
    if (i <= bassEnd) {
      bassRmsSum += sq
      if (v > bassMax) bassMax = v
    } else if (i <= midEnd) {
      midRmsSum += sq
      if (v > midMax) midMax = v
    } else {
      highRmsSum += sq
      if (v > highMax) highMax = v
    }
  }



  const bassCount = bassEnd + 1
  const midCount = midEnd - bassEnd
  const highCount = highEnd - midEnd

  // Calculate RMS (Root Mean Square) for each band
  // This provides a smooth, accurate energy reading that doesn't easily peg to 100%
  const bassRms = Math.sqrt(bassRmsSum / bassCount)
  const midRms = Math.sqrt(midRmsSum / midCount)
  const highRms = Math.sqrt(highRmsSum / highCount)

  // Dialed down multipliers to prevent maxing out the meters
  const bass = Math.min(1.0, bassRms * 0.7)
  const mid  = Math.min(1.0, midRms * 0.8)
  const high = Math.min(1.0, Math.pow(highRms, 0.8) * 1.1)

  // RMS-style volume (0‑1)
  let rms = 0
  for (let i = 0; i < bins; i++) {
    const n = data[i] / 255
    rms += n * n
  }
  const volume = Math.sqrt(rms / bins)

  return { 
    bass, mid, high, volume, spectrum: data,
    rawBass: Math.min(1.0, bassMax * 0.9),
    rawMid: Math.min(1.0, midMax * 1.1),
    rawHigh: Math.min(1.0, highMax * 1.3)
  }
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
