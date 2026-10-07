import os

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

# Add substackHandle to PodcastData
target_interface = """interface PodcastData {
  title: string;
  host: string;
  email: string;
  description: string;
  primaryCategory: string;
  secondaryCategory: string;
  tertiaryCategory: string;
  language: string;
  explicit: string;
  artworkUrl: string;
  rssFeedUrl: string;
  directoryStatus: {"""

replacement_interface = """interface PodcastData {
  title: string;
  host: string;
  email: string;
  description: string;
  primaryCategory: string;
  secondaryCategory: string;
  tertiaryCategory: string;
  language: string;
  explicit: string;
  artworkUrl: string;
  rssFeedUrl: string;
  substackHandle: string;
  directoryStatus: {"""

content = content.replace(target_interface, replacement_interface)

# Add substackHandle to defaultData
target_default = """const defaultData: PodcastData = {
  title: 'Untitled Show',
  host: 'Unknown Host',
  email: 'host@example.com',
  description: 'Welcome to our brand new podcast. In this show we will be exploring fascinating topics with amazing guests. Subscribe to follow along!',
  primaryCategory: '',
  secondaryCategory: '',
  tertiaryCategory: '',
  language: 'English',
  explicit: 'Clean',
  artworkUrl: '',
  rssFeedUrl: '',
  directoryStatus: {"""

replacement_default = """const defaultData: PodcastData = {
  title: 'Untitled Show',
  host: 'Unknown Host',
  email: 'host@example.com',
  description: 'Welcome to our brand new podcast. In this show we will be exploring fascinating topics with amazing guests. Subscribe to follow along!',
  primaryCategory: '',
  secondaryCategory: '',
  tertiaryCategory: '',
  language: 'English',
  explicit: 'Clean',
  artworkUrl: '',
  rssFeedUrl: '',
  substackHandle: '',
  directoryStatus: {"""

content = content.replace(target_default, replacement_default)

# Add the UI field in the Substack box
target_ui = """                <div className="flex flex-col p-3 rounded-lg border border-border bg-muted/10 gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-foreground">Substack (Recommended)</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Best for newsletters & paid subs</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-1 pt-2 border-t border-border/50">"""

replacement_ui = """                <div className="flex flex-col p-3 rounded-lg border border-border bg-muted/10 gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-foreground">Substack (Recommended)</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Best for newsletters & paid subs</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 mt-1">
                    <FieldLabel text="Substack Handle" complete={!!data.substackHandle} />
                    <EditableField 
                      value={data.substackHandle}
                      onSave={(v) => updateData({ substackHandle: v })}
                      status={data.substackHandle ? 'complete' : 'incomplete'}
                      className="font-mono text-sm"
                      placeholder="e.g. yourhandle or @yourhandle"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-1 pt-3 border-t border-border/50">"""

content = content.replace(target_ui, replacement_ui)

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)
