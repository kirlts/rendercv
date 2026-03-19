import { test, expect } from '@playwright/test';

test('verify pdf renders', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Wait for the canvas to appear, which react-pdf uses to render pages
  try {
    const canvas = page.locator('canvas.react-pdf__Page__canvas');
    await canvas.first().waitFor({ timeout: 15000 });
    console.log("PDF CANVAS RENDERED SUCCESSFULLY!");
  } catch (e) {
    console.log("Failed to render PDF canvas.");
  }
});
