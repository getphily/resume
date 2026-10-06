'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sliders, 
  ArrowLeft, 
  Sparkles, 
  Maximize2, 
  Radio, 
  Volume2, 
  Layers, 
  Flame, 
  Play, 
  Square, 
  Copy, 
  Check 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

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

  return (
    <div className="flex flex-col min-h-screen bg-[#111111] text-[#E0E0E0]">
      {/* Top FLX10 Hardware Header */}
      <div className="border-b border-[#333333] bg-[#161616] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                <span>getphily&apos;s code stand</span>
              </Link>
            </Button>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
              Audio & Visuals
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-[#FF5900] text-black font-extrabold uppercase tracking-wider text-[10px] px-2.5 py-0.5">
                  FLX10 Tactical Engine
                </Badge>
                <span className="text-xs text-zinc-400 font-mono">
                  16:9 Three.js Audio Canvas
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <span className="w-4 h-8 bg-[#FF5900] inline-block rounded-xs" />
                KALIMOTXO
              </h1>
              <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Hardware-styled, frequency-reactive 3D graphics studio for live DJ sets. Designed for Pioneer DJ setups and zero-latency OBS capture.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={copyObsUrl} 
                variant="outline" 
                className="border-[#333333] bg-[#1c1c1c] text-white hover:bg-zinc-800 gap-2 h-10 text-xs font-bold uppercase tracking-wider"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy OBS Browser URL'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* 16:9 Canvas Simulation Window */}
        <div className="w-full rounded-xl border border-[#333333] bg-[#0c0c0c] overflow-hidden shadow-2xl flex flex-col">
          {/* Hardware Header Bar */}
          <div className="h-10 bg-[#1c1c1c] border-b border-[#333333] px-4 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-[#FF5900] font-bold">DECK A // MASTER</span>
              <span className="text-zinc-500">|</span>
              <span className="text-zinc-400">128.00 BPM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-400 uppercase text-[11px]">Audio Loopback Active</span>
            </div>
          </div>

          {/* 16:9 Visual Stage */}
          <div className="aspect-video w-full relative bg-[#050505] flex items-center justify-center overflow-hidden group">
            {/* Ambient visualizer background simulation */}
            <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-black" />
            
            {/* Waveform Stems simulation bars */}
            <div className="absolute inset-x-8 bottom-12 flex items-end justify-center gap-1.5 h-36 opacity-85">
              {[40, 65, 80, 55, 95, 70, 85, 100, 60, 45, 90, 75, 50, 80, 100, 85, 60, 40, 70, 95].map((val, i) => (
                <div 
                  key={i} 
                  className="flex-1 rounded-xs transition-all duration-150"
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
                <div className="w-6 h-6 rounded-xs bg-[#0055FF] shadow-xs" title="Drums Blue" />
                <div className="w-6 h-6 rounded-xs bg-[#00FF00] shadow-xs" title="Vocals Green" />
                <div className="w-6 h-6 rounded-xs bg-[#FF0000] shadow-xs" title="Instruments Red" />
                <div className="w-6 h-6 rounded-xs bg-[#FF5900] shadow-xs" title="Active Amber" />
              </div>
              <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">
                3D AUDIO-REACTIVE STAGE
              </span>
            </div>

            {/* Stage Action Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button 
                onClick={() => setIsPlaying(!isPlaying)}
                size="sm" 
                className="bg-[#FF5900] hover:bg-[#FF5900]/90 text-black font-extrabold uppercase tracking-wider text-xs h-9 px-3 gap-1.5 shadow-md"
              >
                {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause Simulation' : 'Run Simulation'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mixer Panel Controls (FLX10 Tactical Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Stems Isolation Panel */}
          <div className="rounded-xl border border-[#333333] bg-[#1C1C1C] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#333333] pb-3">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF5900]" />
                STEMS ISOLATION
              </h3>
              <Badge variant="outline" className="border-[#333333] text-zinc-400 font-mono text-[10px]">
                3-BAND FX
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Real-time stem separation triggers distinct 3D geometry channels across Drums (Blue), Vocals (Green), and Melodic Leads (Red).
            </p>
            <div className="flex gap-2 pt-2">
              <div className="flex-1 py-1.5 text-center font-mono text-xs font-bold rounded-xs bg-[#0055FF]/20 text-[#0055FF] border border-[#0055FF]/30">DRUMS</div>
              <div className="flex-1 py-1.5 text-center font-mono text-xs font-bold rounded-xs bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/30">VOCALS</div>
              <div className="flex-1 py-1.5 text-center font-mono text-xs font-bold rounded-xs bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/30">INST</div>
            </div>
          </div>

          {/* Web Audio Engine */}
          <div className="rounded-xl border border-[#333333] bg-[#1C1C1C] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#333333] pb-3">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#FF5900]" />
                WEB AUDIO CAPTURE
              </h3>
              <Badge variant="outline" className="border-[#333333] text-zinc-400 font-mono text-[10px]">
                0-LATENCY
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Direct system loopback or screen share audio ingestion. Analyzes FFT fast Fourier spectrum frequencies directly inside browser memory.
            </p>
            <div className="font-mono text-[11px] text-zinc-400 bg-[#111111] p-2.5 rounded-md border border-[#2c2c2c]">
              Sample Rate: 48,000 Hz // FFT Size: 2048
            </div>
          </div>

          {/* OBS Stream Capture */}
          <div className="rounded-xl border border-[#333333] bg-[#1C1C1C] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#333333] pb-3">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#FF5900]" />
                OBS LIVE CAPTURE
              </h3>
              <Badge variant="outline" className="border-[#333333] text-zinc-400 font-mono text-[10px]">
                1080P 60FPS
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Add as a 1920×1080 Browser Source in OBS or Streamlabs. Hardware accelerated with WebGL rendering for zero dropped frames.
            </p>
            <Button 
              onClick={copyObsUrl}
              className="mt-auto bg-[#FF5900] hover:bg-[#FF5900]/90 text-black font-extrabold uppercase tracking-wider text-xs h-9"
            >
              Copy Browser Source URL
            </Button>
          </div>

        </div>

      </main>
    </div>
  );
}
