'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Clock, 
  Timer, 
  Tv, 
  Monitor,
  Sliders,
  Mic,
  Users,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Sparkles,
  FileText,
  Calendar,
  TrendingUp,
  Tag,
  Bookmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileNav } from '@/components/MobileNavContext';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  desc?: string;
  badge?: string;
}

interface ToolSectionConfig {
  title: string;
  badge?: string;
  links: NavItem[];
}

function getToolSection(pathname: string): ToolSectionConfig {
  // 1. Broadcast Studio (OBS Widgets)
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/crawl') ||
    pathname.startsWith('/chyron') ||
    pathname.startsWith('/clock') ||
    pathname.startsWith('/timer') ||
    pathname.startsWith('/screen') ||
    pathname.startsWith('/stream-studio')
  ) {
    return {
      title: 'Broadcast Studio',
      badge: 'OBS Overlays',
      links: [
        { name: 'Studio Hub', path: '/dashboard', icon: LayoutDashboard, desc: 'All widgets & embeds' },
        { name: 'Chyron Builder', path: '/crawl', icon: Tv, desc: 'Animated lower-thirds & tickers' },
        { name: 'Clock Widget', path: '/clock', icon: Clock, desc: 'Broadcast clocks' },
        { name: 'Timer Widget', path: '/timer', icon: Timer, desc: 'Stream countdowns' },
        { name: 'Screen Sets', path: '/screen', icon: Monitor, desc: 'Multi-scene OBS canvases' },
      ],
    };
  }

  // 2. Kalimotxo Audio Studio
  if (pathname.startsWith('/kalimotxo')) {
    return {
      title: 'Kalimotxo Studio',
      badge: 'Pioneer DJ',
      links: [
        { name: '3D Visualizer', path: '/kalimotxo', icon: Sliders, desc: 'Tactile DDJ-FLX10 engine' },
        { name: 'Stream Canvas', path: '/kalimotxo#canvas', icon: Monitor, desc: '16:9 OBS output' },
      ],
    };
  }

  // 3. Podcast Tools
  if (pathname.startsWith('/podcast-tools')) {
    return {
      title: 'Podcast Tools',
      badge: 'Publishing',
      links: [
        { name: 'Tools Overview', path: '/podcast-tools', icon: Mic, desc: 'Audio automation suite' },
        { name: 'Chapter Markers', path: '/podcast-tools#chapters', icon: Bookmark, desc: 'YouTube & Spotify', badge: 'Dev' },
        { name: 'ID3v2 Metadata', path: '/podcast-tools#id3', icon: Tag, desc: 'Tag chunking utility', badge: 'Dev' },
        { name: 'Show Notes RSS', path: '/podcast-tools#rss', icon: Radio, desc: 'Syndicated notes feed', badge: 'Dev' },
      ],
    };
  }

  // 4. Union Tools
  if (pathname.startsWith('/union-tools')) {
    return {
      title: 'Solidarity Suite',
      badge: 'Labor Tech',
      links: [
        { name: 'Suite Overview', path: '/union-tools', icon: Users, desc: 'Digital organizer utilities' },
        { name: 'CBA Diff Tool', path: '/union-tools#cba', icon: FileText, desc: 'Contract comparison', badge: 'Dev' },
        { name: 'Grievance Tracker', path: '/union-tools#grievances', icon: Calendar, desc: 'Deadline monitoring', badge: 'Dev' },
        { name: 'Wage Modeler', path: '/union-tools#wages', icon: TrendingUp, desc: 'Step scale projections', badge: 'Dev' },
      ],
    };
  }

  // 5. Account Settings
  if (pathname.startsWith('/account')) {
    return {
      title: 'Account Settings',
      badge: 'Profile',
      links: [
        { name: 'Profile & Auth', path: '/account', icon: User, desc: 'Identity & credentials' },
        { name: 'Saved Widgets', path: '/dashboard', icon: LayoutDashboard, desc: 'Your stream studio items' },
      ],
    };
  }

  // Fallback default
  return {
    title: 'Broadcast Studio',
    badge: 'Tools',
    links: [
      { name: 'Studio Hub', path: '/dashboard', icon: LayoutDashboard, desc: 'Widgets & embeds' },
      { name: 'Chyron Builder', path: '/crawl', icon: Tv, desc: 'Lower-third tickers' },
      { name: 'Clock Widget', path: '/clock', icon: Clock, desc: 'Stream broadcast clocks' },
      { name: 'Timer Widget', path: '/timer', icon: Timer, desc: 'Countdowns' },
      { name: 'Screen Sets', path: '/screen', icon: Monitor, desc: 'OBS scene sets' },
    ],
  };
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen } = useMobileNav();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('codebox_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('codebox_sidebar_collapsed', String(next));
  };

  // Hide on homepage landing
  if (pathname === '/') {
    return null;
  }

  const section = getToolSection(pathname);

  return (
    <TooltipProvider delayDuration={150}>
      <aside 
        className={cn(
          "bg-sidebar lg:border-r border-b lg:border-b-0 border-border shrink-0 z-20 select-none transition-[width] duration-200 ease-in-out", 
          // Responsive & Collapsible width
          isCollapsed ? "lg:w-16 w-full" : "lg:w-60 w-full",
          isOpen ? "flex flex-col" : "hidden lg:flex lg:flex-col"
        )}
      >
        {/* Sidebar Header & Collapse Toggle */}
        <div className="flex items-center justify-between p-3 border-b border-border min-h-[52px]">
          {(!isCollapsed || !mounted) && (
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
                {section.title}
              </span>
              {section.badge && (
                <span className="text-[10px] font-semibold text-primary/80 uppercase tracking-widest mt-0.5">
                  {section.badge}
                </span>
              )}
            </div>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapsed}
                className={cn(
                  "h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 transition-colors",
                  isCollapsed && "mx-auto"
                )}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{isCollapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Tool-specific Navigation Items */}
        <nav 
          className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto" 
          aria-label={`${section.title} Navigation`}
        >
          {section.links.map((link) => {
            const isActive = pathname === link.path || (link.path !== '/dashboard' && pathname.startsWith(link.path));
            const IconComponent = link.icon;

            const linkContent = (
              <Link
                key={link.path}
                href={link.path}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  "flex items-center rounded-lg text-sm font-medium transition-all group",
                  isCollapsed 
                    ? "justify-center h-10 w-10 mx-auto" 
                    : "gap-3 px-3 py-2 min-h-[44px]",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <IconComponent
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  aria-hidden="true"
                />
                
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate">{link.name}</span>
                      {link.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground uppercase">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    {link.desc && (
                      <span className="text-[11px] text-muted-foreground/80 truncate font-normal">
                        {link.desc}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={link.path}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex flex-col gap-0.5 py-1.5 px-2.5">
                    <span className="font-semibold text-xs">{link.name}</span>
                    {link.desc && (
                      <span className="text-[10px] text-muted-foreground">{link.desc}</span>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
