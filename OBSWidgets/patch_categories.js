const fs = require('fs');
let content = fs.readFileSync('src/app/(app)/podcast-tools/page.tsx', 'utf8');

// Replace CategoryDropdown
const oldDropdown = `function CategoryDropdown({ value, onSave, label }: { value: string, onSave: (v: string) => void, label: string }) {
  return (
    <select 
      value={value}
      onChange={(e) => onSave(e.target.value)}
      className="bg-muted/20 border border-border/50 rounded-md px-2 py-1 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary outline-none max-w-full"
    >
      <option value="">{label}</option>
      {APPLE_CATEGORIES.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  );
}`;

const newDropdown = `function CategoryDropdown({ value, onSave, label, status = 'none' }: { value: string, onSave: (v: string) => void, label: string, status?: 'complete' | 'incomplete' | 'none' }) {
  const statusClass = status === 'complete' 
    ? 'border-emerald-500/30 bg-emerald-500/5' 
    : status === 'incomplete' 
      ? 'border-destructive/50 bg-destructive/5' 
      : 'border-border/50 bg-muted/20';

  return (
    <select 
      value={value}
      onChange={(e) => onSave(e.target.value)}
      className={cn(
        "border rounded-md px-2 py-1 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary outline-none max-w-full",
        statusClass
      )}
    >
      <option value="">{label}</option>
      {APPLE_CATEGORIES.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  );
}`;

content = content.replace(oldDropdown, newDropdown);

// Replace grid section
const oldGrid = `              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/60">
                <div className="flex flex-col gap-1">
                  <FieldLabel text="Language" complete={!!data.language} />
                  <EditableField 
                    value={data.language}
                    onSave={(v) => updateData({ language: v })}
                    className="font-semibold text-xs text-foreground !p-1 !-mx-1"
                    placeholder="e.g. English"
                    status={!!data.language ? 'complete' : 'incomplete'}
                  />
                </div>
                
                <div className="flex flex-col gap-2 col-span-2">
                  <FieldLabel text="Categories" complete={!!data.primaryCategory} />
                  <div className="flex flex-col gap-2 mt-0.5">
                    <div className={cn("rounded-md border p-0.5", !!data.primaryCategory ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/50 bg-destructive/5")}>
                      <CategoryDropdown 
                        value={data.primaryCategory} 
                        onSave={(v) => updateData({ primaryCategory: v })} 
                        label="Select Primary Category" 
                      />
                    </div>
                    <CategoryDropdown 
                      value={data.secondaryCategory} 
                      onSave={(v) => updateData({ secondaryCategory: v })} 
                      label="Select Secondary Category (Optional)" 
                    />
                    <CategoryDropdown 
                      value={data.tertiaryCategory} 
                      onSave={(v) => updateData({ tertiaryCategory: v })} 
                      label="Select Tertiary Category (Optional)" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Content Rating</span>
                  <div className="flex gap-2 mt-0.5">`;

const newGrid = `              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/60">
                <div className="flex flex-col gap-1">
                  <FieldLabel text="Language" complete={!!data.language} />
                  <EditableField 
                    value={data.language}
                    onSave={(v) => updateData({ language: v })}
                    className="font-semibold text-xs text-foreground px-2 py-1 rounded-md"
                    placeholder="e.g. English"
                    status={!!data.language ? 'complete' : 'incomplete'}
                  />
                </div>
                
                <div className="flex flex-col gap-1 col-span-2">
                  <FieldLabel text="Categories" complete={!!data.primaryCategory} />
                  <div className="flex flex-col gap-2">
                    <CategoryDropdown 
                      value={data.primaryCategory} 
                      onSave={(v) => updateData({ primaryCategory: v })} 
                      label="Select Primary Category"
                      status={!!data.primaryCategory ? 'complete' : 'incomplete'}
                    />
                    <CategoryDropdown 
                      value={data.secondaryCategory} 
                      onSave={(v) => updateData({ secondaryCategory: v })} 
                      label="Select Secondary Category (Optional)" 
                    />
                    <CategoryDropdown 
                      value={data.tertiaryCategory} 
                      onSave={(v) => updateData({ tertiaryCategory: v })} 
                      label="Select Tertiary Category (Optional)" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pt-0.5">Content Rating</span>
                  <div className="flex gap-2">`;

content = content.replace(oldGrid, newGrid);
fs.writeFileSync('src/app/(app)/podcast-tools/page.tsx', content);
