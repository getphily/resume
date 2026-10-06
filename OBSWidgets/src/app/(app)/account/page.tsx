'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, User, Sliders, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeMode, VALID_THEMES, DEFAULT_THEME } from '@/app/ThemeProvider';

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
    palette: ['#0f172a', '#ffffff', '#4f46e5'],
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
    palette: ['#1c1917', '#fefefe', '#ea580c'],
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
    palette: ['#1e293b', '#fcf5f7', '#fb7185'],
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
    palette: ['#0f172a', '#fbfdf8', '#22c55e'],
  },
];

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'PREFS' | 'PROFILE'>('PREFS');

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [theme, setTheme] = useState<ThemeMode>(DEFAULT_THEME);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      
      setUserId(session.user.id);

      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, theme')
        .eq('id', session.user.id)
        .single();
        
      if (data) {
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url || '');
        if (data.theme && VALID_THEMES.includes(data.theme as ThemeMode)) {
          setTheme(data.theme as ThemeMode);
        } else {
          setTheme(DEFAULT_THEME);
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  const handleUpdate = async () => {
    if (!userId) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username,
        avatar_url: avatarUrl,
        theme,
        updated_at: new Date().toISOString()
      });

    if (error) {
      toast.error("Error saving profile: " + error.message);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      window.dispatchEvent(new Event('theme-updated'));
      toast.success("Preferences saved successfully!");
    }
    setSaving(false);
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSaving(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      toast.error('Error uploading avatar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 md:p-12 max-w-6xl mx-auto w-full">
        <p className="text-sm text-muted-foreground">Loading account...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full flex flex-col">
      
      {/* Top Header */}
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Account & Preferences
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Customize your studio appearance, color theme, and public DJ broadcast identity.
            </p>
          </div>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex border-b border-border gap-8 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab('PREFS')}
          className={cn(
            "pb-3.5 text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer border-b-2",
            activeTab === 'PREFS'
              ? "text-primary border-primary font-bold"
              : "text-muted-foreground hover:text-foreground border-transparent"
          )}
        >
          <Sliders className="w-4 h-4" />
          <span>Appearance & Themes</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PROFILE')}
          className={cn(
            "pb-3.5 text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer border-b-2",
            activeTab === 'PROFILE'
              ? "text-primary border-primary font-bold"
              : "text-muted-foreground hover:text-foreground border-transparent"
          )}
        >
          <User className="w-4 h-4" />
          <span>Public Profile</span>
        </button>
      </div>

      {/* TAB 1: Preferences & Themes */}
      {activeTab === 'PREFS' && (
        <div className="flex flex-col gap-8">
          
          <Card className="border-border bg-card shadow-xs p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6 pb-5 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Studio Interface Theme
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select a curated design specification for your workspace. Theme applies live on selection.
                </p>
              </div>
              <span className="text-sm font-semibold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md w-fit">
                Instant Live Preview
              </span>
            </div>

            {/* Responsive 2x2 Grid of Themes with Visual Mini Mockups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {THEME_OPTIONS.map((opt) => {
                const isSelected = theme === opt.id;

                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      const nextTheme = opt.id;
                      setTheme(nextTheme);
                      document.documentElement.setAttribute('data-theme', nextTheme);
                      localStorage.setItem('theme', nextTheme);
                      window.dispatchEvent(new Event('theme-updated'));
                    }}
                    className={cn(
                      "cursor-pointer rounded-xl border transition-all flex flex-col overflow-hidden select-none group",
                      isSelected
                        ? "border-primary ring-2 ring-primary/25 bg-card shadow-sm"
                        : "border-border bg-card hover:border-primary/40 hover:shadow-xs"
                    )}
                  >
                    {/* Visual Miniature Dashboard Mockup */}
                    <div 
                      className="w-full h-28 overflow-hidden flex flex-col border-b border-border relative transition-transform duration-300 group-hover:scale-[1.01]"
                      style={{ backgroundColor: opt.canvasBg }}
                    >
                      {/* Mini Navbar */}
                      <div 
                        className="h-6 px-3 flex items-center justify-between shrink-0 border-b border-black/10 dark:border-white/10"
                        style={{ backgroundColor: opt.headerBg }}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.accentColor }} />
                          <div className="w-10 h-1.5 rounded-full bg-white/40" />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                          <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                        </div>
                      </div>

                      {/* Mini Content Area */}
                      <div className="flex-1 p-2.5 flex gap-2">
                        {/* Mini sidebar */}
                        <div className="w-10 rounded-xs bg-black/10 dark:bg-white/10 flex flex-col gap-1.5 p-1 shrink-0">
                          <div className="w-full h-1.5 rounded-xs" style={{ backgroundColor: opt.accentColor }} />
                          <div className="w-full h-1.5 rounded-xs bg-white/20" />
                          <div className="w-full h-1.5 rounded-xs bg-white/20" />
                        </div>
                        
                        {/* Mini panels */}
                        <div className="flex-1 flex gap-2">
                          <div 
                            className="flex-1 rounded-xs p-2 flex flex-col justify-between shadow-2xs border border-black/5 dark:border-white/5"
                            style={{ backgroundColor: opt.cardBg }}
                          >
                            <div className="w-12 h-2 rounded-xs" style={{ backgroundColor: opt.accentColor }} />
                            <div className="w-full h-1.5 rounded-xs bg-black/10 dark:bg-white/10" />
                            <div className="w-16 h-1.5 rounded-xs bg-black/10 dark:bg-white/10" />
                          </div>
                          <div 
                            className="w-14 rounded-xs p-2 flex flex-col justify-between shadow-2xs border border-black/5 dark:border-white/5"
                            style={{ backgroundColor: opt.cardBg }}
                          >
                            <div className="w-6 h-2 rounded-xs bg-black/15 dark:bg-white/15" />
                            <div className="w-full h-1.5 rounded-xs" style={{ backgroundColor: opt.accentColor }} />
                          </div>
                        </div>
                      </div>

                      {/* Active Checkmark Pill in Mockup */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-sm font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                          <Check className="w-3 h-3" /> Selected
                        </div>
                      )}
                    </div>

                    {/* Theme Details Footer */}
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {opt.name}
                        </span>
                        <Badge variant={isSelected ? "default" : "secondary"} className="text-sm px-2 py-1 font-semibold text-center">
                          {opt.badge}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                        {opt.description}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                          Key Colors:
                        </span>
                        <div className="flex gap-1.5 items-center">
                          {opt.palette.map((c, i) => (
                            <div
                              key={i}
                              title={c}
                              className="w-4 h-4 rounded-full border border-black/15 dark:border-white/15 shadow-2xs"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-border flex justify-end">
              <Button 
                onClick={handleUpdate} 
                disabled={saving} 
                className="h-10 px-6 font-bold text-xs uppercase tracking-wider gap-2 shadow-xs"
              >
                {saving ? 'Saving...' : 'Save Theme Preferences'}
              </Button>
            </div>
          </Card>

        </div>
      )}

      {/* TAB 2: Public Profile */}
      {activeTab === 'PROFILE' && (
        <Card className="border-border bg-card shadow-xs p-6 md:p-8">
          <div className="mb-6 pb-5 border-b border-border">
            <h2 className="text-base font-bold text-foreground">
              Public Profile Information
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your display identity and avatar across your stream widgets.
            </p>
          </div>

          <div className="flex flex-col gap-6 max-w-xl">
            <div className="flex items-center gap-5">
              <Avatar className="w-20 h-20 border-2 border-border shadow-xs">
                <AvatarImage src={avatarUrl} alt={username || 'User'} />
                <AvatarFallback className="font-bold text-xl bg-primary/10 text-primary">
                  {username ? username.substring(0, 2).toUpperCase() : 'DJ'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Upload Avatar Photo
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={uploadAvatar} 
                  disabled={saving} 
                  className="text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  Recommended: Square JPG or PNG, at least 256×256px.
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                DJ / Channel Name
              </label>
              <Input 
                id="username"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="DJ Name / Username" 
                className="h-10 text-sm max-w-md bg-background"
              />
              <span className="text-sm text-muted-foreground">
                Displayed in broadcast headers and widget credit overlays.
              </span>
            </div>

            <div className="pt-6 border-t border-border mt-4">
              <Button 
                onClick={handleUpdate} 
                disabled={saving} 
                className="h-10 px-6 font-bold text-xs uppercase tracking-wider gap-2 shadow-xs"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
}
