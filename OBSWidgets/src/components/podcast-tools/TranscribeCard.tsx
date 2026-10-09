import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Mic2 } from 'lucide-react';
import type { TranscriberState } from '@/lib/audioEditor/useTranscriber';

interface TranscribeCardProps {
  state: TranscriberState;
  onTranscribe: () => void;
}

export function TranscribeCard({ state, onTranscribe }: TranscribeCardProps) {
  if (state.status === 'done') return null;

  return (
    <Card className="flex flex-col items-center justify-center p-8 gap-4 border-dashed border-2 border-muted-foreground/20 text-center">
      <Mic2 className="w-12 h-12 text-muted-foreground/50" />
      <div className="max-w-xs space-y-1">
        <h3 className=" text-lg">Generate Transcript</h3>
        <p className="text-sm text-muted-foreground">
          Transcribe your audio locally in the browser to edit text like a document. No audio leaves your device.
        </p>
      </div>

      {state.status === 'idle' || state.status === 'error' ? (
        <Button onClick={onTranscribe} size="lg" className="mt-2">
          Start Transcribing
        </Button>
      ) : (
        <div className="w-full max-w-sm mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-muted-foreground">{state.message}</span>
            <span className="tabular-nums font-mono">{state.progress}%</span>
          </div>
          <Progress value={state.progress} className="h-2" />
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
            <Loader2 className="w-3 h-3 animate-spin" />
            Runs entirely on your device
          </div>
        </div>
      )}
    </Card>
  );
}
