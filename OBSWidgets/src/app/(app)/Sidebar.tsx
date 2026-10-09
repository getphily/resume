'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
  Bookmark,
  ChevronDown,
  BookOpen,
  AudioLines,
  FileImage
} from 'lucide-react';
import { TOOLSETS } from '@/lib/toolsets';
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

/** The most specific link matching the route, e.g. /podcast-tools/studio beats /podcast-tools. */
function activeLinkPath(links: NavItem[], pathname: string): string | undefined {
  const current = pathname.replace(/\/$/, '') || '/';
  let best: string | undefined;
  for (const { path } of links) {
    if (path.includes('#')) continue;
    const matches = current === path || (path !== '/dashboard' && current.startsWith(`${path}/`));
    if (matches && (!best || path.length > best.length)) best = path;
  }
  return best;
}

function getToolSection(pathname: string): ToolSectionConfig {
  // 1. StreamTools (OBS Widgets)
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/media') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/crawl') ||
    pathname.startsWith('/chyron') ||
    pathname.startsWith('/clock') ||
    pathname.startsWith('/timer') ||
    pathname.startsWith('/screen') ||
    pathname.startsWith('/stream-studio')
  ) {
    return {
      title: 'StreamTools',
      badge: 'OBS Overlays',
      links: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, desc: 'Account, Media & Toolsets' },
        { name: 'Chyron Builder', path: '/crawl', icon: Tv, desc: 'Animated lower-thirds & tickers' },
        { name: 'Clock Widget', path: '/clock', icon: Clock, desc: 'Broadcast clocks' },
        { name: 'Timer Widget', path: '/timer', icon: Timer, desc: 'Stream countdowns' },
        { name: 'Screen Sets', path: '/screen', icon: Monitor, desc: 'Multi-scene OBS canvases' },
      ],
    };
  }



  // 3. PodcastTools
  if (pathname.startsWith('/podcast-tools')) {
    return {
      title: 'PodcastTools',
      badge: 'Publishing',
      links: [
        { name: 'Your Podcast', path: '/podcast-tools', icon: Mic, desc: 'Interactive startup guide',  },
        { name: 'Short Courses', path: '/podcast-tools/courses', icon: BookOpen, desc: 'Podcast mini-courses',  },
        { name: 'Recording Studio', path: '/podcast-tools/studio', icon: AudioLines, desc: 'Record, edit & polish',  },
        { name: 'Chapter Markers', path: '/podcast-tools#chapters', icon: Bookmark, desc: 'YouTube & Spotify',  },
        { name: 'ID3v2 Metadata', path: '/podcast-tools#id3', icon: Tag, desc: 'Tag chunking utility',  },
        { name: 'Show Notes RSS', path: '/podcast-tools#rss', icon: Radio, desc: 'Syndicated notes feed',  },
      ],
    };
  }

  // 4. UnionTools
  if (pathname.startsWith('/union-tools')) {
    return {
      title: 'UnionTools',
      badge: 'Labor Tech',
      links: [
        { name: 'Suite Overview', path: '/union-tools', icon: Users, desc: 'Digital organizer utilities' },
        { name: 'CBA Diff Tool', path: '/union-tools#cba', icon: FileText, desc: 'Contract comparison',  },
        { name: 'Grievance Tracker', path: '/union-tools#grievances', icon: Calendar, desc: 'Deadline monitoring',  },
        { name: 'Wage Modeler', path: '/union-tools#wages', icon: TrendingUp, desc: 'Step scale projections',  },
      ],
    };
  }

  // Fallback default
  return {
    title: 'StreamTools',
    badge: 'Tools',
    links: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, desc: 'Account, Media & Toolsets' },
      { name: 'Chyron Builder', path: '/crawl', icon: Tv, desc: 'Lower-third tickers' },
      { name: 'Clock Widget', path: '/clock', icon: Clock, desc: 'Stream broadcast clocks' },
      { name: 'Timer Widget', path: '/timer', icon: Timer, desc: 'Countdowns' },
      { name: 'Screen Sets', path: '/screen', icon: Monitor, desc: 'OBS scene sets' },
    ],
  };
}

export default function Sidebar() {
  return (
    <Suspense fallback={null}>
      <SidebarInner />
    </Suspense>
  );
}

function DashboardNav({ isCollapsed }: { isCollapsed: boolean }) {
  const searchParams = useSearchParams();
  const activeSet = searchParams.get('set');
  const activeTool = searchParams.get('tool');

  const itemClass = (active: boolean) =>
    cn(
      "flex items-center rounded-lg text-[15px] font-heading transition-all group",
      isCollapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2 min-h-[44px]",
      active
        ? "bg-primary/10 text-primary shadow-2xs"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    );

  const withTip = (label: string, key: string, node: React.ReactElement) =>
    isCollapsed ? (
      <Tooltip key={key}>
        <TooltipTrigger asChild>{node}</TooltipTrigger>
        <TooltipContent side="right"><p>{label}</p></TooltipContent>
      </Tooltip>
    ) : (
      node
    );

  const overviewActive = !activeSet;

  return (
    <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto" aria-label="Dashboard Navigation">
      {withTip(
        'Overview',
        'overview',
        <Link
          key="overview"
          href="/dashboard"
          aria-current={overviewActive ? 'page' : undefined}
          className={itemClass(overviewActive)}
        >
          <LayoutDashboard className={cn("w-4 h-4 shrink-0", overviewActive ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
          {!isCollapsed && <span className="truncate">Overview</span>}
        </Link>
      )}

      {!isCollapsed && (
        <span className="px-3 pt-4 pb-1 text-[11px] font-heading uppercase tracking-widest text-muted-foreground">
          Toolsets
        </span>
      )}
      {isCollapsed && <div className="my-2 mx-2 h-px bg-border" />}

      {TOOLSETS.map((ts) => {
        const SetIcon = ts.icon;
        const setActive = activeSet === ts.id;
        const multi = ts.tools.length > 1;

        return (
          <div key={ts.id} className="flex flex-col gap-0.5">
            {withTip(
              ts.name,
              ts.id,
              <Link
                href={ts.id === 'broadcast' ? `/dashboard?set=${ts.id}` : ts.tools[0].path}
                aria-current={setActive && !activeTool ? 'page' : undefined}
                className={itemClass(setActive && !activeTool)}
              >
                <SetIcon className={cn("w-4 h-4 shrink-0", setActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} aria-hidden="true" />
                {!isCollapsed && (
                  <>
                    <span className="truncate flex-1">{ts.name}</span>
                    
                    {multi && (
                      <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", setActive ? "rotate-0" : "-rotate-90")} aria-hidden="true" />
                    )}
                  </>
                )}
              </Link>
            )}

            {/* Sub-tools only for multi-tool toolsets, shown when expanded & active */}
            {multi && setActive && !isCollapsed && (
              <div className="ml-5 pl-2 border-l border-border flex flex-col gap-0.5 mb-1">
                {ts.tools.map((tool) => {
                  const ToolIcon = tool.icon;
                  const toolActive = activeTool === tool.id;
                  return (
                    <Link
                      key={tool.id}
                      href={ts.id === 'broadcast' ? `/dashboard?set=${ts.id}&tool=${tool.id}` : tool.path}
                      aria-current={toolActive ? 'page' : undefined}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors",
                        toolActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      <ToolIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{tool.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function SidebarInner() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useMobileNav();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sideMenuDark, setSideMenuDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('codebox_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
    const onMenuModeUpdated = () => setSideMenuDark(localStorage.getItem('sideMenuMode') === 'dark');
    onMenuModeUpdated();
    window.addEventListener('menu-mode-updated', onMenuModeUpdated);
    return () => window.removeEventListener('menu-mode-updated', onMenuModeUpdated);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, setIsOpen]);

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('codebox_sidebar_collapsed', String(next));
  };

  // Hide on homepage landing
  if (pathname === '/') {
    return null;
  }

  const isDashboard = pathname.replace(/\/$/, '') === '/dashboard';
  const section: ToolSectionConfig = isDashboard
    ? { title: 'Dashboard', badge: 'Your Toolsets', links: [] }
    : getToolSection(pathname);

  return (
    <TooltipProvider delayDuration={150}>
      <aside 
        className={cn(
          "bg-card lg:border-r border-b lg:border-b-0 border-border shrink-0 z-20 select-none transition-[width] duration-200 ease-in-out", sideMenuDark && "dark", 
          // Responsive & Collapsible width
          isCollapsed ? "lg:w-16 w-full" : "lg:w-60 w-full",
          isOpen ? "flex flex-col" : "hidden lg:flex lg:flex-col"
        )}
      >
        {/* Sidebar Header & Collapse Toggle */}
        <div className="flex items-center justify-between p-3 border-b border-border min-h-[52px]">
          {(!isCollapsed || !mounted) && (
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs  uppercase tracking-wider text-muted-foreground truncate">
                {section.title}
              </span>
              {section.badge && (
                <span className="text-[11px] font-heading text-primary/80 uppercase tracking-widest mt-0.5">
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
                aria-expanded={!isCollapsed}
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

        {isDashboard ? (
          <DashboardNav isCollapsed={isCollapsed} />
        ) : (
        <nav 
          className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto" 
          aria-label={`${section.title} Navigation`}
        >
          {section.links.filter((l) => !l.path.includes('#')).map((link) => {
            const isActive = activeLinkPath(section.links, pathname) === link.path;
            const IconComponent = link.icon;

            const linkContent = (
              <Link
                key={link.path}
                href={link.path}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  "flex items-center rounded-lg text-[15px] font-heading transition-all group",
                  isCollapsed 
                    ? "justify-center h-10 w-10 mx-auto" 
                    : "gap-3 px-3 py-2 min-h-[44px]",
                  isActive
                    ? "bg-primary/10 text-primary shadow-2xs"
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
                        <span className="text-[10px]  px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground uppercase">
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
          {section.links.some((l) => l.path.includes('#')) && !isCollapsed && (
            <div className="mt-3 pt-3 border-t border-border" role="group" aria-label="Planned tools">
              <p className="px-3 pb-1 text-xs uppercase tracking-wider text-muted-foreground">Planned</p>
              <ul className="flex flex-col gap-0.5 m-0 p-0 list-none">
                {section.links.filter((l) => l.path.includes('#')).map((l) => {
                  const PIcon = l.icon;
                  return (
                    <li key={l.path} className="flex items-center gap-3 px-3 py-1.5 text-sm text-muted-foreground" aria-disabled="true">
                      <PIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{l.name}</span>
                      <span className="ml-auto text-xs">Soon</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </nav>
        )}
      </aside>
    </TooltipProvider>
  );
}
