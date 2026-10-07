import os

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

# Add Download and Upload icons to lucide-react imports if not there
if "Upload," not in content:
    content = content.replace(
        "import { Mic, Play, Plus, Share, MoreHorizontal, Headphones, Info, Edit2, CheckCircle2, ExternalLink, Check, GraduationCap, BookOpen } from 'lucide-react';",
        "import { Mic, Play, Plus, Share, MoreHorizontal, Headphones, Info, Edit2, CheckCircle2, ExternalLink, Check, GraduationCap, BookOpen, Upload, Download } from 'lucide-react';"
    )

# Add logic for file upload and download to YourPodcastLandingPage
logic_inject = """  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // We convert the file to a Data URL to preview and store it locally
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateData({ artworkUrl: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data.artworkUrl) return;
    const a = document.createElement('a');
    a.href = data.artworkUrl;
    a.download = data.title ? `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_cover.png` : 'podcast_cover.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
"""

content = content.replace("  if (!mounted) return null;", logic_inject + "\n  if (!mounted) return null;")

# Update the UI
target = """                <div 
                  className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-xl shadow-md border border-border/20 bg-muted overflow-hidden flex items-center justify-center relative group cursor-pointer"
                  onClick={() => {
                    const url = window.prompt("Enter Artwork Image URL (Square 1400x1400+):", data.artworkUrl);
                    if (url !== null) updateData({ artworkUrl: url });
                  }}
                  title="Click to edit artwork"
                >
                  {data.artworkUrl ? (
                    <img src={data.artworkUrl} alt={data.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                      <Mic className="w-8 h-8 opacity-50" />
                      <span className="text-[10px] font-semibold text-center uppercase tracking-wider">Add Cover Art</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Edit2 className="w-6 h-6 text-white" />
                  </div>
                </div>"""

replacement = """                <div className="flex flex-col gap-2 shrink-0">
                  <div 
                    className="w-32 h-32 md:w-48 md:h-48 rounded-xl shadow-md border border-border/20 bg-muted overflow-hidden flex items-center justify-center relative group cursor-pointer"
                    title="Click to upload artwork"
                  >
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
                    <Button variant="outline" size="sm" onClick={handleDownload} className="w-full text-xs font-bold gap-2">
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                  )}
                </div>"""

content = content.replace(target, replacement)

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)
