import { expect, test } from '../fixtures/extension';

test.describe('Settings', () => {
  test('should open settings panel and change settings', async ({
    panelPage,
  }) => {
    // Find and click the settings toggle button
    const settingsToggle = panelPage.getByTestId('settings-toggle-button');
    await expect(settingsToggle).toBeVisible();
    await settingsToggle.click();

    // Wait for settings panel to open
    await panelPage.waitForTimeout(300);

    // Verify settings panel is visible
    const settingsPanel = panelPage.getByTestId('settings-panel');
    await expect(settingsPanel).toBeVisible();

    // Find the URL input field (it should contain the default URL)
    const urlInput = settingsPanel.locator('input[type="text"]').first();
    await expect(urlInput).toBeVisible();

    // Clear and type a new URL
    await urlInput.clear();
    await urlInput.fill('https://custom-api.example.com/cubejs-api/v1');

    // Find the auto-capture toggle/checkbox
    const autoCaptureToggle = settingsPanel.locator(
      'input[type="checkbox"]',
    ).first();

    // Get current state and toggle it
    const isChecked = await autoCaptureToggle.isChecked();
    await autoCaptureToggle.click();

    // Verify the state changed
    await expect(autoCaptureToggle).toHaveProperty('checked', !isChecked);

    // Close settings panel
    await settingsToggle.click();
    await panelPage.waitForTimeout(300);

    // Verify settings panel is now hidden
    await expect(settingsPanel).not.toBeVisible();

    // Reopen settings to verify changes persisted
    await settingsToggle.click();
    await panelPage.waitForTimeout(300);

    // Verify the URL change persisted
    await expect(urlInput).toHaveValue(
      'https://custom-api.example.com/cubejs-api/v1',
    );
  });
});
