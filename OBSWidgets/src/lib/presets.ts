export interface BroadcastPalettePreset {
  name: string;
  bgColor: string;
  accentColor: string;
  textColor: string;
  glow: 'OFF' | 'SUBTLE' | 'NEON';
}

export const BROADCAST_PRESETS: BroadcastPalettePreset[] = [
  { 
    name: 'Breaking News', 
    bgColor: '#0f172a', 
    accentColor: '#e63946', 
    textColor: '#ffffff', 
    glow: 'OFF' 
  },
  { 
    name: 'Cyber Neon', 
    bgColor: '#09090b', 
    accentColor: '#8b5cf6', 
    textColor: '#06b6d4', 
    glow: 'NEON' 
  },
  { 
    name: 'Studio Blue', 
    bgColor: '#1e293b', 
    accentColor: '#3b82f6', 
    textColor: '#ffffff', 
    glow: 'SUBTLE' 
  },
  { 
    name: 'Amber Minimal', 
    bgColor: '#111111', 
    accentColor: '#f59e0b', 
    textColor: '#f8fafc', 
    glow: 'OFF' 
  },
  { 
    name: 'Emerald Live', 
    bgColor: '#064e3b', 
    accentColor: '#10b981', 
    textColor: '#ecfdf5', 
    glow: 'SUBTLE' 
  },
];

export interface TimerPalettePreset {
  name: string;
  runningColor: string;
  pausedColor: string;
  expiredColor: string;
  trackColor: string;
  bgColor: string;
}

export const TIMER_PRESETS: TimerPalettePreset[] = [
  {
    name: 'Electric Cyan',
    runningColor: '#00e5ff',
    pausedColor: '#ffaa00',
    expiredColor: '#ff0055',
    trackColor: 'rgba(255, 255, 255, 0.1)',
    bgColor: '#000000',
  },
  {
    name: 'Cyber Neon',
    runningColor: '#8b5cf6',
    pausedColor: '#f59e0b',
    expiredColor: '#ec4899',
    trackColor: 'rgba(139, 92, 246, 0.15)',
    bgColor: '#09090b',
  },
  {
    name: 'Studio Blue',
    runningColor: '#3b82f6',
    pausedColor: '#fbbf24',
    expiredColor: '#ef4444',
    trackColor: 'rgba(59, 130, 246, 0.15)',
    bgColor: '#0f172a',
  },
  {
    name: 'Amber Fire',
    runningColor: '#f59e0b',
    pausedColor: '#3b82f6',
    expiredColor: '#dc2626',
    trackColor: 'rgba(245, 158, 11, 0.15)',
    bgColor: '#111111',
  },
  {
    name: 'Emerald Live',
    runningColor: '#10b981',
    pausedColor: '#f59e0b',
    expiredColor: '#f43f5e',
    trackColor: 'rgba(16, 185, 129, 0.15)',
    bgColor: '#064e3b',
  },
];

export interface ClockPalettePreset {
  name: string;
  textColor: string;
  bgColor: string;
  glow: 'OFF' | 'SUBTLE' | 'NEON';
}

export const CLOCK_PRESETS: ClockPalettePreset[] = [
  {
    name: 'Retro Orange',
    textColor: '#ff5900',
    bgColor: '#0a0a0a',
    glow: 'SUBTLE',
  },
  {
    name: 'Cyber Cyan',
    textColor: '#00e5ff',
    bgColor: '#09090b',
    glow: 'NEON',
  },
  {
    name: 'Studio Blue',
    textColor: '#3b82f6',
    bgColor: '#0f172a',
    glow: 'OFF',
  },
  {
    name: 'Amber Gold',
    textColor: '#f59e0b',
    bgColor: '#111111',
    glow: 'OFF',
  },
  {
    name: 'Emerald Terminal',
    textColor: '#10b981',
    bgColor: '#052e16',
    glow: 'SUBTLE',
  },
];
