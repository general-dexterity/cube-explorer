import { test as base, chromium, type BrowserContext, type Page } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type ExtensionFixtures = {
  context: BrowserContext;
  panelPage: Page;
};

/**
 * Extended test fixture for Chrome extension testing
 *
 * Provides:
 * - context: Browser context
 * - panelPage: A page with the DevTools panel loaded
 *
 * Note: We load the panel HTML directly (not as an extension) and mock Chrome APIs.
 * This provides reliable E2E testing without the complexity of extension loading.
 */
export const test = base.extend<ExtensionFixtures>({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      headless: true,
      args: [
        '--headless=new',
        '--no-sandbox',
        '--disable-setuid-sandbox',
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
      // Mock chrome.storage API
      (window as any).chrome = {
        storage: {
          sync: {
            get: (keys: string[], callback: (result: any) => void) => {
              // Return empty/default values
              const result: any = {};
              if (Array.isArray(keys)) {
                for (const key of keys) {
                  result[key] = undefined;
                }
              }
              setTimeout(() => callback(result), 0);
            },
            set: (items: any, callback?: () => void) => {
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
      };
    });

    // Load the panel HTML directly
    const panelPath = path.join(__dirname, '../../dist/src/devtools/panel.html');
    await page.goto(`file://${panelPath}`);

    // Wait for React to mount
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Give React time to hydrate

    await use(page);
  },
});

export { expect } from '@playwright/test';
