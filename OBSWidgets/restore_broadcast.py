with open('src/app/(app)/dashboard/page.tsx.bak', 'r') as f:
    old = f.read()

start = old.find("{/* Quick Launch / Create New Widgets Section (StreamTools hub only) */}")
end = old.find("{/* Saved Widgets Section */}")

broadcast_block = old[start:end].strip()

with open('src/app/(app)/dashboard/page.tsx', 'r') as f:
    new = f.read()

# I want to add it right before {/* Saved Widgets Section */}
start_insert = new.find("{/* Saved Widgets Section */}")
new = new[:start_insert] + broadcast_block + "\n\n      " + new[start_insert:]

with open('src/app/(app)/dashboard/page.tsx', 'w') as f:
    f.write(new)

