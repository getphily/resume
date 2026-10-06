'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export function ImageUploadOrUrl({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading('Uploading image...', { position: 'top-center' });

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const cleanFileName = `${Math.random().toString(36).substring(2, 10)}_${Date.now()}.${fileExt}`;

      const { error: assetErr } = await supabase.storage.from('assets').upload(`uploads/${cleanFileName}`, file, { upsert: true });

      if (!assetErr) {
        const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(`uploads/${cleanFileName}`);
        onChange(publicUrl);
        toast.success('Image uploaded to cloud storage!', { id: toastId, position: 'top-center' });
        setUploading(false);
        return;
      }

      const { error: imgErr } = await supabase.storage.from('images').upload(`uploads/${cleanFileName}`, file, { upsert: true });
      if (!imgErr) {
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(`uploads/${cleanFileName}`);
        onChange(publicUrl);
        toast.success('Image uploaded to cloud storage!', { id: toastId, position: 'top-center' });
        setUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onChange(ev.target.result as string);
          toast.success('Image loaded locally', { id: toastId, position: 'top-center' });
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onChange(ev.target.result as string);
          toast.success('Image loaded locally', { id: toastId, position: 'top-center' });
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      
      <div className="flex gap-2.5 items-center">
        {value && (
          <div className="w-9 h-9 rounded-md border border-border overflow-hidden shrink-0 relative bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex-1">
          <Input 
            placeholder="https://... or click Upload" 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="h-9 text-xs"
          />
        </div>

        {value && (
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => onChange('')} 
            title="Remove image"
            aria-label="Remove image"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        <Button 
          size="sm" 
          variant="secondary" 
          disabled={uploading} 
          asChild 
          className="h-9 cursor-pointer gap-1.5 shrink-0 text-xs font-semibold"
        >
          <label>
            <Upload className="w-3.5 h-3.5" /> {uploading ? 'UPLOADING...' : 'UPLOAD'}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
          </label>
        </Button>
      </div>
    </div>
  );
}
