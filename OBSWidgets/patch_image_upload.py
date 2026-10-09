import re

with open('src/components/ImageUploadOrUrl.tsx', 'r') as f:
    content = f.read()

# Add MediaPicker import and getAssetPublicUrl
if 'import MediaPicker' not in content:
    content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport MediaPicker from './media/MediaPicker';\nimport { getAssetPublicUrl } from '@/lib/media/api';")

# Replace the Button and input with MediaPicker
replacement = """<MediaPicker 
          allowedKinds={['image']} 
          onSelect={(asset) => onChange(getAssetPublicUrl(asset))} 
          trigger={
            <Button size="sm" variant="secondary" className="h-9 cursor-pointer gap-1.5 shrink-0 text-xs font-semibold">
              <Upload className="w-3.5 h-3.5" /> BROWSE
            </Button>
          } 
        />"""

# Find the Button part
content = re.sub(r'<Button[^>]*size="sm"[^>]*variant="secondary"[^>]*>[\s\S]*?</Button>', replacement, content)

# Remove unused state and imports if necessary, but it's fine
with open('src/components/ImageUploadOrUrl.tsx', 'w') as f:
    f.write(content)
