import re

def add_imports(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    if 'import MediaPicker' not in content:
        content = re.sub(r'(import React.*?\n)', r'\1import MediaPicker from "@/components/media/MediaPicker";\nimport { getAssetPublicUrl } from "@/lib/media/api";\n', content, count=1)
        with open(filepath, 'w') as f:
            f.write(content)

add_imports('src/app/(app)/crawl/page.tsx')
add_imports('src/app/(app)/podcast-tools/page.tsx')
add_imports('src/components/cover-studio/BackgroundTab.tsx')
add_imports('src/components/cover-studio/HostPhotoTab.tsx')
