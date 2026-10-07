import os

with open('src/app/(app)/dashboard/page.tsx', 'r') as f:
    content = f.read()

target = """  if (toolset?.id === 'podcast') {
    return <YourPodcastLandingPage />;
  }"""
replacement = """  if (toolset?.id === 'podcast' && (!toolId || toolId === 'podcast')) {
    return <YourPodcastLandingPage />;
  }"""

content = content.replace(target, replacement)

with open('src/app/(app)/dashboard/page.tsx', 'w') as f:
    f.write(content)

