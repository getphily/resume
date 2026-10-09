"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MediaLibrary from './MediaLibrary';
import { MediaAsset, MediaKind } from '@/lib/media/types';
import { Button } from '@/components/ui/button';
import { FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaPickerProps {
  onSelect: (asset: MediaAsset) => void;
  allowedKinds?: MediaKind[];
  trigger?: React.ReactNode;
  className?: string;
}

export default function MediaPicker({ onSelect, allowedKinds, trigger, className }: MediaPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)} className={cn("inline-block cursor-pointer", className)}>
        {trigger || (
          <Button variant="outline" type="button">
            <FolderOpen className="w-4 h-4 mr-2" />
            Browse Media
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl w-[90vw] h-[85vh] p-0 flex flex-col overflow-hidden bg-background">
          <DialogHeader className="p-4 border-b shrink-0">
            <DialogTitle>Select Media</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden relative">
            <MediaLibrary 
              mode="picker" 
              allowedKinds={allowedKinds}
              onSelect={(asset) => {
                onSelect(asset);
                setOpen(false);
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
