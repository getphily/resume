'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, User, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeMode, VALID_THEMES } from '@/app/ThemeProvider';

const THEME_OPTIONS = [
  {
    id: 'dark' as ThemeMode,
    name: 'Pioneer DJ Dark',
    badge: 'Standard',
    description: 'Chassis black & slate panels with vibrant indigo/amber accents for dark streaming booths.',
    palette: ['#0f172a', '#1e293b', '#6366f1'],
  },
  {
    id: 'light' as ThemeMode,
    name: 'Clean Light',
    badge: 'Standard',
    description: 'Minimalist daytime aesthetic with crisp off-white canvas and pure white panels.',
    palette: ['#f4f5f7', '#ffffff', '#4f46e5'],
  },
  {
    id: 'antd-light' as ThemeMode,
    name: 'Ant Design Pro (Light)',
    badge: 'Ant Design Pro',
    description: 'Enterprise light layout with signature #f0f2f5 canvas, Daybreak Blue (#1677ff) accent, and dark navy header.',
    palette: ['#001529', '#f0f2f5', '#1677ff'],
  },
  {
    id: 'antd-dark' as ThemeMode,
    name: 'Ant Design Pro (Dark)',
    badge: 'realDark',
    description: 'Enterprise realDark specification with deep #000000 layout, #141414 panels, and Daybreak Blue (#1677ff) accent.',
    palette: ['#000000', '#141414', '#1677ff'],
  },
];

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'PREFS'>('PROFILE');

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [theme, setTheme] = useState<ThemeMode>('dark');
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
          setTheme('dark');
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
      <div className="p-6 max-w-5xl mx-auto w-full">
        <p className="text-sm text-muted-foreground">Loading account...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
          Account Settings
        </h1>
      </div>

      <div className="flex gap-6 items-start flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <div className="flex md:flex-col gap-2 w-full md:w-60 shrink-0">
          <Button
            variant={activeTab === 'PROFILE' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('PROFILE')}
            className={cn(
              "w-full justify-start gap-2.5 h-11 text-xs font-semibold uppercase tracking-wider",
              activeTab === 'PROFILE' && "bg-primary/10 text-primary border-l-2 border-primary"
            )}
          >
            <User className="w-4 h-4" />
            <span>1. Public Profile</span>
          </Button>

          <Button
            variant={activeTab === 'PREFS' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('PREFS')}
            className={cn(
              "w-full justify-start gap-2.5 h-11 text-xs font-semibold uppercase tracking-wider",
              activeTab === 'PREFS' && "bg-primary/10 text-primary border-l-2 border-primary"
            )}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Preferences</span>
          </Button>
        </div>

        {/* Work Area Card */}
        <Card className="flex-1 w-full min-h-[420px] border-border bg-card shadow-sm p-6">
          <CardContent className="p-0 flex flex-col h-full">
            
            {activeTab === 'PROFILE' && (
              <div className="flex flex-col gap-6 flex-1">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Public Profile
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage your display identity across your stream widgets.</p>
                </div>
                
                <div className="flex items-center gap-5">
                  <Avatar className="w-16 h-16 border border-border">
                    <AvatarImage src={avatarUrl} alt={username || 'User'} />
                    <AvatarFallback className="font-bold text-lg bg-primary/10 text-primary">
                      {username ? username.substring(0, 2).toUpperCase() : 'DJ'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Upload Avatar
                    </label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={uploadAvatar} 
                      disabled={saving} 
                      className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-w-md">
                  <label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Username / DJ Name
                  </label>
                  <Input 
                    id="username"
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="DJ Name / Username" 
                    className="h-10 text-sm"
                  />
                </div>

                <div className="mt-auto pt-6 border-t border-border">
                  <Button onClick={handleUpdate} disabled={saving} className="w-full sm:w-auto h-10 px-6 font-semibold">
                    {saving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'PREFS' && (
              <div className="flex flex-col gap-6 flex-1">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Preferences
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Customize your workspace appearance and interface styling.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Website Theme
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Live preview on selection &bull; Save to persist across devices
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            "cursor-pointer p-4 rounded-lg border transition-all flex flex-col gap-2.5 select-none",
                            isSelected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-xs"
                              : "border-border bg-card hover:bg-muted/40"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-foreground">{opt.name}</span>
                            <Badge variant={isSelected ? "default" : "secondary"} className="text-[10px] px-2 py-0">
                              {opt.badge}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                            {opt.description}
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Palette:</span>
                            <div className="flex gap-1.5 items-center">
                              {opt.palette.map((c, i) => (
                                <div
                                  key={i}
                                  className="w-4 h-4 rounded-xs border border-black/10 dark:border-white/10"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-border">
                  <Button onClick={handleUpdate} disabled={saving} className="w-full sm:w-auto h-10 px-6 font-semibold">
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>

    </div>
  );
}
