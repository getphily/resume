const fs = require('fs');

let content = fs.readFileSync('src/components/StudioShell.tsx', 'utf8');

const oldWorkspace = `        {/* Main Workspace Split */}
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

const newWorkspace = `        {/* Main Workspace Split */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
          
          {/* Canvas Area (Top on mobile, Right on desktop) */}
          <main className="w-full lg:flex-1 bg-muted/30 p-4 lg:p-8 flex items-center justify-center relative order-1 lg:order-2 shrink-0 min-h-[30vh] lg:min-h-0">
            <div className="w-full max-w-[1920px] aspect-video relative flex items-center justify-center">
              {previewCanvas}
            </div>
          </main>

          {/* Settings Panel (Bottom on mobile, Left on desktop) */}
          <aside className="w-full lg:w-[350px] xl:w-[400px] shrink-0 border-t lg:border-t-0 lg:border-r border-border bg-card overflow-y-auto flex flex-col z-40 order-2 lg:order-1 flex-1 lg:flex-none">
            <div className="p-4 flex flex-col gap-6 pb-24 lg:pb-4">
              {settingsPanel}
            </div>
          </aside>
        </div>`;

content = content.replace(oldWorkspace, newWorkspace);
fs.writeFileSync('src/components/StudioShell.tsx', content);
