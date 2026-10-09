import re

with open('src/app/(app)/crawl/page.tsx', 'r') as f:
    content = f.read()

# Add imports
if 'import MediaPicker' not in content:
    content = content.replace("import { Trash2, GripVertical, Settings2, Plus } from 'lucide-react';", "import { Trash2, GripVertical, Settings2, Plus } from 'lucide-react';\nimport MediaPicker from '@/components/media/MediaPicker';\nimport { getAssetPublicUrl } from '@/lib/media/api';")

# Find the label with upload input
replacement = """
                <MediaPicker 
                  allowedKinds={['image']} 
                  onSelect={(asset) => update({ imageUrl: getAssetPublicUrl(asset) })} 
                  trigger={
                    <div className="cursor-pointer flex items-center px-3 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-md text-xs font-semibold shrink-0 transition-colors h-9">
                      Browse
                    </div>
                  }
                />
"""

content = re.sub(r'<label className="cursor-pointer flex items-center px-3 bg-muted hover:bg-muted/80[^>]*>[\s\S]*?</label>', replacement.strip(), content)

with open('src/app/(app)/crawl/page.tsx', 'w') as f:
    f.write(content)
