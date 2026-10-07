import React from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterLink {
  name: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface Footer2Props {
  className?: string;
}

const defaultSections: FooterSection[] = [
  {
    title: "Stream Studio",
    links: [
      { name: "Live Chyron & Crawl", href: "/crawl" },
      { name: "Stream Clocks", href: "/clock" },
      { name: "Event Timers", href: "/timer" },
      { name: "Scene Overlays", href: "/screen" },
    ],
  },
  {
    title: "Audio & Visuals",
    links: [
      { name: "Kalimotxo 3D Visualizer", href: "/kalimotxo" },
      { name: "Pioneer DJ Aesthetic", href: "/kalimotxo" },
      { name: "Web Audio Loopback", href: "/kalimotxo" },
      { name: "Stems Separation FX", href: "/kalimotxo" },
    ],
  },
  {
    title: "Creator Toolsets",
    links: [
      { name: "PodcastTools", href: "/podcast-tools" },
      { name: "UnionTools", href: "/union-tools" },
      { name: "Platform Toolsets", href: "/#toolsets" },
      { name: "Broadcast Dashboard", href: "/#broadcast-studio" },
    ],
  },
  {
    title: "Account & Themes",
    links: [
      { name: "Modern Minimal Theme", href: "/account" },
      { name: "Alpine Cobalt Theme", href: "/account" },
      { name: "Autoblog Orange Theme", href: "/account" },
      { name: "Public Profile", href: "/account" },
    ],
  },
];

export function Footer2({ className }: Footer2Props) {
  return (
    <footer className={cn("border-t border-border bg-card/60 pt-12 pb-8", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6 mb-12">
          
          {/* Brand Info */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                <Radio className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-foreground">
                getphily&apos;s Codebox
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Specialized, handcrafted web toolsets for live broadcasters, DJs, audio creators, and organizers. Hosted at code.getphily.io.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block size-2 rounded-full bg-emerald-500" />
              <span>Platform Engine: Active & Synchronized</span>
            </div>
          </div>

          {/* Section Columns */}
          {defaultSections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link 
                      href={link.href} 
                      className="hover:text-foreground transition-colors hover:underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} getphily&apos;s Codebox (code.getphily.io). Built with Shadcn UI & Tailwind CSS.</p>
          <div className="flex items-center gap-4">
            <Link href="/account" className="hover:text-foreground hover:underline">
              Theme Settings
            </Link>
            <span>•</span>
            <Link href="/auth" className="hover:text-foreground hover:underline">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
