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
        
        # Look for the exact block of css in the next.js state
        # Usually it's in something like: "css":":root{\n--background:0 0% 100%;\n..."
        match = re.search(r'"css":"(.*?)"', html)
        if match:
            css = match.group(1).replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\')
            name = url.split('/')[-1]
            results[name] = css
            print(f"Success: {name}")
        else:
            print(f"Could not find css for {url}")
            
    except Exception as e:
        print(f"Error fetching {url}: {e}")

with open('themes_raw.json', 'w') as f:
    json.dump(results, f, indent=2)
