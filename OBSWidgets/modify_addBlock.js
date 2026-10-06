const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/crawl/page.tsx', 'utf8');

content = content.replace(
  "setSelectedLayer('crawl');\n    setSelectedPanel('layer');\n    setExpandedBlockId(newBlock.id);",
  "setSelectedLayer(`crawlBlock:${newBlock.id}`);\n    setSelectedPanel('layer');"
);

fs.writeFileSync('src/app/(app)/crawl/page.tsx', content);
