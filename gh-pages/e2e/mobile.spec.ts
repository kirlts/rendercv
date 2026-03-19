import { test, expect } from '@playwright/test';

test.describe('Mobile View E2E', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // Mobile viewport

  test('should render tab switcher and hamburger menu', async ({ page }) => {
    await page.goto('/');

    // Verify Mobile View is active
    const mobileView = page.locator('[data-testid="mobile-view"]');
    await expect(mobileView).toBeVisible();

    // Verify Editor tab is default
    const editorTab = page.locator('button', { hasText: 'Editor' });
    const previewTab = page.locator('button', { hasText: 'Preview' });

    await expect(editorTab).toHaveClass(/text-blue-400/);
    await expect(previewTab).not.toHaveClass(/text-blue-400/);

    // Click Preview
    await previewTab.click();

    await expect(previewTab).toHaveClass(/text-blue-400/);
    await expect(editorTab).not.toHaveClass(/text-blue-400/);

    // Verify hamburger menu opens
    const menuBtn = page.locator('.w-8.h-8.flex-col');
    await menuBtn.click();

    // Look for things inside menu
    await expect(page.locator('select').first()).toBeVisible(); // Theme selector
  });
});
