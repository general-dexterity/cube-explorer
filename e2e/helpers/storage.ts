import type { Page } from '@playwright/test';
import type { Settings } from '../../src/types';

const SETTINGS_STORAGE_KEY = 'cubeExplorerSettings_v1.20250118';
const PINNED_REQUESTS_STORAGE_KEY = 'cubeExplorerPinnedRequests_v1.20250821';

/**
 * Set extension settings in Chrome storage
 */
export async function setSettings(page: Page, settings: Partial<Settings>) {
  await page.evaluate(
    ({ key, value }) => {
      chrome.storage.sync.set({ [key]: value });
    },
    {
      key: SETTINGS_STORAGE_KEY,
      value: settings,
    }
  );
}

/**
 * Get extension settings from Chrome storage
 */
export async function getSettings(page: Page): Promise<Settings | undefined> {
  return page.evaluate(
    ({ key }) => {
      return new Promise((resolve) => {
        chrome.storage.sync.get(key, (result) => {
          resolve(result[key]);
        });
      });
    },
    { key: SETTINGS_STORAGE_KEY }
  );
}

/**
 * Clear all extension storage
 */
export async function clearStorage(page: Page) {
  await page.evaluate(() => {
    chrome.storage.sync.clear();
  });
}

/**
 * Set pinned requests in Chrome storage
 */
export async function setPinnedRequests(page: Page, requests: any[]) {
  await page.evaluate(
    ({ key, value }) => {
      chrome.storage.sync.set({ [key]: value });
    },
    {
      key: PINNED_REQUESTS_STORAGE_KEY,
      value: requests,
    }
  );
}

/**
 * Get pinned requests from Chrome storage
 */
export async function getPinnedRequests(page: Page): Promise<any[]> {
  return page.evaluate(
    ({ key }) => {
      return new Promise((resolve) => {
        chrome.storage.sync.get(key, (result) => {
          resolve(result[key] || []);
        });
      });
    },
    { key: PINNED_REQUESTS_STORAGE_KEY }
  );
}
