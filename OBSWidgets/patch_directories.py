import os

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

# RSS feed URL field update
rss_target = """              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Master RSS Feed URL</span>
                <EditableField 
                  value={data.rssFeedUrl}
                  onSave={(v) => updateData({ rssFeedUrl: v })}
                  className="font-mono text-sm text-foreground bg-muted/40 border border-border/80 rounded-md p-3"
                  placeholder="https://feed.yourhost.com/rss"
                />
                <p className="text-xs text-muted-foreground mt-1">This is the link you will submit to all podcast directories.</p>
              </div>"""

rss_replacement = """              <div className="flex flex-col gap-2">
                <FieldLabel text="Master RSS Feed URL" complete={!!data.rssFeedUrl} />
                <EditableField 
                  value={data.rssFeedUrl}
                  onSave={(v) => updateData({ rssFeedUrl: v })}
                  status={data.rssFeedUrl ? 'complete' : 'incomplete'}
                  className="font-mono text-sm"
                  placeholder="https://feed.yourhost.com/rss"
                />
                <p className="text-xs text-muted-foreground mt-1">This is the link you will submit to all podcast directories.</p>
              </div>"""
content = content.replace(rss_target, rss_replacement)

# Directories update
dirs_target = """                    {[
                      { id: 'apple', label: 'Apple Podcasts', url: 'https://podcastsconnect.apple.com/' },
                      { id: 'spotify', label: 'Spotify for Creators', url: 'https://creators.spotify.com/' },
                      { id: 'youtube', label: 'YouTube Music', url: 'https://studio.youtube.com/' },
                      { id: 'amazon', label: 'Amazon Music', url: 'https://podcasters.amazon.com/' },
                      { id: 'iheart', label: 'iHeartRadio', url: 'https://podcasters.iheart.com/' },
                    ].map((dir) => (
                      <div key={dir.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background shadow-sm hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleDirectoryStatus(dir.id as keyof PodcastData['directoryStatus'])}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              data.directoryStatus[dir.id as keyof PodcastData['directoryStatus']] 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-input hover:border-primary'
                            }`}
                          >
                            {data.directoryStatus[dir.id as keyof PodcastData['directoryStatus']] && <Check className="w-3.5 h-3.5" />}
                          </button>
                          <span className="text-sm font-semibold text-foreground">{dir.label}</span>
                        </div>
                        <a href={dir.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title={`Submit to ${dir.label}`}>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}"""

dirs_replacement = """                    {[
                      { id: 'apple', label: 'Apple Podcasts', url: 'https://podcastsconnect.apple.com/' },
                      { id: 'spotify', label: 'Spotify for Creators', url: 'https://creators.spotify.com/' },
                      { id: 'youtube', label: 'YouTube Music', url: 'https://studio.youtube.com/' },
                      { id: 'amazon', label: 'Amazon Music', url: 'https://podcasters.amazon.com/' },
                      { id: 'iheart', label: 'iHeartRadio', url: 'https://podcasters.iheart.com/' },
                    ].map((dir) => {
                      const isComplete = data.directoryStatus[dir.id as keyof PodcastData['directoryStatus']];
                      return (
                        <div key={dir.id} className={cn(
                          "flex items-center justify-between p-3 rounded-lg border shadow-sm transition-all duration-300 relative",
                          isComplete 
                            ? "border-emerald-500/50 bg-emerald-500/5" 
                            : "border-red-500/30 bg-red-500/5"
                        )}>
                          {!isComplete && (
                            <div className="absolute -top-1.5 -right-1.5">
                              <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] items-center justify-center text-white font-bold">!</span>
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => toggleDirectoryStatus(dir.id as keyof PodcastData['directoryStatus'])}
                              className={cn(
                                "w-5 h-5 rounded-md border flex items-center justify-center transition-colors shadow-sm",
                                isComplete
                                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                                  : 'border-red-500/50 bg-background hover:bg-red-500/10'
                              )}
                            >
                              {isComplete && <Check className="w-3.5 h-3.5" />}
                            </button>
                            <span className={cn("text-sm font-semibold", isComplete ? "text-emerald-700 dark:text-emerald-400" : "text-foreground")}>{dir.label}</span>
                          </div>
                          <a href={dir.url} target="_blank" rel="noreferrer" className={cn("transition-colors", isComplete ? "text-emerald-600/70 hover:text-emerald-600" : "text-muted-foreground hover:text-primary")} title={`Submit to ${dir.label}`}>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )
                    })}"""

content = content.replace(dirs_target, dirs_replacement)

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)

