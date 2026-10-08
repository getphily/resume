const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3111/podcast-tools');
  
  // wait for it to render
  await page.waitForTimeout(2000);
  
  const h2Info = await page.locator('#section-metadata h2 svg').boundingBox();
  const h2Text = await page.locator('#section-metadata h2').boundingBox();
  const coverArtLabel = await page.locator('#section-artwork span').first().boundingBox();
  const showDescLabel = await page.locator('span', { hasText: 'SHOW DESCRIPTION' }).boundingBox();
  
  console.log('h2Text:', h2Text);
  console.log('h2Info:', h2Info);
  console.log('coverArtLabel:', coverArtLabel);
  console.log('showDescLabel:', showDescLabel);
  
  await browser.close();
})();
