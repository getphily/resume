const fs = require('fs');
let code = fs.readFileSync('src/app/(app)/podcast-tools/page.tsx', 'utf8');

const originalBlock = \`              <div className="flex flex-col sm:flex-row gap-6">
                {/* Artwork */}
                <div id="section-artwork" className="flex flex-col gap-2 shrink-0 scroll-mt-6 w-32 md:w-48">
                  <FieldLabel text="Cover Art" complete={!!data.artworkUrl} />
                  <div 
                    className={cn("w-32 h-32 md:w-48 md:h-48 rounded-xl shadow-md border bg-muted overflow-hidden flex items-center justify-center relative group cursor-pointer", data.artworkUrl ? "border-emerald-500/50 shadow-emerald-500/20" : "border-destructive shadow-destructive/20")}\`;

const replacementBlock = \`              <div className="flex flex-col sm:flex-row gap-6">
                {/* Artwork */}
                <div id="section-artwork" className="flex flex-col shrink-0 scroll-mt-6 w-32 md:w-48">
                  <FieldLabel text="Cover Art" complete={!!data.artworkUrl} />
                  <div className="flex flex-col gap-2">
                  <div 
                    className={cn("w-32 h-32 md:w-48 md:h-48 rounded-xl shadow-md border bg-muted overflow-hidden flex items-center justify-center relative group cursor-pointer", data.artworkUrl ? "border-emerald-500/50 shadow-emerald-500/20" : "border-destructive shadow-destructive/20")}\`;

code = code.replace(originalBlock, replacementBlock);

const buttonEndOriginal = \`                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setStudioOpen(true)} 
                    className="w-full h-7 mt-2 text-[10px] uppercase font-bold text-primary gap-1 px-2 py-0 border-primary/20 bg-primary/5 hover:bg-primary/10"
                  >
                    <Palette className="w-3 h-3" /> Cover Studio
                  </Button>
                </div>

                {/* Core Details */}\`;

const buttonEndReplacement = \`                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setStudioOpen(true)} 
                    className="w-full h-7 mt-2 text-[10px] uppercase font-bold text-primary gap-1 px-2 py-0 border-primary/20 bg-primary/5 hover:bg-primary/10"
                  >
                    <Palette className="w-3 h-3" /> Cover Studio
                  </Button>
                  </div>
                </div>

                {/* Core Details */}\`;

code = code.replace(buttonEndOriginal, buttonEndReplacement);

fs.writeFileSync('src/app/(app)/podcast-tools/page.tsx', code);
console.log('Fixed');
