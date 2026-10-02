/**
 * Lightweight Web Audio API synthesizer for timer alarms
 * Works offline, in OBS browser sources, and requires zero external MP3 assets.
 */

export function playTimerAlarm(type: 'BELL' | 'DIGITAL' | 'GONG' | 'CLASSIC' = 'BELL', volume: number = 0.8) {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), now);
    masterGain.connect(ctx.destination);

    switch (type) {
      case 'DIGITAL': {
        // Double beep pattern: Beep-beep, pause, Beep-beep
        [0, 0.12, 0.35, 0.47].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1046.5, now + offset); // C6
          gain.gain.setValueAtTime(0.3, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + offset);
          osc.stop(now + offset + 0.09);
        });
        break;
      }
      case 'GONG': {
        // Deep resonating gong chime
        const fundamental = 220; // A3
        [1, 1.48, 2.05, 2.85].forEach((ratio, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(fundamental * ratio, now);
          gain.gain.setValueAtTime(0.5 / (i + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 2.6);
        });
        break;
      }
      case 'CLASSIC': {
        // Melodic 3-tone chime (E5, G#5, B5)
        const notes = [659.25, 830.61, 987.77];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          gain.gain.setValueAtTime(0.4, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.7);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.75);
        });
        break;
      }
      case 'BELL':
      default: {
        // Clean broadcast desk bell chime
        const frequencies = [880, 1760]; // A5 and octave harmonic
        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(idx === 0 ? 0.6 : 0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 1.25);
        });
        break;
      }
    }
  } catch (e) {
    console.warn('Audio playback not permitted or not supported:', e);
  }
}
