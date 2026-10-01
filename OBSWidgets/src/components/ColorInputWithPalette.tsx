'use client';

import { Flex, Box } from '@radix-ui/themes';

const PRESET_COLORS = [
  '#ffffff', '#f8fafc', '#94a3b8', '#0f172a', '#000000',
  '#e63946', '#f97316', '#f59e0b', '#84cc16', '#10b981',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
];

export function ColorInputWithPalette({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  return (
    <Flex align="center" gap="3">
      <Box style={{ backgroundColor: value, width: '28px', height: '28px', borderRadius: 'var(--radius-3)', border: '1px solid var(--gray-a6)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer', position: 'absolute', inset: 0 }} />
      </Box>
      <Flex gap="1" wrap="wrap" align="center">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              width: '18px', height: '18px', borderRadius: '50%', backgroundColor: c,
              border: value.toLowerCase() === c.toLowerCase() ? '2px solid var(--accent-a9)' : '1px solid var(--gray-a4)',
              cursor: 'pointer', padding: 0
            }}
            title={c}
          />
        ))}
      </Flex>
    </Flex>
  );
}
