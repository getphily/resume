const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/crawl/page.tsx', 'utf8');

// Replace the rendering of CrawlProperties
content = content.replace(
  /{[^}]*selectedPanel === 'layer' && selectedLayer === 'crawl'[^}]*CrawlProperties[\s\S]*?\/>\s*\)}/,
  `{(selectedPanel === 'layer' && selectedLayer === 'crawl') && (
            <CrawlProperties 
              config={config} 
              onChange={setConfig} 
            />
          )}
          {(selectedPanel === 'layer' && selectedLayer?.startsWith('crawlBlock:')) && (
            <CrawlBlockProperties 
              config={config} 
              onChange={setConfig} 
              blockId={selectedLayer.replace('crawlBlock:', '')}
            />
          )}`
);

fs.writeFileSync('src/app/(app)/crawl/page.tsx', content);
