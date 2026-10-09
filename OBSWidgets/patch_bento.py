with open('src/app/(app)/dashboard/page.tsx', 'r') as f:
    content = f.read()

# Find the start of the current !toolset blocks
start_token = "{/* Account & Themes Section (Only on Overview) */}"
# Find the end of the last !toolset block (which is Media Library)
end_token = "{/* Toolsets without saved widgets: launch cards for every tool */}"

start_idx = content.find(start_token)
end_idx = content.find(end_token)

bento_html = """
      {/* 
        ====================================================
        BENTO BOX DASHBOARD OVERVIEW 
        ====================================================
      */}
      {!toolset && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10">
          
          {/* --- BENTO ITEM: PROFILE (col-span-3) --- */}
          <Card className="md:col-span-5 lg:col-span-3 border-border bg-card shadow-xs p-6 flex flex-col gap-6 relative overflow-hidden group">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground absolute top-6 left-6 z-10">Profile</h3>
            
            <div className="flex flex-col items-center gap-4 text-center mt-6">
              <div className="relative group/avatar">
                <Avatar className="w-24 h-24 border-4 border-background shadow-sm transition-transform group-hover/avatar:scale-105">
                  <AvatarImage src={avatarUrl} alt={username || 'User'} className="object-cover" />
                  <AvatarFallback className="font-bold text-3xl bg-primary/10 text-primary">
                    {username ? username.substring(0, 2).toUpperCase() : 'DJ'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
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
                <label htmlFor="username" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pl-1">
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pl-1">
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
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Platform Theme</h3>
               <Badge variant="outline" className="text-[10px] font-normal border-primary/20 bg-primary/5 text-primary">{THEME_OPTIONS.length} Themes</Badge>
             </div>
             
             {/* Custom scrollable grid to fit inside the bento nicely */}
             <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto max-h-[380px] pr-2 custom-scrollbar -mr-2 pb-2">
                {THEME_OPTIONS.map(opt => (
                  <ThemeCard key={opt.id} opt={opt} theme={theme} setTheme={setTheme} />
                ))}
             </div>
          </Card>

          {/* --- BENTO ITEM: LINKED ACCOUNTS (col-span-3) --- */}
          <Card className="md:col-span-12 lg:col-span-3 border-border bg-card shadow-xs p-6 flex flex-col gap-5">
             <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Connected Services</h3>
             
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{ts.tools.length} Sub-tools</span>
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
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Global Media Library</h3>
              <Badge variant="outline" className="text-[10px] font-normal">Cross-Platform Sync</Badge>
            </div>
            <div className="flex-1 relative bg-background/50">
              <MediaLibrary />
            </div>
          </Card>
          
        </div>
      )}

"""

content = content[:start_idx] + bento_html + "\n      " + content[end_idx:]

with open('src/app/(app)/dashboard/page.tsx', 'w') as f:
    f.write(content)

