export type TextAlign = 'left' | 'center' | 'right';

export interface TextLayer {
  text: string;
  font: string;            // must be in FONTS_LIST
  bold: boolean;
  italic: boolean;
  upper: boolean;          // uppercase transform
  color: string;           // hex
  bgColor: string;         // hex, highlight behind each line
  bgOpacity: number;       // 0..1 (0 = no highlight)
  sizeScale: 0.82 | 1 | 1.2;
  letterSpacing: number;   // in em, e.g. 0.01
}

export interface TitleLayer extends TextLayer {
  align: TextAlign;
  lineHeight: number;      // multiplier, e.g. 1.04
  x: number;               // left of text block
  y: number;               // FIRST BASELINE
  maxWidth: number;        // wrap width
}

export interface CoverConfig {
  bg: {
    type: 'gradient' | 'solid' | 'image';
    solid: string;
    gradient: { stops: [string, string, string]; angle: number };
    imgX: number; imgY: number; imgZoom: number;   // image offsets in canvas px, zoom >= 1
    blur?: number;
    overlayOpacity?: number; // 0..1 for a dark gradient overlay over image
  };
  host: { enabled: boolean; cx: number; bottom: number; zoom: number };
  title: TitleLayer;
  withText: TextLayer;
  hostName: TextLayer;
  badge: { enabled: boolean; color: string; x: number; baselineY: number };
}

// Runtime-only (NOT persisted, NOT in CoverConfig)
export interface CoverImages {
  bg: HTMLImageElement | null;
  host: HTMLImageElement | null;      // current (possibly background-removed)
}
