import React, { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ColorInputWithPalette } from '@/components/ColorInputWithPalette';
import { CoverConfig, CoverImages } from '@/lib/coverStudio/types';
import { toast } from 'react-hot-toast';
import { Upload, X, ChevronDown, ChevronUp } from 'lucide-react';

interface BackgroundTabProps {
  cfg: CoverConfig;
  setCfg: React.Dispatch<React.SetStateAction<CoverConfig>>;
  images: CoverImages;
  setImages: React.Dispatch<React.SetStateAction<CoverImages>>;
}

const GRADIENT_PRESETS = [
  { name: 'Sky', stops: ['#e2e5f3', '#c3d9f6', '#e9e6f1'] },
  { name: 'Studio', stops: ['#334155', '#1e293b', '#0f172a'] },
  { name: 'Sunset', stops: ['#fed7aa', '#fde68a', '#fef3c7'] },
  { name: 'Mint', stops: ['#d1fae5', '#a7f3d0', '#ecfdf5'] },
  { name: 'Rose', stops: ['#fecdd3', '#fbcfe8', '#fdf2f8'] },
];

export function BackgroundTab({ cfg, setCfg, images, setImages }: BackgroundTabProps) {
  const [advOpen, setAdvOpen] = useState(false);

  const handleModeChange = (val: string) => {
    if (!val) return;
    setCfg(prev => ({ ...prev, bg: { ...prev.bg, type: val as any } }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image is too large (max 15MB)', { position: 'top-center' });
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImages(prev => ({ ...prev, bg: img }));
      setCfg(prev => ({ ...prev, bg: { ...prev.bg, type: 'image' } }));
    };
    img.src = url;
  };

  const handleRemoveImage = () => {
    setImages(prev => ({ ...prev, bg: null }));
    setCfg(prev => ({ ...prev, bg: { ...prev.bg, type: 'gradient' } }));
  };

  return (
    <div className="flex flex-col gap-5 p-1">
      <p className="text-xs text-muted-foreground font-medium">
        Soft, light backgrounds keep a black title readable.
      </p>

      <ToggleGroup type="single" value={cfg.bg.type} onValueChange={handleModeChange} className="justify-start w-full bg-muted/50 p-1 rounded-lg">
        <ToggleGroupItem value="gradient" className="flex-1 text-xs">Gradient</ToggleGroupItem>
        <ToggleGroupItem value="solid" className="flex-1 text-xs">Solid</ToggleGroupItem>
        <ToggleGroupItem value="image" className="flex-1 text-xs">Image</ToggleGroupItem>
      </ToggleGroup>

      {cfg.bg.type === 'gradient' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-5 gap-2">
            {GRADIENT_PRESETS.map(preset => (
              <button
                key={preset.name}
                title={preset.name}
                className="h-10 rounded-md border shadow-sm transition-transform hover:scale-105 active:scale-95 overflow-hidden flex"
                style={{ 
                  background: `linear-gradient(160deg, ${preset.stops[0]}, ${preset.stops[1]} 50%, ${preset.stops[2]})` 
                }}
                onClick={() => setCfg(prev => ({
                  ...prev,
                  bg: { ...prev.bg, gradient: { ...prev.bg.gradient, stops: preset.stops as any } }
                }))}
              />
            ))}
          </div>

          <div className="border rounded-md overflow-hidden">
            <button 
              className="w-full flex items-center justify-between p-3 bg-muted/20 text-xs font-semibold hover:bg-muted/40 transition-colors"
              onClick={() => setAdvOpen(!advOpen)}
            >
              Advanced Edit
              {advOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {advOpen && (
              <div className="p-4 border-t bg-background flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Angle ({cfg.bg.gradient.angle}°)</label>
                  <Slider 
                    value={[cfg.bg.gradient.angle]} 
                    min={0} max={360} step={1} 
                    onValueChange={(val) => setCfg(prev => ({
                      ...prev, bg: { ...prev.bg, gradient: { ...prev.bg.gradient, angle: val[0] } }
                    }))}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Color {idx + 1}</label>
                      <ColorInputWithPalette 
                        value={cfg.bg.gradient.stops[idx]} 
                        onChange={(col) => {
                          setCfg(prev => {
                            const newStops = [...prev.bg.gradient.stops] as [string, string, string];
                            newStops[idx] = col;
                            return { ...prev, bg: { ...prev.bg, gradient: { ...prev.bg.gradient, stops: newStops } } };
                          });
                        }} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {cfg.bg.type === 'solid' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground">Solid Color</label>
          <ColorInputWithPalette 
            value={cfg.bg.solid} 
            onChange={(val) => setCfg(prev => ({ ...prev, bg: { ...prev.bg, solid: val } }))}
          />
        </div>
      )}

      {cfg.bg.type === 'image' && (
        <div className="flex flex-col gap-4">
          {!images.bg ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors">
              <Upload className="w-6 h-6 text-muted-foreground mb-2" />
              <span className="text-xs font-medium text-foreground">Click to upload background</span>
              <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP (Max 15MB)</span>
              <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} />
            </label>
          ) : (
            <div className="flex flex-col gap-4">
              <Button variant="outline" size="sm" onClick={handleRemoveImage} className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                <X className="w-4 h-4 mr-2" />
                Remove Image
              </Button>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">Zoom ({cfg.bg.imgZoom.toFixed(2)}x)</label>
                <Slider 
                  value={[cfg.bg.imgZoom]} min={1} max={2.5} step={0.05} 
                  onValueChange={(val) => setCfg(prev => ({ ...prev, bg: { ...prev.bg, imgZoom: val[0] } }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">Horizontal Offset</label>
                <Slider 
                  value={[cfg.bg.imgX]} min={-1500} max={1500} step={10} 
                  onValueChange={(val) => setCfg(prev => ({ ...prev, bg: { ...prev.bg, imgX: val[0] } }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">Vertical Offset</label>
                <Slider 
                  value={[cfg.bg.imgY]} min={-1500} max={1500} step={10} 
                  onValueChange={(val) => setCfg(prev => ({ ...prev, bg: { ...prev.bg, imgY: val[0] } }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">Blur ({(cfg.bg.blur || 0)}px)</label>
                <Slider 
                  value={[cfg.bg.blur || 0]} min={0} max={100} step={2} 
                  onValueChange={(val) => setCfg(prev => ({ ...prev, bg: { ...prev.bg, blur: val[0] } }))}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
