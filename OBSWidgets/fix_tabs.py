import re

def fix_tab(filepath, kind):
    with open(filepath, 'r') as f:
        content = f.read()
    
    handler = f"""
  const handleMediaSelect = (asset: any) => {{
    const url = getAssetPublicUrl(asset);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {{
      setImages(prev => ({{ ...prev, {kind}: img }}));
      setCfg(prev => ({{ ...prev, {kind}: {{ ...prev.{kind}, type: 'image' }} }}));
    }};
    img.src = url;
  }};
"""
    if 'handleMediaSelect' not in content:
        content = content.replace("const handleRemoveImage = () => {", handler + "\n  const handleRemoveImage = () => {")
        content = content.replace("const handleRemovePhoto = () => {", handler + "\n  const handleRemovePhoto = () => {")
    
    # fix the MediaPicker invocation
    content = re.sub(r'updateImage\([^\)]+\)', 'handleMediaSelect(asset)', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

fix_tab('src/components/cover-studio/BackgroundTab.tsx', 'bg')
fix_tab('src/components/cover-studio/HostPhotoTab.tsx', 'host')
