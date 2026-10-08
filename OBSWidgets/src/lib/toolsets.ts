import {
  LayoutDashboard,
  Clock,
  Timer,
  Tv,
  Monitor,
  Sliders,
  Mic,
  Users,
  Radio,
  BookOpen,
  AudioLines,
} from 'lucide-react';

export interface ToolsetTool {
  id: string;
  name: string;
  /** Studio / editor route */
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  /** widget_type values stored in Supabase for this tool */
  widgetTypes?: string[];
  desc: string;
}

export interface Toolset {
  id: string;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  status?: 'live' | 'dev';
  tools: ToolsetTool[];
}

/**
 * Each toolset owns a dashboard at /dashboard?set=<id>.
 * Toolsets with several tools get sub-items (/dashboard?set=<id>&tool=<toolId>);
 * single-tool toolsets link straight to their dashboard.
 */
export const TOOLSETS: Toolset[] = [
  {
    id: 'broadcast',
    name: 'StreamTools',
    tagline: 'Real-time OBS overlays, chyrons, clocks, timers and scene screens.',
    icon: Radio,
    status: 'live',
    tools: [
      { id: 'chyron', name: 'Chyron Builder', path: '/crawl', icon: Tv, widgetTypes: ['crawl', 'chyron'], desc: 'Lower thirds & scrolling tickers' },
      { id: 'clock', name: 'Clock Widget', path: '/clock', icon: Clock, widgetTypes: ['clock'], desc: 'Broadcast clocks' },
      { id: 'timer', name: 'Timer Widget', path: '/timer', icon: Timer, widgetTypes: ['timer'], desc: 'Countdowns & stopwatches' },
      { id: 'screen', name: 'Screen Sets', path: '/screen', icon: Monitor, widgetTypes: ['screen'], desc: 'Starting soon / BRB scenes' },
    ],
  },

  {
    id: 'podcast',
    name: 'PodcastTools',
    tagline: 'Interactive guides, chapter markers, and syndicated show notes.',
    icon: Mic,
    status: 'dev',
    tools: [
      { id: 'podcast', name: 'Your Podcast', path: '/podcast-tools', icon: Mic, desc: 'Public Directory Profile' },
      { id: 'courses', name: 'Short Courses', path: '/podcast-tools/courses', icon: BookOpen, desc: 'Podcast mini-courses' },
      { id: 'studio', name: 'Recording Studio', path: '/podcast-tools/studio', icon: AudioLines, desc: 'Record, edit & polish episodes' },
    ],
  },
  {
    id: 'union',
    name: 'UnionTools',
    tagline: 'Digital utilities for stewards and bargaining committees.',
    icon: Users,
    status: 'dev',
    tools: [
      { id: 'union', name: 'UnionTools', path: '/union-tools', icon: Users, desc: 'CBA diffing & grievance tracking' },
    ],
  },
];

export const OVERVIEW_ICON = LayoutDashboard;

export function getToolset(id: string | null | undefined): Toolset | undefined {
  return TOOLSETS.find((t) => t.id === id);
}
