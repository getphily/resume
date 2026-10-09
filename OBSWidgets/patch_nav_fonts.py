import re

# Update Navbar.tsx
with open('src/app/(app)/Navbar.tsx', 'r') as f:
    content = f.read()

content = content.replace('nav className="hidden lg:flex items-center gap-1 ml-4 text-sm font-medium"', 'nav className="hidden lg:flex items-center gap-2 ml-4 text-[15px] font-heading tracking-wide"')

with open('src/app/(app)/Navbar.tsx', 'w') as f:
    f.write(content)

# Update Sidebar.tsx
with open('src/app/(app)/Sidebar.tsx', 'r') as f:
    sidebar = f.read()

# The sidebar links typically have text-sm font-medium, let's add font-heading to them
# Let's see what the sidebar uses
