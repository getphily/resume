import re

with open('src/app/(app)/Navbar.tsx', 'r') as f:
    content = f.read()

# Replace the Brand Logo & Title block
old_block = r"""        \{/\* Brand Logo & Title \*/\}
        <Link href="/" className="flex items-center gap-4 no-underline group min-h-\[44px\] p-1 rounded-md focus-visible:outline-white focus-visible:outline-2 focus-visible:outline-offset-2">
          <Image src="/logo.png" alt="GetPhily's Codebox" width=\{48\} height=\{48\} className="w-12 h-12 object-contain drop-shadow-md group-hover:opacity-90 transition-opacity" priority />
          <div className="flex flex-col justify-center -space-y-0.5">
            <span className="font-bold text-lg tracking-tight text-white">
              GetPhily&apos;s Codebox
            </span>
            <span className="text-\[11px\] font-bold text-slate-400 tracking-widest uppercase mt-1">
              code.getphily.io
            </span>
          </div>
        </Link>"""

new_block = """        {/* Brand Logo */}
        <Link href="/" className="flex items-center no-underline group min-h-[44px] p-1 rounded-md focus-visible:outline-white focus-visible:outline-2 focus-visible:outline-offset-2">
          <Image src="/logo-gp-white.png" alt="GetPhily Logo" width={48} height={48} className="h-10 w-auto object-contain drop-shadow-sm group-hover:opacity-90 transition-opacity" priority />
        </Link>"""

new_content = re.sub(old_block, new_block, content, count=1)

with open('src/app/(app)/Navbar.tsx', 'w') as f:
    f.write(new_content)
    
print("Replaced logo block in Navbar.tsx")
