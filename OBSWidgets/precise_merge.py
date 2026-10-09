import re

with open('src/app/(app)/dashboard/page.tsx', 'r') as f:
    content = f.read()

# 1. Imports
imports = """
import MediaLibrary from '@/components/media/MediaLibrary';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ShieldCheck } from 'lucide-react';
import { ThemeMode, VALID_THEMES, DEFAULT_THEME } from '@/app/ThemeProvider';
"""
content = content.replace("import Link from 'next/link';", "import Link from 'next/link';" + imports)

# 2. Extract Theme options from temp_account.tsx
with open('temp_account.tsx', 'r') as f:
    acc_content = f.read()
start = acc_content.find("export interface ThemeOption")
end = acc_content.find("function AccountContent()")
theme_code = acc_content[start:end]

content = content.replace("function DashboardContent() {", theme_code + "\nfunction DashboardContent() {")

# 3. State
profile_state = """  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [theme, setTheme] = useState<ThemeMode>(DEFAULT_THEME);
  const [userId, setUserId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);"""

content = content.replace(
  "const [selectedIds, setSelectedIds] = useState<string[]>([]);",
  "const [selectedIds, setSelectedIds] = useState<string[]>([]);\n" + profile_state
)

# 4. Save and Load logic
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
content = content.replace("fetchConfigs(session.user.id);", "fetchConfigs(session.user.id);\n" + profile_load)

profile_funcs = """
  const handleUpdateProfile = async () => {
    if (!userId) return;
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').upsert({ id: userId, username, avatar_url: avatarUrl, theme, updated_at: new Date().toISOString() });
    if (error) { toast.error("Error saving profile: " + error.message); } 
    else { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); window.dispatchEvent(new Event('theme-updated')); toast.success("Preferences saved successfully!"); }
    setSavingProfile(false);
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
"""
content = content.replace("const fetchConfigs = async (userId: string) => {", profile_funcs + "\n  const fetchConfigs = async (userId: string) => {")


# 5. UI Additions
header_button = """
        {!toolset && userId && (
          <Button onClick={handleUpdateProfile} disabled={savingProfile} className="h-9 px-6 font-bold text-xs uppercase tracking-wider shadow-xs shrink-0 mt-4 md:mt-0">
            {savingProfile ? 'Saving...' : 'Save Profile & Theme'}
          </Button>
        )}
      </div>"""
content = content.replace("</div>\n\n        {toolset && (activeTool || toolset.tools.length === 1)", header_button + "\n\n        {toolset && (activeTool || toolset.tools.length === 1)")


account_ui = """
      {/* Account & Themes Section (Only on Overview) */}
      {!toolset && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
          {/* Profile Settings */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <Card className="border-border bg-card shadow-xs p-6 flex flex-col items-center justify-center gap-4 text-center">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-2 border-border shadow-xs transition-transform group-hover:scale-105">
                  <AvatarImage src={avatarUrl} alt={username || 'User'} className="object-cover" />
                  <AvatarFallback className="font-bold text-2xl bg-primary/10 text-primary">
                    {username ? username.substring(0, 2).toUpperCase() : 'DJ'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                  <input type="file" accept="image/*" onChange={uploadAvatar} disabled={savingProfile} className="hidden" />
                </label>
              </div>
              <div className="flex flex-col items-center">
                <h3 className=" text-sm text-foreground">Profile Picture</h3>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">256x256 px Min</p>
              </div>
            </Card>
            <Card className="p-5 border-border bg-card shadow-xs flex flex-col justify-center">
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
            <Card className="p-5 border-border bg-card shadow-xs flex flex-col justify-center">
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
          </div>

          {/* Theme Settings */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-min">
              {THEME_OPTIONS.map(opt => (
                <ThemeCard key={opt.id} opt={opt} theme={theme} setTheme={setTheme} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overview: one card per toolset */}"""

content = content.replace("{/* Overview: one card per toolset */}", account_ui)


media_ui = """
      {/* Global Media Library (Only on Overview) */}
      {!toolset && (
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Global Media Library</h2>
          <div className="min-h-[500px] flex flex-col border border-border rounded-xl shadow-xs overflow-hidden bg-background">
            <MediaLibrary />
          </div>
        </div>
      )}

      {/* Toolsets without saved widgets: launch cards for every tool */}"""

content = content.replace("{/* Toolsets without saved widgets: launch cards for every tool */}", media_ui)

with open('src/app/(app)/dashboard/page.tsx', 'w') as f:
    f.write(content)

