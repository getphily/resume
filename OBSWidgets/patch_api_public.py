import re

with open('src/lib/media/api.ts', 'r') as f:
    content = f.read()

# Replace getAssetSignedUrl to getAssetPublicUrl
if 'export async function getAssetSignedUrl(asset: MediaAsset): Promise<string> {' in content:
    replacement = """export function getAssetPublicUrl(asset: MediaAsset): string {
  const { data } = supabase.storage.from(asset.storage_bucket).getPublicUrl(asset.storage_path);
  return data.publicUrl;
}"""
    # Just replace the whole function
    content = re.sub(r'export async function getAssetSignedUrl[\s\S]*?return data.signedUrl;\n}', replacement, content)

with open('src/lib/media/api.ts', 'w') as f:
    f.write(content)
