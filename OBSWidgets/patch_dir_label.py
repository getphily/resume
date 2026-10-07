import os

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

target = """<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Directory Submissions Checklist</span>"""
replacement = """<FieldLabel text="Directory Submissions Checklist" complete={Object.values(data.directoryStatus).every(Boolean)} />"""

content = content.replace(target, replacement)

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)
