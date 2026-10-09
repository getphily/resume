import re

with open('src/app/(app)/account/page.tsx', 'r') as f:
    content = f.read()

# Find the return ( block in AccountContent
match = re.search(r'  return \(\n    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full flex flex-col">.*?\n  \);\n}', content, re.DOTALL)

if match:
    new_render = """  return (
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

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column: Profile */}
        <Card className="col-span-1 lg:col-span-4 border-border bg-card shadow-xs p-6 flex flex-col">
          <h2 className="text-sm font-bold text-foreground mb-5 uppercase tracking-wider">
            Public Profile
          </h2>
          <div className="flex flex-col gap-5 flex-1">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-border shadow-xs">
                <AvatarImage src={avatarUrl} alt={username || 'User'} />
                <AvatarFallback className="font-bold text-lg bg-primary/10 text-primary">
                  {username ? username.substring(0, 2).toUpperCase() : 'DJ'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Avatar
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={uploadAvatar} 
                  disabled={saving} 
                  className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer w-full max-w-[200px]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Username
              </label>
              <Input 
                id="username"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Username" 
                className="h-9 text-sm bg-background"
              />
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center justify-between">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <Badge variant="outline" className="text-[10px] font-semibold border-border text-muted-foreground gap-1 py-0 px-1">
                  <ShieldCheck className="w-3 h-3 text-green-600 dark:text-green-400" />
                  Verified
                </Badge>
              </div>
              <Input 
                id="email"
                value={email || 'No email associated'} 
                readOnly
                disabled
                className="h-9 text-sm bg-muted/30 text-muted-foreground cursor-not-allowed select-all"
              />
            </div>
          </div>
        </Card>

        {/* Right Column: Themes */}
        <Card className="col-span-1 lg:col-span-8 border-border bg-card shadow-xs p-6 flex flex-col">
          <h2 className="text-sm font-bold text-foreground mb-5 uppercase tracking-wider">
            Appearance & Theme
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
                    "cursor-pointer rounded-lg border transition-all flex flex-col overflow-hidden select-none group relative",
                    isSelected
                      ? "border-primary ring-2 ring-primary/25 bg-card shadow-sm"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-xs"
                  )}
                >
                  {/* Minimal Header Mockup */}
                  <div 
                    className="w-full h-12 flex items-center px-3 border-b border-black/10 dark:border-white/10"
                    style={{ backgroundColor: opt.headerBg }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.accentColor }} />
                  </div>
                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1" style={{ backgroundColor: opt.canvasBg }}>
                    <span className="font-bold text-sm" style={{ color: opt.headerBg }}>
                      {opt.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold mt-1 opacity-70" style={{ color: opt.headerBg }}>
                      {opt.badge}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex items-center shadow-md">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Media Library */}
      <div className="flex-1 min-h-[600px] flex flex-col border border-border rounded-xl shadow-xs overflow-hidden bg-background">
        <MediaLibrary />
      </div>
    </div>
  );
}"""
    content = content[:match.start()] + new_render + content[match.end():]
    with open('src/app/(app)/account/page.tsx', 'w') as f:
        f.write(content)
    print("Replaced render block")
else:
    print("Could not find match")
