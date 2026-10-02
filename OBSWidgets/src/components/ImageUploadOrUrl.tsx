'use client';

import React, { useState } from 'react';
import { Box, Flex, Text, TextField, Button, IconButton } from '@radix-ui/themes';
import { Cross2Icon, UploadIcon } from '@radix-ui/react-icons';
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

      // Try uploading to Supabase storage bucket 'assets'
      const { error: assetErr } = await supabase.storage.from('assets').upload(`uploads/${cleanFileName}`, file, { upsert: true });

      if (!assetErr) {
        const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(`uploads/${cleanFileName}`);
        onChange(publicUrl);
        toast.success('Image uploaded to cloud storage!', { id: toastId, position: 'top-center' });
        setUploading(false);
        return;
      }

      // Fallback: try bucket 'images'
      const { error: imgErr } = await supabase.storage.from('images').upload(`uploads/${cleanFileName}`, file, { upsert: true });
      if (!imgErr) {
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(`uploads/${cleanFileName}`);
        onChange(publicUrl);
        toast.success('Image uploaded to cloud storage!', { id: toastId, position: 'top-center' });
        setUploading(false);
        return;
      }

      // If buckets are unavailable or permissions restrict, fallback to data URL
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
      // Data URL fallback
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
    <Box>
      <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>
        {label}
      </Text>
      
      <Flex gap="3" align="center">
        {value && (
          <Box style={{ width: '38px', height: '38px', borderRadius: '6px', border: '1px solid var(--border-subtle)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        )}

        <Box style={{ flexGrow: 1 }}>
          <TextField.Root 
            size="2" 
            placeholder="https://... or click Upload" 
            value={value} 
            onChange={e => onChange(e.target.value)} 
          />
        </Box>

        {value && (
          <IconButton 
            size="2" 
            variant="ghost" 
            color="gray" 
            onClick={() => onChange('')} 
            title="Remove image"
            aria-label="Remove image"
          >
            <Cross2Icon />
          </IconButton>
        )}

        <Button size="2" variant="surface" disabled={uploading} asChild style={{ cursor: 'pointer' }}>
          <label>
            <UploadIcon /> {uploading ? 'UPLOADING...' : 'UPLOAD'}
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </Button>
      </Flex>
    </Box>
  );
}
