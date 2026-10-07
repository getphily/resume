import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  try {
    console.log("Navigating to clock...");
    await page.goto("http://localhost:3111/clock", { waitUntil: 'networkidle', timeout: 10000 });
    
    // click settings
    await page.click('button:has-text("Settings")');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: `/Users/philybarrolaza/.gemini/antigravity/brain/5848bfb0-6dbe-42ca-9ff1-04b31d25d40d/scratch/clock_drawer_open.png` });
    console.log("Saved clock_drawer_open.png");

  } catch (e) {
    console.error(e);
  }
  await browser.close();
}
run().catch(console.error);
