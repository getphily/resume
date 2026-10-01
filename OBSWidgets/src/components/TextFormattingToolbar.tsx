'use client';

import React from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import { FontBoldIcon, FontItalicIcon, LetterCaseCapitalizeIcon, BlendingModeIcon } from '@radix-ui/react-icons';
import { ColorInputWithPalette } from '@/components/ColorInputWithPalette';
import * as Popover from '@radix-ui/react-popover';
import { Flex, Box, Text, TextField, Select, Slider } from '@radix-ui/themes';

interface TextFormatProps {
  text?: string;
  fontFamily: string;
  fontSize: number | string; // usually 0.82 to 1.5, or strings. Let's make it flexible.
  bold?: boolean;
  italic?: boolean;
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  textColor: string;
  opacity?: number;
  bgColor?: string;
  bgOpacity?: number;
  onChange: (patch: any) => void;
  showBgColor?: boolean;
}

export function TextFormattingToolbar({
  text, fontFamily, fontSize, bold, italic, textTransform, textColor, opacity, bgColor, bgOpacity, showBgColor, onChange
}: TextFormatProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {text !== undefined && (
        <TextField.Root 
          value={text} 
          onChange={e => onChange({ text: e.target.value })} 
          placeholder="Enter text..." 
          style={{ fontWeight: bold ? 700 : 400, fontFamily, textTransform: textTransform === 'uppercase' ? 'uppercase' : 'none' }}
        />
      )}
      
      <Toolbar.Root 
        style={{ 
          display: 'flex', 
          padding: '4px', 
          width: '100%', 
          minWidth: 'max-content', 
          borderRadius: '6px', 
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        {/* Font Family Dropdown */}
        <Select.Root size="1" value={fontFamily} onValueChange={val => onChange({ fontFamily: val })}>
          <Select.Trigger variant="ghost" />
          <Select.Content>
            <Select.Item value="Inter">Inter</Select.Item>
            <Select.Item value="Outfit">Outfit</Select.Item>
            <Select.Item value="Roboto Mono">Roboto Mono</Select.Item>
            <Select.Item value="Bebas Neue">Bebas Neue</Select.Item>
          </Select.Content>
        </Select.Root>

        <Toolbar.Separator style={{ width: '1px', backgroundColor: 'var(--border-subtle)', margin: '0 8px' }} />

        {/* Font Size Dropdown */}
        <Select.Root size="1" value={String(fontSize)} onValueChange={val => onChange({ fontSize: isNaN(Number(val)) ? val : parseFloat(val) })}>
          <Select.Trigger variant="ghost" />
          <Select.Content>
            {typeof fontSize === 'string' ? (
              <>
                <Select.Item value="SMALL">Small</Select.Item>
                <Select.Item value="MEDIUM">Medium</Select.Item>
                <Select.Item value="LARGE">Large</Select.Item>
                <Select.Item value="EXTRA LARGE">X-Large</Select.Item>
              </>
            ) : (
              <>
                <Select.Item value="0.82">Small</Select.Item>
                <Select.Item value="1">Medium</Select.Item>
                <Select.Item value="1.2">Large</Select.Item>
                <Select.Item value="1.5">X-Large</Select.Item>
              </>
            )}
          </Select.Content>
        </Select.Root>

        <Toolbar.Separator style={{ width: '1px', backgroundColor: 'var(--border-subtle)', margin: '0 8px' }} />

        {/* Toggle Buttons */}
        {(bold !== undefined || italic !== undefined || textTransform !== undefined) && (
          <Toolbar.ToggleGroup type="multiple" style={{ display: 'flex', gap: '2px' }}>
            {bold !== undefined && (
              <Toolbar.ToggleItem 
                value="bold" 
                aria-label="Bold" 
                className="toolbar-btn"
                data-state={bold ? 'on' : 'off'}
                onClick={() => onChange({ bold: !bold })}
              >
                <FontBoldIcon />
              </Toolbar.ToggleItem>
            )}
          {italic !== undefined && (
            <Toolbar.ToggleItem 
              value="italic" 
              aria-label="Italic" 
              className="toolbar-btn"
              data-state={italic ? 'on' : 'off'}
              onClick={() => onChange({ italic: !italic })}
            >
              <FontItalicIcon />
            </Toolbar.ToggleItem>
          )}
          {textTransform !== undefined && (
            <Toolbar.ToggleItem 
              value="uppercase" 
              aria-label="Uppercase" 
              className="toolbar-btn"
              data-state={textTransform === 'uppercase' ? 'on' : 'off'}
              onClick={() => onChange({ textTransform: textTransform === 'uppercase' ? 'none' : 'uppercase' })}
            >
              <LetterCaseCapitalizeIcon />
            </Toolbar.ToggleItem>
            )}
          </Toolbar.ToggleGroup>
        )}

        {(bold !== undefined || italic !== undefined || textTransform !== undefined) && (
          <Toolbar.Separator style={{ width: '1px', backgroundColor: 'var(--border-subtle)', margin: '0 8px' }} />
        )}

        {/* Color Popovers */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="toolbar-btn" aria-label="Text Color" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <BlendingModeIcon color={textColor} />
              <div style={{ width: '12px', height: '12px', backgroundColor: textColor, borderRadius: '2px', border: '1px solid rgba(0,0,0,0.1)' }} />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content sideOffset={5} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--border-subtle)', zIndex: 100 }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>TEXT COLOR</label>
              <ColorInputWithPalette value={textColor} onChange={c => onChange({ textColor: c })} />
              {opacity !== undefined && (
                <Box mt="3">
                  <Text as="label" size="1" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>OPACITY</Text>
                  <Slider min={0} max={1} step={0.05} value={[opacity]} onValueChange={v => onChange({ opacity: v[0] })} />
                </Box>
              )}
              <Popover.Arrow style={{ fill: 'white' }} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {showBgColor && bgColor !== undefined && (
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="toolbar-btn" aria-label="Background Color" style={{ display: 'flex', gap: '6px', alignItems: 'center', marginLeft: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>BG</span>
                <div style={{ width: '12px', height: '12px', backgroundColor: bgColor, borderRadius: '2px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content sideOffset={5} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--border-subtle)', zIndex: 100 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>BACKGROUND COLOR</label>
                <ColorInputWithPalette value={bgColor} onChange={c => onChange({ bgColor: c })} />
                {bgOpacity !== undefined && (
                  <Box mt="3">
                    <Text as="label" size="1" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>OPACITY</Text>
                    <Slider min={0} max={1} step={0.05} value={[bgOpacity]} onValueChange={v => onChange({ bgOpacity: v[0] })} />
                  </Box>
                )}
                <Popover.Arrow style={{ fill: 'white' }} />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        )}
      </Toolbar.Root>
    </div>
  );
}
