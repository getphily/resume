import re

with open('src/app/globals.css', 'r') as f:
    content = f.read()

# Add --font-heading to @theme inline
if '--font-heading: var(--font-heading);' not in content:
    content = content.replace("--font-sans: 'Inter', -apple-system, sans-serif;", "--font-sans: 'Inter', -apple-system, sans-serif;\n  --font-heading: var(--font-heading);")

# Add global styles
global_styles = """
@layer base {
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    letter-spacing: 0.02em; /* Coolvetica often benefits from a tiny bit of tracking */
  }
}
"""
if '@layer base' not in content:
    content += global_styles

with open('src/app/globals.css', 'w') as f:
    f.write(content)
