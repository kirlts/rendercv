const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the local server
  await page.goto('http://localhost:5173');

  // Wait for the app to load. We wait for Monaco or PDF viewer elements
  try {
    await page.waitForSelector('[data-testid="editor-panel"]', { timeout: 10000 });
    await page.waitForTimeout(2000); // give it a moment to settle
  } catch (e) {
    console.log("Could not find editor panel. Still taking screenshot.");
  }

  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  await browser.close();
  console.log('Screenshot saved to screenshot.png');
})();
