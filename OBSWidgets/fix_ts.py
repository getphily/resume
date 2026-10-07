import os
import re

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "complete={data.title && data.title !== 'Untitled Show'}",
    "complete={!!(data.title && data.title !== 'Untitled Show')}"
)
content = content.replace(
    "complete={data.host && data.host !== 'Unknown Host'}",
    "complete={!!(data.host && data.host !== 'Unknown Host')}"
)
content = content.replace(
    "complete={data.email && data.email !== 'host@example.com'}",
    "complete={!!(data.email && data.email !== 'host@example.com')}"
)
content = content.replace(
    "complete={data.description && data.description !== defaultData.description}",
    "complete={!!(data.description && data.description !== defaultData.description)}"
)

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)
