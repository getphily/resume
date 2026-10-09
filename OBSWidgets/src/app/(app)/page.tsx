'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  Sliders, 
  Mic, 
  Users, 
  Sparkles, 
  ArrowRight,
  Tv,
  Clock,
  Layers,
  ExternalLink
} from 'lucide-react';
import { Hero1 } from '@/components/blocks/hero1';
import { Feature43 } from '@/components/blocks/feature43';
import { Footer2 } from '@/components/blocks/footer2';

export default function Home() {
  return (
    <div className="flex flex-col min-h-full w-full">
      {/* 1. Shadcnblocks Hero Section */}
      <Hero1 
        badgeText="code.getphily.io"
        badgeLabel="Browser-based creator tools"
        heading="Tools for live shows, podcasts, and workplace organizing"
        description="GetPhily's Codebox is a growing set of browser-based tools. Build broadcast overlays for OBS today; podcast and union tools are in development."
        primaryButtonText="Open StreamTools"
        primaryButtonUrl="/dashboard?set=broadcast"
        secondaryButtonText="Sign in"
        secondaryButtonUrl="/auth"
      />

      {/* 2. Platform Toolsets Showcase Grid */}
      <section id="toolsets" className="py-16 px-6 max-w-7xl mx-auto w-full border-b border-border">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-3">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-xs font-semibold px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Available now & coming soon
            </Badge>
          </div>
          <h2 className="text-3xl sm:text-4xl   text-foreground">
            Toolsets
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
            StreamTools is live. PodcastTools and UnionTools are still in development — preview what's planned.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Toolset 1: OBS Stream Studio */}
          <Card className="border-border bg-card shadow-xs hover:border-primary/50 transition-all flex flex-col p-6 rounded-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Radio className="w-6 h-6" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                Live
              </Badge>
            </div>
            <h3 className=" text-xl text-foreground mb-2">
              StreamTools
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
              Design lower thirds, tickers, clocks, timers and scene screens, then add one URL to OBS as a transparent browser source.
            </p>
            <div className="flex flex-col gap-2 pt-3 border-t border-border mt-auto">
              <Button asChild size="default" className="w-full h-auto py-2.5 whitespace-normal flex-wrap font-bold text-xs uppercase tracking-wide gap-1.5 shadow-xs">
                <Link href="/dashboard">
                  <span>Open StreamTools</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <div className="grid grid-cols-2 gap-1.5 text-center mt-1">
                <Button asChild variant="outline" size="sm" className="h-8 text-xs px-1">
                  <Link href="/crawl">Chyron Builder</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="h-8 text-xs px-1">
                  <Link href="/clock">Clock</Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Toolset 3: PodcastTools (Placeholder) */}
          <Card className="border-border bg-card shadow-xs hover:border-amber-500/40 transition-all flex flex-col p-6 rounded-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Mic className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                In Development
              </Badge>
            </div>
            <h3 className=" text-xl text-foreground mb-2">
              PodcastTools
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
              Automated chapter markers for YouTube and Spotify, ID3v2 tag chunking, waveform teaser clips, and syndicated RSS show notes.
            </p>
            <div className="flex flex-col gap-2 pt-3 border-t border-border mt-auto">
              <Button asChild variant="outline" size="default" className="w-full h-auto py-2.5 whitespace-normal flex-wrap font-semibold text-xs gap-1.5">
                <Link href="/podcast-tools">
                  <span>Preview Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <div className="text-xs text-center text-muted-foreground mt-1">
                Publishing utilities preview
              </div>
            </div>
          </Card>

          {/* Toolset 4: UnionTools (Placeholder) */}
          <Card className="border-border bg-card shadow-xs hover:border-blue-500/40 transition-all flex flex-col p-6 rounded-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                In Development
              </Badge>
            </div>
            <h3 className=" text-xl text-foreground mb-2">
              UnionTools
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
              Open digital utilities for stewards and bargaining committees. Side-by-side CBA diffing, grievance deadline tracking, and wage step modeling.
            </p>
            <div className="flex flex-col gap-2 pt-3 border-t border-border mt-auto">
              <Button asChild variant="outline" size="default" className="w-full h-auto py-2.5 whitespace-normal flex-wrap font-semibold text-xs gap-1.5">
                <Link href="/union-tools">
                  <span>Preview Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
              
            </div>
          </Card>
        </div>
      </section>

      {/* 3. Shadcnblocks Feature Grid Section */}
      <Feature43 />

      {/* 4. Shadcnblocks Footer Section */}
      <Footer2 />
    </div>
  );
}
