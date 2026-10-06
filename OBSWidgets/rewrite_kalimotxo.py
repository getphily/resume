import re

with open("src/app/(app)/kalimotxo/page.tsx", "r") as f:
    original = f.read()

new_code = """'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Radio, 
  Volume2, 
  Layers, 
  Play, 
  Square, 
  Copy, 
  Check 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { StudioShell } from '@/components/StudioShell';

export default function KalimotxoPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<'CYBER_GRID' | 'STEMS_FLUX' | 'AMBER_PULSE'>('STEMS_FLUX');

  const copyObsUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://code.getphily.io';
    navigator.clipboard.writeText(`${origin}/kalimotxo/live`);
    setCopied(true);
    toast.success('Kalimotxo OBS Browser Source URL copied to clipboard!', {
      position: 'top-center',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const settingsPanel = (
    <div className="flex flex-col gap-4 pb-10">
      <Card className="border-border bg-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            STEMS ISOLATION
          </h3>
          <Badge variant="outline" className="text-[10px]">3-BAND FX</Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Real-time stem separation triggers distinct 3D geometry channels across Drums (Blue), Vocals (Green), and Melodic Leads (Red).
        </p>
        <div className="flex gap-2 pt-1">
          <div className="flex-1 py-1.5 text-center font-mono text-xs font-bold rounded-sm bg-blue-500/10 text-blue-600 border border-blue-500/20">DRUMS</div>
          <div className="flex-1 py-1.5 text-center font-mono text-xs font-bold rounded-sm bg-green-500/10 text-green-600 border border-green-500/20">VOCALS</div>
          <div className="flex-1 py-1.5 text-center font-mono text-xs font-bold rounded-sm bg-red-500/10 text-red-600 border border-red-500/20">INST</div>
        </div>
      </Card>

      <Card className="border-border bg-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-primary" />
            WEB AUDIO CAPTURE
          </h3>
          <Badge variant="outline" className="text-[10px]">0-LATENCY</Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Direct system loopback or screen share audio ingestion. Analyzes FFT fast Fourier spectrum frequencies directly inside browser memory.
        </p>
        <div className="font-mono text-[10px] text-muted-foreground bg-muted p-2 rounded-md border border-border/50">
          Sample Rate: 48,000 Hz // FFT Size: 2048
        </div>
      </Card>

      <Card className="border-border bg-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            OBS LIVE CAPTURE
          </h3>
          <Badge variant="outline" className="text-[10px]">1080P 60FPS</Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Add as a 1920×1080 Browser Source in OBS or Streamlabs. Hardware accelerated with WebGL rendering for zero dropped frames.
        </p>
      </Card>
    </div>
  );

  const previewCanvas = (
    <div className="w-full h-full flex items-center justify-center p-0">
      <div className="w-full aspect-video border border-[#333333] shadow-2xl relative overflow-hidden bg-[#050505] flex flex-col items-center justify-center group">
        
        {/* Hardware Header Bar */}
        <div className="absolute top-0 inset-x-0 h-8 bg-[#1c1c1c] border-b border-[#333333] px-4 flex items-center justify-between text-[10px] font-mono z-20">
          <div className="flex items-center gap-3">
            <span className="text-[#FF5900] font-bold">DECK A // MASTER</span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">128.00 BPM</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-400 uppercase">Audio Loopback Active</span>
          </div>
        </div>

        {/* Ambient visualizer background simulation */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-black" />
        
        {/* Waveform Stems simulation bars */}
        <div className="absolute inset-x-8 bottom-8 flex items-end justify-center gap-1 h-28 opacity-85">
          {[40, 65, 80, 55, 95, 70, 85, 100, 60, 45, 90, 75, 50, 80, 100, 85, 60, 40, 70, 95].map((val, i) => (
            <div 
              key={i} 
              className="flex-1 rounded-sm transition-all duration-150"
              style={{
                height: isPlaying ? `${Math.min(100, val * (0.8 + Math.random() * 0.4))}%` : `${val * 0.5}%`,
                backgroundColor: i % 3 === 0 ? '#0055FF' : i % 3 === 1 ? '#00FF00' : '#FF0000',
                boxShadow: isPlaying ? '0 0 12px currentColor' : 'none'
              }}
            />
          ))}
        </div>

        {/* Central FLX10 Tactile Logo */}
        <div className="relative z-10 text-center flex flex-col items-center gap-3">
          <div className="grid grid-cols-2 gap-1.5 p-3 rounded-lg bg-[#111111]/90 border border-[#333333] shadow-lg">
            <div className="w-5 h-5 rounded-sm bg-[#0055FF] shadow-sm" title="Drums Blue" />
            <div className="w-5 h-5 rounded-sm bg-[#00FF00] shadow-sm" title="Vocals Green" />
            <div className="w-5 h-5 rounded-sm bg-[#FF0000] shadow-sm" title="Instruments Red" />
            <div className="w-5 h-5 rounded-sm bg-[#FF5900] shadow-sm" title="Active Amber" />
          </div>
          <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
            3D AUDIO-REACTIVE STAGE
          </span>
        </div>

        {/* Stage Action Controls */}
        <div className="absolute top-12 right-4 flex items-center gap-2 z-20">
          <Button 
            onClick={() => setIsPlaying(!isPlaying)}
            size="sm" 
            className="bg-[#FF5900] hover:bg-[#FF5900]/90 text-black font-extrabold uppercase tracking-wider text-[10px] h-7 px-2 gap-1 shadow-md"
          >
            {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Run'}</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <StudioShell
      title="Kalimotxo Studio"
      icon={<Sparkles className="w-4 h-4" />}
      widgetName="Kalimotxo FLX10 Default"
      hasId={true} // For the copy URL button to be active
      onCopyUrl={copyObsUrl}
      copySuccess={copied}
      settingsPanel={settingsPanel}
      previewCanvas={previewCanvas}
    />
  );
}
"""

with open("src/app/(app)/kalimotxo/page.tsx", "w") as f:
    f.write(new_code)
