import re

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

# Add imports
if 'import MediaPicker' not in content:
    content = content.replace("import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';", "import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';\nimport MediaPicker from '@/components/media/MediaPicker';\nimport { getAssetPublicUrl } from '@/lib/media/api';")

# Replace label
replacement = """
                    <MediaPicker 
                      allowedKinds={['image']} 
                      onSelect={(asset) => updateData({ artworkUrl: getAssetPublicUrl(asset) })} 
                      trigger={<div className="absolute inset-0 w-full h-full cursor-pointer z-10"></div>}
                    />
"""

content = re.sub(r'<label className="absolute inset-0 w-full h-full cursor-pointer z-10">[\s\S]*?</label>', replacement.strip(), content)

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)
