import re

with open('src/app/(app)/Sidebar.tsx', 'r') as f:
    content = f.read()

# Update itemClass
content = content.replace('"flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group outline-none focus-visible:ring-2 focus-visible:ring-primary"', '"flex items-center gap-3 px-3 py-2 rounded-md text-[15px] font-heading tracking-wide transition-all group outline-none focus-visible:ring-2 focus-visible:ring-primary"')

# Update child links
content = content.replace('"flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"', '"flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[14px] font-heading tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"')

# Update section titles
content = content.replace('text-[10px] font-bold uppercase tracking-widest text-muted-foreground', 'text-[11px] font-heading uppercase tracking-widest text-muted-foreground')

with open('src/app/(app)/Sidebar.tsx', 'w') as f:
    f.write(content)
