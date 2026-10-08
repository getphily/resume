export interface Range {
  start: number;
  end: number;
}

export interface Word {
  id: string;
  text: string;            // as transcribed
  correctedText?: string;  // user typo fix: changes text only, never audio
  start: number;           // source time
  end: number;
  speaker: number | null;  // diarization cluster id
}

export interface Transcript {
  words: Word[];                         // sorted by start, never filtered
  speakers: Record<number, { name: string }>;
  model: string;
  language: string;
}

export interface StudioState {
  source: AudioBuffer | null;            // immutable
  polished: AudioBuffer | null;          // same length as source
  layer: 'original' | 'polished';
  history: { stack: Range[][]; cursor: number };   // kept = stack[cursor]
  transcript: Transcript | null;
  view: 'waveform' | 'split' | 'transcript';
}
