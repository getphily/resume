'use client';

import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Sparkles, SlidersHorizontal, Loader2, X, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { encodeWav } from '@/lib/audioEditor/buffer';
import {
  DEFAULT_MASTER_SETTINGS, masterAudio,
  type MasterPreset, type MasterSettings, type MasterStage,
} from '@/lib/audioEditor/master';
import { getDriveToken, isDriveConfigured, preloadDriveSdk, saveToDrive } from '@/lib/audioEditor/drive';
import { makeFileName, saveToCloud } from '@/lib/audioEditor/save';
import { toastDriveError, toastDriveSaved } from '@/components/podcast-tools/driveToasts';

const PRESETS: { id: MasterPreset; label: string; blurb: string }[] = [
  { id: 'gentle', label: 'Gentle', blurb: 'Light touch. Keeps your natural dynamics.' },
  { id: 'podcast', label: 'Podcast', blurb: 'Balanced and clear. Best for most voices.' },
  { id: 'broadcast', label: 'Broadcast', blurb: 'Loud, even, radio-style sound.' },
];

const STAGE_LABEL: Record<MasterStage, string> = {
  prepare: 'Preparing audio…',
  denoise: 'Reducing background noise…',
  compress: 'Evening out the volume…',
  level: 'Setting the final level…',
  done: 'Done',
};

/** Map a pipeline stage + its own 0..1 progress onto one 0..100 bar. */
function overallPercent(stage: MasterStage, f: number): number {
  switch (stage) {
    case 'prepare': return 2;
    case 'denoise': return Math.round(5 + 65 * f);
    case 'compress': return 72;
    case 'level': return 88;
    default: return 100;
  }
}

interface MagicPolishPanelProps {
  /** The full source buffer. Polish runs on this entire buffer, so cuts remain editable. */
  buffer: AudioBuffer | null;
  /** Used to name saved copies. */
  fileBase: string;
  disabled?: boolean;
  layer: 'original' | 'polished';
  onResult: (polished: AudioBuffer) => void;
  onToggleLayer: (layer: 'original' | 'polished') => void;
}

export function MagicPolishPanel({ buffer, fileBase, disabled, layer, onResult, onToggleLayer }: MagicPolishPanelProps) {
  const [settings, setSettings] = useState<MasterSettings>(DEFAULT_MASTER_SETTINGS);
  const [showFineTune, setShowFineTune] = useState(false);
  const [saveCloudCopy, setSaveCloudCopy] = useState(false);
  const [saveDriveCopy, setSaveDriveCopy] = useState(false);
  const [run, setRun] = useState<{ label: string; pct: number } | null>(null);
  const [lastRun, setLastRun] = useState<{ before: AudioBuffer; after: AudioBuffer } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const driveAvailable = isDriveConfigured();
  const isRunning = run !== null;
  const preset = PRESETS.find(p => p.id === settings.preset)!;

  useEffect(() => {
    if (driveAvailable) preloadDriveSdk();
  }, [driveAvailable]);
  useEffect(() => () => abortRef.current?.abort(), []);

  // Which side of the A/B are we currently on? Derived from identity, so any later edit hides the toggle.
  const view: 'polished' | 'original' | null =
    lastRun && buffer === lastRun.after ? 'polished' : lastRun && buffer === lastRun.before ? 'original' : null;

  const saveCopies = async (polished: AudioBuffer, signal: AbortSignal) => {
    const blob = encodeWav(polished);
    const name = `${makeFileName(fileBase, 'polished')}.wav`;
    if (saveCloudCopy) {
      setRun({ label: 'Saving to your cloud…', pct: 100 });
      try {
        await saveToCloud(blob, name);
        toast.success(`Saved ${name} to your cloud storage.`, { position: 'top-center' });
      } catch (e) {
        console.error('[MagicPolish] cloud save failed', e);
        toast.error(e instanceof Error ? e.message : 'Cloud save failed.', { position: 'top-center' });
      }
    }
    if (saveDriveCopy && driveAvailable) {
      setRun({ label: 'Uploading to Google Drive…', pct: 0 });
      try {
        const file = await saveToDrive(blob, name, f => setRun({ label: 'Uploading to Google Drive…', pct: Math.round(f * 100) }), signal);
        toastDriveSaved(file);
      } catch (e) {
        toastDriveError(e);
      }
    }
  };

  const handlePolish = async () => {
    if (!buffer || isRunning) return;

    // Google's consent popup must open inside this click, so ask BEFORE the long render.
    if (saveDriveCopy && driveAvailable) {
      try {
        await getDriveToken();
      } catch (e) {
        toastDriveError(e);
        return;
      }
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setRun({ label: STAGE_LABEL.prepare, pct: 2 });
    try {
      const polished = await masterAudio(
        buffer,
        settings,
        (stage, f) => setRun({ label: STAGE_LABEL[stage], pct: overallPercent(stage, f) }),
        controller.signal,
      );
      setLastRun({ before: buffer, after: polished });
      onResult(polished);
      toast.success('Polished! Use "Original" to compare, or Undo to go back.', { position: 'top-center' });
      if (saveCloudCopy || (saveDriveCopy && driveAvailable)) await saveCopies(polished, controller.signal);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        toast('Polish cancelled.', { position: 'top-center' });
      } else {
        console.error('[MagicPolish] failed', e);
        toast.error("Couldn't polish this audio. Please try again.", { position: 'top-center' });
      }
    } finally {
      setRun(null);
      abortRef.current = null;
    }
  };

  const touchBtn = 'h-11 sm:h-9 text-sm font-semibold';

  return (
    <section
      aria-label="Magic Polish"
      className="flex flex-col gap-4 rounded-lg border border-primary/25 bg-primary/5 p-3 sm:p-4"
    >
      <div className="flex flex-col gap-1">
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
          <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
          Magic Polish
        </h3>
        <p className="text-xs text-muted-foreground">
          One click removes background noise, evens out loud and quiet parts, and sets a clean final level — tuned for spoken word.
          Do your cuts first, then polish.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label id="polish-style-label" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Style</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          value={settings.preset}
          onValueChange={v => v && setSettings(s => ({ ...s, preset: v as MasterPreset }))}
          aria-labelledby="polish-style-label"
          disabled={isRunning}
          className="grid grid-cols-3 w-full"
        >
          {PRESETS.map(p => (
            <ToggleGroupItem key={p.id} value={p.id} className="h-11 sm:h-9 text-sm font-semibold w-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary data-[state=on]:hover:bg-primary/90">
              {p.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-xs text-muted-foreground">{preset.blurb}</p>
      </div>

      {showFineTune && (
        <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-3">
          <div className="flex min-h-11 items-center justify-between gap-3">
            <Label htmlFor="polish-denoise" className="flex-1 self-stretch cursor-pointer items-center text-sm font-semibold">Reduce background noise</Label>
            <Switch
              id="polish-denoise"
              checked={settings.denoise}
              onCheckedChange={v => setSettings(s => ({ ...s, denoise: v }))}
              disabled={isRunning}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="polish-strength" className="text-sm font-semibold">Noise reduction strength</Label>
              <span className="text-xs text-muted-foreground tabular-nums">{Math.round(settings.denoiseStrength * 100)}%</span>
            </div>
            <Slider
              id="polish-strength"
              aria-label="Noise reduction strength"
              min={0}
              max={100}
              step={5}
              value={[Math.round(settings.denoiseStrength * 100)]}
              onValueChange={([v]) => setSettings(s => ({ ...s, denoiseStrength: v / 100 }))}
              disabled={isRunning || !settings.denoise}
            />
            <p className="text-xs text-muted-foreground">Lower it if the voice sounds thin or "watery".</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="polish-ceiling" className="text-sm font-semibold">Loudest peak</Label>
              <span className="text-xs text-muted-foreground tabular-nums">{settings.ceilingDb.toFixed(1)} dBFS</span>
            </div>
            <Slider
              id="polish-ceiling"
              aria-label="Loudest peak in dBFS"
              min={-3}
              max={-0.5}
              step={0.5}
              value={[settings.ceilingDb]}
              onValueChange={([v]) => setSettings(s => ({ ...s, ceilingDb: v }))}
              disabled={isRunning}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Also save a copy to</span>
        <div className="flex min-h-11 items-center justify-between gap-3">
          <Label htmlFor="polish-save-cloud" className="flex-1 self-stretch cursor-pointer items-center text-sm">My cloud storage</Label>
          <Switch id="polish-save-cloud" checked={saveCloudCopy} onCheckedChange={setSaveCloudCopy} disabled={isRunning} />
        </div>
        {driveAvailable && (
          <div className="flex min-h-11 items-center justify-between gap-3">
            <Label htmlFor="polish-save-drive" className="flex-1 self-stretch cursor-pointer items-center text-sm">Google Drive</Label>
            <Switch id="polish-save-drive" checked={saveDriveCopy} onCheckedChange={setSaveDriveCopy} disabled={isRunning} />
          </div>
        )}
      </div>

      {isRunning ? (
        <div className="flex flex-col gap-2" role="status" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" aria-hidden="true" />
              {run.label}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">{run.pct}%</span>
          </div>
          <Progress value={run.pct} aria-label="Magic Polish progress" />
          <Button variant="ghost" className={`${touchBtn} self-start text-muted-foreground`} onClick={() => abortRef.current?.abort()}>
            <X className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button className={`${touchBtn} flex-1 sm:flex-none min-w-40`} onClick={handlePolish} disabled={!buffer || disabled}>
            <Sparkles className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Magic Polish
          </Button>
          <Button
            variant="ghost"
            className={`${touchBtn} text-muted-foreground`}
            onClick={() => setShowFineTune(v => !v)}
            aria-expanded={showFineTune}
          >
            <SlidersHorizontal className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Fine tune
          </Button>
          {lastRun && (
            <div className="flex items-center gap-1 sm:ml-auto" role="group" aria-label="Compare original and polished">
              <Button variant={layer === 'original' ? 'default' : 'outline'} className={touchBtn} onClick={() => onToggleLayer('original')} aria-pressed={layer === 'original'}>
                <Undo2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Original
              </Button>
              <Button variant={layer === 'polished' ? 'default' : 'outline'} className={touchBtn} onClick={() => onToggleLayer('polished')} aria-pressed={layer === 'polished'}>
                <Redo2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Polished
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
