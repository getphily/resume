import os

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

# Add email to interface
content = content.replace("artworkUrl: string;\n}", "artworkUrl: string;\n  email: string;\n}")

# Add email to defaultData
content = content.replace("artworkUrl: '',\n};", "artworkUrl: '',\n  email: 'host@example.com',\n};")

# Add email to the sidebar UI
sidebar_ui = """
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Email</span>
                <EditableField 
                  value={data.email}
                  onSave={(v) => updateData({ email: v })}
                  className="font-semibold text-foreground -ml-2 !p-1.5"
                  placeholder="host@example.com"
                />
              </div>
"""
content = content.replace(
    '<div className="flex flex-col gap-0.5">\n                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Host</span>',
    sidebar_ui + '\n              <div className="flex flex-col gap-0.5">\n                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Host</span>'
)

# Remove the Episodes section
start_tag = '<section className="flex flex-col gap-4">\n            <h2 className="text-2xl font-bold border-b border-border/60 pb-3">Episodes</h2>'
end_tag = '</section>'
start_idx = content.find(start_tag)
if start_idx != -1:
    end_idx = content.find(end_tag, start_idx)
    content = content[:start_idx] + content[end_idx+len(end_tag):]

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)
