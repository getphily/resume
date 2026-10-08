import type { Transcript, Range } from './transcript';
import { deriveDeleted } from './edl';

function formatTimeSrt(seconds: number): string {
  const d = new Date(seconds * 1000);
  return d.toISOString().substr(11, 12).replace('.', ',');
}

function formatTimeVtt(seconds: number): string {
  const d = new Date(seconds * 1000);
  return d.toISOString().substr(11, 12);
}

export function exportText(transcript: Transcript, kept: Range[]): string {
  const deleted = deriveDeleted(transcript.words, kept);
  let text = '';
  let lastSpeaker = null;

  for (let i = 0; i < transcript.words.length; i++) {
    if (deleted[i]) continue;
    const w = transcript.words[i];
    if (w.speaker !== lastSpeaker) {
      if (text.length > 0) text += '\n\n';
      const speakerName = w.speaker != null ? transcript.speakers[w.speaker]?.name || `Speaker ${w.speaker}` : 'Speaker';
      text += `${speakerName}:\n`;
      lastSpeaker = w.speaker;
    }
    text += (w.correctedText || w.text) + ' ';
  }
  return text.trim();
}

export function exportSrt(transcript: Transcript, kept: Range[]): string {
  const deleted = deriveDeleted(transcript.words, kept);
  let srt = '';
  let counter = 1;
  let currentSubtitle: string[] = [];
  let currentStart = -1;
  let currentEnd = -1;

  const flush = () => {
    if (currentSubtitle.length > 0) {
      srt += `${counter++}\n${formatTimeSrt(currentStart)} --> ${formatTimeSrt(currentEnd)}\n${currentSubtitle.join(' ')}\n\n`;
      currentSubtitle = [];
    }
  };

  for (let i = 0; i < transcript.words.length; i++) {
    if (deleted[i]) continue;
    const w = transcript.words[i];
    
    if (currentSubtitle.length === 0) {
      currentStart = w.start;
    }
    
    currentSubtitle.push(w.correctedText || w.text);
    currentEnd = w.end;

    // Flush every ~10 words or on long gaps
    if (currentSubtitle.length > 10 || (i + 1 < transcript.words.length && transcript.words[i+1].start - w.end > 2)) {
      flush();
    }
  }
  flush();
  return srt;
}

export function exportVtt(transcript: Transcript, kept: Range[]): string {
  const deleted = deriveDeleted(transcript.words, kept);
  let vtt = 'WEBVTT\n\n';
  let currentSubtitle: string[] = [];
  let currentStart = -1;
  let currentEnd = -1;

  const flush = () => {
    if (currentSubtitle.length > 0) {
      vtt += `${formatTimeVtt(currentStart)} --> ${formatTimeVtt(currentEnd)}\n${currentSubtitle.join(' ')}\n\n`;
      currentSubtitle = [];
    }
  };

  for (let i = 0; i < transcript.words.length; i++) {
    if (deleted[i]) continue;
    const w = transcript.words[i];
    
    if (currentSubtitle.length === 0) {
      currentStart = w.start;
    }
    
    currentSubtitle.push(w.correctedText || w.text);
    currentEnd = w.end;

    if (currentSubtitle.length > 10 || (i + 1 < transcript.words.length && transcript.words[i+1].start - w.end > 2)) {
      flush();
    }
  }
  flush();
  return vtt;
}
