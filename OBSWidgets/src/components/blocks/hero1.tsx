import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Tv, Clock, Timer, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface HeroProps {
  badgeText?: string;
  badgeLabel?: string;
  heading?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Hero1({
  badgeText = "Studio Ready",
  badgeLabel = "Tailored for OBS & Streamlabs",
  heading = "Dynamic Broadcast Overlays Built for Streamers",
  description = "Create real-time animated lower thirds, customizable scrolling chyron newsflashes, synchronized stream clocks, and count-down timers. Built on transparent browser sources for flawless 1080p integration.",
  primaryButtonText = "Create Overlay",
  primaryButtonUrl = "/crawl",
  secondaryButtonText = "Explore Studio Screens",
  secondaryButtonUrl = "/screen",
  className,
  children,
}: HeroProps) {
  return (
    <section className={cn("py-12 md:py-20 lg:py-24 border-b border-border bg-card/40", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          
          {/* Left Column: Headline, Copy, Action Buttons */}
          <div className="flex flex-col items-start text-left gap-5">
            <div className="inline-flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1 gap-1.5 border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{badgeText}</span>
              </Badge>
              <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                {badgeLabel}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              {heading}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {description}
            </p>

            <div className="flex w-full sm:w-auto flex-col sm:flex-row items-center gap-3 pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto gap-2 text-sm font-semibold h-11 px-5 shadow-xs">
                <Link href={primaryButtonUrl}>
                  <span>{primaryButtonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-sm font-semibold h-11 px-5">
                <Link href={secondaryButtonUrl}>
                  {secondaryButtonText}
                </Link>
              </Button>
            </div>

            {/* Quick Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border w-full text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Tv className="w-4 h-4 text-primary shrink-0" />
                <span>Live Chyron</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>Stream Clocks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-primary shrink-0" />
                <span>Event Timers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-primary shrink-0" />
                <span>Scene Screens</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive / Visual Showcase */}
          <div className="w-full flex justify-center h-full items-center">
            {children ? (
              children
            ) : (
              <Carousel 
                className="w-full max-w-lg mx-auto"
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 4000,
                  }),
                ]}
              >
                <CarouselContent>
                  
                  {/* Slide 1: Chyron */}
                  <CarouselItem>
                    <div className="p-1">
                      <div className="w-full rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-md relative overflow-hidden group">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border text-xs font-semibold text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Chyron Overlay
                          </span>
                          <Badge variant="secondary" className="text-xs font-mono">1920 × 1080</Badge>
                        </div>
                        <div className="aspect-video w-full rounded-xl bg-slate-950 p-4 flex flex-col justify-between border border-border/60 relative overflow-hidden shadow-inner">
                          <div className="flex justify-end">
                            <div className="px-2 py-1 rounded bg-red-600 text-white font-black text-[10px] tracking-wider uppercase">LIVE ON AIR</div>
                          </div>
                          <div className="w-full rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                            <div className="bg-slate-900 px-3 py-2 flex items-center justify-between border-l-4 border-primary">
                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Breaking Coverage</div>
                                <div className="text-xs sm:text-sm font-extrabold text-white">CHAMPIONSHIP FINALS STREAM</div>
                              </div>
                              <span className="text-[11px] font-mono text-slate-400">18:45:00 UTC</span>
                            </div>
                            <div className="bg-slate-950 px-3 py-1 flex items-center gap-2 border-t border-white/10">
                              <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">TICKER:</span>
                              <span className="text-[10px] text-slate-300 font-medium truncate">Welcome to the official broadcast stream • Next round begins in 10 minutes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Slide 2: Clock & Timer */}
                  <CarouselItem>
                    <div className="p-1">
                      <div className="w-full rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-md relative overflow-hidden group">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border text-xs font-semibold text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                            Stream Timer Widget
                          </span>
                          <Badge variant="secondary" className="text-xs font-mono">Transparent</Badge>
                        </div>
                        <div className="aspect-video w-full rounded-xl bg-slate-950/80 flex items-center justify-center border border-border/60 relative overflow-hidden shadow-inner bg-[url('https://transparenttextures.com/patterns/cubes.png')]">
                           <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl">
                              <div className="text-sm font-bold text-blue-400 tracking-widest uppercase mb-1">Stream Starts In</div>
                              <div className="text-5xl font-black text-white font-mono tracking-tighter">04:59</div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Slide 3: Kalimotxo Visuals */}
                  <CarouselItem>
                    <div className="p-1">
                      <div className="w-full rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-md relative overflow-hidden group">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border text-xs font-semibold text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                            Audio Reactive Canvas
                          </span>
                          <Badge variant="secondary" className="text-xs font-mono">Web Audio API</Badge>
                        </div>
                        <div className="aspect-video w-full rounded-xl bg-[#050505] p-4 flex flex-col justify-between border border-[#333333] relative overflow-hidden shadow-inner">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-1.5">
                               <div className="w-2 h-8 bg-blue-600 rounded-sm"></div>
                               <div className="w-2 h-12 bg-blue-500 rounded-sm"></div>
                               <div className="w-2 h-6 bg-blue-600 rounded-sm"></div>
                            </div>
                            <div className="px-2 py-1 rounded bg-[#1c1c1c] border border-[#333333] text-amber-500 font-mono text-[10px] tracking-widest">
                              STEMS ACTIVE
                            </div>
                          </div>
                          <div className="flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full border-4 border-[#333333] border-t-amber-500 animate-spin flex items-center justify-center">
                               <div className="w-16 h-16 rounded-full border-2 border-[#1c1c1c] border-b-blue-500 animate-reverse-spin"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>

                </CarouselContent>
                <div className="hidden sm:flex items-center justify-center gap-4 mt-6">
                  <CarouselPrevious className="static transform-none" />
                  <span className="text-xs text-muted-foreground font-medium">Drag or click to navigate</span>
                  <CarouselNext className="static transform-none" />
                </div>
              </Carousel>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}