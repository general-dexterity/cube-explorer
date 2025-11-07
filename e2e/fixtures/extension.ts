import {
  type BrowserContext,
  test as base,
  chromium,
  type Page,
} from '@playwright/test';

type ExtensionFixtures = {
  context: BrowserContext;
  panelPage: Page;
};

/**
 * Extended test fixture for Chrome extension E2E testing
 *
 * Provides:
 * - context: Browser context
 * - panelPage: A page with the DevTools panel loaded via HTTP
 *
 * Approach: We load the panel HTML from Vite preview server (HTTP) and mock Chrome APIs.
 * This provides reliable E2E testing without file:// protocol limitations.
 *
 * Benefits:
 * - No CORS or module loading issues
 * - Works in headless mode with Chrome's new headless (--headless=new)
 * - No extension ID detection needed
 * - Fast and reliable in CI/CD
 *
 * @see https://playwright.dev/docs/chrome-extensions
 */
export const test = base.extend<ExtensionFixtures>({
  context: async (_, use) => {
    const context = await chromium.launchPersistentContext('', {
      headless: true,
      channel: 'chromium', // Use bundled Chromium for best compatibility
      args: [
        '--headless=new', // Chrome 128+ default, but be explicit
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu', // Disable GPU in headless environment
        '--disable-software-rasterizer',
        '--disable-dev-shm-usage',
      ],
    });

    await use(context);
    await context.close();
  },

  panelPage: async ({ context }, use) => {
    const page = await context.newPage();

    // Mock Chrome APIs before loading the panel
    await page.addInitScript(() => {
      type StorageResult = Record<string, unknown>;

      // Mock chrome.storage API
      (window as Window & { chrome: typeof chrome }).chrome = {
        storage: {
          sync: {
            get: (
              keys: string[],
              callback: (result: StorageResult) => void,
            ) => {
              // Return empty/default values
              const result: StorageResult = {};
              if (Array.isArray(keys)) {
                for (const key of keys) {
                  result[key] = undefined;
                }
              }
              setTimeout(() => callback(result), 0);
            },
            set: (_items: StorageResult, callback?: () => void) => {
              setTimeout(() => callback?.(), 0);
            },
            clear: (callback?: () => void) => {
              setTimeout(() => callback?.(), 0);
            },
          },
          onChanged: {
            addListener: () => {},
            removeListener: () => {},
          },
        },
        devtools: {
          network: {
            onRequestFinished: {
              addListener: () => {},
              removeListener: () => {},
            },
          },
        },
      } as typeof chrome;
    });

    // Load the panel from HTTP server (started by webServer in playwright.config.ts)
    // This avoids file:// protocol issues with Vite-bundled assets
    await page.goto('http://localhost:4173/src/devtools/panel.html');

    // Wait for React to mount
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Give React time to hydrate

    await use(page);
  },
});

export { expect } from '@playwright/test';
