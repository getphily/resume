import re

with open('src/app/(app)/dashboard/page.tsx.bak', 'r') as f:
    old_content = f.read()

# Extract the Start a new widget section
start_token = "{(!toolset || (toolset && !activeTool)) && ("
end_token = "      {/* Saved Widgets Section */}"
start = old_content.find(start_token)
end = old_content.find(end_token)
cards_html = old_content[start:end]

with open('src/app/(app)/dashboard/page.tsx', 'r') as f:
    new_content = f.read()

# Replace the generic Toolsets Section and Specific Toolset Sub-Tools with the old one, but keep the Account stuff!
# We want to replace everything between {/* Toolsets Section (Only on Overview) */} and {/* Global Media Library (Only on Overview) */}

replace_start_token = "{/* Toolsets Section (Only on Overview) */}"
replace_end_token = "{/* Global Media Library (Only on Overview) */}"

start_rep = new_content.find(replace_start_token)
end_rep = new_content.find(replace_end_token)

new_content = new_content[:start_rep] + "{/* Start a new widget */}\n      " + cards_html + "\n      " + new_content[end_rep:]

with open('src/app/(app)/dashboard/page.tsx', 'w') as f:
    f.write(new_content)

