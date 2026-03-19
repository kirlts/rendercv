import { test, expect } from '@playwright/test';

test.describe('Toolbar and Render Engine E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to initialize and all background API auto-fetches to resolve
    await expect(page.getByText('RenderCV Live Preview')).toBeVisible();
    await page.waitForLoadState('networkidle');
  });

  test('can select a different design theme', async ({ page }) => {
    // Find the design select by its name/label
    const designSelect = page.getByRole('combobox', { name: /diseño/i });
    
    // Wait for the themes to load from the API (Classic option should appear)
    await expect(designSelect).toContainText('Classic', { timeout: 10000 });

    // Change design to ModernCV
    await designSelect.selectOption('moderncv');
    
    // Check that it's selected
    await expect(designSelect).toHaveValue('moderncv');
  });

  test('can select an oferta from dropdown (if options exist)', async ({ page }) => {
    // Wait for ofertas to load from API
    const ofertasSelect = page.locator('#ofertas-select');
    
    // Check if the dropdown is completely disabled (empty state)
    const isDisabled = await ofertasSelect.isDisabled();
    
    if (isDisabled) {
      // The new empty state should show the placeholder text
      await expect(ofertasSelect).toContainText('-- No hay ofertas --', { timeout: 10000 });
      console.log('Skipping selection test: No ofertas available in backend');
      return;
    }
    
    // Select the first real oferta option
    const options = await ofertasSelect.locator('option').allInnerTexts();
    const ofertaName = options.find(o => o !== '-- Recientes --');
    if (ofertaName) {
      // Find the value for this option
      const optionEl = ofertasSelect.locator(`option:has-text("${ofertaName}")`);
      const value = await optionEl.getAttribute('value');
      if (value) {
        await ofertasSelect.selectOption(value);
        
        // Editor should update with content (can't assert exact text as it's dynamic)
        const editor = page.locator('.monaco-editor');
        await expect(editor).toBeVisible({ timeout: 15000 });
      }
    }
  });

  test('can upload a YAML file using the Cargar YAML button', async ({ page }) => {
    // Create a mock YAML file with playwright's file chooser
    const yamlContent = `cv:\n  name: Playwright Test User\n  sections:\n    about: Hello from E2E test`;
    
    // Start waiting for file chooser before clicking
    const fileChooserPromise = page.waitForEvent('filechooser');
    
    // Click the upload button
    await page.getByRole('button', { name: 'Cargar YAML' }).click();
    
    // Give it the file
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-upload.yaml',
      mimeType: 'text/yaml',
      buffer: Buffer.from(yamlContent)
    });
    
    // Verify the editor updated
    const editor = page.locator('.monaco-editor');
    await expect(editor).toContainText('Playwright Test User', { timeout: 10000 });
  });

  test('can reset the editor content', async ({ page }) => {
    // First alter the content by uploading a mock YAML
    const yamlContent = `cv:\n  name: Temporary User\n  sections:\n    about: Hello from E2E test`;
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Cargar YAML' }).click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-upload.yaml',
      mimeType: 'text/yaml',
      buffer: Buffer.from(yamlContent)
    });
    
    const editor = page.locator('.monaco-editor');
    await expect(editor).toContainText('Temporary User', { timeout: 10000 });

    // Click Reset
    await page.getByRole('button', { name: 'Reset' }).click();
    
    // Verify it changed back to John Doe default
    await expect(editor).toContainText('name: John Doe', { timeout: 10000 });
  });
});
