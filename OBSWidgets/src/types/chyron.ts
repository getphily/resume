// Chyron Builder Type Definitions

export interface CrawlBlock {
  id: string;
  label: string;
  text: string;
  enabled: boolean;
}

export interface ChyronConfig {
  name: string;

  // Global layout
  layout: {
    width: number;
    height: number;
    bgColor: string;
    bgMode: 'SOLID' | 'TRANSPARENT';
    accentColor: string;
  };

  // Title bar
  title: {
    enabled: boolean;
    text: string;
    fontFamily: string;
    fontSize: number;
    textColor: string;
    bgColor: string;
    textTransform: 'uppercase' | 'none';
    bold: boolean;
  };

  // Logo bug
  logo: {
    enabled: boolean;
    mode: 'TEXT' | 'IMAGE';
    text: string;
    imageUrl: string;
    position: 'LEFT' | 'RIGHT';
    spanRows: boolean; // if true, logo spans all layers instead of just title
    showLiveBadge?: boolean;
    bgColor: string;
    textColor: string;
    fontFamily: string;
  };

  // Subheader / slogan (goes below title)
  subheader: {
    enabled: boolean;
    text: string;
    fontFamily: string;
    fontSize: number;
    textColor: string;
    bgColor: string;
    textTransform: 'uppercase' | 'none';
    bold: boolean;
  };

  // Clock / date
  clock: {
    enabled: boolean;
    format: '12HR' | '24HR';
    showSeconds: boolean;
    showDate: boolean;
    timezone: string;
    textColor: string;
    bgColor: string;
    position: 'LEFT' | 'RIGHT';
  };

  // Scrolling crawl
  crawl: {
    enabled: boolean;
    blocks: CrawlBlock[];
    speed: 'SLOW' | 'NORMAL' | 'FAST';
    separator: string;
    fontFamily: string;
    fontSize: number;
    textColor: string;
    bgColor: string;
  };

  // Layer ordering (bottom to top in render)
  layerOrder: ('title' | 'subheader' | 'crawl' | 'logo' | 'clock')[];
}

export const DEFAULT_CHYRON_CONFIG: ChyronConfig = {
  name: 'My Chyron',

  layout: {
    width: 1920,
    height: 200,
    bgColor: '#1a1a2e',
    bgMode: 'TRANSPARENT',
    accentColor: '#e63946',
  },

  title: {
    enabled: true,
    text: 'BREAKING NEWS',
    fontFamily: 'Inter',
    fontSize: 1.0,      // multiplier on 2.9rem base → ~46px at 1920px
    textColor: '#ffffff',
    bgColor: '#1a1a2e',
    textTransform: 'uppercase',
    bold: true,
  },

  logo: {
    enabled: true,
    mode: 'TEXT',
    text: 'LIVE',
    imageUrl: '',
    position: 'RIGHT',
    spanRows: false,
    showLiveBadge: true,
    bgColor: '#e63946',
    textColor: '#ffffff',
    fontFamily: 'Inter',
  },

  subheader: {
    enabled: false,
    text: 'LIVE FROM OAKLAND, CA',
    fontFamily: 'Inter',
    fontSize: 1.0, // base ~24px
    textColor: '#94a3b8',
    bgColor: '#1a1a2e',
    textTransform: 'uppercase',
    bold: false,
  },

  clock: {
    enabled: true,
    format: '12HR',
    showSeconds: false,
    showDate: false,
    timezone: 'LOCAL',
    textColor: '#ffffff',
    bgColor: '#0f172a',
    position: 'RIGHT',
  },

  crawl: {
    enabled: true,
    blocks: [
      { id: 'block-1', label: 'Headlines', text: 'LATEST HEADLINES AND BREAKING NEWS UPDATES', enabled: true },
      { id: 'block-2', label: 'Info', text: 'FOLLOW US FOR MORE UPDATES', enabled: true },
    ],
    speed: 'NORMAL',
    separator: ' ★ ',
    fontFamily: 'Inter',
    fontSize: 1.0,      // multiplier on 1.65rem base → ~26px at 1920px
    textColor: '#ffffff',
    bgColor: '#0f172a',
  },

  layerOrder: ['crawl', 'title'],
};
