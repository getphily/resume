'use client';

import React from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import { FontBoldIcon, FontItalicIcon, LetterCaseCapitalizeIcon, Pencil1Icon } from '@radix-ui/react-icons';
import { ColorInputWithPalette } from '@/components/ColorInputWithPalette';
import { Box, Text, TextField, Select, Slider, IconButton, Tooltip, Popover } from '@radix-ui/themes';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      {text !== undefined && (
        <TextField.Root 
          size="2" 
          value={text} 
          onChange={e => onChange({ text: e.target.value })} 
          placeholder="Text content..." 
        />
      )}

      {/* Ribbon Control Toolbar */}
      <Toolbar.Root 
        aria-label="Text Formatting"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          padding: '4px', 
          backgroundColor: 'var(--bg-panel)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: '6px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          flexWrap: 'wrap'
        }}
      >
        {/* Font Family Selector */}
        <Select.Root 
          size="1" 
          value={fontFamily || 'Inter'} 
          onValueChange={f => onChange({ fontFamily: f })}
        >
          <Select.Trigger variant="ghost" color="gray" style={{ minWidth: '110px' }} />
          <Select.Content position="popper">
            {FONTS_LIST.map(f => (
              <Select.Item 
                key={f} 
                value={f} 
                style={{ fontFamily: `'${f}', sans-serif`, fontSize: '13px' }}
              >
                {f}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Toolbar.Separator style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Font Size Selector if available */}
        {fontSize !== undefined && (
          typeof fontSize === 'string' ? (
            <Select.Root 
              size="1" 
              value={fontSize} 
              onValueChange={s => onChange({ fontSize: s })}
            >
              <Select.Trigger variant="ghost" color="gray" />
              <Select.Content position="popper">
                <Select.Item value="SMALL">Small</Select.Item>
                <Select.Item value="MEDIUM">Medium</Select.Item>
                <Select.Item value="LARGE">Large</Select.Item>
                <Select.Item value="EXTRA LARGE">Extra Large</Select.Item>
              </Select.Content>
            </Select.Root>
          ) : (
            <Select.Root 
              size="1" 
              value={fontSize >= 1.2 ? '1.2' : fontSize <= 0.82 ? '0.82' : '1.0'} 
              onValueChange={v => onChange({ fontSize: parseFloat(v) })}
            >
              <Select.Trigger variant="ghost" color="gray" />
              <Select.Content position="popper">
                <Select.Item value="0.82">Small</Select.Item>
                <Select.Item value="1.0">Medium</Select.Item>
                <Select.Item value="1.2">Large</Select.Item>
              </Select.Content>
            </Select.Root>
          )
        )}

        {fontSize !== undefined && (
          <Toolbar.Separator style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />
        )}

        {/* Bold Toggle */}
        {bold !== undefined && (
          <Tooltip content="Bold">
            <IconButton 
              variant={bold ? "soft" : "ghost"} 
              color={bold ? "blue" : "gray"} 
              size="1" 
              onClick={() => onChange({ bold: !bold })}
              aria-label="Toggle Bold"
            >
              <FontBoldIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Italic Toggle */}
        {italic !== undefined && (
          <Tooltip content="Italic">
            <IconButton 
              variant={italic ? "soft" : "ghost"} 
              color={italic ? "blue" : "gray"} 
              size="1" 
              onClick={() => onChange({ italic: !italic })}
              aria-label="Toggle Italic"
            >
              <FontItalicIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Uppercase Toggle */}
        {textTransform !== undefined && (
          <Tooltip content="Uppercase">
            <IconButton 
              variant={textTransform === 'uppercase' ? "soft" : "ghost"} 
              color={textTransform === 'uppercase' ? "blue" : "gray"} 
              size="1" 
              onClick={() => onChange({ textTransform: textTransform === 'uppercase' ? 'none' : 'uppercase' })}
              aria-label="Toggle Uppercase"
            >
              <LetterCaseCapitalizeIcon />
            </IconButton>
          </Tooltip>
        )}

        {(bold !== undefined || italic !== undefined || textTransform !== undefined) && (
          <Toolbar.Separator style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />
        )}

        {/* Color Popovers */}
        {textColor !== undefined && (
          <Popover.Root>
            <Tooltip content="Text Color">
              <Popover.Trigger>
                <IconButton variant="ghost" color="gray" aria-label="Text Color" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', padding: 0, gap: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'sans-serif', lineHeight: 1 }}>A</span>
                  <div style={{ width: '14px', height: '3px', backgroundColor: textColor, borderRadius: '1px', border: textColor === '#000000' || textColor === '#111111' ? '1px solid rgba(255,255,255,0.2)' : 'none' }} />
                </IconButton>
              </Popover.Trigger>
            </Tooltip>
            <Popover.Content sideOffset={5} style={{ backgroundColor: 'var(--bg-panel)', padding: '15px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--border-subtle)', zIndex: 100 }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>TEXT COLOR</label>
              <ColorInputWithPalette value={textColor} onChange={c => onChange({ textColor: c })} />
              {opacity !== undefined && (
                <Box mt="3">
                  <Text as="label" size="1" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>OPACITY</Text>
                  <Slider min={0} max={1} step={0.05} value={[opacity]} onValueChange={v => onChange({ opacity: v[0] })} />
                </Box>
              )}
            </Popover.Content>
          </Popover.Root>
        )}

        {showBgColor && bgColor !== undefined && (
          <Popover.Root>
            <Tooltip content="Background Color">
              <Popover.Trigger>
                <IconButton variant="ghost" color="gray" aria-label="Background Color" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', padding: 0, gap: '2px' }}>
                  <Pencil1Icon width={13} height={13} />
                  <div style={{ width: '14px', height: '3px', backgroundColor: bgColor, borderRadius: '1px', border: bgColor === '#000000' || bgColor === '#111111' ? '1px solid rgba(255,255,255,0.2)' : 'none' }} />
                </IconButton>
              </Popover.Trigger>
            </Tooltip>
            <Popover.Content sideOffset={5} style={{ backgroundColor: 'var(--bg-panel)', padding: '15px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--border-subtle)', zIndex: 100 }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>BACKGROUND COLOR</label>
              <ColorInputWithPalette value={bgColor} onChange={c => onChange({ bgColor: c })} />
              {bgOpacity !== undefined && (
                <Box mt="3">
                  <Text as="label" size="1" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>OPACITY</Text>
                  <Slider min={0} max={1} step={0.05} value={[bgOpacity]} onValueChange={v => onChange({ bgOpacity: v[0] })} />
                </Box>
              )}
            </Popover.Content>
          </Popover.Root>
        )}
      </Toolbar.Root>
    </div>
  );
}
