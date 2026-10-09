import urllib.request
import re

themes = [
    "japan-blues",
    "astrovista",
    "porfolio",
    "vescrow",
    "polaris",
    "claude"
]

output_css = ""
output_options = ""

for theme in themes:
    url = f"https://www.shadcnblocks.com/theme/{theme}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        match = re.search(r'style="(--background:[^"]+)"', html)
        if match:
            style_str = match.group(1)
            # Remove font vars and radius
            style_str = re.sub(r'--font-[^:]+:[^;]+;?', '', style_str)
            style_str = re.sub(r'--radius:[^;]+;?', '', style_str)
            
            # Format nicely
            parts = [p.strip() for p in style_str.split(';') if p.strip()]
            css_rules = "\n  ".join(parts) + ";"
            
            output_css += f"\n[data-theme=\"{theme}\"] {{\n  {css_rules}\n}}"
            output_options += f"\n    <option value=\"{theme}\">{theme.replace('-', ' ').title()}</option>"
        else:
            print(f"Could not find style for {theme}")
    except Exception as e:
        print(f"Error fetching {theme}: {e}")

print("--- CSS ---")
print(output_css)
print("\n--- HTML OPTIONS ---")
print(output_options)

