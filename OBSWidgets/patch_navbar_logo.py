import re

with open('src/app/(app)/Navbar.tsx', 'r') as f:
    content = f.read()

content = content.replace('boxClass="fill-white" textClass="fill-black"', '')

with open('src/app/(app)/Navbar.tsx', 'w') as f:
    f.write(content)
