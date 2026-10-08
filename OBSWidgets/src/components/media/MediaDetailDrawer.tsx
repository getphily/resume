"use client";

import React, { useState } from 'react';
import { MediaAsset } from '@/lib/media/types';
import { updateMediaAsset } from '@/lib/media/api';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, Music, Video, Trash2, Download, Check } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function MediaDetailDrawer({ 
  asset, 
  open, 
  onOpenChange,
  onDelete,
  onUpdate
}: { 
  asset: MediaAsset; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  onUpdate: (updated: Partial<MediaAsset>) => void;
}) {
  const [title, setTitle] = useState(asset.title);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (title === asset.title) return;
    setIsSaving(true);
    try {
      await updateMediaAsset(asset.id, { title });
      onUpdate({ title });
      toast.success('Saved');
    } catch (err) {
      toast.error('Failed to save title');
    } finally {
      setIsSaving(false);
    }
  };

  const Icon = asset.kind === 'image' ? ImageIcon : asset.kind === 'audio' ? Music : Video;

  // Custom positioning to make it a right-side drawer
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="fixed inset-y-0 right-0 h-full w-full sm:w-[400px] max-w-full m-0 p-0 rounded-none sm:rounded-l-2xl flex flex-col data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right duration-300"
      >
        <DialogHeader className="p-4 border-b shrink-0 flex-row items-center justify-between">
          <DialogTitle className="text-lg">File Details</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          
          {/* Big Preview Area */}
          <div className="aspect-video bg-muted rounded-xl flex items-center justify-center border">
             {/* In a real implementation we'd load the image via getAssetSignedUrl or render an audio/video player */}
             <Icon className="w-12 h-12 text-muted-foreground/50" />
          </div>

          {/* Editable Details */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Title</Label>
              <div className="flex gap-2">
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                />
                <Button size="icon" variant="secondary" onClick={handleSave} disabled={isSaving || title === asset.title}>
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Type</span>
                <span className="text-sm font-medium">{asset.kind} ({asset.mime_type})</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Size</span>
                <span className="text-sm font-medium">{formatBytes(asset.size_bytes)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Uploaded</span>
                <span className="text-sm font-medium">{new Date(asset.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Source</span>
                <span className="text-sm font-medium capitalize">{asset.source}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t bg-muted/20 shrink-0 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => toast('Downloads coming soon')}>
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
          <Button variant="destructive" onClick={() => { onDelete(); onOpenChange(false); }}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
