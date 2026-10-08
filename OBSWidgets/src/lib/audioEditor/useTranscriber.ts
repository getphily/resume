import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import type { Word } from './transcript';

export interface TranscriberState {
  status: 'idle' | 'loading' | 'transcribing' | 'done' | 'error';
  progress: number;
  message?: string;
}

export function useTranscriber(
  onWordsAppended: (words: Word[]) => void,
  onDone: () => void,
) {
  const [state, setState] = useState<TranscriberState>({ status: 'idle', progress: 0 });
  const workerRef = useRef<Worker | null>(null);

  const initWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../../workers/transcribe.worker.ts', import.meta.url), { type: 'module' });
    }
    return workerRef.current;
  }, []);

  const transcribe = useCallback(async (source: AudioBuffer, language = 'en') => {
    const worker = initWorker();
    setState({ status: 'loading', progress: 0, message: 'Waking up AI engine...' });
    
    const device = (await (navigator as any).gpu?.requestAdapter()) ? 'webgpu' : 'wasm';
    worker.postMessage({ type: 'load', model: 'onnx-community/whisper-base_timestamped', device });

    // Downmix to 16kHz Mono for Whisper
    const ctx = new OfflineAudioContext(1, Math.ceil(source.duration * 16_000), 16_000);
    const src = ctx.createBufferSource();
    src.buffer = source;
    src.connect(ctx.destination);
    src.start();
    const audio = (await ctx.startRendering()).getChannelData(0);

    worker.onmessage = ({ data }) => {
      if (data.type === 'download') {
        const pct = data.total ? Math.round((data.loaded / data.total) * 100) : 0;
        setState({ status: 'loading', progress: pct, message: `Downloading model: ${data.file}` });
      }
      if (data.type === 'ready') {
        setState({ status: 'transcribing', progress: 0, message: 'Transcribing...' });
        worker.postMessage({ type: 'transcribe', audio, language }, [audio.buffer]);
      }
      if (data.type === 'words') {
        onWordsAppended(data.words);
        setState({ status: 'transcribing', progress: Math.round(data.progress * 100), message: 'Transcribing...' });
      }
      if (data.type === 'done') {
        setState({ status: 'done', progress: 100 });
        onDone();
      }
      if (data.type === 'error') {
        setState({ status: 'error', progress: 0, message: data.message });
        toast.error(data.message, { position: 'top-center' });
      }
    };
  }, [initWorker, onWordsAppended, onDone]);

  return { state, transcribe };
}
