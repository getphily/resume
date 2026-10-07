import React from 'react';
import { TextFormattingToolbar } from '@/components/TextFormattingToolbar';
import { Slider } from '@/components/ui/slider';
import { TextLayer, TitleLayer } from '@/lib/coverStudio/types';
import { Input } from '@/components/ui/input';

interface TextTabProps {
  layer: TitleLayer | TextLayer;
  onChange: (patch: any) => void;
  kind: 'title' | 'single';
}

export function TextTab({ layer, onChange, kind }: TextTabProps) {
  const isTitle = kind === 'title';
  const tLayer = layer as TitleLayer;

  const handleToolbarChange = (patch: any) => {
    const mapped: any = {};
    if ('fontFamily' in patch) mapped.font = patch.fontFamily;
    if ('fontSize' in patch) {
      const size = typeof patch.fontSize === 'string' ? parseFloat(patch.fontSize) : patch.fontSize;
      // coerce to exactly 0.82 | 1 | 1.2
      mapped.sizeScale = size <= 0.82 ? 0.82 : size >= 1.2 ? 1.2 : 1;
    }
    if ('textTransform' in patch) mapped.upper = patch.textTransform === 'uppercase';
    if ('textColor' in patch) mapped.color = patch.textColor;
    if ('textAlign' in patch) mapped.align = patch.textAlign;
    
    // Pass through others
    if ('bold' in patch) mapped.bold = patch.bold;
    if ('italic' in patch) mapped.italic = patch.italic;
    if ('bgColor' in patch) mapped.bgColor = patch.bgColor;
    if ('bgOpacity' in patch) mapped.bgOpacity = patch.bgOpacity;
    if ('letterSpacing' in patch) mapped.letterSpacing = patch.letterSpacing;
    if ('lineHeight' in patch) mapped.lineHeight = patch.lineHeight;

    onChange(mapped);
  };

  return (
    <div className="flex flex-col gap-5 p-1">
      <p className="text-xs text-muted-foreground font-medium">
        {isTitle 
          ? "Keep it to 1–3 short lines; very long titles shrink automatically."
          : "Short and bold works best on small phone screens."}
      </p>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-foreground">Text</label>
        <Input 
          value={layer.text} 
          onChange={(e) => onChange({ text: e.target.value })} 
          className="bg-background"
        />
      </div>

      <TextFormattingToolbar
        fontFamily={layer.font}
        fontSize={layer.sizeScale}
        bold={layer.bold}
        italic={layer.italic}
        textTransform={layer.upper ? 'uppercase' : 'none'}
        textColor={layer.color}
        showBgColor={true}
        bgColor={layer.bgColor}
        bgOpacity={layer.bgOpacity}
        letterSpacing={layer.letterSpacing}
        textAlign={isTitle ? tLayer.align : undefined}
        lineHeight={isTitle ? tLayer.lineHeight : undefined}
        onChange={handleToolbarChange}
      />

      {isTitle && (
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground">Horizontal Position</label>
            <Slider 
              value={[tLayer.x]} min={150} max={1000} step={10} 
              onValueChange={(val) => onChange({ x: val[0] })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground">Vertical Position</label>
            <Slider 
              value={[tLayer.y]} min={900} max={2300} step={10} 
              onValueChange={(val) => onChange({ y: val[0] })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
