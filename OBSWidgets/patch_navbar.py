with open('src/app/(app)/Navbar.tsx', 'r') as f:
    content = f.read()

replacement = """      'light-green': 'Light Green',
      'japan-blues': 'Japan Blues',
      'astrovista': 'Astrovista',
      'porfolio': 'Portfolio',
      'vescrow': 'Vescrow',
      'polaris': 'Polaris',
      'claude': 'Claude',"""

content = content.replace("      'light-green': 'Light Green',", replacement)

with open('src/app/(app)/Navbar.tsx', 'w') as f:
    f.write(content)
