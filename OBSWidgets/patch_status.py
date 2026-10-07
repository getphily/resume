import os

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

# Add AlertCircle
if "AlertCircle" not in content:
    content = content.replace(
        "import { Mic, Play, Plus, Share, MoreHorizontal, Headphones, Info, Edit2, CheckCircle2, ExternalLink, Check, GraduationCap, BookOpen, Upload, Download } from 'lucide-react';",
        "import { Mic, Play, Plus, Share, MoreHorizontal, Headphones, Info, Edit2, CheckCircle2, ExternalLink, Check, GraduationCap, BookOpen, Upload, Download, AlertCircle } from 'lucide-react';"
    )

# Update EditableField
target_editable = """function EditableField({ 
  value, 
  onSave, 
  multiline = false, 
  className = '',
  placeholder = 'Click to edit'
}: { 
  value: string, 
  onSave: (v: string) => void, 
  multiline?: boolean, 
  className?: string,
  placeholder?: string
}) {"""
replacement_editable = """function EditableField({ 
  value, 
  onSave, 
  multiline = false, 
  className = '',
  placeholder = 'Click to edit',
  status = 'none'
}: { 
  value: string, 
  onSave: (v: string) => void, 
  multiline?: boolean, 
  className?: string,
  placeholder?: string,
  status?: 'complete' | 'incomplete' | 'none'
}) {
  const statusClass = status === 'complete' 
    ? 'border border-emerald-500/30 bg-emerald-500/5' 
    : status === 'incomplete' 
      ? 'border border-destructive/50 bg-destructive/5' 
      : 'border border-transparent';
"""
content = content.replace(target_editable, replacement_editable)

# Add status class to the outer div in EditableField
content = content.replace(
    """className={cn("group relative cursor-pointer hover:ring-2 hover:ring-primary/30 hover:bg-primary/5 rounded-md transition-all p-2 -mx-2", className)}""",
    """className={cn("group relative cursor-pointer hover:ring-2 hover:ring-primary/30 hover:bg-primary/5 rounded-md transition-all p-2 -mx-2", statusClass, className)}"""
)

# Helper function
label_helper = """
function FieldLabel({ text, complete }: { text: string, complete?: boolean }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
      {text}
      {complete !== undefined && (
        complete 
          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 
          : <AlertCircle className="w-3.5 h-3.5 text-destructive animate-pulse" />
      )}
    </span>
  );
}
"""
if "function FieldLabel" not in content:
    content = content.replace("export default function YourPodcastLandingPage() {", label_helper + "\nexport default function YourPodcastLandingPage() {")

# We need to compute status for each field inside the render.
# Let's write a replacement logic for the fields block.

def replace_field(original, field_name, check_logic):
    # This is a bit tricky, let's just do targeted string replacements for the labels and EditableFields.
    pass

# Title
content = content.replace(
    """<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Show Title</span>
                    <EditableField 
                      value={data.title}
                      onSave={(v) => updateData({ title: v })}
                      className="text-2xl font-black text-foreground !p-1 !-mx-1"
                      placeholder="Untitled Show"
                    />""",
    """<FieldLabel text="Show Title" complete={data.title && data.title !== 'Untitled Show'} />
                    <EditableField 
                      value={data.title}
                      onSave={(v) => updateData({ title: v })}
                      className="text-2xl font-black text-foreground !p-1 !-mx-1"
                      placeholder="Untitled Show"
                      status={data.title && data.title !== 'Untitled Show' ? 'complete' : 'incomplete'}
                    />"""
)

# Host
content = content.replace(
    """<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Host Name</span>
                      <EditableField 
                        value={data.host}
                        onSave={(v) => updateData({ host: v })}
                        className="font-medium text-sm text-foreground !p-1 !-mx-1"
                        placeholder="Unknown Host"
                      />""",
    """<FieldLabel text="Host Name" complete={data.host && data.host !== 'Unknown Host'} />
                      <EditableField 
                        value={data.host}
                        onSave={(v) => updateData({ host: v })}
                        className="font-medium text-sm text-foreground !p-1 !-mx-1"
                        placeholder="Unknown Host"
                        status={data.host && data.host !== 'Unknown Host' ? 'complete' : 'incomplete'}
                      />"""
)

# Email
content = content.replace(
    """<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contact Email</span>
                      <EditableField 
                        value={data.email}
                        onSave={(v) => updateData({ email: v })}
                        className="font-medium text-sm text-foreground !p-1 !-mx-1"
                        placeholder="host@example.com"
                      />""",
    """<FieldLabel text="Contact Email" complete={data.email && data.email !== 'host@example.com'} />
                      <EditableField 
                        value={data.email}
                        onSave={(v) => updateData({ email: v })}
                        className="font-medium text-sm text-foreground !p-1 !-mx-1"
                        placeholder="host@example.com"
                        status={data.email && data.email !== 'host@example.com' ? 'complete' : 'incomplete'}
                      />"""
)

# Description
content = content.replace(
    """<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Show Description</span>
                <EditableField 
                  value={data.description}
                  onSave={(v) => updateData({ description: v })}
                  multiline
                  className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap !p-2 !-mx-2 bg-muted/20 rounded-lg border border-border/50"
                  placeholder="Add a description for your podcast here..."
                />""",
    """<FieldLabel text="Show Description" complete={data.description && data.description !== defaultData.description} />
                <EditableField 
                  value={data.description}
                  onSave={(v) => updateData({ description: v })}
                  multiline
                  className={cn("text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap !p-3 !-mx-2 bg-muted/20 rounded-lg", (!data.description || data.description === defaultData.description) && "border-destructive border")}
                  placeholder="Add a description for your podcast here..."
                  status={data.description && data.description !== defaultData.description ? 'complete' : 'incomplete'}
                />"""
)

# Language
content = content.replace(
    """<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Language</span>
                  <EditableField 
                    value={data.language}
                    onSave={(v) => updateData({ language: v })}
                    className="font-semibold text-xs text-foreground !p-1 !-mx-1"
                    placeholder="e.g. English"
                  />""",
    """<FieldLabel text="Language" complete={!!data.language} />
                  <EditableField 
                    value={data.language}
                    onSave={(v) => updateData({ language: v })}
                    className="font-semibold text-xs text-foreground !p-1 !-mx-1"
                    placeholder="e.g. English"
                    status={!!data.language ? 'complete' : 'incomplete'}
                  />"""
)

# Categories
content = content.replace(
    """<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Categories</span>
                  <div className="flex flex-col gap-2 mt-0.5">
                    <CategoryDropdown 
                      value={data.primaryCategory} 
                      onSave={(v) => updateData({ primaryCategory: v })} 
                      label="Select Primary Category" 
                    />""",
    """<FieldLabel text="Categories" complete={!!data.primaryCategory} />
                  <div className="flex flex-col gap-2 mt-0.5">
                    <div className={cn("rounded-md border p-0.5", !!data.primaryCategory ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/50 bg-destructive/5")}>
                      <CategoryDropdown 
                        value={data.primaryCategory} 
                        onSave={(v) => updateData({ primaryCategory: v })} 
                        label="Select Primary Category" 
                      />
                    </div>"""
)

# Replace the artwork wrapper as well to add the red border if incomplete
content = content.replace(
    """<div 
                    className="w-32 h-32 md:w-48 md:h-48 rounded-xl shadow-md border border-border/20 bg-muted overflow-hidden flex items-center justify-center relative group cursor-pointer"
                    title="Click to upload artwork"
                  >""",
    """<div 
                    className={cn("w-32 h-32 md:w-48 md:h-48 rounded-xl shadow-md border bg-muted overflow-hidden flex items-center justify-center relative group cursor-pointer", data.artworkUrl ? "border-emerald-500/50 shadow-emerald-500/20" : "border-destructive shadow-destructive/20")}
                    title="Click to upload artwork"
                  >
                    {!data.artworkUrl && <AlertCircle className="absolute top-2 right-2 w-5 h-5 text-destructive animate-pulse z-20" />}
"""
)


with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)
