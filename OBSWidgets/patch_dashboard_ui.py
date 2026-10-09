import re

with open('src/app/(app)/dashboard/page.tsx', 'r') as f:
    content = f.read()

new_ui = """  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full flex flex-col gap-10">
      
      {/* Header */}
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <Badge variant="outline" className="mb-3 text-xs font-semibold text-primary/80 border-primary/20 bg-primary/5 uppercase tracking-wider gap-1.5">
            <LayoutDashboard className="w-3.5 h-3.5" /> Platform Dashboard
          </Badge>
          <h1 className="text-2xl md:text-3xl text-foreground">
            {activeTool ? `${activeTool.name} Dashboard` : toolset ? `${toolset.name} Dashboard` : 'User Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            {activeTool 
              ? `Manage your saved ${activeTool.name}s and overlays.`
              : toolset 
                ? toolset.tagline
                : 'Pick a toolset to open its dashboard, or manage your platform preferences and saved widgets.'}
          </p>
        </div>
        <Button onClick={handleUpdateProfile} disabled={savingProfile} className="h-10 px-6 font-bold text-xs uppercase tracking-wider gap-2 shadow-xs shrink-0">
          {savingProfile ? 'Saving...' : 'Save Profile & Theme'}
        </Button>
      </div>

      {/* Account & Themes Section (Only on Overview) */}
      {showSaved && !toolset && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

      {/* Toolsets Section (Only on Overview) */}
      {!toolset && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Your Toolsets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TOOLSETS.map(ts => (
              <Link key={ts.id} href={`/dashboard?set=${ts.id}`} className="block group">
                <Card className="p-6 border-border bg-card shadow-xs hover:border-primary/50 hover:shadow-md transition-all flex flex-col gap-4 h-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <ts.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className=" text-lg text-foreground truncate">{ts.name}</h3>
                        {ts.status === 'dev' && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-muted">In Development</Badge>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {ts.tagline}
                  </p>
                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>{ts.tools.length} tools</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Specific Toolset Sub-Tools */}
      {toolset && !activeTool && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Included Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolset.tools.map(tool => (
              <Card key={tool.id} className="border-border bg-card shadow-xs hover:border-primary/50 transition-all flex flex-col p-4">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <tool.icon className="w-4 h-4 text-primary" />
                    <h3 className=" text-sm text-foreground">{tool.name}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1">
                    {tool.desc}
                  </p>
                  <Button asChild size="sm" className="w-full mt-auto">
                    <Link href={toolset.id === 'broadcast' ? `/dashboard?set=broadcast&tool=${tool.id}` : tool.path}>Launch</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Global Media Library (Only on Overview) */}
      {!toolset && (
        <div className="flex-1 flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Global Media Library</h2>
          <div className="min-h-[500px] flex-1 flex flex-col border border-border rounded-xl shadow-xs overflow-hidden bg-background">
            <MediaLibrary />
          </div>
        </div>
      )}

      {/* Saved Widgets Section */}
      {showSaved && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground m-0">
                {activeTool ? `Saved ${activeTool.name}s` : toolset ? `Saved ${toolset.name} Widgets` : 'Your Saved Widgets'} ({visibleList.length})
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
}"""

# Replace the entire return block of DashboardContent
content = re.sub(r'  return \(\n    <div className="p-6 md:p-10.*?\n  \);\n}', new_ui, content, flags=re.DOTALL)

with open('src/app/(app)/dashboard/page.tsx', 'w') as f:
    f.write(content)
