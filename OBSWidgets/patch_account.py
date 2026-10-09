import re

with open('src/app/(app)/account/page.tsx', 'r') as f:
    content = f.read()

new_themes = """  {
    id: 'japan-blues',
    name: 'Japan Blues',
    badge: 'Cool & Calm',
    description: 'Soft blue accents with a warm off-white canvas.',
    headerBg: '#1e293b',
    canvasBg: '#faf9f5',
    cardBg: '#faf9f5',
    accentColor: '#3b82f6',
    palette: ['#1e293b', '#faf9f5', '#3b82f6'],
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
    palette: ['#0f172a', '#ffffff', '#e11d48'],
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
    palette: ['#18181b', '#ffffff', '#ca8a04'],
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
    palette: ['#172554', '#ffffff', '#1d4ed8'],
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
    palette: ['#0f172a', '#ffffff', '#0ea5e9'],
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
    palette: ['#27272a', '#ffffff', '#d97757'],
  },"""

# Insert new themes into THEME_OPTIONS array
content = re.sub(r'(const THEME_OPTIONS: ThemeOption\[\] = \[.*?)(];)', r'\1' + new_themes + r'\n\2', content, flags=re.DOTALL)

# Replace the Bento Box section entirely
old_bento = re.search(r'\{/\* Bento Box Settings Grid \*/\}.*?\{/\* Media Library \*/\}', content, flags=re.DOTALL)
if old_bento:
    new_bento = """{/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Profile Settings */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Avatar Block */}
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
                <input type="file" accept="image/*" onChange={uploadAvatar} disabled={saving} className="hidden" />
              </label>
            </div>
            <div className="flex flex-col items-center">
              <h3 className=" text-sm text-foreground">Profile Picture</h3>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">256x256 px Min</p>
            </div>
          </Card>

          {/* Username Block */}
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

          {/* Email Block */}
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

      {/* Media Library */}"""
    content = content.replace(old_bento.group(0), new_bento)

with open('src/app/(app)/account/page.tsx', 'w') as f:
    f.write(content)
