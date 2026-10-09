with open('src/app/(app)/Sidebar.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    """      { name: 'Studio Hub', path: '/dashboard', icon: LayoutDashboard, desc: 'Widgets & embeds' },
      { name: 'Media Library', path: '/media', icon: FileImage, desc: 'Your uploaded files' },""",
    """      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, desc: 'Account, Media & Toolsets' },"""
)

with open('src/app/(app)/Sidebar.tsx', 'w') as f:
    f.write(content)
