import os

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

target = """              <div className="flex flex-col gap-3">
                <a href="https://substack.com/podcasts" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40 transition-colors group">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-foreground">Substack (Recommended)</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Best for newsletters & paid subs</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
                
                <a href="https://creators.spotify.com/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40 transition-colors group">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-foreground">Spotify for Creators</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Best for video & Q&A features</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              </div>"""

replacement = """              <div className="flex flex-col gap-3">
                <div className="flex flex-col p-3 rounded-lg border border-border bg-muted/10 gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-foreground">Substack (Recommended)</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Best for newsletters & paid subs</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 pt-2 border-t border-border/50">
                    <a href="https://substack.com/podcasts" target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Dashboard</a>
                    <a href="https://support.substack.com/hc/en-us/articles/360037489572-How-do-I-start-a-podcast-on-Substack-" target="_blank" rel="noreferrer" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Setup Guide</a>
                  </div>
                </div>
                
                <div className="flex flex-col p-3 rounded-lg border border-border bg-muted/10 gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-foreground">Spotify for Creators</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Best for video & Q&A features</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 pt-2 border-t border-border/50">
                    <a href="https://creators.spotify.com/" target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Dashboard</a>
                    <a href="https://support.spotify.com/us/creators/" target="_blank" rel="noreferrer" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Help Center</a>
                  </div>
                </div>
              </div>"""

content = content.replace(target, replacement)

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)

