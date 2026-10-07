const fs = require('fs');
let content = fs.readFileSync('src/app/(app)/podcast-tools/page.tsx', 'utf8');

const oldArtwork = `<div id="section-artwork" className="flex flex-col gap-4 shrink-0 scroll-mt-6 w-32 md:w-48">
                  <div className="flex flex-col gap-1.5">
                    <Button 
                      onClick={() => setStudioOpen(true)}
                      className="w-full font-bold gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                      size="sm"
                    >
                      <Palette className="w-4 h-4" />
                      Design with Cover Studio
                    </Button>
                    <p className="text-[10px] text-muted-foreground leading-tight text-center">
                      No design? Build a template cover in minutes.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                  <div 
                    className={cn("w-32 h-32 md:w-48 md:h-48 rounded-xl shadow-md border bg-muted overflow-hidden flex items-center justify-center relative group cursor-pointer", data.artworkUrl ? "border-emerald-500/50 shadow-emerald-500/20" : "border-destructive shadow-destructive/20")}
                    title="Click to upload artwork"
                  >
                    {!data.artworkUrl && <AlertCircle className="absolute top-2 right-2 w-5 h-5 text-destructive animate-pulse z-20" />}

                    <label className="absolute inset-0 w-full h-full cursor-pointer z-10">
                      <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleFileUpload} />
                    </label>
                    {data.artworkUrl ? (
                      <img src={data.artworkUrl} alt={data.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                        <Upload className="w-8 h-8 opacity-50" />
                        <span className="text-[10px] font-semibold text-center uppercase tracking-wider px-2">Upload Cover Art</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex flex-col gap-2 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Upload className="w-6 h-6 text-white" />
                       <span className="text-white text-xs font-bold">Change Image</span>
                    </div>
                  </div>
                  {data.artworkUrl && (
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1 text-xs font-bold gap-2">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => updateData({ artworkUrl: '' })} className="flex-none px-2.5">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  </div>
                </div>`;

const newArtwork = `<div id="section-artwork" className="flex flex-col gap-2 shrink-0 scroll-mt-6 w-32 md:w-48">
                  <FieldLabel text="Cover Art" complete={!!data.artworkUrl} />
                  <div 
                    className={cn("w-32 h-32 md:w-48 md:h-48 rounded-xl shadow-md border bg-muted overflow-hidden flex items-center justify-center relative group cursor-pointer", data.artworkUrl ? "border-emerald-500/50 shadow-emerald-500/20" : "border-destructive shadow-destructive/20")}
                    title="Click to upload artwork"
                  >
                    {!data.artworkUrl && <AlertCircle className="absolute top-2 right-2 w-5 h-5 text-destructive animate-pulse z-20" />}

                    <label className="absolute inset-0 w-full h-full cursor-pointer z-10">
                      <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleFileUpload} />
                    </label>
                    {data.artworkUrl ? (
                      <img src={data.artworkUrl} alt={data.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                        <Upload className="w-8 h-8 opacity-50" />
                        <span className="text-[10px] font-semibold text-center uppercase tracking-wider px-2">Upload Cover Art</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex flex-col gap-2 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Upload className="w-6 h-6 text-white" />
                       <span className="text-white text-xs font-bold">Change Image</span>
                    </div>
                  </div>
                  
                  {data.artworkUrl && (
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1 text-xs font-bold gap-2">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => updateData({ artworkUrl: '' })} className="flex-none px-2.5">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setStudioOpen(true)} 
                    className="w-full h-7 mt-1 text-[10px] uppercase font-bold text-primary gap-1 px-2 py-0 border-primary/20 bg-primary/5 hover:bg-primary/10"
                  >
                    <Palette className="w-3 h-3" /> Cover Studio
                  </Button>
                </div>`;

content = content.replace(oldArtwork, newArtwork);
fs.writeFileSync('src/app/(app)/podcast-tools/page.tsx', content);
