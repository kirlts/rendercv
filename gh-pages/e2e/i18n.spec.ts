import { test, expect } from '@playwright/test';

test.describe('i18n E2E', () => {
  test('should toggle UI language', async ({ page }) => {
    await page.goto('/');

    // Default is English (based on our default config or test setup)
    await expect(page.locator('text=Download PDF').first()).toBeVisible();

    // Toggle to Spanish
    await page.click('button:has-text("EN")');

    // Now should be Spanish
    await expect(page.locator('text=Descargar PDF').first()).toBeVisible();
    await expect(page.locator('text=ES').first()).toBeVisible();

    // Verify LocalStorage
    const lang = await page.evaluate(() => localStorage.getItem('rendercv-ui-lang'));
    expect(lang).toBe('es');
  });
});
