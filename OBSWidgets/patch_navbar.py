import re

with open('src/app/(app)/Navbar.tsx', 'r') as f:
    content = f.read()

# 1. Update TopNavLinks colors and font
content = content.replace(
    'const base = "px-3 py-2 rounded-md transition-colors whitespace-nowrap";\n  const cls = (active: boolean) =>\n    cn(base, active ? "text-white bg-white/10 " : "text-slate-300 hover:text-white hover:bg-white/10");',
    'const base = "px-3 py-1.5 rounded-md transition-colors whitespace-nowrap";\n  const cls = (active: boolean) =>\n    cn(base, active ? "text-primary bg-primary/10 font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted");'
)

# Replace the font styling
content = content.replace(
    '<nav className="hidden lg:flex items-center gap-2 ml-4 text-[15px] font-heading tracking-wide" aria-label="Main">',
    '<nav className="hidden lg:flex items-center gap-1 ml-4 text-sm font-sans font-medium" aria-label="Main">'
)

content = content.replace(
    '<span className="w-px h-5 bg-white/15 mx-2" aria-hidden="true" />',
    '<span className="w-px h-5 bg-border mx-2" aria-hidden="true" />'
)

# 2. Update Header container
content = content.replace(
    '<header className="h-[72px] bg-[#0f172a] text-white border-b border-white/10 px-4 flex items-center justify-between shrink-0 z-20">',
    '<header className="h-[72px] bg-card text-card-foreground border-b border-border px-4 flex items-center justify-between shrink-0 z-20 shadow-sm">'
)

# 3. Fix Logo usage if it passed explicit white classes
content = content.replace(
    '<Logo className="w-8 h-8" boxClass="fill-white" textClass="fill-[#0f172a]" />',
    '<Logo className="w-8 h-8" />'
)

with open('src/app/(app)/Navbar.tsx', 'w') as f:
    f.write(content)

