import re

with open('temp_account.tsx', 'r') as f:
    acc_content = f.read()

with open('src/app/(app)/dashboard/page.tsx.bak', 'r') as f:
    dash_content = f.read()

# Extract ThemeOption, THEME_OPTIONS, and ThemeCard from account
theme_match = re.search(r'(export interface ThemeOption.*?)(function AccountContent)', acc_content, flags=re.DOTALL)
theme_code = theme_match.group(1) if theme_match else ""

# Extract MediaLibrary import
if "import { MediaLibrary } from" not in dash_content:
    dash_content = dash_content.replace(
        "import { Suspense, useEffect, useState } from 'react';",
        "import { Suspense, useEffect, useState } from 'react';\nimport { MediaLibrary } from '@/components/media/MediaLibrary';\nimport { Input } from '@/components/ui/input';\nimport { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';\nimport { User, ShieldCheck } from 'lucide-react';\nimport { ThemeMode, VALID_THEMES, DEFAULT_THEME } from '@/app/ThemeProvider';"
    )

# Inject Theme options before DashboardContent
dash_content = dash_content.replace("function DashboardContent() {", theme_code + "\nfunction DashboardContent() {")

# Extract Profile State from AccountContent
profile_state = """  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [theme, setTheme] = useState<ThemeMode>(DEFAULT_THEME);
  const [userId, setUserId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);"""

# Add to DashboardContent
dash_content = dash_content.replace(
  "const [selectedIds, setSelectedIds] = useState<string[]>([]);",
  "const [selectedIds, setSelectedIds] = useState<string[]>([]);\n" + profile_state
)

# Extract Profile load logic
profile_load = """
      if (session) {
        setUserId(session.user.id);
        setEmail(session.user.email || '');
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
"""
dash_content = dash_content.replace("fetchConfigs(session.user.id);", "fetchConfigs(session.user.id);\n" + profile_load)

# Add profile update/upload logic
profile_funcs = """
  const handleUpdateProfile = async () => {
    if (!userId) return;
    setSavingProfile(true);
    
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
    setSavingProfile(false);
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSavingProfile(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
    } catch (error: any) {
      toast.error('Error uploading avatar: ' + error.message);
    } finally {
      setSavingProfile(false);
    }
  };
"""
dash_content = dash_content.replace("const fetchConfigs = async (userId: string) => {", profile_funcs + "\n  const fetchConfigs = async (userId: string) => {")

with open('src/app/(app)/dashboard/page.tsx', 'w') as f:
    f.write(dash_content)

