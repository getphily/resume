const fs = require('fs');

let content = fs.readFileSync('src/components/StudioShell.tsx', 'utf8');

// Replace the Main Workspace Split
const oldWorkspace = `        {/* Main Workspace Split */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Right Canvas Area (Underneath on mobile, right side on desktop) */}
          <main className="flex-1 bg-muted/30 overflow-y-auto p-4 pb-24 lg:p-8 flex items-center justify-center relative min-h-[50vh]">
            <div className="w-full max-w-[1920px] aspect-video relative flex items-center justify-center">
              {previewCanvas}
            </div>
          </main>

          {/* Left Settings Panel (Sidebar on desktop, Bottom Drawer on mobile) */}
          <aside className={cn(
            "w-full lg:w-[350px] xl:w-[400px] shrink-0 border-t lg:border-t-0 lg:border-r lg:border-l-0 lg:order-first border-border bg-card overflow-y-auto flex flex-col z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:shadow-none transition-transform duration-300 ease-in-out",
            "fixed inset-x-0 bottom-0 h-[65vh] rounded-t-2xl lg:rounded-none lg:static lg:h-full",
            mobileSettingsOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0"
          )}>
            <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card z-50">
              <span className="font-bold text-sm">Editor Settings</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setMobileSettingsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 flex flex-col gap-6">
              {settingsPanel}
            </div>
          </aside>

          {/* Mobile FAB to open settings */}
          <div className={cn(
            "lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 transition-all duration-300",
            mobileSettingsOpen ? "opacity-0 pointer-events-none scale-90 translate-y-8" : "opacity-100 scale-100"
          )}>
            <Button 
              size="lg" 
              className="rounded-full shadow-xl h-14 px-6 gap-2"
              onClick={() => setMobileSettingsOpen(true)}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Settings
            </Button>
          </div>
        </div>`;

const newWorkspace = `        {/* Main Workspace Split */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
          
          {/* Settings Panel (Bottom on mobile, Left on desktop) */}
          <aside className="w-full lg:w-[350px] xl:w-[400px] shrink-0 border-t lg:border-t-0 lg:border-r border-border bg-card overflow-y-auto flex flex-col z-40 order-2 lg:order-1 h-[50vh] lg:h-full">
            <div className="p-4 flex flex-col gap-6">
              {settingsPanel}
            </div>
          </aside>

          {/* Canvas Area (Top on mobile, Right on desktop) */}
          <main className="flex-1 bg-muted/30 overflow-y-auto p-4 lg:p-8 flex items-center justify-center relative order-1 lg:order-2 h-[50vh] lg:h-full">
            <div className="w-full max-w-[1920px] aspect-video relative flex items-center justify-center">
              {previewCanvas}
            </div>
          </main>
        </div>`;

content = content.replace(oldWorkspace, newWorkspace);

// We also don't need mobileSettingsOpen state anymore, but it's harmless or we can remove it.
content = content.replace(/const \[mobileSettingsOpen, setMobileSettingsOpen\] = useState\(false\);/, '');

fs.writeFileSync('src/components/StudioShell.tsx', content);
console.log("Patched StudioShell.tsx");
