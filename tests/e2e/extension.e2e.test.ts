import { expect, test } from 'vitest';
import { version } from '../../package.json' with { type: 'json' };

/**
 * End-to-end tests for the Cube Explorer Chrome extension.
 *
 * These run in a real Chromium browser with the built extension loaded from
 * `./dist` (via `vitest-environment-web-ext`). The `browser` and `context`
 * globals are injected by the environment — see `vitest.e2e.config.ts`.
 *
 * https://crxjs.dev/guide/test/installation
 */

test('the built extension exposes a valid MV3 manifest', async () => {
  const manifest = await browser.getManifest();

  expect(manifest.manifest_version).toBe(3);
  expect(manifest.name).toBe('Cube Explorer');
  expect(manifest.version).toBe(version);
  expect(manifest.permissions).toContain('storage');
  // The extension's entry point is a DevTools panel.
  expect(manifest.devtools_page).toBeTruthy();
});

test('the extension loads in Chrome and is assigned an extension ID', async () => {
  const id = await browser.getExtensionId();

  // Unpacked extensions get a 32-letter [a-p] ID derived from their path.
  expect(id).toBeTruthy();
  expect(id).toMatch(/^[a-p]{32}$/);
});

test('the DevTools panel renders its empty state in a real browser', async () => {
  const id = await browser.getExtensionId();
  const page = await context.newPage();

  // The `chrome.devtools.*` APIs only exist inside the DevTools context, so
  // stub them before the panel page loads. Everything else (chrome.storage,
  // chrome.runtime, ...) is real because this is a genuine extension page.
  await page.addInitScript(() => {
    const chrome = (globalThis as { chrome: typeof globalThis.chrome }).chrome;
    if (!chrome.devtools) {
      (chrome as unknown as { devtools: unknown }).devtools = {
        network: {
          onRequestFinished: {
            addListener() {},
            removeListener() {},
          },
        },
      };
    }
  });

  await page.goto(`chrome-extension://${id}/src/devtools/panel.html`);
  await page.waitForLoadState('domcontentloaded');

  // The panel renders <EmptyState /> until a request is selected.
  await expect
    .soft(page.locator('body'))
    .toContainText('No request selected', { timeout: 15_000 });

  await page.close();
});
