import re

with open('src/app/layout.tsx', 'r') as f:
    content = f.read()

# Add next/font/local import
if 'import localFont from "next/font/local";' not in content:
    content = content.replace('import { Geist } from "next/font/google";', 'import { Geist } from "next/font/google";\nimport localFont from "next/font/local";')

# Define coolvetica
coolvetica_def = """const coolvetica = localFont({
  src: './fonts/coolvetica-rg.otf',
  variable: '--font-heading',
  display: 'swap',
});"""

if 'const coolvetica = localFont' not in content:
    content = content.replace("const geist = Geist({subsets:['latin'],variable:'--font-sans'});", f"const geist = Geist({{subsets:['latin'],variable:'--font-sans'}});\n{coolvetica_def}")

# Add it to html className
if 'coolvetica.variable' not in content:
    content = content.replace('cn("font-sans", geist.variable)', 'cn("font-sans", geist.variable, coolvetica.variable)')

with open('src/app/layout.tsx', 'w') as f:
    f.write(content)
