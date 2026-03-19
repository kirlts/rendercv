import { test, expect } from '@playwright/test';

test('capture pdf error', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Wait for the "Detailed Error:" text to appear, or for the PDF to load successfully
  try {
    const errorBlock = page.locator('text=Detailed Error:');
    await errorBlock.waitFor({ timeout: 15000 });
    
    // Get the full text of the red error box
    const errorText = await page.locator('.bg-red-900\\/50').innerText();
    console.log("PDF ERROR OUTPUT:", errorText);
  } catch (e) {
    console.log("No error block appeared. PDF might have loaded successfully or timed out.");
  }
});
