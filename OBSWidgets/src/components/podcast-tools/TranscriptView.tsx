import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { Transcript, Range, Word } from '@/lib/audioEditor/transcript';
import { deriveDeleted } from '@/lib/audioEditor/edl';
import { Button } from '@/components/ui/button';
import { Scissors } from 'lucide-react';

export interface TranscriptViewRef {
  syncPlayback: (sourceTime: number) => void;
}

interface TranscriptViewProps {
  transcript: Transcript;
  kept: Range[];
  onWordClick: (start: number) => void;
  onCutWords: (startIndex: number, endIndex: number) => void;
}

export const TranscriptView = React.forwardRef<TranscriptViewRef, TranscriptViewProps>(
  ({ transcript, kept, onWordClick, onCutWords }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const activeWordIndex = useRef<number>(-1);
    const [selectionInfo, setSelectionInfo] = useState<{ startIdx: number; endIdx: number; rect: DOMRect } | null>(null);

    // Derive which words are deleted based on the EDL `kept` ranges
    const deleted = useMemo(() => deriveDeleted(transcript.words, kept), [transcript.words, kept]);

    useImperativeHandle(ref, () => ({
      syncPlayback: (sourceTime: number) => {
        if (!containerRef.current) return;
        
        // Binary search for the current word
        let low = 0;
        let high = transcript.words.length - 1;
        let bestIdx = -1;
        
        while (low <= high) {
          const mid = (low + high) >> 1;
          const w = transcript.words[mid];
          if (sourceTime >= w.start && sourceTime <= w.end) {
            bestIdx = mid;
            break;
          } else if (sourceTime < w.start) {
            high = mid - 1;
          } else {
            bestIdx = mid; // Might be in the gap after this word
            low = mid + 1;
          }
        }

        if (bestIdx !== activeWordIndex.current) {
          // Remove old active class
          if (activeWordIndex.current >= 0) {
            const oldEl = containerRef.current.querySelector(`[data-wi="${activeWordIndex.current}"]`);
            if (oldEl) {
              oldEl.classList.remove('bg-primary/20', 'text-foreground');
              if (!deleted[activeWordIndex.current]) oldEl.classList.remove('font-medium');
            }
          }
          
          // Add new active class
          if (bestIdx >= 0) {
            const newEl = containerRef.current.querySelector(`[data-wi="${bestIdx}"]`);
            if (newEl) {
              newEl.classList.add('bg-primary/20', 'text-foreground');
              if (!deleted[bestIdx]) newEl.classList.add('font-medium');
              
              // Auto-scroll if it's out of view
              const rect = newEl.getBoundingClientRect();
              const containerRect = containerRef.current.getBoundingClientRect();
              if (rect.bottom > containerRect.bottom || rect.top < containerRect.top) {
                newEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }
            }
          }
          activeWordIndex.current = bestIdx;
        }
      }
    }));

    // Handle text selection for the floating action bar
    useEffect(() => {
      const handleSelectionChange = () => {
        const sel = document.getSelection();
        if (!sel || sel.isCollapsed || !containerRef.current?.contains(sel.anchorNode)) {
          setSelectionInfo(null);
          return;
        }
        
        const range = sel.getRangeAt(0);
        let startNode = range.startContainer;
        let endNode = range.endContainer;
        
        if (startNode.nodeType === Node.TEXT_NODE) startNode = startNode.parentElement!;
        if (endNode.nodeType === Node.TEXT_NODE) endNode = endNode.parentElement!;
        
        const startIdx = parseInt((startNode as HTMLElement).getAttribute('data-wi') || '-1', 10);
        const endIdx = parseInt((endNode as HTMLElement).getAttribute('data-wi') || '-1', 10);
        
        if (startIdx !== -1 && endIdx !== -1) {
          const rect = range.getBoundingClientRect();
          setSelectionInfo({
            startIdx: Math.min(startIdx, endIdx),
            endIdx: Math.max(startIdx, endIdx),
            rect
          });
        } else {
          setSelectionInfo(null);
        }
      };

      document.addEventListener('selectionchange', handleSelectionChange);
      return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    // Paragraphing logic: start a new paragraph if speaker changes or gap > 1.5s
    const paragraphs = useMemo(() => {
      const paras: Word[][] = [];
      let currentPara: Word[] = [];
      let lastEnd = -1;
      let lastSpeaker = null;

      for (const w of transcript.words) {
        const gap = lastEnd >= 0 ? w.start - lastEnd : 0;
        if (currentPara.length > 0 && (w.speaker !== lastSpeaker || gap > 1.5)) {
          paras.push(currentPara);
          currentPara = [];
        }
        currentPara.push(w);
        lastEnd = w.end;
        lastSpeaker = w.speaker;
      }
      if (currentPara.length > 0) paras.push(currentPara);
      return paras;
    }, [transcript.words]);

    return (
      <div className="relative h-full">
        <div ref={containerRef} className="h-full overflow-y-auto p-4 md:p-6 text-lg leading-relaxed text-foreground/90 space-y-6">
          {paragraphs.map((para, pIdx) => (
            <div key={pIdx} className="group flex flex-col md:flex-row gap-2 md:gap-6">
              {/* Speaker label could go here in the future */}
              <div className="w-24 shrink-0 font-semibold text-sm text-muted-foreground pt-1 select-none">
                {para[0].speaker != null ? transcript.speakers[para[0].speaker]?.name || `Speaker ${para[0].speaker}` : ''}
              </div>
              <div className="flex-1 flex flex-wrap gap-x-1 gap-y-0.5">
                {para.map(w => {
                  const wi = parseInt(w.id.replace('w', ''), 10);
                  const isDeleted = deleted[wi];
                  return (
                    <span
                      key={w.id}
                      data-wi={wi}
                      className={`cursor-pointer rounded transition-colors break-words ${
                        isDeleted ? 'line-through text-muted-foreground/50 decoration-muted-foreground/30' : 'hover:bg-primary/10'
                      }`}
                      onClick={() => onWordClick(w.start)}
                    >
                      {w.correctedText || w.text}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Action Bar for Selection */}
        {selectionInfo && (
          <div
            className="fixed z-50 flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 text-white rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: Math.max(10, selectionInfo.rect.top - 60),
              left: Math.max(10, selectionInfo.rect.left + selectionInfo.rect.width / 2 - 50)
            }}
          >
            <Button
              size="sm"
              className="h-8 bg-transparent hover:bg-zinc-800 text-white border-0"
              onClick={() => {
                onCutWords(selectionInfo.startIdx, selectionInfo.endIdx);
                document.getSelection()?.removeAllRanges();
              }}
            >
              <Scissors className="w-3.5 h-3.5 mr-1.5" />
              Remove
            </Button>
          </div>
        )}
      </div>
    );
  }
);

TranscriptView.displayName = 'TranscriptView';
