const fs = require('fs');
let code = fs.readFileSync('src/components/podcast-tools/MagicPolishPanel.tsx', 'utf8');

code = code.replace(
  `interface MagicPolishPanelProps {\n  /** The editor's current (already-cut) audio. */\n  buffer: AudioBuffer | null;\n  /** Used to name saved copies. */\n  fileBase: string;\n  disabled?: boolean;\n  /** Push the rendered result onto the editor's undo stack. */\n  onResult: (polished: AudioBuffer) => void;\n  onUndo: () => void;\n  onRedo: () => void;\n}`,
  `interface MagicPolishPanelProps {\n  /** The full source buffer. Polish runs on this entire buffer, so cuts remain editable. */\n  buffer: AudioBuffer | null;\n  /** Used to name saved copies. */\n  fileBase: string;\n  disabled?: boolean;\n  layer: 'original' | 'polished';\n  onResult: (polished: AudioBuffer) => void;\n  onToggleLayer: (layer: 'original' | 'polished') => void;\n}`
);

code = code.replace(
  `export function MagicPolishPanel({\n  buffer,\n  fileBase,\n  disabled,\n  onResult,\n  onUndo,\n  onRedo,\n}: MagicPolishPanelProps) {`,
  `export function MagicPolishPanel({\n  buffer,\n  fileBase,\n  disabled,\n  layer,\n  onResult,\n  onToggleLayer,\n}: MagicPolishPanelProps) {`
);

code = code.replace(
  `  const [lastRun, setLastRun] = useState<{ before: AudioBuffer; after: AudioBuffer } | null>(null);\n  const view = lastRun && buffer === lastRun.before ? 'original' : lastRun && buffer === lastRun.after ? 'polished' : null;`,
  `  const [lastRun, setLastRun] = useState<{ before: AudioBuffer; after: AudioBuffer } | null>(null);`
);

code = code.replace(
  `          {view && (\n            <div className="flex items-center gap-1 sm:ml-auto" role="group" aria-label="Compare original and polished">\n              <Button variant={view === 'original' ? 'default' : 'outline'} className={touchBtn} onClick={onUndo} aria-pressed={view === 'original'}>\n                <Undo2 className="w-4 h-4 mr-1.5" aria-hidden="true" />\n                Original\n              </Button>\n              <Button variant={view === 'polished' ? 'default' : 'outline'} className={touchBtn} onClick={onRedo} aria-pressed={view === 'polished'}>\n                <Redo2 className="w-4 h-4 mr-1.5" aria-hidden="true" />\n                Polished\n              </Button>\n            </div>\n          )}`,
  `          {lastRun && (\n            <div className="flex items-center gap-1 sm:ml-auto" role="group" aria-label="Compare original and polished">\n              <Button variant={layer === 'original' ? 'default' : 'outline'} className={touchBtn} onClick={() => onToggleLayer('original')} aria-pressed={layer === 'original'}>\n                <Undo2 className="w-4 h-4 mr-1.5" aria-hidden="true" />\n                Original\n              </Button>\n              <Button variant={layer === 'polished' ? 'default' : 'outline'} className={touchBtn} onClick={() => onToggleLayer('polished')} aria-pressed={layer === 'polished'}>\n                <Redo2 className="w-4 h-4 mr-1.5" aria-hidden="true" />\n                Polished\n              </Button>\n            </div>\n          )}`
);

fs.writeFileSync('src/components/podcast-tools/MagicPolishPanel.tsx', code);
console.log('Patch applied successfully');
