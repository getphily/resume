const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/crawl/page.tsx', 'utf8');

// Replace CrawlProperties definition
content = content.replace(
  /function CrawlProperties\(\{[\s\S]*?expandedBlockId,[\s\S]*?setExpandedBlockId,[\s\S]*?\}\) \{[\s\S]*?const cr = config.crawl;/,
  `function CrawlProperties({
  config,
  onChange,
}: {
  config: ChyronConfig;
  onChange: (c: ChyronConfig) => void;
}) {
  const cr = config.crawl;`
);

// Remove the CrawlBlocksManager instantiation from inside CrawlProperties
content = content.replace(
  /<CrawlBlocksManager[\s\S]*?\/>/,
  ""
);

// We should also remove the "2. Crawl Blocks" header if it exists.
content = content.replace(
  /{[^}]*2\. Crawl Blocks[^}]*}/,
  ""
);

fs.writeFileSync('src/app/(app)/crawl/page.tsx', content);
