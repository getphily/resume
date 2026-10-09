import re

with open('src/components/cover-studio/BackgroundTab.tsx', 'r') as f:
    content = f.read()

# Add imports
if 'import MediaPicker' not in content:
    content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport MediaPicker from '../media/MediaPicker';\nimport { getAssetPublicUrl } from '@/lib/media/api';")

# We want to replace the label block with MediaPicker
replacement = """
          {!images.bg ? (
            <MediaPicker 
              allowedKinds={['image']} 
              onSelect={(asset) => updateImage('bg', getAssetPublicUrl(asset))} 
              className="w-full"
              trigger={
                <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-xs font-medium text-foreground">Browse Media Library</span>
                  <span className="text-xs text-muted-foreground mt-1">Select a background image</span>
                </div>
              }
            />
"""

content = re.sub(r'\{!images\.bg \? \([\s\S]*?</label>', replacement.strip(), content)

with open('src/components/cover-studio/BackgroundTab.tsx', 'w') as f:
    f.write(content)
