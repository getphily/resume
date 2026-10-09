import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace('handleMediaSelect(asset))} ', 'handleMediaSelect(asset)} ')
    
    with open(filepath, 'w') as f:
        f.write(content)

fix_file('src/components/cover-studio/BackgroundTab.tsx')
fix_file('src/components/cover-studio/HostPhotoTab.tsx')
