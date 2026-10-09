import re

with open('src/app/(app)/account/page.tsx', 'r') as f:
    content = f.read()

# Replace the "Settings Grid" down to Media Library
match = re.search(r'      \{/\* Settings Grid \*/\}.*?(?=      \{/\* Media Library \*/\})', content, re.DOTALL)

new_bento = """      {/* Bento Box Settings Grid */}
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
      </div>\n\n"""

if match:
    content = content[:match.start()] + new_bento + content[match.end():]
    with open('src/app/(app)/account/page.tsx', 'w') as f:
        f.write(content)
    print("Replaced with Bento grid.")
else:
    print("Could not match the grid section.")
