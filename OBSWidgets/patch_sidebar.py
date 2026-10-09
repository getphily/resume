import re

with open('src/app/(app)/Sidebar.tsx', 'r') as f:
    content = f.read()

# Replace Account & Media and Studio Hub
content = content.replace(
    "{ name: 'Studio Hub', path: '/dashboard', icon: LayoutDashboard, desc: 'All widgets & embeds' },\n        { name: 'Account & Media', path: '/account', icon: User, desc: 'Profile, Theme & Files' },",
    "{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, desc: 'Account, Media & Toolsets' },"
)

with open('src/app/(app)/Sidebar.tsx', 'w') as f:
    f.write(content)
