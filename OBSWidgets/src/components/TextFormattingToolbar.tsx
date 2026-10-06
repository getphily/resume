'use client';

import React from 'react';
import { Bold, Italic, CaseUpper, Paintbrush } from 'lucide-react';
import { ColorInputWithPalette } from '@/components/ColorInputWithPalette';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TextFormatPatch = Record<string, any>;

interface TextFormatProps {
  text?: string;
  fontFamily: string;
  fontSize?: number | string;
  bold?: boolean;
  italic?: boolean;
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  textColor?: string;
  opacity?: number;
  bgColor?: string;
  bgOpacity?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (patch: any) => void;
  showBgColor?: boolean;
}

const FONTS_LIST = [
  'Inter', 'Outfit', 'Roboto Mono', 'Bebas Neue', 'Roboto',
  'Poppins', 'Montserrat', 'Open Sans', 'Lato', 'Raleway',
  'Nunito', 'Playfair Display', 'Oswald', 'Fira Code', 'VT323'
];

export function TextFormattingToolbar({
  text,
  fontFamily,
  fontSize,
  bold,
  italic,
  textTransform,
  textColor,
  opacity,
  bgColor,
  bgOpacity,
  onChange,
  showBgColor = false,
}: TextFormatProps) {
  return (
    <div className="flex flex-col gap-2.5 w-full">
      {text !== undefined && (
        <Input 
          value={text} 
          onChange={e => onChange({ text: e.target.value })} 
          placeholder="Text content..." 
          className="h-9 text-xs"
        />
      )}

      {/* Ribbon Control Toolbar */}
      <div 
        role="toolbar"
        aria-label="Text Formatting"
        className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-lg shadow-2xs flex-wrap"
      >
        {/* Font Family Selector */}
        <div className="w-32">
          <Select 
            value={fontFamily || 'Inter'} 
            onValueChange={f => onChange({ fontFamily: f })}
          >
            <SelectTrigger className="h-8 text-xs border-0 bg-transparent hover:bg-muted font-medium">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              {FONTS_LIST.map(f => (
                <SelectItem 
                  key={f} 
                  value={f} 
                  style={{ fontFamily: `'${f}', sans-serif` }}
                  className="text-xs"
                >
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Font Size Selector if available */}
        {fontSize !== undefined && (
          typeof fontSize === 'string' ? (
            <div className="w-28">
              <Select 
                value={fontSize} 
                onValueChange={s => onChange({ fontSize: s })}
              >
                <SelectTrigger className="h-8 text-xs border-0 bg-transparent hover:bg-muted font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMALL" className="text-xs">Small</SelectItem>
                  <SelectItem value="MEDIUM" className="text-xs">Medium</SelectItem>
                  <SelectItem value="LARGE" className="text-xs">Large</SelectItem>
                  <SelectItem value="EXTRA LARGE" className="text-xs">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="w-24">
              <Select 
                value={fontSize >= 1.2 ? '1.2' : fontSize <= 0.82 ? '0.82' : '1.0'} 
                onValueChange={v => onChange({ fontSize: parseFloat(v) })}
              >
                <SelectTrigger className="h-8 text-xs border-0 bg-transparent hover:bg-muted font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.82" className="text-xs">Small</SelectItem>
                  <SelectItem value="1.0" className="text-xs">Medium</SelectItem>
                  <SelectItem value="1.2" className="text-xs">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )
        )}

        {fontSize !== undefined && (
          <div className="w-px h-4 bg-border mx-0.5" />
        )}

        {/* Bold Toggle */}
        {bold !== undefined && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={bold ? "secondary" : "ghost"} 
                size="icon" 
                onClick={() => onChange({ bold: !bold })}
                aria-label="Toggle Bold"
                className={`h-7 w-7 ${bold ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
              >
                <Bold className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Bold</p></TooltipContent>
          </Tooltip>
        )}

        {/* Italic Toggle */}
        {italic !== undefined && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={italic ? "secondary" : "ghost"} 
                size="icon" 
                onClick={() => onChange({ italic: !italic })}
                aria-label="Toggle Italic"
                className={`h-7 w-7 ${italic ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
              >
                <Italic className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Italic</p></TooltipContent>
          </Tooltip>
        )}

        {/* Uppercase Toggle */}
        {textTransform !== undefined && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={textTransform === 'uppercase' ? "secondary" : "ghost"} 
                size="icon" 
                onClick={() => onChange({ textTransform: textTransform === 'uppercase' ? 'none' : 'uppercase' })}
                aria-label="Toggle Uppercase"
                className={`h-7 w-7 ${textTransform === 'uppercase' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
              >
                <CaseUpper className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Uppercase</p></TooltipContent>
          </Tooltip>
        )}

        {(bold !== undefined || italic !== undefined || textTransform !== undefined) && (
          <div className="w-px h-4 bg-border mx-0.5" />
        )}

        {/* Text Color Popover */}
        {textColor !== undefined && (
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    aria-label="Text Color"
                    className="h-7 w-7 flex flex-col items-center justify-center p-0 gap-0.5"
                  >
                    <span className="text-xs font-bold leading-none">A</span>
                    <div 
                      className="w-3.5 h-1 rounded-xs" 
                      style={{ backgroundColor: textColor }} 
                    />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Text Color</p></TooltipContent>
            </Tooltip>
            <PopoverContent sideOffset={5} className="w-64 p-4">
              <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2">
                Text Color
              </span>
              <ColorInputWithPalette value={textColor} onChange={c => onChange({ textColor: c })} />
              {opacity !== undefined && (
                <div className="mt-3 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Opacity
                  </span>
                  <Slider min={0} max={1} step={0.05} value={[opacity]} onValueChange={v => onChange({ opacity: v[0] })} />
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* Background Color Popover */}
        {showBgColor && bgColor !== undefined && (
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    aria-label="Background Color"
                    className="h-7 w-7 flex flex-col items-center justify-center p-0 gap-0.5"
                  >
                    <Paintbrush className="w-3 h-3 text-muted-foreground" />
                    <div 
                      className="w-3.5 h-1 rounded-xs" 
                      style={{ backgroundColor: bgColor }} 
                    />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Background Color</p></TooltipContent>
            </Tooltip>
            <PopoverContent sideOffset={5} className="w-64 p-4">
              <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2">
                Background Color
              </span>
              <ColorInputWithPalette value={bgColor} onChange={c => onChange({ bgColor: c })} />
              {bgOpacity !== undefined && (
                <div className="mt-3 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Opacity
                  </span>
                  <Slider min={0} max={1} step={0.05} value={[bgOpacity]} onValueChange={v => onChange({ bgOpacity: v[0] })} />
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
