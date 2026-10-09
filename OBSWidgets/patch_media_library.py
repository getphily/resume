import re

with open('src/components/media/MediaLibrary.tsx', 'r') as f:
    content = f.read()

# Update signature
if 'export default function MediaLibrary() {' in content:
    new_sig = """export default function MediaLibrary({ 
  mode = 'standalone', 
  onSelect,
  allowedKinds
}: { 
  mode?: 'standalone' | 'picker';
  onSelect?: (asset: MediaAsset) => void;
  allowedKinds?: MediaKind[];
}) {"""
    content = content.replace('export default function MediaLibrary() {', new_sig)

# Update fetchMedia logic to use allowedKinds if filter is 'all'
# But since API doesn't support multiple kinds in one query (it's string | undefined), we might just filter on frontend if allowedKinds is passed
if 'const data = await getMediaAssets({' in content:
    fetch_replacement = """const data = await getMediaAssets({
        kind: filter === 'all' ? (allowedKinds?.length === 1 ? allowedKinds[0] : undefined) : filter,
        search: search.length > 2 ? search : undefined,
      });
      // Filter out on frontend if multiple allowedKinds exist
      const filtered = allowedKinds ? data.filter(a => allowedKinds.includes(a.kind)) : data;
      setAssets(filtered);"""
    content = re.sub(r'const data = await getMediaAssets\(\{[\s\S]*?setAssets\(data\);', fetch_replacement, content)

# Modify asset selection logic. If mode === 'picker', call onSelect instead of opening drawer.
if 'onSelect={() => setSelectedAsset(asset)}' in content:
    content = content.replace('onSelect={() => setSelectedAsset(asset)}', "onSelect={() => mode === 'picker' && onSelect ? onSelect(asset) : setSelectedAsset(asset)}")

with open('src/components/media/MediaLibrary.tsx', 'w') as f:
    f.write(content)
