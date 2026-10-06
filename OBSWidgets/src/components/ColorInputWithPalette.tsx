'use client';

import { Slider } from '@/components/ui/slider';

const PRESET_COLORS = [
  '#ffffff', '#f8fafc', '#94a3b8', '#0f172a', '#000000',
  '#c92a2a', '#f97316', '#f59e0b', '#84cc16', '#10b981',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
];

export function ColorInputWithPalette({ 
  value, 
  onChange,
  opacity,
  onOpacityChange
}: { 
  value: string, 
  onChange: (val: string) => void,
  opacity?: number,
  onOpacityChange?: (val: number) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div 
          className="w-11 h-11 rounded-md border border-border shrink-0 relative overflow-hidden shadow-xs"
          style={{ backgroundColor: value }}
        >
          <input aria-label="Choose color" 
            type="color" 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="opacity-0 w-full h-full cursor-pointer absolute inset-0" 
          />
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 ${
                value.toLowerCase() === c.toLowerCase() 
                  ? 'ring-2 ring-primary ring-offset-1 scale-105' 
                  : 'border border-black/10 dark:border-white/10'
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>
      
      {opacity !== undefined && onOpacityChange !== undefined && (
        <div className="flex items-center gap-3 w-full">
          <span className="text-sm font-bold tracking-wider uppercase text-muted-foreground w-14">
            Opacity
          </span>
          <div className="flex-1">
            <Slider aria-label="Opacity" 
              min={0} 
              max={1} 
              step={0.05} 
              value={[opacity]} 
              onValueChange={e => onOpacityChange(e[0])} 
            />
          </div>
          <span className="text-sm font-mono font-medium text-muted-foreground w-8 text-right">
            {Math.round(opacity * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
