const fs = require('fs');
let code = fs.readFileSync('src/components/podcast-tools/AudioEditor.tsx', 'utf8');

// 1. Imports
code = code.replace(
  `import {\n  decodeBlob, encodeWav, formatTime, keepRanges, removeRanges, type TimeRange,\n} from '@/lib/audioEditor/buffer';`,
  `import {\n  decodeBlob, encodeWav, formatTime, concatSegments,\n} from '@/lib/audioEditor/buffer';\nimport {\n  subtract, add, cutWaveformRegion\n} from '@/lib/audioEditor/edl';\nimport type { Range } from '@/lib/audioEditor/transcript';`
);

// 2. State definition
code = code.replace(
  `  // --- Non-destructive edit history. The AudioBuffers are never mutated; every edit pushes a new one. ---\n  const [hist, setHist] = useState<{ stack: AudioBuffer[]; cursor: number }>({ stack: [], cursor: -1 });\n  const current = hist.cursor >= 0 ? hist.stack[hist.cursor] ?? null : null;`,
  `  // --- Non-destructive edit history (EDL). The source buffer is never mutated. ---\n  const [source, setSource] = useState<AudioBuffer | null>(null);\n  const [polished, setPolished] = useState<AudioBuffer | null>(null);\n  const [layer, setLayer] = useState<'original' | 'polished'>('original');\n\n  const [hist, setHist] = useState<{ stack: Range[][]; cursor: number }>({ stack: [], cursor: -1 });\n  const kept = hist.cursor >= 0 ? hist.stack[hist.cursor] ?? [] : [];\n\n  const currentSource = layer === 'polished' && polished ? polished : source;\n  const current = useMemo(() => {\n    if (!currentSource || kept.length === 0) return null;\n    return concatSegments(currentSource, kept);\n  }, [currentSource, kept]);`
);

// 3. pushBuffer -> pushKept
code = code.replace(
  `  const pushBuffer = useCallback((buffer: AudioBuffer) => {\n    setHist(prev => {\n      const stack = [...prev.stack.slice(0, prev.cursor + 1), buffer].slice(-MAX_HISTORY);\n      return { stack, cursor: stack.length - 1 };\n    });\n  }, []);`,
  `  const pushKept = useCallback((newKept: Range[]) => {\n    setHist(prev => {\n      const stack = [...prev.stack.slice(0, prev.cursor + 1), newKept].slice(-50);\n      return { stack, cursor: stack.length - 1 };\n    });\n  }, []);`
);

// 4. loadBlobAsAudio
code = code.replace(
  `  const loadBlobAsAudio = async (blob: Blob, label: string) => {\n    setIsBusy(true);\n    try {\n      pushBuffer(await decodeBlob(blob));\n    } catch (err) {\n      console.error('[AudioEditor] decode failed', err);\n      toast.error(\`Couldn't read \${label}. Try an MP3, WAV or M4A file.\`, { position: 'top-center' });\n      setIsBusy(false);\n    }\n  };`,
  `  const loadBlobAsAudio = async (blob: Blob, label: string) => {\n    setIsBusy(true);\n    try {\n      const buf = await decodeBlob(blob);\n      setSource(buf);\n      setPolished(null);\n      setLayer('original');\n      setHist({ stack: [[{ start: 0, end: buf.duration }]], cursor: 0 });\n    } catch (err) {\n      console.error('[AudioEditor] decode failed', err);\n      toast.error(\`Couldn't read \${label}. Try an MP3, WAV or M4A file.\`, { position: 'top-center' });\n    } finally {\n      setIsBusy(false);\n    }\n  };`
);

// 5. getSelectedRanges -> TimeRange[] to Range[]
code = code.replace(
  `  const getSelectedRanges = (): TimeRange[] =>\n    (regionsRef.current?.getRegions() ?? []).map(r => ({ start: r.start, end: r.end }));`,
  `  const getSelectedRanges = (): Range[] =>\n    (regionsRef.current?.getRegions() ?? []).map(r => ({ start: r.start, end: r.end }));`
);

// 6. applyEdit
code = code.replace(
  `  const applyEdit = (mode: 'trim' | 'remove') => {\n    if (!current) return;\n    const ranges = getSelectedRanges();\n    if (ranges.length === 0) {\n      toast.error('Drag on the waveform (or tap "Add selection") to select a section first.', { position: 'top-center' });\n      return;\n    }\n    const result = mode === 'trim' ? keepRanges(current, ranges) : removeRanges(current, ranges);\n    if (!result) {\n      toast.error('That would remove all of the audio.', { position: 'top-center' });\n      return;\n    }\n    pushBuffer(result);\n    toast.success(mode === 'trim' ? 'Trimmed to selection.' : 'Selection removed.', { position: 'top-center' });\n  };`,
  `  const applyEdit = (mode: 'trim' | 'remove') => {\n    if (!source || kept.length === 0) return;\n    const timelineRanges = getSelectedRanges();\n    if (timelineRanges.length === 0) {\n      toast.error('Drag on the waveform (or tap "Add selection") to select a section first.', { position: 'top-center' });\n      return;\n    }\n\n    let nextKept = kept;\n    const sourceRanges = timelineRanges.flatMap(r => cutWaveformRegion(kept, r.start, r.end));\n\n    if (mode === 'remove') {\n      for (const c of sourceRanges) {\n        nextKept = subtract(nextKept, c);\n      }\n    } else { // 'trim'\n      nextKept = [];\n      for (const k of sourceRanges) {\n        nextKept = add(nextKept, k);\n      }\n    }\n\n    if (nextKept.length === 0) {\n      toast.error('That would remove all of the audio.', { position: 'top-center' });\n      return;\n    }\n    pushKept(nextKept);\n    toast.success(mode === 'trim' ? 'Trimmed to selection.' : 'Selection removed.', { position: 'top-center' });\n  };`
);

// 7. MagicPolishPanel
code = code.replace(
  `          <MagicPolishPanel\n            buffer={current}\n            fileBase={fileBase}\n            disabled={isBusy || isRecording}\n            onResult={pushBuffer}\n            onUndo={undo}\n            onRedo={redo}\n          />`,
  `          <MagicPolishPanel\n            buffer={source}\n            fileBase={fileBase}\n            disabled={isBusy || isRecording}\n            layer={layer}\n            onResult={(buf) => {\n              setPolished(buf);\n              setLayer('polished');\n            }}\n            onToggleLayer={setLayer}\n          />`
);

// 8. addRegionAtPlayhead length check
code = code.replace(
  `const length = Math.min(Math.max(1, current.duration * 0.1), current.duration);`,
  `const length = Math.min(Math.max(1, current.duration * 0.1), current.duration);`
);

fs.writeFileSync('src/components/podcast-tools/AudioEditor.tsx', code);
console.log('Patch applied successfully');
