import { chromium } from 'playwright';
const pagesToTest = [
  { name: 'clock_stacked', url: 'http://localhost:3111/clock' },
  { name: 'crawl_stacked', url: 'http://localhost:3111/crawl' },
];
async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  for (const p of pagesToTest) {
    try {
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `/Users/philybarrolaza/.gemini/antigravity/brain/5848bfb0-6dbe-42ca-9ff1-04b31d25d40d/scratch/${p.name}.png` });
    } catch (e) { }
  }
  await browser.close();
}
run().catch(console.error);
