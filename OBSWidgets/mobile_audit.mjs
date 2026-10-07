import { chromium } from 'playwright';

const pagesToTest = [
  { name: 'dashboard', url: 'http://localhost:3111/' },
  { name: 'podcast-tools', url: 'http://localhost:3111/podcast-tools' },
  { name: 'clock', url: 'http://localhost:3111/clock' },
  { name: 'timer', url: 'http://localhost:3111/timer' },
  { name: 'crawl', url: 'http://localhost:3111/crawl' },
  { name: 'screen', url: 'http://localhost:3111/screen' },
  { name: 'kalimotxo', url: 'http://localhost:3111/kalimotxo' }
];

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  for (const p of pagesToTest) {
    try {
      console.log(`Navigating to ${p.name}...`);
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 10000 });
      // wait a bit for animations/renders
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `/Users/philybarrolaza/.gemini/antigravity/brain/5848bfb0-6dbe-42ca-9ff1-04b31d25d40d/scratch/${p.name}_mobile.png`, fullPage: true });
      console.log(`Saved ${p.name}_mobile.png`);
    } catch (e) {
      console.error(`Failed on ${p.name}:`, e.message);
    }
  }

  await browser.close();
}

run().catch(console.error);
