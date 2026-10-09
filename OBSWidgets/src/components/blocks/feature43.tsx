import React from "react";
import Link from "next/link";
import { 
  Zap, 
  Tv, 
  Clock, 
  Timer, 
  Monitor, 
  Layers, 
  Palette, 
  ShieldCheck, 
  ArrowRight,
  Sliders,
  Mic,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  url?: string;
}

interface Feature43Props {
  heading?: string;
  subheading?: string;
  features?: FeatureItem[];
  className?: string;
}

const defaultFeatures: FeatureItem[] = [
  {
    icon: <Tv className="w-5 h-5 text-primary" />,
    title: "News Chyron & Tickers",
    description: "Broadcast-quality lower thirds featuring animated breaking-news headlines, dynamic tickers, and logo bugs.",
    url: "/crawl",
  },
  {
    icon: <Clock className="w-5 h-5 text-primary" />,
    title: "Timezone Clocks & Timers",
    description: "Synchronized UTC/local stream clocks and countdown timers with SVG rings and audio chime alarms.",
    url: "/clock",
  },

  {
    icon: <Monitor className="w-5 h-5 text-primary" />,
    title: "Studio Scene Screens",
    description: "Full-screen 'Starting Soon', 'Be Right Back', and 'Thanks for Watching' broadcast cards with live sync.",
    url: "/screen",
  },
  {
    icon: <Mic className="w-5 h-5 text-primary" />,
    title: "Podcast Production Tools",
    description: "Automated YouTube/Spotify chapter markers, ID3v2 metadata chunking, and syndicated RSS show notes.",
    url: "/podcast-tools",
  },
  {
    icon: <Users className="w-5 h-5 text-primary" />,
    title: "Union Solidarity Toolkit",
    description: "Open collective bargaining tools for stewards: contract clause diffing, grievance deadlines, and wage calculators.",
    url: "/union-tools",
  },
];

export function Feature43({
  heading = "Crafted for Broadcasters, DJs & Organizers",
  subheading = "An expanding ecosystem of purpose-built open web utilities hosted at code.getphily.io to streamline your workflow.",
  features = defaultFeatures,
  className,
}: Feature43Props) {
  return (
    <section className={cn("py-12 md:py-20 bg-background", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mx-auto mb-12 sm:mb-16 max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl   text-foreground">
            {heading}
          </h2>
          {subheading && (
            <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
              {subheading}
            </p>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="flex flex-col p-6 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg  text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {feature.description}
              </p>
              {feature.url && (
                <div className="mt-4 pt-3 border-t border-border/60">
                  <Link 
                    href={feature.url} 
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Open Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
