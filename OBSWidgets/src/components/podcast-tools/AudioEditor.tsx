
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
import toast from 'react-hot-toast';
import {
  Mic, Square, Play, Pause, Scissors, Upload, Download, Undo2, Redo2, SkipBack,
  ZoomIn, ZoomOut, Trash2, BoxSelect, CloudUpload, Loader2, Crop, HardDriveUpload,
  Layout, AlignLeft, Activity
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  decodeBlob, encodeWav, formatTime, concatSegments,
} from '@/lib/audioEditor/buffer';
import {
  subtract, add, cutWaveformRegion, timelineToSource, sourceToTimeline, cutWords
} from '@/lib/audioEditor/edl';
import type { Range, Transcript, StudioState } from '@/lib/audioEditor/transcript';
import { isDriveConfigured, preloadDriveSdk, saveToDrive } from '@/lib/audioEditor/drive';
import { makeFileName, saveToCloud as uploadToCloud, slugify } from '@/lib/audioEditor/save';
import { MagicPolishPanel } from '@/components/podcast-tools/MagicPolishPanel';
import { toastDriveError, toastDriveSaved } from '@/components/podcast-tools/driveToasts';
import { useTranscriber } from '@/lib/audioEditor/useTranscriber';
import { exportText, exportSrt, exportVtt } from '@/lib/audioEditor/exportTranscript';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText } from 'lucide-react';
import { TranscribeCard } from '@/components/podcast-tools/TranscribeCard';
import { TranscriptView, type TranscriptViewRef } from '@/components/podcast-tools/TranscriptView';

type RegionsInstance = ReturnType<typeof RegionsPlugin.create>;

const ZOOM_LEVELS = [1, 25, 50, 100, 200];

function resolveThemeColor(cssVar: string, fallback: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${cssVar})`;
  document.body.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color || fallback;
}

interface AudioEditorProps {
  showTitle?: string;
}

export function AudioEditor({ showTitle }: AudioEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsInstance | null>(null);
  const transcriptRef = useRef<TranscriptViewRef>(null);

  const [source, setSource] = useState<AudioBuffer | null>(null);
  const [polished, setPolished] = useState<AudioBuffer | null>(null);
  const [layer, setLayer] = useState<'original' | 'polished'>('original');
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [view, setView] = useState<'waveform' | 'split' | 'transcript'>('waveform');

  const [hist, setHist] = useState<{ stack: Range[][]; cursor: number }>({ stack: [], cursor: -1 });
  const kept = hist.cursor >= 0 ? hist.stack[hist.cursor] ?? [] : [];
  const keptRef = useRef(kept);
  keptRef.current = kept;

  const currentSource = layer === 'polished' && polished ? polished : source;
  const current = useMemo(() => {
    if (!currentSource || kept.length === 0) return null;
    return concatSegments(currentSource, kept);
  }, [currentSource, kept]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [regionCount, setRegionCount] = useState(0);
  const [zoomIdx, setZoomIdx] = useState(0);
  const zoomIdxRef = useRef(0);
  zoomIdxRef.current = zoomIdx;
  const [isBusy, setIsBusy] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [driveProgress, setDriveProgress] = useState<number | null>(null);
  const driveAvailable = isDriveConfigured();
  
  useEffect(() => {
    if (driveAvailable) preloadDriveSdk();
  }, [driveAvailable]);

  // Transcriber
  const { state: tState, transcribe } = useTranscriber(
    (words) => setTranscript(prev => ({
      words: prev ? [...prev.words, ...words] : words,
      speakers: prev?.speakers || {},
      model: 'onnx-community/whisper-base_timestamped',
      language: 'en'
    })),
    () => {} // done
  );

  const handleTranscribe = () => {
    if (!source) return;
    setTranscript({ words: [], speakers: {}, model: 'whisper-base', language: 'en' });
    transcribe(source);
  };

  const recordRef = useRef<InstanceType<typeof RecordPlugin> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('default');

  const loadDevices = useCallback(async () => {
    try {
      if (devices.length === 0 || !devices[0]?.label) {
        // Request permission to get labels
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      }
      const allDevs = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevs.filter(d => d.kind === 'audioinput'));
    } catch (e) {
      console.warn('Microphone permission denied or not available.', e);
    }
  }, [devices]);

  useEffect(() => {
    // Attempt to load devices silently (might not have labels yet)
    navigator.mediaDevices?.enumerateDevices().then(devs => {
      setDevices(devs.filter(d => d.kind === 'audioinput'));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: resolveThemeColor('--muted-foreground', '#94a3b8'),
      progressColor: resolveThemeColor('--primary', '#3b82f6'),
      cursorColor: resolveThemeColor('--foreground', '#0f172a'),
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 128,
      minPxPerSec: ZOOM_LEVELS[0],
      normalize: true,
    });

    const regions = ws.registerPlugin(RegionsPlugin.create());
    regions.enableDragSelection({ color: 'color-mix(in srgb, var(--primary) 25%, transparent)' });

    const record = ws.registerPlugin(RecordPlugin.create({
      scrollingWaveform: true,
      renderRecordedAudio: false
    }));

    const syncRegionCount = () => setRegionCount(regions.getRegions().length);
    regions.on('region-created', syncRegionCount);
    regions.on('region-removed', syncRegionCount);

    record.on('record-progress', (duration) => {
      setRecordSeconds(duration / 1000);
    });
    record.on('record-end', (blob) => {
      setIsRecording(false);
      if (blob.size === 0) {
        toast.error('Nothing was recorded.', { position: 'top-center' });
        return;
      }
      void loadBlobAsAudio(blob, 'the recording');
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));
    ws.on('timeupdate', t => {
      setCurrentTime(t);
      if (transcriptRef.current) {
        // Find current source time based on the active EDL
        const sourceTime = timelineToSource(keptRef.current, t);
        transcriptRef.current.syncPlayback(sourceTime);
      }
    });
    ws.on('ready', () => ws.zoom(ZOOM_LEVELS[zoomIdxRef.current]));

    wavesurferRef.current = ws;
    regionsRef.current = regions;

    recordRef.current = record;
    return () => {
      ws.destroy();
      wavesurferRef.current = null;
      regionsRef.current = null;
      recordRef.current = null;
    };
  }, []); // Initialize WaveSurfer once, use refs for dynamic state

  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws || !current) return;
    let cancelled = false;

    regionsRef.current?.clearRegions();
    setRegionCount(0);
    setCurrentTime(0);
    setIsBusy(true);

    const channels = Array.from({ length: current.numberOfChannels }, (_, i) => current.getChannelData(i));
    ws.loadBlob(encodeWav(current), channels, current.duration)
      .catch(err => {
        if (cancelled) return;
        console.error('[AudioEditor] render failed', err);
        toast.error("Couldn't render the waveform.", { position: 'top-center' });
      })
      .finally(() => {
        if (!cancelled) setIsBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [current]);

  useEffect(() => {
    const ws = wavesurferRef.current;
    if (ws && ws.getDuration() > 0) ws.zoom(ZOOM_LEVELS[zoomIdx]);
  }, [zoomIdx]);



  const pushKept = useCallback((newKept: Range[]) => {
    setHist(prev => {
      const stack = [...prev.stack.slice(0, prev.cursor + 1), newKept].slice(-50);
      return { stack, cursor: stack.length - 1 };
    });
  }, []);

  const canUndo = hist.cursor > 0;
  const canRedo = hist.cursor >= 0 && hist.cursor < hist.stack.length - 1;
  const undo = () => setHist(h => (h.cursor > 0 ? { ...h, cursor: h.cursor - 1 } : h));
  const redo = () => setHist(h => (h.cursor < h.stack.length - 1 ? { ...h, cursor: h.cursor + 1 } : h));

  const loadBlobAsAudio = async (blob: Blob, label: string) => {
    setIsBusy(true);
    try {
      const buf = await decodeBlob(blob);
      setSource(buf);
      setPolished(null);
      setLayer('original');
      setTranscript(null); // Reset transcript on new audio
      setHist({ stack: [[{ start: 0, end: buf.duration }]], cursor: 0 });
    } catch (err) {
      console.error('[AudioEditor] decode failed', err);
      toast.error(`Couldn't read ${label}. Try an MP3, WAV or M4A file.`, { position: 'top-center' });
    } finally {
      setIsBusy(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; 
    if (!file) return;
    await loadBlobAsAudio(file, 'that file');
  };

  const startRecording = async () => {
    if (!recordRef.current) return;
    try {
      wavesurferRef.current?.pause();
      setIsRecording(true);
      setRecordSeconds(0);
      
      // Force Wavesurfer RecordPlugin to drop its cached stream so it respects the new device selection
      if (typeof (recordRef.current as any).stopMic === 'function') {
        (recordRef.current as any).stopMic();
      }

      await recordRef.current.startRecording(
        selectedDevice && selectedDevice !== 'default' ? { deviceId: selectedDevice } : undefined
      );
    } catch (err: any) {
      setIsRecording(false);
      console.error('[AudioEditor] mic error', err);
      toast.error(`Mic error: ${err?.message || String(err)}`, { position: 'top-center' });
    }
  };

  const stopRecording = () => {
    recordRef.current?.stopRecording();
  };

  const getSelectedRanges = (): Range[] =>
    (regionsRef.current?.getRegions() ?? []).map(r => ({ start: r.start, end: r.end }));

  const applyEdit = (mode: 'trim' | 'remove') => {
    if (!source || kept.length === 0) return;
    const timelineRanges = getSelectedRanges();
    if (timelineRanges.length === 0) {
      toast.error('Drag on the waveform (or tap "Add selection") to select a section first.', { position: 'top-center' });
      return;
    }

    let nextKept = kept;
    const sourceRanges = timelineRanges.flatMap(r => cutWaveformRegion(kept, r.start, r.end));

    if (mode === 'remove') {
      for (const c of sourceRanges) {
        nextKept = subtract(nextKept, c);
      }
    } else { // 'trim'
      nextKept = [];
      for (const k of sourceRanges) {
        nextKept = add(nextKept, k);
      }
    }

    if (nextKept.length === 0) {
      toast.error('That would remove all of the audio.', { position: 'top-center' });
      return;
    }
    pushKept(nextKept);
    toast.success(mode === 'trim' ? 'Trimmed to selection.' : 'Selection removed.', { position: 'top-center' });
  };

  const handleCutWords = (startIdx: number, endIdx: number) => {
    if (!transcript || !source) return;
    const state: StudioState = {
      source, polished, layer, transcript, view, history: hist
    };
    const c = cutWords(state, startIdx, endIdx);
    const nextKept = subtract(kept, c);
    pushKept(nextKept);
  };

  const addRegionAtPlayhead = () => {
    const ws = wavesurferRef.current;
    if (!ws || !current) return;
    const length = Math.min(Math.max(1, current.duration * 0.1), current.duration);
    let start = Math.min(ws.getCurrentTime(), current.duration - length);
    start = Math.max(0, start);
    regionsRef.current?.addRegion({
      start,
      end: start + length,
      color: 'color-mix(in srgb, var(--primary) 25%, transparent)',
      drag: true,
      resize: true,
    });
  };

  const clearRegions = () => {
    regionsRef.current?.clearRegions();
    setRegionCount(0);
  };

  const fileBase = useMemo(
    () => slugify(showTitle && showTitle !== 'Untitled Show' ? showTitle : 'recording'),
    [showTitle],
  );

  const estimatedMb = current ? (current.length * current.numberOfChannels * 2) / (1024 * 1024) : 0;

  const downloadTranscript = (format: 'txt' | 'srt' | 'vtt') => {
    if (!transcript) return;
    let content = '';
    if (format === 'txt') content = exportText(transcript, kept);
    if (format === 'srt') content = exportSrt(transcript, kept);
    if (format === 'vtt') content = exportVtt(transcript, kept);
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${makeFileName(fileBase)}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copyTranscript = async () => {
    if (!transcript) return;
    try {
      const text = exportText(transcript, kept);
      await navigator.clipboard.writeText(text);
      toast.success('Transcript copied to clipboard', { position: 'top-center' });
    } catch (e) {
      toast.error('Failed to copy transcript', { position: 'top-center' });
    }
  };

  const downloadWav = () => {
    if (!current) return;
    const url = URL.createObjectURL(encodeWav(current));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${makeFileName(fileBase)}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const saveToCloud = async () => {
    if (!current) return;
    setIsUploading(true);
    try {
      const name = `${makeFileName(fileBase)}.wav`;
      await uploadToCloud(encodeWav(current), name);
      toast.success(`Saved ${name} to your cloud storage.`, { position: 'top-center' });
    } catch (err) {
      console.error('[AudioEditor] cloud save failed', err);
      toast.error(err instanceof Error ? err.message : 'Cloud save failed. Please try again.', { position: 'top-center' });
    } finally {
      setIsUploading(false);
    }
  };

  const saveToGoogleDrive = async () => {
    if (!current || driveProgress !== null) return;
    setDriveProgress(0);
    try {
      const wavName = `${makeFileName(fileBase)}.wav`;
      const file = await saveToDrive(encodeWav(current), wavName, f => setDriveProgress(Math.round(f * 90))); // 0-90% for WAV
      
      // Also upload transcript if it exists
      if (transcript && transcript.words.length > 0) {
        const txt = exportText(transcript, kept);
        const txtBlob = new Blob([txt], { type: 'text/plain' });
        await saveToDrive(txtBlob, `${makeFileName(fileBase)}.txt`);
        setDriveProgress(100);
      }
      
      toastDriveSaved(file);
    } catch (err) {
      toastDriveError(err);
    } finally {
      setDriveProgress(null);
    }
  };

  const hasAudio = !!current;
  const touchBtn = 'h-11 sm:h-9 text-sm font-semibold';
  const touchIconBtn = 'h-11 w-11 sm:h-9 sm:w-9';

  return (
    <Card id="section-audio-studio" className="border-border bg-card shadow-sm p-4 sm:p-6 flex flex-col gap-4 scroll-mt-6">
      {/* Header + input */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-bold text-foreground">Episode Editor</h2>
        </div>
        
        {hasAudio && (
          <ToggleGroup
            type="single"
            variant="outline"
            value={view}
            onValueChange={v => v && setView(v as typeof view)}
            className="flex self-center"
          >
            <ToggleGroupItem value="waveform" aria-label="Waveform view" className="h-9 px-3">
              <Activity className="w-4 h-4 mr-1.5" /> Waveform
            </ToggleGroupItem>
            <ToggleGroupItem value="split" aria-label="Split view" className="h-9 px-3 hidden sm:flex">
              <Layout className="w-4 h-4 mr-1.5" /> Split
            </ToggleGroupItem>
            <ToggleGroupItem value="transcript" aria-label="Transcript view" className="h-9 px-3">
              <AlignLeft className="w-4 h-4 mr-1.5" /> Transcript
            </ToggleGroupItem>
          </ToggleGroup>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="sr-only"
            aria-label="Upload an audio file"
            tabIndex={-1}
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            className={touchBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording || isBusy}
          >
            <Upload className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Upload Audio
          </Button>
          <div className="flex items-center gap-2">
            {!isRecording && (
              <Select value={selectedDevice} onValueChange={setSelectedDevice} onOpenChange={(open) => { if (open) loadDevices(); }}>
                <SelectTrigger className={`${touchBtn} w-40 max-w-full`}>
                  <SelectValue placeholder="Select Mic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">System Default</SelectItem>
                  {devices.filter(d => d.deviceId !== 'default').map(d => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || 'Unknown Device'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!isRecording ? (
              <Button
                className={`${touchBtn} bg-red-500 hover:bg-red-600 active:bg-red-700 text-white`}
                onClick={startRecording}
                disabled={isBusy}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white mr-1.5" aria-hidden="true" />
                Record
              </Button>
            ) : (
              <Button
                className={`${touchBtn} bg-zinc-800 hover:bg-zinc-900 active:bg-black text-white`}
                onClick={stopRecording}
              >
                <Square className="w-4 h-4 mr-1.5 fill-white" aria-hidden="true" />
                Stop · {formatTime(recordSeconds).replace(/\.\d$/, '')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 lg:items-start">
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className={`relative ${(hasAudio && view === 'transcript') ? 'hidden' : 'block'}`}>
        <div
          ref={containerRef}
          className={`w-full bg-muted/20 border border-border rounded-lg overflow-hidden ${(view === 'split' && hasAudio) ? 'min-h-[96px] h-[96px]' : 'min-h-[128px]'}`}
          aria-label="Audio waveform"
        />
        
        {(!hasAudio && !isRecording) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center px-4 pointer-events-none bg-muted/20">
            {isBusy ? (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Processing audio…
              </span>
            ) : (
              <>
                <span className="text-sm font-semibold text-foreground">No audio yet</span>
                <span className="text-xs text-muted-foreground">Select a mic and record, or upload an audio file.</span>
              </>
            )}
          </div>
        )}

        {isBusy && hasAudio && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg" role="status" aria-label="Rendering waveform">
            <Loader2 className="w-5 h-5 animate-spin text-primary" aria-hidden="true" />
          </div>
        )}
      </div>
      
      {!hasAudio && isRecording && (
        <div className="mt-2 w-full flex items-center justify-center gap-2 text-center text-sm font-semibold text-foreground animate-pulse">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
             <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
           </span>
           Recording… {formatTime(recordSeconds).replace(/\.\d$/, '')}
        </div>
      )}

      {hasAudio && (
        <>
          {/* Transport */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className={touchIconBtn} aria-label="Back to start" onClick={() => wavesurferRef.current?.setTime(0)}>
                <SkipBack className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                className={`${touchIconBtn} rounded-full`}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                onClick={() => wavesurferRef.current?.playPause()}
              >
                {isPlaying ? <Pause className="w-4 h-4" aria-hidden="true" /> : <Play className="w-4 h-4 ml-0.5" aria-hidden="true" />}
              </Button>
              <span className="font-mono text-sm tabular-nums text-foreground ml-1" aria-live="off">
                {formatTime(currentTime)} <span className="text-muted-foreground">/ {formatTime(current.duration)}</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              {view !== 'transcript' && (
                <>
                  <Button variant="ghost" size="icon" className={touchIconBtn} aria-label="Zoom out" disabled={zoomIdx === 0} onClick={() => setZoomIdx(i => Math.max(0, i - 1))}>
                    <ZoomOut className="w-4 h-4" aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon" className={touchIconBtn} aria-label="Zoom in" disabled={zoomIdx === ZOOM_LEVELS.length - 1} onClick={() => setZoomIdx(i => Math.min(ZOOM_LEVELS.length - 1, i + 1))}>
                    <ZoomIn className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" className={touchIconBtn} aria-label="Undo" disabled={!canUndo} onClick={undo}>
                <Undo2 className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" className={touchIconBtn} aria-label="Redo" disabled={!canRedo} onClick={redo}>
                <Redo2 className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Transcript View Container */}
          {(view === 'transcript' || view === 'split') && (
            <div className="flex-1 min-h-[300px] border border-border bg-card rounded-lg overflow-hidden flex flex-col">
              {transcript && transcript.words.length > 0 ? (
                <TranscriptView
                  ref={transcriptRef}
                  transcript={transcript}
                  kept={kept}
                  onWordClick={(start) => {
                    const t = sourceToTimeline(kept, start);
                    if (t !== null && wavesurferRef.current) wavesurferRef.current.setTime(t);
                  }}
                  onCutWords={handleCutWords}
                />
              ) : (
                <div className="p-4 sm:p-8 flex items-center justify-center h-full bg-muted/10">
                  <TranscribeCard state={tState} onTranscribe={handleTranscribe} />
                </div>
              )}
            </div>
          )}

          {/* Editing Toolbar */}
          {(view === 'waveform' || view === 'split') && (
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" className={touchBtn} onClick={addRegionAtPlayhead}>
                  <BoxSelect className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  Add selection
                </Button>
                <Button variant="outline" className={touchBtn} onClick={() => applyEdit('remove')} disabled={regionCount === 0}>
                  <Scissors className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  Remove selection{regionCount > 1 ? `s (${regionCount})` : ''}
                </Button>
                <Button variant="outline" className={touchBtn} onClick={() => applyEdit('trim')} disabled={regionCount === 0}>
                  <Crop className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  Trim to selection{regionCount > 1 ? `s (${regionCount})` : ''}
                </Button>
                <Button variant="ghost" className={`${touchBtn} text-muted-foreground hover:text-destructive`} onClick={clearRegions} disabled={regionCount === 0}>
                  <Trash2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  Clear
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Drag on the waveform to select a section, or tap <strong>Add selection</strong> to drop one at the playhead and drag its edges.
                Edits are non-destructive — use Undo to step back.
              </p>
            </div>
          )}
            </>
          )}
        </div>

        {hasAudio && (
          <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4">
            <MagicPolishPanel
              buffer={source}
              fileBase={fileBase}
              disabled={isBusy || isRecording}
              layer={layer}
              onResult={(buf) => {
                setPolished(buf);
                setLayer('polished');
              }}
              onToggleLayer={setLayer}
            />
          </div>
        )}
      </div>

      {hasAudio && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
            <span className="text-xs text-muted-foreground">
              WAV · {current.numberOfChannels === 1 ? 'mono' : 'stereo'} · {(current.sampleRate / 1000).toFixed(1)} kHz · ~{estimatedMb.toFixed(1)} MB
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className={touchBtn} onClick={saveToCloud} disabled={isUploading || isBusy}>
                {isUploading
                  ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />
                  : <CloudUpload className="w-4 h-4 mr-1.5" aria-hidden="true" />}
                Save to cloud
              </Button>
              {driveAvailable && (
                <Button variant="outline" className={touchBtn} onClick={saveToGoogleDrive} disabled={driveProgress !== null || isBusy}>
                  {driveProgress !== null
                    ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />
                    : <HardDriveUpload className="w-4 h-4 mr-1.5" aria-hidden="true" />}
                  {driveProgress !== null ? `Saving ${driveProgress}%` : 'Save to Google Drive'}
                </Button>
              )}
              <Button className={touchBtn} onClick={downloadWav} disabled={isBusy}>
                <Download className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Download WAV
              </Button>
              {!transcript || transcript.words.length === 0 ? (
                <Button 
                  variant="outline" 
                  className={touchBtn} 
                  onClick={handleTranscribe} 
                  disabled={isBusy || tState.status === 'loading' || tState.status === 'transcribing'}
                >
                  {tState.status === 'loading' || tState.status === 'transcribing' ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <FileText className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  )}
                  {tState.status === 'loading' 
                    ? 'Loading AI Model...' 
                    : tState.status === 'transcribing' 
                      ? `Transcribing ${Math.round(tState.progress * 100)}%` 
                      : 'Generate Transcript'}
                </Button>
              ) : (
                <>
                  <Button variant="outline" className={touchBtn} onClick={copyTranscript} disabled={isBusy}>
                    <FileText className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Copy Text
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className={touchBtn} disabled={isBusy}>
                        <Download className="w-4 h-4 mr-1.5" aria-hidden="true" />
                        Save Transcript
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={copyTranscript}>Copy to clipboard</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadTranscript('txt')}>Download as .txt</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadTranscript('srt')}>Download as .srt</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadTranscript('vtt')}>Download as .vtt</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
