import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Chrome extension E2E tests
 *
 * Uses Vite preview server to serve the built extension panel HTML
 * This avoids file:// protocol issues and provides reliable testing
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false, // Extensions need sequential testing
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Important: one worker for extension tests
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    channel: 'chromium', // Use bundled Chromium for extension support
  },
  // Serve the built extension via HTTP (avoids file:// protocol issues)
  webServer: {
    command: 'vite preview --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [
    {
      name: 'chromium-extension',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
