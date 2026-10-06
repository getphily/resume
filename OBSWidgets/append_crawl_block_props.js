const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/crawl/page.tsx', 'utf8');

const newComponent = `
function CrawlBlockProperties({
  config,
  onChange,
  blockId,
}: {
  config: ChyronConfig;
  onChange: (c: ChyronConfig) => void;
  blockId: string;
}) {
  const cr = config.crawl;
  const block = cr.blocks.find(b => b.id === blockId);
  if (!block) return null;

  const updateBlock = (patch: Partial<CrawlBlock>) => {
    const newBlocks = cr.blocks.map(b => b.id === blockId ? { ...b, ...patch } : b);
    onChange({ ...config, crawl: { ...cr, blocks: newBlocks } });
  };

  const deleteBlock = () => {
    if (cr.blocks.length <= 1) {
      toast.error('You need at least one crawl block');
      return;
    }
    onChange({ ...config, crawl: { ...cr, blocks: cr.blocks.filter(b => b.id !== blockId) } });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border bg-card p-5 flex flex-col gap-4 relative group">
        <div className="flex justify-between items-center mb-2">
          <Input 
            aria-label="Block Label"
            value={block.label} 
            onChange={e => updateBlock({ label: e.target.value })}
            className="h-8 font-bold text-base border-transparent hover:border-border focus-visible:border-border px-1.5 -ml-1.5 bg-transparent shadow-none"
          />
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={deleteBlock}
            className="text-muted-foreground hover:text-destructive shrink-0"
            aria-label="Delete block"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Content (Plain Text or Markdown)</label>
          <Textarea 
            aria-label="Block Content"
            value={block.text}
            onChange={e => updateBlock({ text: e.target.value })}
            placeholder="Type your crawl text here..."
            className="min-h-[100px] text-sm resize-y"
          />
        </div>
      </Card>
    </div>
  );
}
`;

content = content.replace(
  "function LayoutProperties",
  newComponent + "\nfunction LayoutProperties"
);

fs.writeFileSync('src/app/(app)/crawl/page.tsx', content);
