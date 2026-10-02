export interface TimerConfig {
  id?: string;
  name: string;
  
  // State 
  mode: 'TIMER' | 'STOPWATCH';
  durationSeconds: number; // For timer
  
  // Live Control
  state: 'STOPPED' | 'RUNNING' | 'PAUSED' | 'EXPIRED';
  endTime: number | null;
  pausedTimeLeft: number | null;

  
  // Theme Customization
  layout: {
    fontFamily: string;
    bgColor: string;
    runningColor: string; // Used when running (e.g. Blue)
    pausedColor: string;  // Used when paused (e.g. Yellow)
    expiredColor: string; // Used when expired (e.g. Red)
    trackColor: string;   // Track circle color
    textColor: string;
    opacity: number;
    bold?: boolean;
    italic?: boolean;
    textTransform?: 'none' | 'uppercase' | 'lowercase';
  };
  
  // Sound
  sound: {
    enabled: boolean;
    volume: number; // 0 to 1
    type: 'BELL' | 'DIGITAL' | 'GONG' | 'CLASSIC';
  };
}

export const DEFAULT_TIMER_CONFIG: TimerConfig = {
  name: 'My Timer',
  mode: 'TIMER',
  durationSeconds: 300, // 5 minutes
  
  state: 'STOPPED',
  endTime: null,
  pausedTimeLeft: null,
  
  layout: {
    fontFamily: 'Inter',
    bgColor: '#eef2ff',      // Light blue background
    runningColor: '#2563eb', // Blue
    pausedColor: '#d97706',  // Yellow/Orange
    expiredColor: '#be123c', // Red
    trackColor: '#bfdbfe',   // Light blue track
    textColor: '#0f172a',    // Dark slate text
    opacity: 1.0,
    bold: true,
    italic: false,
    textTransform: 'none',
  },
  
  sound: {
    enabled: true,
    volume: 0.8,
    type: 'BELL',
  }
};
