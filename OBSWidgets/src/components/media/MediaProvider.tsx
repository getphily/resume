"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import toast from 'react-hot-toast';
import { UploadTask, MediaKind, MediaSource, MediaAsset } from '@/lib/media/types';
import { reserveMediaAsset, finalizeMediaAsset } from '@/lib/media/api';
import { uploadWithTus } from '@/lib/media/upload';

interface MediaContextType {
  queue: UploadTask[];
  enqueueUpload: (file: File, kind: MediaKind, source?: MediaSource) => void;
  cancelUpload: (id: string) => void;
  clearDone: () => void;
  isUploading: boolean;
}

const MediaContext = createContext<MediaContextType | null>(null);

export function useMediaQueue() {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error('useMediaQueue must be used within MediaProvider');
  return ctx;
}

export function MediaProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<UploadTask[]>([]);

  const isUploading = queue.some(t => t.status === 'uploading' || t.status === 'processing');

  // Prevent closing window if uploading
  useEffect(() => {
    if (!isUploading) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isUploading]);

  const enqueueUpload = useCallback(async (file: File, kind: MediaKind, source: MediaSource = 'upload') => {
    // Generate a temporary ID for the queue item until reservation is done
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const abortController = new AbortController();

    setQueue(prev => [...prev, {
      id: tempId,
      file,
      kind,
      progress: 0,
      status: 'pending',
      abortController
    }]);

    try {
      // 1. Reserve Asset
      const { id, storage_path } = await reserveMediaAsset(kind, file.type, file.size, file.name, source);
      
      // Update queue item with real ID
      setQueue(prev => prev.map(t => t.id === tempId ? { ...t, id, status: 'uploading' } : t));

      // 2. Upload with TUS
      await uploadWithTus({
        bucket: 'media-library',
        path: storage_path,
        file,
        abortController,
        onProgress: (bytesSent, bytesTotal) => {
          setQueue(prev => prev.map(t => t.id === id ? { ...t, progress: bytesSent / bytesTotal } : t));
        }
      });

      // 3. Finalize Asset
      setQueue(prev => prev.map(t => t.id === id ? { ...t, status: 'processing', progress: 1 } : t));
      
      // NOTE: In a full implementation, we'd sniff the file, extract dimensions, duration, thumbnail here.
      await finalizeMediaAsset(id, {
        // Mock metadata extraction for now
        width: kind === 'image' || kind === 'video' ? 1920 : undefined,
        height: kind === 'image' || kind === 'video' ? 1080 : undefined,
        duration_ms: kind === 'audio' || kind === 'video' ? 60000 : undefined,
      });

      setQueue(prev => prev.map(t => t.id === id ? { ...t, status: 'done' } : t));
      toast.success(`${file.name} uploaded successfully!`);
    } catch (err: any) {
      if (err.message === 'Upload aborted') {
        setQueue(prev => prev.filter(t => t.id !== tempId && t.id !== err.id)); // Just remove if aborted
      } else {
        setQueue(prev => prev.map(t => t.id === tempId || t.id === err?.id ? { ...t, status: 'error', error: err.message } : t));
        toast.error(`Upload failed: ${err.message}`);
      }
    }
  }, []);

  const cancelUpload = useCallback((id: string) => {
    setQueue(prev => {
      const task = prev.find(t => t.id === id);
      if (task?.abortController) {
        task.abortController.abort();
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const clearDone = useCallback(() => {
    setQueue(prev => prev.filter(t => t.status !== 'done' && t.status !== 'error'));
  }, []);

  return (
    <MediaContext.Provider value={{ queue, enqueueUpload, cancelUpload, clearDone, isUploading }}>
      {children}
      
      {/* Basic Upload Tray (Rendered globally) */}
      {queue.length > 0 && (
        <div className="fixed bottom-4 right-4 w-80 bg-background border border-border shadow-lg rounded-xl overflow-hidden z-50 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b bg-muted/30">
            <h4 className="text-sm font-bold text-foreground">Uploads ({queue.filter(q => q.status === 'uploading' || q.status === 'processing').length} active)</h4>
            <button onClick={clearDone} className="text-xs text-muted-foreground hover:text-foreground">Clear Done</button>
          </div>
          <div className="max-h-64 overflow-y-auto p-2 flex flex-col gap-2">
            {queue.map(task => (
              <div key={task.id} className="p-2 bg-card border rounded-lg flex flex-col gap-1.5">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium truncate max-w-[200px]" title={task.file.name}>{task.file.name}</span>
                  {(task.status === 'uploading' || task.status === 'pending') && (
                    <button onClick={() => cancelUpload(task.id)} className="text-[10px] text-destructive hover:underline">Cancel</button>
                  )}
                </div>
                
                {task.status === 'error' ? (
                  <span className="text-[10px] text-destructive">{task.error}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${task.status === 'done' ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${task.progress * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-8 text-right">
                      {task.status === 'done' ? 'Done' : `${Math.round(task.progress * 100)}%`}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </MediaContext.Provider>
  );
}
