export interface ScreenPage {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  timer?: {
    enabled: boolean;
    endTime: number | null; // Timestamp for when the timer ends
    durationMinutes: number; // Default duration to start from
  };
}

export interface ScreenConfig {
  name: string;
  layout: {
    bgColor: string;
    bgImageUrl: string;
    bgOpacity?: number;
    accentColor: string;
    titleOpacity?: number;
    textColor: string;
    subtitleOpacity?: number;
    fontFamily: string;
    titleSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA LARGE';
    subtitleSize: 'SMALL' | 'MEDIUM' | 'LARGE';
    dropShadow: boolean;
    glow: 'OFF' | 'SUBTLE' | 'NEON';
    timerColor?: string;
    timerOpacity?: number;
  };
  logo: {
    enabled: boolean;
    imageUrl: string;
    position: 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT' | 'CENTER';
    size: 'SMALL' | 'MEDIUM' | 'LARGE';
  };
  pages: ScreenPage[];
}

export const DEFAULT_SCREEN_CONFIG: ScreenConfig = {
  name: 'My Screens',
  layout: {
    bgColor: '#111111',
    bgImageUrl: '',
    bgOpacity: 1,
    accentColor: '#3b82f6',
    titleOpacity: 1,
    textColor: '#ffffff',
    subtitleOpacity: 1,
    fontFamily: 'Inter',
    titleSize: 'EXTRA LARGE',
    subtitleSize: 'MEDIUM',
    dropShadow: false,
    glow: 'OFF',
    timerColor: '#ffffff',
    timerOpacity: 1,
  },
  logo: {
    enabled: false,
    imageUrl: '',
    position: 'TOP_LEFT',
    size: 'MEDIUM',
  },
  pages: [
    {
      id: 'starting-soon',
      name: 'Starting Soon',
      title: 'STARTING SOON',
      subtitle: 'The stream will begin shortly...',
      timer: { enabled: false, durationMinutes: 5, endTime: null },
    },
    {
      id: 'be-right-back',
      name: 'Be Right Back',
      title: 'BE RIGHT BACK',
      subtitle: 'Grabbing a drink, be back in a moment.',
      timer: { enabled: false, durationMinutes: 5, endTime: null },
    },
    {
      id: 'goodbye',
      name: 'Goodbye',
      title: 'THANKS FOR WATCHING',
      subtitle: 'See you next time!',
      timer: { enabled: false, durationMinutes: 5, endTime: null },
    },
  ],
};
