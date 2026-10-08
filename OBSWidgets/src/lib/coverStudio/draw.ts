import { CoverConfig, CoverImages, TextLayer, TitleLayer } from './types';
import { BASE_SIZE, HOST_BASE_HEIGHT } from './defaults';

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + ' ' + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export async function ensureFonts(cfg: CoverConfig) {
  const layers = [cfg.title, cfg.withText, cfg.hostName];
  await Promise.all(layers.map(l =>
    document.fonts.load(`${l.bold ? '700' : '400'} 100px "${l.font}"`)
  ));
}

function fontString(layer: TextLayer, size: number) {
  return `${layer.italic ? 'italic ' : ''}${layer.bold ? '700' : '400'} ${size}px "${layer.font}", sans-serif`;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export function drawCover(
  ctx: CanvasRenderingContext2D,
  cfg: CoverConfig,
  images: CoverImages,
  opts: { scale: number; showPlaceholder: boolean }
): void {
  ctx.save();
  ctx.setTransform(opts.scale, 0, 0, opts.scale, 0, 0);
  ctx.clearRect(0, 0, 3000, 3000);

  // 2. Background
  if (cfg.bg.type === 'image' && images.bg) {
    const img = images.bg;
    const base = Math.max(3000 / img.width, 3000 / img.height) * cfg.bg.imgZoom;
    const dw = img.width * base;
    const dh = img.height * base;
    const maxX = (dw - 3000) / 2;
    const maxY = (dh - 3000) / 2;
    const ox = clamp(cfg.bg.imgX, -maxX, maxX);
    const oy = clamp(cfg.bg.imgY, -maxY, maxY);
    
    const blurVal = cfg.bg.blur || 0;
    if (blurVal > 0) {
      ctx.filter = `blur(${blurVal}px)`;
    }
    
    // Fill a fallback color behind to prevent transparent edge bleed on heavy blur
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 3000, 3000);
    
    // Slight overdraw to hide edge bleed when blurred
    const bleed = blurVal > 0 ? blurVal * 2 : 0;
    ctx.drawImage(
      img, 
      1500 - (dw + bleed) / 2 + ox, 
      1500 - (dh + bleed) / 2 + oy, 
      dw + bleed, 
      dh + bleed
    );
    
    if (blurVal > 0) {
      ctx.filter = "none";
    }

    if (cfg.bg.overlayOpacity && cfg.bg.overlayOpacity > 0) {
      ctx.fillStyle = `rgba(0,0,0,${cfg.bg.overlayOpacity})`;
      ctx.fillRect(0, 0, 3000, 3000);
    }
  } else if (cfg.bg.type === 'solid') {
    ctx.fillStyle = cfg.bg.solid;
    ctx.fillRect(0, 0, 3000, 3000);
  } else {
    // gradient
    const a = cfg.bg.gradient.angle * (Math.PI / 180);
    const cx = 1500, cy = 1500;
    const r = 1500 * Math.SQRT2;
    const sx = cx - Math.cos(a) * r;
    const sy = cy - Math.sin(a) * r;
    const ex = cx + Math.cos(a) * r;
    const ey = cy + Math.sin(a) * r;
    
    const grad = ctx.createLinearGradient(sx, sy, ex, ey);
    grad.addColorStop(0, cfg.bg.gradient.stops[0]);
    grad.addColorStop(0.5, cfg.bg.gradient.stops[1]);
    grad.addColorStop(1, cfg.bg.gradient.stops[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 3000, 3000);
  }

  // 3. Host photo
  if (cfg.host.enabled !== false && images.host) {
    const img = images.host;
    const h = HOST_BASE_HEIGHT * cfg.host.zoom;
    const w = h * (img.width / img.height);
    ctx.drawImage(img, cfg.host.cx - w / 2, cfg.host.bottom - h, w, h);
  } else if (opts.showPlaceholder) {
    ctx.fillStyle = '#707070';
    ctx.beginPath();
    ctx.arc(1781, 1046, 747, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(1781, 3094, 1160, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Title
  let size = BASE_SIZE.title * cfg.title.sizeScale;
  let titleText = cfg.title.upper ? cfg.title.text.toUpperCase() : cfg.title.text;
  let lines: string[] = [];
  
  // Auto-fit loop
  while (true) {
    ctx.font = fontString(cfg.title, size);
    if ('letterSpacing' in ctx) {
      (ctx as any).letterSpacing = `${cfg.title.letterSpacing * size}px`;
    }
    lines = wrapText(ctx, titleText, cfg.title.maxWidth);
    
    if (lines.length > 3 && size > BASE_SIZE.title * cfg.title.sizeScale * 0.4) {
      size *= 0.94; // reduce by 6%
    } else {
      break;
    }
  }

  const { x, y, align, lineHeight, color, bgColor, bgOpacity } = cfg.title;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const metrics = ctx.measureText(line);
    const w = metrics.width;
    let lineX = x;
    if (align === 'center') lineX = x + (cfg.title.maxWidth - w) / 2;
    else if (align === 'right') lineX = x + cfg.title.maxWidth - w;
    
    const lineY = y + i * size * lineHeight;
    
    if (bgOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = bgOpacity;
      ctx.fillStyle = bgColor;
      // line width + 40px padding, height size * 1.0, positioned around baseline
      ctx.fillRect(lineX - 20, lineY - size * 0.8, w + 40, size * 1.0);
      ctx.restore();
    }
    
    ctx.fillStyle = color;
    ctx.fillText(line, lineX, lineY);
  }

  // reset letterSpacing for safety
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '0px';
  }

  // 5. Badge
  const wSize = BASE_SIZE.withText * cfg.withText.sizeScale;
  const hSize = BASE_SIZE.hostName * cfg.hostName.sizeScale;
  
  ctx.font = fontString(cfg.withText, wSize);
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = `${cfg.withText.letterSpacing * wSize}px`;
  }
  const withTextStr = cfg.withText.upper ? cfg.withText.text.toUpperCase() : cfg.withText.text;
  const ww = ctx.measureText(withTextStr).width;
  
  ctx.font = fontString(cfg.hostName, hSize);
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = `${cfg.hostName.letterSpacing * hSize}px`;
  }
  const hostNameStr = cfg.hostName.upper ? cfg.hostName.text.toUpperCase() : cfg.hostName.text;
  const hw = ctx.measureText(hostNameStr).width;
  
  const PAD = 120;
  const GAP = 100;
  const rectW = PAD + ww + GAP + hw + PAD;
  const rectH = Math.max(wSize, hSize) * 1.85;
  const rectTop = cfg.badge.baselineY - rectH * 0.667;
  
  if (cfg.badge.enabled) {
    ctx.fillStyle = cfg.badge.color;
    ctx.fillRect(cfg.badge.x, rectTop, rectW, rectH);
  }
  
  // "With"
  ctx.font = fontString(cfg.withText, wSize);
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = `${cfg.withText.letterSpacing * wSize}px`;
  }
  
  const withX = cfg.badge.x + PAD;
  const withY = cfg.badge.baselineY;
  
  if (cfg.withText.bgOpacity > 0) {
    ctx.save();
    ctx.globalAlpha = cfg.withText.bgOpacity;
    ctx.fillStyle = cfg.withText.bgColor;
    ctx.fillRect(withX - 20, withY - wSize * 0.8, ww + 40, wSize * 1.0);
    ctx.restore();
  }
  ctx.fillStyle = cfg.withText.color;
  ctx.fillText(withTextStr, withX, withY);
  
  // Host Name
  ctx.font = fontString(cfg.hostName, hSize);
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = `${cfg.hostName.letterSpacing * hSize}px`;
  }
  
  const hostX = cfg.badge.x + PAD + ww + GAP;
  const hostY = cfg.badge.baselineY;
  
  if (cfg.hostName.bgOpacity > 0) {
    ctx.save();
    ctx.globalAlpha = cfg.hostName.bgOpacity;
    ctx.fillStyle = cfg.hostName.bgColor;
    ctx.fillRect(hostX - 20, hostY - hSize * 0.8, hw + 40, hSize * 1.0);
    ctx.restore();
  }
  ctx.fillStyle = cfg.hostName.color;
  ctx.fillText(hostNameStr, hostX, hostY);
  
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '0px';
  }
  
  ctx.restore();
}
