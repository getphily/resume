'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import MediaLibrary from '@/components/media/MediaLibrary';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ShieldCheck } from 'lucide-react';
import { ThemeMode, VALID_THEMES, DEFAULT_THEME } from '@/app/ThemeProvider';
import { cn } from '@/lib/utils';

import { useRouter, useSearchParams } from 'next/navigation';
import { TOOLSETS, getToolset } from '@/lib/toolsets';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  GripVertical, 
  Trash2, 
  Pencil, 
  Clock, 
  Timer, 
  Tv, 
  Monitor, 
  Plus, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ClockPreview } from '@/components/ClockPreview';
import { TimerPreview } from '@/components/TimerPreview';
import ChyronPreview from '@/components/ChyronPreview';
import { ScreenPreview } from '@/components/ScreenPreview';
import { ObsExportCard } from '@/components/ObsExportCard';

function WidgetMiniThumbnail({ item, time }: { item: any; time: Date | null }) {
  const type = item.widget_type;

  return (
    <div 
      aria-hidden="true" 
      className="preview-window-container w-24 h-14 shrink-0 rounded-md overflow-hidden flex items-center justify-center border border-border bg-[#0a0a0c]"
    >
      {type === 'clock' && (
        <div className="scale-[0.24] origin-center">
          <ClockPreview config={item.config} time={time} scale={1} />
        </div>
      )}
      {type === 'timer' && (
        <div className="scale-[0.25] origin-center w-48 h-48 flex items-center justify-center">
          <TimerPreview config={item.config} scale={0.5} />
        </div>
      )}
      {(type === 'crawl' || type === 'chyron') && (
        <div className="w-full h-full flex items-end">
          <ChyronPreview config={item.config} scale={0.06} />
        </div>
      )}
      {type === 'screen' && (
        <div className="scale-[0.05] origin-center w-[1920px] h-[1080px]">
          <ScreenPreview config={item.config} />
        </div>
      )}
    </div>
  );
}

function SortableWidgetCard({ item, copyUrl, copySuccess, isSelected, onToggleSelect, onDelete, time }: any) {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: transform ? 1 : 0,
    position: 'relative' as const,
  };

  const getPrimaryEmbedUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const prefix = typeof window !== 'undefined' && window.location.pathname.startsWith('/widgets') 
      ? `${origin}/widgets/embed` 
      : `${origin}/embed`;
    if (item.widget_type === 'screen') {
      const firstPageId = item.config.pages?.[0]?.id || 'starting-soon';
      return `${prefix}/screen?id=${item.id}&page=${firstPageId}`;
    }
    const embedType = (item.widget_type === 'chyron' || item.widget_type === 'crawl') ? 'crawl' : item.widget_type;
    return `${prefix}/${embedType}?id=${item.id}`;
  };

  const primaryUrl = getPrimaryEmbedUrl();
  const isCopied = copySuccess === item.id;

  const badgeVariant = 
    item.widget_type === 'screen' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' : 
    item.widget_type === 'timer' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : 
    (item.widget_type === 'crawl' || item.widget_type === 'chyron') ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' : 
    'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="border-border bg-card shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-4"
    >
      <div className="flex justify-between items-center gap-3 flex-wrap">
        
        {/* Left: Drag + Select + Thumbnail + Title */}
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1" title="Drag to reorder">
            <GripVertical className="w-4 h-4" />
          </div>
          
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={() => onToggleSelect(item.id)} 
            aria-label={`Select ${item.config.name || 'widget'}`}
          />
          
          <WidgetMiniThumbnail item={item} time={time} />

          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-sm uppercase font-bold tracking-wider px-2 py-0 h-4 border ${badgeVariant}`}>
                {(item.widget_type === 'crawl' || item.widget_type === 'chyron') ? 'CHYRON' : item.widget_type.toUpperCase()}
              </Badge>
              {item.widget_type === 'screen' && (
                <span className="text-xs text-muted-foreground">
                  {item.config.pages?.length || 1} Pages
                </span>
              )}
            </div>
            <h3 className=" text-sm truncate text-foreground">
              {item.config.name || 'Unnamed Widget'}
            </h3>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant={isCopied ? "default" : "secondary"}
                onClick={() => copyUrl(item.id, primaryUrl)}
                className={`h-8 gap-1.5 text-xs font-medium ${isCopied ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy OBS Browser Source URL</p>
            </TooltipContent>
          </Tooltip>

          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium">
            <Link href={`/${(item.widget_type === 'chyron' || item.widget_type === 'crawl') ? 'crawl' : item.widget_type}?id=${item.id}`}>
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => onDelete(item.id)}
                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                aria-label="Delete widget"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete widget</p>
            </TooltipContent>
          </Tooltip>

          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Toggle details"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded Accordion: Full OBS Embed Details */}
      {expanded && (
        <div className="mt-1 pt-3 border-t border-border">
          {item.widget_type === 'screen' ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground mb-1">
                This screenset contains multiple overlays. Copy the exact page URL you need for your stream scene:
              </p>
              {item.config.pages?.map((page: any) => (
                <ObsExportCard
                  key={page.id}
                  title={`${page.name.toUpperCase()} PAGE EMBED`}
                  url={`${typeof window !== 'undefined' ? window.location.origin : ''}/widgets/embed/screen?id=${item.id}&page=${page.id}`}
                  dimensions="1920 × 1080"
                  allowTransparency={true}
                />
              ))}
            </div>
          ) : (
            <ObsExportCard
              title={`${(item.widget_type === 'crawl' || item.widget_type === 'chyron') ? 'CHYRON' : item.widget_type.toUpperCase()} EMBED URL`}
              url={primaryUrl}
              dimensions={(item.widget_type === 'crawl' || item.widget_type === 'chyron') ? '1920 × 200' : '1920 × 1080'}
              allowTransparency={true}
            />
          )}
        </div>
      )}
    </Card>
  );
}

interface ThemeOption {
  id: ThemeMode;
  name: string;
  badge: string;
  description: string;
  headerBg: string;
  canvasBg: string;
  cardBg: string;
  accentColor: string;
  palette: string[];
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    badge: 'Default Theme',
    description: 'Stripped-back minimal aesthetic with razor-sharp contrast and vibrant indigo focus accents.',
    headerBg: '#0f172a',
    canvasBg: '#ffffff',
    cardBg: '#ffffff',
    accentColor: '#4f46e5',
    palette: ['#4f46e5', '#f3f4f6', '#e0f2fe', '#f4f5f7', '#0f172a'],
  },
  {
    id: 'autoblog',
    name: 'Autoblog',
    badge: 'Publishing',
    description: 'Vivid orange primary, warm accent wash, and clean white background for high-energy broadcasts.',
    headerBg: '#1c1917',
    canvasBg: '#fefefe',
    cardBg: '#ffffff',
    accentColor: '#ea580c',
    palette: ['#da3e05', '#edf0f4', '#fff0eb', '#fdfdfd', '#000000'],
  },
  {
    id: 'alpine',
    name: 'Alpine',
    badge: 'Cobalt & Coral',
    description: 'Cobalt structure, coral heat accent, and a warm blush canvas (#fcf5f7) inspired by night ski lodges.',
    headerBg: '#1e293b',
    canvasBg: '#fcf5f7',
    cardBg: '#ffffff',
    accentColor: '#1d4ed8',
    palette: ['#0047ab', '#ff4d6d', '#ffb3c1', '#fcf5f7', '#0a1931'],
  },
  {
    id: 'light-green',
    name: 'Light Green',
    badge: 'Fresh & Clean',
    description: 'High-contrast neon green primary, deep indigo-slate text, and crisp modern cards.',
    headerBg: '#0f172a',
    canvasBg: '#fbfdf8',
    cardBg: '#ffffff',
    accentColor: '#22c55e',
    palette: ['#aff33e', '#334155', '#f0fdf4', '#fbfcf8', '#0f172a'],
  },
  {
    id: 'japan-blues',
    name: 'Japan Blues',
    badge: 'Cool & Calm',
    description: 'Soft blue accents with a warm off-white canvas.',
    headerBg: '#1e293b',
    canvasBg: '#faf9f5',
    cardBg: '#faf9f5',
    accentColor: '#3b82f6',
    palette: ['#90a1b9', '#cad5e2', '#e9e6dc', '#faf9f5', '#0a0a0a'],
  },
  {
    id: 'astrovista',
    name: 'Astrovista',
    badge: 'Space',
    description: 'Crisp layout with cosmic magenta accents.',
    headerBg: '#0f172a',
    canvasBg: '#f0f0f5',
    cardBg: '#ffffff',
    accentColor: '#e11d48',
    palette: ['#ca4d1f', '#2f4b79', '#d6e4f0', '#e8ebed', '#333333'],
  },
  {
    id: 'porfolio',
    name: 'Portfolio',
    badge: 'Elegant',
    description: 'Refined golden accents perfect for showcases.',
    headerBg: '#18181b',
    canvasBg: '#fafafa',
    cardBg: '#ffffff',
    accentColor: '#ca8a04',
    palette: ['#c1a875', '#e5e1d5', '#c1a875', '#f8f7f2', '#1a1a1a'],
  },
  {
    id: 'vescrow',
    name: 'Vescrow',
    badge: 'Corporate',
    description: 'Deep royal blue trust-building aesthetic.',
    headerBg: '#172554',
    canvasBg: '#fefefe',
    cardBg: '#ffffff',
    accentColor: '#1d4ed8',
    palette: ['#03035e', '#e2ebfd', '#e5e8ff', '#fdfcfe', '#0a050d'],
  },
  {
    id: 'polaris',
    name: 'Polaris',
    badge: 'SaaS',
    description: 'Cool slate blues for a modern software feel.',
    headerBg: '#0f172a',
    canvasBg: '#f8fafc',
    cardBg: '#ffffff',
    accentColor: '#0ea5e9',
    palette: ['#02677f', '#ffb500', '#03a2bc', '#f5fafb', '#081e24'],
  },
  {
    id: 'claude',
    name: 'Claude',
    badge: 'AI',
    description: 'Warm peach and cream tones inspired by Claude.',
    headerBg: '#27272a',
    canvasBg: '#fdfcfb',
    cardBg: '#ffffff',
    accentColor: '#d97757',
    palette: ['#bd5835', '#e7e4dd', '#f4997b', '#faf8f1', '#3d3826'],
  },
];




function ThemeCard({ opt, theme, setTheme }: { opt: ThemeOption, theme: ThemeMode, setTheme: (t: ThemeMode) => void }) {
  const isSelected = theme === opt.id;
  return (
    <div 
      onClick={() => {
        setTheme(opt.id);
        document.documentElement.setAttribute('data-theme', opt.id);
        localStorage.setItem('theme', opt.id);
        window.dispatchEvent(new Event('theme-updated'));
      }}
      className={cn(
        "group cursor-pointer flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200",
        isSelected 
          ? "border-primary bg-primary/5" 
          : "border-transparent hover:border-border hover:bg-muted/50"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Row of chips in a subtle container */}
        {/* Row of 5 chips */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-inner">
          {opt.palette.map((color, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10 shadow-xs" style={{ backgroundColor: color }}></div>
          ))}
        </div>
        <div className="flex flex-col">
          <span className={cn(
            "text-xs font-semibold tracking-wide transition-colors leading-none",
            isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}>
            {opt.name}
          </span>
        </div>
      </div>
      {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
    </div>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [topMenuDark, setTopMenuDark] = useState(false);
  const [sideMenuDark, setSideMenuDark] = useState(false);

  useEffect(() => {
    const onMenuModeUpdated = () => {
      setTopMenuDark(localStorage.getItem('topMenuMode') === 'dark');
      setSideMenuDark(localStorage.getItem('sideMenuMode') === 'dark');
    };
    onMenuModeUpdated();
    window.addEventListener('menu-mode-updated', onMenuModeUpdated);
    return () => window.removeEventListener('menu-mode-updated', onMenuModeUpdated);
  }, []);
  
  const setId = searchParams.get('set');
  const toolId = searchParams.get('tool');
  const toolset = getToolset(setId);
  const activeTool = toolset?.tools.find((t) => t.id === toolId);
  const [session, setSession] = useState<any>(null);
  const [configsList, setConfigsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [theme, setTheme] = useState<ThemeMode>(DEFAULT_THEME);
  const [userId, setUserId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [identities, setIdentities] = useState<any[]>([]);
  const [time, setTime] = useState<Date | null>(null);
  const router = useRouter();



  const visibleTypes = toolset
    ? (activeTool ? activeTool.widgetTypes : toolset.tools.flatMap((t) => t.widgetTypes ?? [])) ?? []
    : null;
  const visibleList = visibleTypes ? configsList.filter((c) => visibleTypes.includes(c.widget_type)) : configsList;
  const showSaved = !toolset || toolset.id === 'broadcast';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        fetchConfigs(session.user.id);

      if (session) {
        setUserId(session.user.id);
        setEmail(session.user.email || '');
        setIdentities(session.user.identities || []);
        supabase.from('profiles').select('username, avatar_url, theme').eq('id', session.user.id).single().then(({data}) => {
          if (data) {
            setUsername(data.username || '');
            setAvatarUrl(data.avatar_url || '');
            if (data.theme && VALID_THEMES.includes(data.theme as ThemeMode)) {
              setTheme(data.theme as ThemeMode);
            } else {
              setTheme(DEFAULT_THEME);
            }
          }
        });
      }

      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchConfigs(session.user.id);

      if (session) {
        setUserId(session.user.id);
        setEmail(session.user.email || '');
        setIdentities(session.user.identities || []);
        supabase.from('profiles').select('username, avatar_url, theme').eq('id', session.user.id).single().then(({data}) => {
          if (data) {
            setUsername(data.username || '');
            setAvatarUrl(data.avatar_url || '');
            if (data.theme && VALID_THEMES.includes(data.theme as ThemeMode)) {
              setTheme(data.theme as ThemeMode);
            } else {
              setTheme(DEFAULT_THEME);
            }
          }
        });
      }

      } else {
        setConfigsList([]);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  
  const handleUpdateProfile = async () => {
    if (!userId) return;
    setSavingProfile(true);
    let errorMsg = null;
    const { data: sessionData } = await supabase.auth.getSession();
    const currentEmail = sessionData?.session?.user?.email;
    if (email && email !== currentEmail) {
      const { error: authError } = await supabase.auth.updateUser({ email });
      if (authError) errorMsg = authError.message;
    }
    if (!errorMsg) {
      const { error } = await supabase.from('profiles').upsert({ id: userId, username, avatar_url: avatarUrl, theme, updated_at: new Date().toISOString() });
      if (error) { errorMsg = error.message; }
    }
    if (errorMsg) { toast.error("Error saving profile: " + errorMsg); } 
    else { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); window.dispatchEvent(new Event('theme-updated')); toast.success("Preferences saved successfully! If you changed your email, check both inboxes."); }
    setSavingProfile(false);
  };

  const handleLinkIdentity = async (provider: 'google' | 'azure' | 'facebook' | 'twitch') => {
    try {
      const { data, error } = await supabase.auth.linkIdentity({ provider });
      if (error) throw error;
      toast.success(`Redirecting to connect ${provider}...`);
    } catch (e: any) {
      toast.error(`Error connecting ${provider}: ` + e.message);
    }
  };

  const handleUnlinkIdentity = async (identity: any) => {
    try {
      if (identities.length <= 1) {
        toast.error('Cannot disconnect your only sign-in method.');
        return;
      }
      const { error } = await supabase.auth.unlinkIdentity(identity);
      if (error) throw error;
      setIdentities(identities.filter(id => id.id !== identity.id && id.identity_id !== identity.identity_id));
      toast.success('Account disconnected');
    } catch (e: any) {
      toast.error('Error disconnecting account: ' + e.message);
    }
  };
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSavingProfile(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const filePath = `${userId}-${Math.random()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
    } catch (error: any) { toast.error('Error uploading avatar: ' + error.message); } 
    finally { setSavingProfile(false); }
  };

  const fetchConfigs = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('widget_configs')
      .select('id, config, widget_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    const sorted = (data || []).sort((a, b) => {
      const orderA = a.config.sortOrder ?? 999;
      const orderB = b.config.sortOrder ?? 999;
      return orderA - orderB;
    });

    setConfigsList(sorted);
    setLoading(false);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = configsList.findIndex(i => i.id === active.id);
      const newIndex = configsList.findIndex(i => i.id === over.id);
      const newList = arrayMove(configsList, oldIndex, newIndex);
      setConfigsList(newList);

      for (let i = 0; i < newList.length; i++) {
        const item = newList[i];
        if (item.config.sortOrder !== i) {
          item.config.sortOrder = i;
          await supabase.from('widget_configs').update({ config: item.config }).eq('id', item.id);
        }
      }
      toast.success('Widget order saved');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const deleteSingle = (id: string) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-1">
          <p className="m-0 text-sm font-semibold text-foreground">Delete this widget?</p>
          <p className="m-0 text-xs text-muted-foreground">This action cannot be undone.</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await supabase.from('widget_configs').delete().eq('id', id);
                setConfigsList(configsList.filter(c => c.id !== id));
                setSelectedIds(selectedIds.filter(i => i !== id));
                toast.success('Widget deleted');
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold cursor-pointer transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-md text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center' }
    );
  };

  const deleteSelected = async () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-1">
          <p className="m-0 text-sm font-semibold text-foreground">
            Delete {selectedIds.length} widget{selectedIds.length > 1 ? 's' : ''}?
          </p>
          <p className="m-0 text-xs text-muted-foreground">
            This action cannot be undone.
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                for (const id of selectedIds) {
                  await supabase.from('widget_configs').delete().eq('id', id);
                }
                setConfigsList(configsList.filter(c => !selectedIds.includes(c.id)));
                setSelectedIds([]);
                toast.success('Deleted successfully');
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold cursor-pointer transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-md text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center' }
    );
  };

  const copyUrl = (key: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopySuccess(key);
    toast.success('OBS Browser Source URL copied to clipboard!', { position: 'top-center', duration: 2000 });
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <div className="flex flex-col min-h-full w-full p-6 max-w-7xl mx-auto">
      {/* Dashboard Top Header */}
      <div className="flex justify-between items-start md:items-end mb-8 flex-wrap gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              {toolset ? 'Toolset Dashboard' : 'Creator Studio'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl   text-foreground">
            {activeTool ? activeTool.name : toolset ? toolset.name : 'User Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeTool
              ? `${activeTool.desc}. Manage your saved ${activeTool.name.toLowerCase()} configurations and copy browser source URLs.`
              : toolset
                ? toolset.tagline
                : 'Pick a toolset to open its dashboard, or review everything you have saved across the platform.'}
          </p>
        
        {!toolset && userId && (
          <Button onClick={handleUpdateProfile} disabled={savingProfile} className="h-9 px-6 font-bold text-xs uppercase tracking-wider shadow-xs shrink-0 mt-4 md:mt-0">
            {savingProfile ? 'Saving...' : 'Save Profile & Theme'}
          </Button>
        )}
      </div>

        {toolset && (activeTool || toolset.tools.length === 1) && (
          <Button asChild size="sm" className="font-semibold gap-1.5 shadow-xs">
            <Link href={(activeTool ?? toolset.tools[0]).path}>
              Open {(activeTool ?? toolset.tools[0]).name}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        )}

        {!session && !loading && (
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="font-semibold shadow-xs">
              <Link href="/auth">{toolset && toolset.id !== 'broadcast' ? 'Sign In' : 'Sign In to Save Overlays'}</Link>
            </Button>
          </div>
        )}
      </div>

      
      
      {/* 
        ====================================================
        BENTO BOX DASHBOARD OVERVIEW 
        ====================================================
      */}
      {!toolset && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10">
          
          {/* --- BENTO ITEM: PROFILE (col-span-3) --- */}
          <Card className="md:col-span-5 lg:col-span-3 border-border bg-card shadow-xs p-6 flex flex-col gap-6 relative overflow-hidden group">
            <h3 className="text-base font-bold text-foreground m-0 leading-tight absolute top-6 left-6 z-10">Profile</h3>
            
            <div className="flex flex-col items-center gap-4 text-center mt-6">
              <div className="relative group/avatar">
                <Avatar className="w-24 h-24 border-4 border-background shadow-sm transition-transform group-hover/avatar:scale-105">
                  <AvatarImage src={avatarUrl} alt={username || 'User'} className="object-cover" />
                  <AvatarFallback className="font-bold text-3xl bg-primary/10 text-primary">
                    {username ? username.substring(0, 2).toUpperCase() : 'DJ'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider">Upload</span>
                  <input type="file" accept="image/*" onChange={uploadAvatar} disabled={savingProfile} className="hidden" />
                </label>
              </div>
              <div>
                <div className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border inline-block">
                  ID: {userId?.substring(0, 8) || 'GUEST'}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 mt-auto">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pl-1">
                  <User className="w-3.5 h-3.5" /> Username
                </label>
                <Input 
                  id="username"
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="DJ Name" 
                  className="h-9 text-sm bg-background/50 focus:bg-background font-medium"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pl-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Email
                </label>
                <Input 
                  value={email || ''} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-9 text-sm bg-background/50 focus:bg-background font-medium"
                />
              </div>
            </div>
          </Card>

          {/* --- BENTO ITEM: THEMES (col-span-6) --- */}
          <Card className="md:col-span-7 lg:col-span-6 border-border bg-card shadow-xs p-6 flex flex-col gap-4 relative overflow-hidden">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-3">
               <div className="flex items-center gap-3">
                 <h3 className="text-base font-bold text-foreground m-0 leading-tight">Platform Theme</h3>
                 <Badge variant="outline" className="text-[10px] font-normal border-primary/20 bg-primary/5 text-primary">{THEME_OPTIONS.length} Themes</Badge>
               </div>
               <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5">
                   <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Top Bar Dark</span>
                   <Switch 
                     checked={topMenuDark}
                     onCheckedChange={(checked) => {
                       localStorage.setItem('topMenuMode', checked ? 'dark' : 'light');
                       window.dispatchEvent(new Event('menu-mode-updated'));
                     }}
                   />
                 </div>
                 <div className="flex items-center gap-1.5">
                   <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sidebar Dark</span>
                   <Switch 
                     checked={sideMenuDark}
                     onCheckedChange={(checked) => {
                       localStorage.setItem('sideMenuMode', checked ? 'dark' : 'light');
                       window.dispatchEvent(new Event('menu-mode-updated'));
                     }}
                   />
                 </div>
               </div>
             </div>
             
             {/* Condensed List of Themes */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 overflow-y-auto max-h-[380px] pr-2 custom-scrollbar -mr-2 pb-2">
                {THEME_OPTIONS.map(opt => (
                  <ThemeCard key={opt.id} opt={opt} theme={theme} setTheme={setTheme} />
                ))}
             </div>
          </Card>

          {/* --- BENTO ITEM: LINKED ACCOUNTS (col-span-3) --- */}
          <Card className="md:col-span-12 lg:col-span-3 border-border bg-card shadow-xs p-6 flex flex-col gap-5">
             <h3 className="text-base font-bold text-foreground m-0 leading-tight mb-2">Connected Services</h3>
             
             <div className="flex flex-col gap-3 flex-1 justify-center">
                {[
                  { name: 'Google', id: 'google', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.85-2.22.83-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.18-4.53z" fill="#EA4335"/></svg>, bg: 'bg-[#DB4437]/10' },
                  { name: 'Microsoft', id: 'azure', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" fill="#00A4EF"/></svg>, bg: 'bg-[#00A4EF]/10' },
                  { name: 'Twitch', id: 'twitch', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="#9146FF"><path d="M2.149 0 0 5.373v14.328h5.373V24h3.582l4.298-4.299h3.582L24 12.537V0H2.149zm19.701 11.463-3.582 3.582H13.25L9.668 18.63v-3.585H4.298V2.149h17.552v9.314z"/><path d="M16.119 5.373h-2.149v5.373h2.149V5.373zm-4.298 0H9.672v5.373h2.149V5.373z"/></svg>, bg: 'bg-[#9146FF]/10' },
                  { name: 'Facebook', id: 'facebook', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/></svg>, bg: 'bg-[#1877F2]/10' }
                ].map((provider) => {
                  const linkedIdentity = identities.find(id => id.provider === provider.id);
                  return (
                    <div key={provider.id} className="flex items-center justify-between group/conn p-2 rounded-lg hover:bg-muted/50 transition-colors -mx-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${provider.bg} flex items-center justify-center shrink-0`}>
                          {provider.icon}
                        </div>
                        <span className="text-sm font-semibold">{provider.name}</span>
                      </div>
                      {linkedIdentity ? (
                        <Button variant="ghost" size="sm" onClick={() => handleUnlinkIdentity(linkedIdentity)} className="h-7 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600 hover:bg-red-500/10 opacity-0 group-hover/conn:opacity-100 transition-opacity">Disconnect</Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleLinkIdentity(provider.id as any)} className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider">Connect</Button>
                      )}
                    </div>
                  );
                })}
             </div>
          </Card>

          {/* --- BENTO ITEMS: TOOLSETS (col-span-4 each) --- */}
          {TOOLSETS.map((ts) => {
            const SetIcon = ts.icon;
            return (
              <Link key={ts.id} href={`/dashboard?set=${ts.id}`} className="md:col-span-4 no-underline group block">
                <Card className="h-full border-border bg-card shadow-xs hover:border-primary/50 transition-all p-6 flex flex-col relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <SetIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground m-0 leading-tight">{ts.name}</h3>
                      {ts.status === 'dev' && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 mt-1 uppercase tracking-widest border-amber-500/30 text-amber-500">In Development</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed m-0 flex-1">{ts.tagline}</p>
                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                    <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{ts.tools.length} Sub-tools</span>
                    <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:translate-x-1 transition-all">
                      <ArrowRight className="w-3.5 h-3.5 text-primary" />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}

          {/* --- BENTO ITEM: MEDIA LIBRARY (col-span-12) --- */}
          <Card className="md:col-span-12 border-border bg-card shadow-xs p-0 overflow-hidden flex flex-col min-h-[500px]">
            <div className="px-6 py-4 border-b border-border bg-card flex justify-between items-center">
              <h3 className="text-base font-bold text-foreground m-0 leading-tight mb-2">Global Media Library</h3>
              <Badge variant="outline" className="text-[10px] font-normal">Cross-Platform Sync</Badge>
            </div>
            <div className="flex-1 relative bg-background/50">
              <MediaLibrary />
            </div>
          </Card>
          
        </div>
      )}


      {/* Toolsets without saved widgets: launch cards for every tool */}
      {toolset && !showSaved && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm  uppercase tracking-wider text-muted-foreground m-0">Tools</h2>
            {toolset.status === 'dev' && (
              <p className="text-xs text-muted-foreground m-0">
                This toolset is still in development. Saved projects will appear here once it launches.
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolset.tools.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <Link key={tool.id} href={tool.path} className="no-underline group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Card className="border-border bg-card shadow-xs group-hover:border-primary/50 transition-all p-5 flex flex-row items-start gap-4 h-full">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <ToolIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <h3 className=" text-sm text-foreground m-0">{tool.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed m-0">{tool.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" aria-hidden="true" />
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Launch / Create New Widgets Section (StreamTools hub only) */}
      {toolset?.id === 'broadcast' && !activeTool && (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm  uppercase tracking-wider text-muted-foreground m-0">
            Create New Broadcast Widget
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Clock Widget Card */}
          <Card className="border-border bg-card shadow-xs hover:border-primary/50 transition-all flex flex-col p-4">
            <div aria-hidden="true" className="preview-window-container aspect-video mb-3.5 rounded-md overflow-hidden flex items-center justify-center">
              <div className="font-mono text-2xl text-amber-500 font-bold">
                12:34
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className=" text-sm text-foreground">Clock Widget</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1">
                Digital stream clock with timezones, seconds, dates, and glowing neon FX.
              </p>
              <Button asChild size="sm" className="w-full mt-auto">
                <Link href="/clock">Launch Clock Studio</Link>
              </Button>
            </div>
          </Card>

          {/* Timer Widget Card */}
          <Card className="border-border bg-card shadow-xs hover:border-primary/50 transition-all flex flex-col p-4">
            <div aria-hidden="true" className="preview-window-container aspect-video mb-3.5 rounded-md flex items-center justify-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg width="64" height="64" className="absolute top-0 left-0">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" className="text-border" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="175" strokeDashoffset="42" strokeLinecap="round" transform="rotate(-90 32 32)" />
                </svg>
                <span className="text-sm font-bold text-foreground">4:47</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-primary" />
                <h3 className=" text-sm text-foreground">Timer Widget</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1">
                Countdown timer and stopwatch with SVG progress ring and chime alarms.
              </p>
              <Button asChild size="sm" className="w-full mt-auto">
                <Link href="/timer">Launch Timer Studio</Link>
              </Button>
            </div>
          </Card>

          {/* Chyron Builder Card */}
          <Card className="border-border bg-card shadow-xs hover:border-primary/50 transition-all flex flex-col p-4">
            <div aria-hidden="true" className="preview-window-container aspect-video mb-3.5 rounded-md flex flex-col justify-end items-stretch overflow-hidden">
              <div className="bg-[#1a1a2e] w-full border-l-4 border-red-500 px-2 py-1 flex items-center justify-between">
                <span className="text-white text-[9px] font-extrabold tracking-wide">BREAKING NEWS</span>
                <span className="text-white text-[8px] font-mono bg-red-600 px-1 py-0.5 rounded font-bold">LIVE</span>
              </div>
              <div className="bg-[#0f172a] w-full border-t-2 border-red-500 px-2 py-0.5 overflow-hidden">
                <span className="text-white text-[8px] font-semibold whitespace-nowrap">SCROLLING TICKER TEXT ★</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-primary" />
                <h3 className=" text-sm text-foreground">Chyron Builder</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1">
                Broadcast lower thirds with headlines, logo bug, clock, and scrolling crawl.
              </p>
              <Button asChild size="sm" className="w-full mt-auto">
                <Link href="/crawl">Launch Chyron Studio</Link>
              </Button>
            </div>
          </Card>

          {/* Screen Sets Card */}
          <Card className="border-border bg-card shadow-xs hover:border-primary/50 transition-all flex flex-col p-4">
            <div aria-hidden="true" className="preview-window-container aspect-video mb-3.5 rounded-md flex items-center justify-center">
              <div className="text-center">
                <div className="text-base font-extrabold text-blue-500 uppercase leading-tight">STARTING SOON</div>
                <div className="text-sm text-muted-foreground mt-0.5">Stream begins shortly...</div>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary" />
                <h3 className=" text-sm text-foreground">Screen Sets</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1">
                Full-screen Starting Soon, BRB, and Goodbye overlays with countdowns.
              </p>
              <Button asChild size="sm" className="w-full mt-auto">
                <Link href="/screen">Launch Screen Studio</Link>
              </Button>
            </div>
          </Card>

        </div>
      </div>
      )}

      {/* Saved Widgets Section */}
      {showSaved && (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm  uppercase tracking-wider text-muted-foreground m-0">
              {activeTool ? `Saved ${activeTool.name}s` : toolset ? 'Saved Broadcast Widgets' : 'Your Saved Widgets'} ({visibleList.length})
            </h2>
            {session && (
              <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                Synced to Cloud
              </Badge>
            )}
          </div>

          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={deleteSelected} className="gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="p-8 text-center border border-border rounded-xl bg-card">
            <p className="text-sm text-muted-foreground m-0">Loading your saved widgets...</p>
          </div>
        ) : !session ? (
          <Card className="text-center py-12 px-6 border-dashed border-border bg-card">
            <p className="text-base font-semibold text-foreground mb-1">Sign in to view and save your broadcast widgets</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              When signed in, your custom widgets are securely synced with cloud backup, drag-and-drop ordering, and instant OBS browser source URLs.
            </p>
            <Button asChild>
              <Link href="/auth">Sign In or Create Account</Link>
            </Button>
          </Card>
        ) : visibleList.length === 0 ? (
          <Card className="text-center py-12 px-6 border-dashed border-border bg-card">
            <p className="text-base font-semibold text-foreground mb-1">No saved widgets yet</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Select any of the creator studios above to configure your custom broadcast graphics and save them here.
            </p>
            <Button asChild variant="outline">
              <Link href={activeTool?.path ?? '/crawl'}>{activeTool ? `Create Your First ${activeTool.name}` : 'Create Your First Chyron'}</Link>
            </Button>
          </Card>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={visibleList.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-3.5">
                {visibleList.map((item) => (
                  <SortableWidgetCard 
                    key={item.id} 
                    item={item} 
                    copyUrl={copyUrl} 
                    copySuccess={copySuccess} 
                    isSelected={selectedIds.includes(item.id)}
                    onToggleSelect={toggleSelect}
                    onDelete={deleteSingle}
                    time={time}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted-foreground">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
