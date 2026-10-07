import os

content = """'use client';

import React, { useEffect, useState } from 'react';
import { Mic, Play, Plus, Share, MoreHorizontal, Headphones, Info, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface PodcastData {
  title: string;
  host: string;
  description: string;
  primaryCategory: string;
  secondaryCategory: string;
  language: string;
  explicit: string;
  artworkUrl: string;
}

const defaultData: PodcastData = {
  title: 'Untitled Show',
  host: 'Unknown Host',
  description: 'Welcome to our brand new podcast. In this show we will be exploring fascinating topics with amazing guests. Subscribe to follow along!',
  primaryCategory: 'Society & Culture',
  secondaryCategory: '',
  language: 'English',
  explicit: 'Clean',
  artworkUrl: '',
};

function EditableField({ 
  value, 
  onSave, 
  multiline = false, 
  className = '',
  placeholder = 'Click to edit'
}: { 
  value: string, 
  onSave: (v: string) => void, 
  multiline?: boolean, 
  className?: string,
  placeholder?: string
}) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value);

  if (editing) {
    const commonClass = cn("w-full bg-background border border-primary rounded-md outline-none focus:ring-2 focus:ring-primary/50 text-foreground", className);
    return multiline ? (
      <textarea 
        autoFocus
        className={cn(commonClass, "p-3 min-h-[120px] resize-y")}
        value={temp}
        onChange={e => setTemp(e.target.value)}
        onBlur={() => { setEditing(false); if (temp !== value) onSave(temp); }}
        onKeyDown={e => {
          if (e.key === 'Escape') { setEditing(false); setTemp(value); }
        }}
      />
    ) : (
      <input 
        autoFocus
        className={cn(commonClass, "px-2 py-1")}
        value={temp}
        onChange={e => setTemp(e.target.value)}
        onBlur={() => { setEditing(false); if (temp !== value) onSave(temp); }}
        onKeyDown={e => {
          if (e.key === 'Enter') { setEditing(false); if (temp !== value) onSave(temp); }
          if (e.key === 'Escape') { setEditing(false); setTemp(value); }
        }}
      />
    );
  }

  return (
    <div 
      onClick={() => { setTemp(value); setEditing(true); }}
      className={cn("group relative cursor-pointer hover:ring-2 hover:ring-primary/30 hover:bg-primary/5 rounded-md transition-all -ml-2 p-2", className)}
      title="Click to edit"
    >
      {value ? value : <span className="opacity-50 italic">{placeholder}</span>}
      <Edit2 className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 absolute top-2 right-2 transition-opacity" />
    </div>
  );
}

export default function YourPodcastLandingPage() {
  const [data, setData] = useState<PodcastData>(defaultData);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('podcast_show_metadata');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData({ ...defaultData, ...parsed });
      } catch (e) {}
    }
  }, []);

  const updateData = (updates: Partial<PodcastData>) => {
    const next = { ...data, ...updates };
    setData(next);
    localStorage.setItem('podcast_show_metadata', JSON.stringify(next));
    toast.success('Saved changes');
  };

  if (!mounted) return null;

  return (
    <div className="w-full h-full min-h-screen bg-background overflow-y-auto">
      {/* Directory-style Header Banner */}
      <div className="relative w-full h-auto min-h-[350px] md:min-h-[400px] bg-gradient-to-b from-primary/10 to-background flex items-end pt-20">
        
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 pb-8 flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-8 mt-12 md:mt-0">
          
          {/* Artwork Cover */}
          <div 
            className="w-32 h-32 md:w-56 md:h-56 shrink-0 rounded-2xl shadow-2xl border border-border/20 bg-muted overflow-hidden flex items-center justify-center relative group cursor-pointer"
            onClick={() => {
              const url = window.prompt("Enter Artwork Image URL (Square 1400x1400+):", data.artworkUrl);
              if (url !== null) updateData({ artworkUrl: url });
            }}
            title="Click to edit artwork"
          >
            {data.artworkUrl ? (
              <img src={data.artworkUrl} alt={data.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                <Mic className="w-12 h-12 opacity-50" />
                <span className="text-xs font-semibold">Click to add Artwork</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Edit2 className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Show Info */}
          <div className="flex flex-col gap-1 pb-2 w-full max-w-2xl">
            <EditableField 
              value={data.primaryCategory}
              onSave={(v) => updateData({ primaryCategory: v })}
              className="text-sm font-bold tracking-widest uppercase text-primary w-fit -ml-2 mb-1"
            />
            
            <EditableField 
              value={data.title}
              onSave={(v) => updateData({ title: v })}
              className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-none"
              placeholder="Untitled Show"
            />
            
            <div className="flex items-center text-lg md:text-2xl font-medium text-muted-foreground mt-1 md:mt-2 -ml-2 px-2">
              Hosted by 
              <EditableField 
                value={data.host}
                onSave={(v) => updateData({ host: v })}
                className="text-foreground ml-2 !p-1 !-ml-1 inline-block"
                placeholder="Unknown Host"
              />
            </div>

            <div className="flex items-center gap-3 mt-4 md:mt-6">
              <Button size="lg" className="rounded-full px-6 md:px-8 font-bold text-sm md:text-base gap-2 shadow-lg hover:scale-105 transition-transform">
                <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                Trailer
              </Button>
              <Button size="icon" variant="outline" className="rounded-full h-11 w-11 md:h-12 md:w-12 border-border text-foreground hover:bg-muted shrink-0">
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full h-11 w-11 md:h-12 md:w-12 border-border text-foreground hover:bg-muted shrink-0">
                <Share className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full h-11 w-11 md:h-12 md:w-12 border-border text-foreground hover:bg-muted shrink-0">
                <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row gap-12 md:gap-16">
        
        {/* Left Column (About & Episodes) */}
        <div className="flex-1 flex flex-col gap-12">
          
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold border-b border-border/60 pb-3">About the Show</h2>
            <EditableField 
              value={data.description}
              onSave={(v) => updateData({ description: v })}
              multiline
              className="text-muted-foreground leading-relaxed text-base whitespace-pre-wrap -ml-2"
              placeholder="Add a description for your podcast here..."
            />
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold border-b border-border/60 pb-3">Episodes</h2>
            
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 flex flex-col items-center justify-center text-center gap-4 text-muted-foreground min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Headphones className="w-8 h-8 opacity-40" />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg mb-1">No episodes published yet</p>
                <p className="text-sm max-w-sm mx-auto">Once you publish episodes via your RSS feed or distribution host, they will appear chronologically here.</p>
              </div>
            </div>
          </section>

        </div>

        {/* Right Sidebar (Metadata details) */}
        <div className="w-full md:w-80 flex flex-col gap-8 shrink-0">
          
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-6 shadow-sm">
            <h3 className="font-bold text-lg flex items-center gap-2 border-b border-border/60 pb-3">
              <Info className="w-5 h-5 text-primary" />
              Information
            </h3>
            
            <div className="flex flex-col gap-5 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Host</span>
                <EditableField 
                  value={data.host}
                  onSave={(v) => updateData({ host: v })}
                  className="font-semibold text-foreground -ml-2 !p-1.5"
                  placeholder="Unknown"
                />
              </div>
              
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Language</span>
                <EditableField 
                  value={data.language}
                  onSave={(v) => updateData({ language: v })}
                  className="font-semibold text-foreground -ml-2 !p-1.5"
                  placeholder="e.g. English"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Categories</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  <div className="relative group">
                    {data.primaryCategory && <Badge variant="secondary" className="px-3 py-1 font-semibold">{data.primaryCategory}</Badge>}
                    <EditableField 
                      value={data.primaryCategory}
                      onSave={(v) => updateData({ primaryCategory: v })}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="relative group">
                    {data.secondaryCategory ? (
                       <Badge variant="outline" className="px-3 py-1 font-semibold">{data.secondaryCategory}</Badge>
                    ) : (
                       <Badge variant="outline" className="px-3 py-1 font-semibold border-dashed opacity-50">+ Add Category</Badge>
                    )}
                    <EditableField 
                      value={data.secondaryCategory}
                      onSave={(v) => updateData({ secondaryCategory: v })}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Content Rating</span>
                <div className="mt-1 relative group inline-block w-fit">
                  {data.explicit === 'Yes' ? (
                    <Badge variant="destructive" className="px-3 py-1 font-semibold">Explicit Content</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 px-3 py-1 font-semibold">Clean</Badge>
                  )}
                  <div className="absolute inset-0 opacity-0 cursor-pointer" onClick={() => updateData({ explicit: data.explicit === 'Yes' ? 'No' : 'Yes' })} />
                </div>
                <span className="text-[10px] text-muted-foreground italic">Click to toggle rating</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
"""

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)
