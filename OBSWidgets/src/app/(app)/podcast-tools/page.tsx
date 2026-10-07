'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Mic, 
  ListOrdered, 
  FileText, 
  Tag, 
  Sparkles, 
  Share2, 
  AlertCircle 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StudioShell } from '@/components/StudioShell';

export default function PodcastToolsPage() {
  const plannedFeatures = [
    {
      icon: ListOrdered,
      title: "Automated Chapter Markers",
      badge: "In Development",
      description: "AI-assisted timestamps and semantic chapter chunking formatted for YouTube, Spotify, and Apple Podcasts chapters.",
    },
    {
      icon: FileText,
      title: "RSS Show Notes & Summary",
      badge: "In Development",
      description: "Instant markdown show notes generation with guest links, sponsor timestamps, and clean social teasers.",
    },
    {
      icon: Tag,
      title: "ID3v2 Chapter & Artwork Tagger",
      badge: "Roadmap",
      description: "Embed high-res square cover art, individual chapter graphics, and episode metadata directly into MP3/M4A files.",
    },
    {
      icon: Share2,
      title: "Audiogram & Waveform Snippets",
      badge: "Roadmap",
      description: "Generate 9:16 vertical waveform teaser videos ready for TikTok, Instagram Reels, and YouTube Shorts.",
    },
  ];

  const settingsPanel = (
    <div className="flex flex-col gap-4 pb-10">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3 text-sm text-foreground">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-amber-700 dark:text-amber-300">
            Under Construction
          </span>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Finalizing the audio transcription parser and ID3 chunking pipeline. Check back soon for the initial beta preview release.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Planned Features</h3>
        {plannedFeatures.map((feat, idx) => {
          const IconComp = feat.icon;
          return (
            <Card key={idx} className="border-border bg-card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <IconComp className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-sm text-foreground">{feat.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground">{feat.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const previewCanvas = (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-muted/20 border border-dashed border-border rounded-xl">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Mic className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">PodcastToolset</h2>
      <p className="text-sm text-muted-foreground max-w-md text-center mb-8">
        Streamline audio publishing workflows with automated chaptering, rich metadata tagging, and syndicated RSS show notes.
      </p>
      <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 px-4 py-1 gap-2 text-sm">
        <Sparkles className="w-4 h-4" />
        Beta Development Phase
      </Badge>
    </div>
  );

  return (
    <StudioShell
      title="PodcastTools"
      icon={<Mic className="w-4 h-4" />}
      widgetName="Audio Syndication Hub"
      hasId={false}
      onNameChange={() => {}}
      onSave={async () => {}}
      isSaving={false}
      settingsPanel={settingsPanel}
      previewCanvas={previewCanvas}
    />
  );
}
