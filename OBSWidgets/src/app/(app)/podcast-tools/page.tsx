'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Mic, 
  ListOrdered, 
  FileText, 
  Tag, 
  Sparkles, 
  ArrowLeft, 
  Clock, 
  Share2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Top Banner Header */}
      <div className="border-b border-border bg-card/50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                <span>getphily&apos;s code stand</span>
              </Link>
            </Button>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Creator Toolsets
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1.5 px-2.5 py-0.5 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  In Development
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">
                  Planned for Q4
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                <Mic className="w-8 h-8 text-primary" />
                Podcast Tools
              </h1>
              <p className="text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                Streamline audio publishing workflows with automated chaptering, rich metadata tagging, and syndicated RSS show notes.
              </p>
            </div>

            <Button asChild variant="outline" className="shrink-0 gap-2 font-medium">
              <Link href="/#toolsets">
                Explore All Toolsets
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
        
        {/* Status Callout */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 flex items-start gap-3.5 text-sm text-foreground">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-amber-700 dark:text-amber-300">
              Tool Under Active Construction
            </span>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              This toolset is part of <strong>getphily&apos;s code stand</strong>. We are finalizing the audio transcription parser and ID3 chunking pipeline. Check back soon for the initial beta preview release.
            </p>
          </div>
        </div>

        {/* Planned Capabilities Grid */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Planned Features & Modules</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Designed to eliminate friction between recording and public syndication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plannedFeatures.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <Card key={idx} className="border-border bg-card shadow-xs flex flex-col p-5 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {feat.badge}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-1">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {feat.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Integration Preview Card */}
        <Card className="border-border bg-card p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 text-left">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Connected with OBS Stream Studio
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              Live stream your podcast recording using <strong>OBS Stream Studio</strong> for real-time chyrons and episode clocks, then seamlessly ingest the recording into Podcast Tools for post-production chaptering.
            </p>
          </div>
          <Button asChild className="shrink-0 gap-2">
            <Link href="/crawl">
              <span>Launch Chyron Builder</span>
            </Link>
          </Button>
        </Card>

      </main>
    </div>
  );
}
