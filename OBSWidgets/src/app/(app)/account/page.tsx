'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter,  } from 'next/navigation';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, User, Sliders, Check, ShieldCheck, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeMode, VALID_THEMES, DEFAULT_THEME } from '@/app/ThemeProvider';
import MediaLibrary from '@/components/media/MediaLibrary';

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

import { Suspense } from 'react';


function ThemeCard({ opt, theme, setTheme }: { opt: ThemeOption, theme: ThemeMode, setTheme: (t: ThemeMode) => void }) {
  const isSelected = theme === opt.id;
  return (
    <Card 
      onClick={() => {
        setTheme(opt.id);
        document.documentElement.setAttribute('data-theme', opt.id);
        localStorage.setItem('theme', opt.id);
        window.dispatchEvent(new Event('theme-updated'));
      }}
      className={cn(
        "col-span-1 md:col-span-1 p-0 cursor-pointer overflow-hidden relative flex flex-col transition-all group",
        isSelected
          ? "border-primary ring-2 ring-primary/25 bg-card shadow-sm"
          : "border-border bg-card hover:border-primary/40 hover:shadow-xs"
      )}
    >
      <div className="w-full h-10 flex items-center px-3 border-b border-black/10 dark:border-white/10" style={{ backgroundColor: opt.headerBg }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opt.accentColor }} />
      </div>
      <div className="p-3 flex flex-col flex-1 justify-center items-center text-center" style={{ backgroundColor: opt.canvasBg }}>
        <span className="font-bold text-[11px] leading-tight mb-0.5" style={{ color: opt.headerBg }}>
          {opt.name}
        </span>
        <span className="text-[9px] uppercase font-bold opacity-70" style={{ color: opt.headerBg }}>
          {opt.badge}
        </span>
      </div>
      {isSelected && (
        <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1 py-0.5 rounded-sm flex items-center shadow-md">
          <Check className="w-2.5 h-2.5" />
        </div>
      )}
    </Card>
  );
}

function AccountContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // searchParams and activeTab removed to consolidate preferences

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
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
      setEmail(session.user.email || '');

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
      <div className="mb-8 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Account & Media
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your public profile, theme preferences, and media assets.
          </p>
        </div>
        <Button 
          onClick={handleUpdate} 
          disabled={saving} 
          className="h-10 px-6 font-bold text-xs uppercase tracking-wider gap-2 shadow-xs shrink-0"
        >
          {saving ? 'Saving...' : 'Save Profile & Theme'}
        </Button>
      </div>

      {/* Bento Box Settings Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 auto-rows-[minmax(110px,auto)]">
        
        {/* 1. Avatar Block (Spans 2 rows on desktop) */}
        <Card className="col-span-2 md:col-span-1 md:row-span-2 border-border bg-card shadow-xs p-6 flex flex-col items-center justify-center gap-4 text-center">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-2 border-border shadow-xs transition-transform group-hover:scale-105">
              <AvatarImage src={avatarUrl} alt={username || 'User'} className="object-cover" />
              <AvatarFallback className="font-bold text-2xl bg-primary/10 text-primary">
                {username ? username.substring(0, 2).toUpperCase() : 'DJ'}
              </AvatarFallback>
            </Avatar>
            {/* Upload Overlay */}
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
              <input type="file" accept="image/*" onChange={uploadAvatar} disabled={saving} className="hidden" />
            </label>
          </div>
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-sm text-foreground">Profile Picture</h3>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">256x256 px Min</p>
          </div>
        </Card>

        {/* 2. Username Block */}
        <Card className="col-span-2 md:col-span-1 p-5 border-border bg-card shadow-xs flex flex-col justify-center">
          <label htmlFor="username" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Username
          </label>
          <Input 
            id="username"
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="DJ Name" 
            className="h-9 text-sm bg-background font-medium"
          />
        </Card>

        {/* 3. Theme 1 */}
        {THEME_OPTIONS.slice(0, 1).map(opt => (
          <ThemeCard key={opt.id} opt={opt} theme={theme} setTheme={setTheme} />
        ))}

        {/* 4. Theme 2 */}
        {THEME_OPTIONS.slice(1, 2).map(opt => (
          <ThemeCard key={opt.id} opt={opt} theme={theme} setTheme={setTheme} />
        ))}

        {/* 5. Email Block */}
        <Card className="col-span-2 md:col-span-1 p-5 border-border bg-card shadow-xs flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
               Registered Email
            </label>
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
          </div>
          <Input 
            value={email || 'No email associated'} 
            readOnly
            disabled
            className="h-9 text-sm bg-muted/30 text-muted-foreground cursor-not-allowed border-transparent"
          />
        </Card>

        {/* 6. Theme 3 */}
        {THEME_OPTIONS.slice(2, 3).map(opt => (
          <ThemeCard key={opt.id} opt={opt} theme={theme} setTheme={setTheme} />
        ))}

        {/* 7. Theme 4 */}
        {THEME_OPTIONS.slice(3, 4).map(opt => (
          <ThemeCard key={opt.id} opt={opt} theme={theme} setTheme={setTheme} />
        ))}
      </div>

      {/* Media Library */}
      <div className="flex-1 min-h-[600px] flex flex-col border border-border rounded-xl shadow-xs overflow-hidden bg-background">
        <MediaLibrary />
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading...</div>}>
      <AccountContent />
    </Suspense>
  );
}
