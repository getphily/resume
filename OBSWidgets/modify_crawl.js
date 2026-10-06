const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/crawl/page.tsx', 'utf8');

// 1. Add onDragEnd logic for crawl-blocks-list
content = content.replace(
  "if (result.source.droppableId === 'layers-list') {",
  `if (result.source.droppableId === 'crawl-blocks-list') {
      const blocks = Array.from(config.crawl.blocks);
      const [reorderedBlock] = blocks.splice(result.source.index, 1);
      blocks.splice(result.destination.index, 0, reorderedBlock);
      setConfig({ ...config, crawl: { ...config.crawl, blocks } });
      return;
    }

    if (result.source.droppableId === 'layers-list') {`
);

fs.writeFileSync('src/app/(app)/crawl/page.tsx', content);
