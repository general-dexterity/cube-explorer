import { test as base, chromium, type BrowserContext, type Page } from '@playwright/test';
import path from 'node:path';

type ExtensionFixtures = {
  context: BrowserContext;
  extensionId: string;
  panelPage: Page;
};

/**
 * Extended test fixture for Chrome extension testing
 *
 * Provides:
 * - context: Browser context with extension loaded
 * - extensionId: The extension's ID
 * - panelPage: A page with the DevTools panel loaded
 */
export const test = base.extend<ExtensionFixtures>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, '../../dist');

    const context = await chromium.launchPersistentContext('', {
      headless: false, // Extensions don't work in old headless mode
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });

    await use(context);
    await context.close();
  },

  extensionId: async ({ context }, use) => {
    // Wait for the extension's service worker to be ready
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },

  panelPage: async ({ context, extensionId }, use) => {
    // Open the DevTools panel in a new page
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/src/devtools/panel.html`);

    // Wait for React to mount
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500); // Give React time to hydrate

    await use(page);
  },
});

export { expect } from '@playwright/test';
