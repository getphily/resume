import urllib.request
import json
import re

urls = [
    "https://www.shadcnblocks.com/theme/japan-blues",
    "https://www.shadcnblocks.com/theme/astrovista",
    "https://www.shadcnblocks.com/theme/porfolio",
    "https://www.shadcnblocks.com/theme/vescrow",
    "https://www.shadcnblocks.com/theme/polaris",
    "https://www.shadcnblocks.com/theme/claude"
]

results = {}

for url in urls:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        # Try to find a script tag containing JSON with the CSS
        # Usually it's in self.__next_f or similar Next.js data, or look for :root {
        
        # Let's just find the big string that looks like :root { ... } 
        # But wait, it might be escaped like :root {\n  --background
        css_blocks = re.findall(r'(@layer base\s*\{[^}]+\})|(:root\s*\{[^}]+\})', html)
        
        # We can also search for the exact "css":"@layer base {..." in a JSON blob
        match = re.search(r'"css":"([^"]+)"', html)
        if match:
            css = match.group(1).replace('\\n', '\n').replace('\\"', '"')
            name = url.split('/')[-1]
            results[name] = css
            continue
            
    except Exception as e:
        print(f"Error fetching {url}: {e}")

print(json.dumps(results, indent=2))
