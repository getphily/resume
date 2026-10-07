import os

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

target = """                  <div className="flex items-center gap-3 mt-1 pt-2 border-t border-border/50">
                    <a href="https://substack.com/podcasts" target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Dashboard</a>
                    <a href="https://support.substack.com/hc/en-us/articles/360037489572-How-do-I-start-a-podcast-on-Substack-" target="_blank" rel="noreferrer" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Setup Guide</a>
                  </div>"""

replacement = """                  <div className="flex items-center gap-3 mt-1 pt-2 border-t border-border/50">
                    <a href="https://substack.com/signup" target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Sign Up</a>
                    <a href="https://substack.com/podcasts" target="_blank" rel="noreferrer" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Dashboard</a>
                    <a href="https://support.substack.com/hc/en-us/articles/360037489572-How-do-I-start-a-podcast-on-Substack-" target="_blank" rel="noreferrer" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Setup Guide</a>
                  </div>"""
content = content.replace(target, replacement)

target2 = """                  <div className="flex items-center gap-3 mt-1 pt-2 border-t border-border/50">
                    <a href="https://creators.spotify.com/" target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Dashboard</a>
                    <a href="https://support.spotify.com/us/creators/" target="_blank" rel="noreferrer" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Help Center</a>
                  </div>"""

replacement2 = """                  <div className="flex items-center gap-3 mt-1 pt-2 border-t border-border/50">
                    <a href="https://creators.spotify.com/signup" target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Sign Up</a>
                    <a href="https://creators.spotify.com/" target="_blank" rel="noreferrer" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Dashboard</a>
                    <a href="https://support.spotify.com/us/creators/" target="_blank" rel="noreferrer" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Help Center</a>
                  </div>"""
content = content.replace(target2, replacement2)

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)
