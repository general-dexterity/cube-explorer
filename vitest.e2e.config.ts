/// <reference types="vitest/config" />

import { defineConfig } from 'vitest/config';

/**
 * E2E test configuration for the Chrome extension.
 *
 * Uses `vitest-environment-web-ext` (built on Playwright + Chromium) to load
 * the built extension from `./dist` in a real browser. The extension is a
 * DevTools panel, so `playwright.devtools` auto-opens DevTools for new tabs
 * (`--auto-open-devtools-for-tabs`), letting the panel register itself.
 *
 * Run a production build first (`pnpm build`) — the `test:e2e` script does
 * this for you. See https://crxjs.dev/guide/test/installation
 */
export default defineConfig({
  test: {
    include: ['tests/e2e/**/*.e2e.test.ts'],
    environment: 'web-ext',
    environmentOptions: {
      'web-ext': {
        path: './dist',
        targetUrl: 'https://example.com',
        playwright: {
          devtools: true,
          slowMo: 0,
          userDataDir: false,
        },
      },
    },
    // E2E tests are slower than unit tests: real browser + extension load.
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
