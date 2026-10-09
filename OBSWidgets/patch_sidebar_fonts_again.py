import re

with open('src/app/(app)/Sidebar.tsx', 'r') as f:
    content = f.read()

content = content.replace('text-sm font-medium', 'text-[15px] font-heading')
content = content.replace('font-semibold shadow-2xs', 'shadow-2xs')
content = content.replace('text-[10px] font-semibold', 'text-[11px] font-heading')
content = content.replace('font-bold', '')

with open('src/app/(app)/Sidebar.tsx', 'w') as f:
    f.write(content)
