import type { CoverConfig } from './types';

export const CANVAS = 3000;
export const PREVIEW_CSS = 300;
export const PREVIEW_SCALE = 0.2;           // 600px internal canvas
export const SAFE_MARGIN = 150;
export const HOST_BASE_HEIGHT = 2700;
export const BASE_SIZE = { title: 380, withText: 130, hostName: 170 } as const;

export const DEFAULT_CONFIG: CoverConfig = {
  bg: {
    type: 'gradient',
    solid: '#c3d9f6',
    gradient: { stops: ['#e2e5f3', '#c3d9f6', '#e9e6f1'], angle: 160 },
    imgX: 0, imgY: 0, imgZoom: 1, blur: 0, overlayOpacity: 0.2,
  },
  host: { enabled: true, cx: 1781, bottom: 3000, zoom: 1 },
  title: {
    text: 'YOUR PODCAST NAME', font: 'Oswald', bold: true, italic: false, upper: true,
    color: '#000000', bgColor: '#ffffff', bgOpacity: 0, sizeScale: 1, letterSpacing: 0.01,
    align: 'left', lineHeight: 1.04, x: 360, y: 1845, maxWidth: 2200,
  },
  withText: {
    text: 'With', font: 'Montserrat', bold: false, italic: false, upper: false,
    color: '#ffffff', bgColor: '#000000', bgOpacity: 0, sizeScale: 1, letterSpacing: 0,
  },
  hostName: {
    text: 'Host(s)', font: 'Montserrat', bold: true, italic: false, upper: false,
    color: '#ffffff', bgColor: '#000000', bgOpacity: 0, sizeScale: 1, letterSpacing: 0,
  },
  badge: { enabled: true, color: '#000000', x: 360, baselineY: 2593 },
};
