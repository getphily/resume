import os

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

# Imports
if "Trash2" not in content:
    content = content.replace(
        "import { Mic, Play, Plus, Share, MoreHorizontal, Headphones, Info, Edit2, CheckCircle2, ExternalLink, Check, GraduationCap, BookOpen, Upload, Download, AlertCircle } from 'lucide-react';",
        "import { Mic, Play, Plus, Share, MoreHorizontal, Headphones, Info, Edit2, CheckCircle2, ExternalLink, Check, GraduationCap, BookOpen, Upload, Download, AlertCircle, Trash2, Wand2 } from 'lucide-react';"
    )

# Add state
state_block = """  const [mounted, setMounted] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardData, setWizardData] = useState({ about: '', for: '', why: '' });"""
content = content.replace("  const [mounted, setMounted] = useState(false);", state_block)


# Replace Description section
desc_target = """<FieldLabel text="Show Description" complete={!!(data.description && data.description !== defaultData.description)} />
                <EditableField"""
desc_replacement = """<div className="flex items-center justify-between mb-1">
                  <FieldLabel text="Show Description" complete={!!(data.description && data.description !== defaultData.description)} />
                  <Button variant="outline" size="sm" onClick={() => setWizardOpen(true)} className="h-6 text-[10px] uppercase font-bold text-primary gap-1 px-2 py-0 border-primary/20 bg-primary/5 hover:bg-primary/10"><Wand2 className="w-3 h-3" /> Wizard</Button>
                </div>
                <EditableField"""
content = content.replace(desc_target, desc_replacement)

# Remove old download button
trash_target = """                  {data.artworkUrl && (
                    <Button variant="outline" size="sm" onClick={handleDownload} className="w-full text-xs font-bold gap-2">
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                  )}"""
trash_replacement = """                  {data.artworkUrl && (
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1 text-xs font-bold gap-2">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => updateData({ artworkUrl: '' })} className="flex-none px-2.5">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}"""
content = content.replace(trash_target, trash_replacement)

# Add wizard modal just before the final return of YourPodcastLandingPage, which ends with `  );` 
# Let's insert it inside the main return, maybe right before the closing `</div>` of the page.
# Actually, it's safer to just wrap it in a `<>` and `</>` if we have to, or just insert it before the closing `</main>`.
# Wait, let's find `</main>` and put it before.
# Wait, the page starts with `return ( <div className="flex flex-col min-h-screen bg-background text-foreground">`
wizard_jsx = """
      {wizardOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-lg flex items-center gap-2"><Wand2 className="w-5 h-5 text-primary" /> Description Wizard</h3>
              <p className="text-xs text-muted-foreground mt-1">Answer these three questions to generate a perfect podcast summary based on best practices.</p>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">What is the show about?</label>
                <textarea className="w-full bg-background border border-border rounded-md p-2 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[60px]" placeholder="e.g. A weekly breakdown of true crime cases..." value={wizardData.about} onChange={e => setWizardData({...wizardData, about: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Who is it for?</label>
                <textarea className="w-full bg-background border border-border rounded-md p-2 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[60px]" placeholder="e.g. Amateur sleuths and mystery lovers..." value={wizardData.for} onChange={e => setWizardData({...wizardData, for: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Why should they tune in?</label>
                <textarea className="w-full bg-background border border-border rounded-md p-2 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[60px]" placeholder="e.g. To learn how forensic science solves cold cases..." value={wizardData.why} onChange={e => setWizardData({...wizardData, why: e.target.value})} />
              </div>
            </div>
            <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setWizardOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                const combined = [wizardData.about, wizardData.for, wizardData.why].filter(Boolean).join(" ");
                updateData({ description: combined });
                setWizardOpen(false);
                setWizardData({ about: '', for: '', why: '' });
              }}>Save Description</Button>
            </div>
          </div>
        </div>
      )}
"""

# The file ends with:
#       </main>
#     </div>
#   );
# }

content = content.replace("      </main>\n    </div>", wizard_jsx + "\n      </main>\n    </div>")

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)

