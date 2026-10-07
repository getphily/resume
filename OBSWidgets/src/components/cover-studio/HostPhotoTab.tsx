import React, { useRef, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { CoverConfig, CoverImages } from '@/lib/coverStudio/types';
import { toast } from 'react-hot-toast';
import { Upload, X, Wand2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface HostPhotoTabProps {
  cfg: CoverConfig;
  setCfg: React.Dispatch<React.SetStateAction<CoverConfig>>;
  images: CoverImages;
  setImages: React.Dispatch<React.SetStateAction<CoverImages>>;
}

export function HostPhotoTab({ cfg, setCfg, images, setImages }: HostPhotoTabProps) {
  // Object URL of the photo uploaded in THIS session (needed for "Undo Cutout").
  // A photo restored from the cloud has no original, so Undo isn't offered for it.
  const hostRawUrl = useRef<string | null>(null);
  const [hasOriginal, setHasOriginal] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [hasCutout, setHasCutout] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image is too large (max 15MB)', { position: 'top-center' });
      return;
    }

    const url = URL.createObjectURL(file);
    hostRawUrl.current = url;
    setHasOriginal(true);
    setHasCutout(false);
    
    const img = new Image();
    img.onload = () => {
      // Downscale if > 3000
      const maxSide = Math.max(img.width, img.height);
      if (maxSide > 3000) {
        const scale = 3000 / maxSide;
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const downscaled = new Image();
          downscaled.onload = () => setImages(prev => ({ ...prev, host: downscaled }));
          downscaled.src = canvas.toDataURL('image/jpeg', 0.9);
          return;
        }
      }
      setImages(prev => ({ ...prev, host: img }));
    };
    img.src = url;
  };

  const handleRemovePhoto = () => {
    setImages(prev => ({ ...prev, host: null }));
    setHasCutout(false);
    setHasOriginal(false);
    if (hostRawUrl.current) {
      URL.revokeObjectURL(hostRawUrl.current);
      hostRawUrl.current = null;
    }
  };

  const handleRemoveBackground = async () => {
    // Prefer the untouched upload; fall back to the current (cloud-restored) image.
    const source = hostRawUrl.current ?? images.host?.src;
    if (!source) return;
    setRemovingBg(true);
    const toastId = toast.loading('Removing background… first run downloads the AI model (can take up to a minute)', { position: 'top-center' });
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(source, { output: { format: 'image/png' } });
      const url = URL.createObjectURL(blob);
      
      const img = new Image();
      img.onload = () => {
        setImages(prev => ({ ...prev, host: img }));
        setHasCutout(true);
        toast.success('Background removed!', { id: toastId });
        setRemovingBg(false);
      };
      img.onerror = () => {
        toast.error('Failed to load processed image', { id: toastId });
        setRemovingBg(false);
      };
      img.src = url;
    } catch (e) {
      console.error(e);
      toast.error('Background removal failed', { id: toastId });
      setRemovingBg(false);
    }
  };

  const handleUndoCutout = () => {
    if (!hostRawUrl.current) return;
    const img = new Image();
    img.onload = () => {
      setImages(prev => ({ ...prev, host: img }));
      setHasCutout(false);
    };
    img.src = hostRawUrl.current;
  };

  return (
    <div className="flex flex-col gap-5 p-1">
      <p className="text-xs text-muted-foreground font-medium">
        Face in the right half, shoulders touching the bottom edge — just like the template.
      </p>

      {!images.host ? (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors">
          <Upload className="w-6 h-6 text-muted-foreground mb-2" />
          <span className="text-xs font-medium text-foreground">Click to upload host photo</span>
          <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP (Max 15MB)</span>
          <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} />
        </label>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRemovePhoto} className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10">
              <X className="w-4 h-4 mr-2" />
              Remove Photo
            </Button>
            
            {hasCutout && hasOriginal ? (
              <Button variant="secondary" size="sm" onClick={handleUndoCutout} className="flex-1">
                Undo Cutout
              </Button>
            ) : hasCutout ? (
              <Button variant="secondary" size="sm" disabled className="flex-1">
                Background removed
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={handleRemoveBackground} disabled={removingBg} className="flex-1">
                <Wand2 className="w-4 h-4 mr-2" />
                {removingBg ? 'Removing...' : 'Remove Background'}
              </Button>
            )}
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground">Zoom ({cfg.host.zoom.toFixed(2)}x)</label>
            <Slider 
              value={[cfg.host.zoom]} min={0.7} max={1.4} step={0.05} 
              onValueChange={(val) => setCfg(prev => ({ ...prev, host: { ...prev.host, zoom: val[0] } }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground">Horizontal Position</label>
            <Slider 
              value={[cfg.host.cx]} min={1200} max={2400} step={10} 
              onValueChange={(val) => setCfg(prev => ({ ...prev, host: { ...prev.host, cx: val[0] } }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground">Vertical Position</label>
            <Slider 
              value={[cfg.host.bottom]} min={2700} max={3300} step={10} 
              onValueChange={(val) => setCfg(prev => ({ ...prev, host: { ...prev.host, bottom: val[0] } }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
