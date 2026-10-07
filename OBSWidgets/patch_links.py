import os

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

# Add the Hosting & Setup Links Card
hosting_card = """
            {/* Hosting & Setup Links Container */}
            <Card className="border-border bg-card shadow-sm p-6 flex flex-col gap-4">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/60 pb-3">
                <Share className="w-5 h-5 text-primary" />
                Hosting Providers
              </h2>
              <p className="text-xs text-muted-foreground mb-1">
                We strongly recommend hosting your podcast on either Substack or Spotify for Creators.
              </p>
              
              <div className="flex flex-col gap-3">
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
              </div>
            </Card>
"""

# Insert it before the Course List & Checkoff Container
target = "{/* Course List & Checkoff Container */}"
content = content.replace(target, hosting_card + "\n            " + target)

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)
