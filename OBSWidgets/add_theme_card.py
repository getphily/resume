import re

with open('src/app/(app)/account/page.tsx', 'r') as f:
    content = f.read()

theme_card_code = """
function ThemeCard({ opt, theme, setTheme }: { opt: ThemeOption, theme: ThemeMode, setTheme: (t: ThemeMode) => void }) {
  const isSelected = theme === opt.id;
  return (
    <Card 
      onClick={() => {
        setTheme(opt.id);
        document.documentElement.setAttribute('data-theme', opt.id);
        localStorage.setItem('theme', opt.id);
        window.dispatchEvent(new Event('theme-updated'));
      }}
      className={cn(
        "col-span-1 md:col-span-1 p-0 cursor-pointer overflow-hidden relative flex flex-col transition-all group",
        isSelected
          ? "border-primary ring-2 ring-primary/25 bg-card shadow-sm"
          : "border-border bg-card hover:border-primary/40 hover:shadow-xs"
      )}
    >
      <div className="w-full h-10 flex items-center px-3 border-b border-black/10 dark:border-white/10" style={{ backgroundColor: opt.headerBg }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opt.accentColor }} />
      </div>
      <div className="p-3 flex flex-col flex-1 justify-center items-center text-center" style={{ backgroundColor: opt.canvasBg }}>
        <span className="font-bold text-[11px] leading-tight mb-0.5" style={{ color: opt.headerBg }}>
          {opt.name}
        </span>
        <span className="text-[9px] uppercase font-bold opacity-70" style={{ color: opt.headerBg }}>
          {opt.badge}
        </span>
      </div>
      {isSelected && (
        <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1 py-0.5 rounded-sm flex items-center shadow-md">
          <Check className="w-2.5 h-2.5" />
        </div>
      )}
    </Card>
  );
}
"""

match = re.search(r'function AccountContent\(\) \{', content)
if match:
    content = content[:match.start()] + theme_card_code + "\n" + content[match.start():]
    with open('src/app/(app)/account/page.tsx', 'w') as f:
        f.write(content)
    print("Added ThemeCard component.")
