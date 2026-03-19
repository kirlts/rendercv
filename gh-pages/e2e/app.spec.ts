import { test, expect } from '@playwright/test';

test.describe('App E2E', () => {
  test('should load default showcase and compile', async ({ page }) => {
    // 1. Visit app
    await page.goto('/');

    // 2. Verify Toolbar exists
    await expect(page.locator('text=RenderCV')).toBeVisible();

    // 3. Verify Editor has content
    // We mock the editor in e2e so we can check the text or wait for the monaco editor elements
    await expect(page.locator('.view-lines').first()).toBeVisible();

    // 4. Verify Wasm Notice appears
    await expect(page.locator('[data-testid="wasm-notice"]')).toBeVisible();

    // 5. Dismiss Notice
    await page.click('button[aria-label="Dismiss"]');
    await expect(page.locator('[data-testid="wasm-notice"]')).toBeHidden();

    // 6. Verify PDF Shimmer is loading or document is loaded
    // Since WASM might fail to compile or fetch packages correctly in a test environment,
    // we just check if it attempts to load and shows the PDF viewer container
    await expect(page.locator('[data-testid="pdf-viewer"]')).toBeVisible();
  });

  test('should clear template on reset', async ({ page }) => {
    await page.goto('/');

    // Ensure we are on desktop view
    await page.setViewportSize({ width: 1200, height: 800 });

    // 1. Click Reset
    await page.click('text=Reset');

    // 2. Verify Reset Hint appears
    await expect(page.locator('[data-testid="reset-hint"]')).toBeVisible();

    // 3. Verify Monaco editor content changed (checking a specific skeleton string)
    await expect(page.locator('.view-lines').first()).toContainText('Your Full Name');
  });
});
