const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/crawl/page.tsx', 'utf8');

content = content.replace(
  /<Textarea[\s\S]*?\/>/,
  `<textarea
            aria-label="Block Content"
            value={block.text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBlock({ text: e.target.value })}
            placeholder="Type your crawl text here..."
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          />`
);

fs.writeFileSync('src/app/(app)/crawl/page.tsx', content);
