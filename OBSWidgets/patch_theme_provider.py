with open('src/app/ThemeProvider.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "export type ThemeMode = 'modern-minimal' | 'autoblog' | 'alpine' | 'light-green' | 'dark' | 'light';",
    "export type ThemeMode = 'modern-minimal' | 'autoblog' | 'alpine' | 'light-green' | 'japan-blues' | 'astrovista' | 'porfolio' | 'vescrow' | 'polaris' | 'claude' | 'dark' | 'light';"
)

content = content.replace(
    "  'light-green',\n  'dark',\n  'light',",
    "  'light-green',\n  'japan-blues',\n  'astrovista',\n  'porfolio',\n  'vescrow',\n  'polaris',\n  'claude',\n  'dark',\n  'light',"
)

with open('src/app/ThemeProvider.tsx', 'w') as f:
    f.write(content)
