import re

with open('src/app/globals.css', 'r') as f:
    content = f.read()

# Replace the h1, h2 block
old_block = """@layer base {
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading) !important;
    letter-spacing: 0.02em;
  }
}"""

new_block = """@layer base {
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading) !important;
    font-weight: normal !important; /* Prevent faux-bolding of Coolvetica */
    letter-spacing: 0.02em !important; /* Override any tailwind tracking utilities */
  }
}"""

content = content.replace(old_block, new_block)

with open('src/app/globals.css', 'w') as f:
    f.write(content)
