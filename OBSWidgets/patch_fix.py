import os

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

target = """  artworkUrl: '',
  rssFeedUrl: '',
  directoryStatus: {"""

replacement = """  artworkUrl: '',
  rssFeedUrl: '',
  substackHandle: '',
  directoryStatus: {"""

content = content.replace(target, replacement)

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)
