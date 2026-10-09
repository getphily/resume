import re

with open('src/app/(app)/Navbar.tsx', 'r') as f:
    content = f.read()

# Replace logo-gp-white.png with logo-gp-black.png
content = content.replace('logo-gp-white.png', 'logo-gp-black.png')

with open('src/app/(app)/Navbar.tsx', 'w') as f:
    f.write(content)
