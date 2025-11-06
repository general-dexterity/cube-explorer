# E2E Testing Best Practices for Chrome Extensions (2025)

**Updated:** 2025-11-07
**Based on:** Latest Chrome documentation, Playwright updates, and community practices

## 🎯 Key Finding: Playwright is Now the Industry Standard

As of 2025, **Playwright has become the recommended framework** for Chrome extension E2E testing, surpassing Puppeteer for most use cases.

## 🚀 Chrome's New Headless Mode (Critical Update)

### Timeline
- **Chrome 112**: Introduced `--headless=new` mode that supports extensions
- **Chrome 128+**: New headless mode became the default (no flag needed)
- **Chrome 132+**: Old headless mode removed entirely

### What This Means
✅ Extensions now work in headless mode by default
✅ CI/CD pipelines can run without Xvfb
✅ More reliable and authentic browser behavior

## 📋 Recommended Approach for 2025

### 1. Use Playwright with Chromium Channel

```typescript
// e2e/fixtures/extension.ts
import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, '../../dist');

    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium', // IMPORTANT: Use bundled Chromium, not Chrome/Edge
      headless: true,      // Now works with extensions!
      args: [
        '--headless=new',  // Explicit new headless (though default in 128+)
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--no-sandbox',    // For CI/CD environments
        '--disable-setuid-sandbox',
      ],
    });

    await use(context);
    await context.close();
  },

  extensionId: async ({ context }, use) => {
    // For Manifest v3 with service workers
    let [serviceWorker] = context.serviceWorkers();
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent('serviceworker');
    }

    const extensionId = serviceWorker.url().split('/')[2];
    await use(extensionId);
  },
});
```

### 2. Special Handling for DevTools Extensions

**Problem**: DevTools extensions use `devtools_page` instead of background service workers, making standard ID detection impossible.

**Solutions:**

#### Option A: Navigate to Extension Popup/Options (If Available)
```typescript
// If your extension has a popup or options page
const page = await context.newPage();
await page.goto(`chrome-extension://${extensionId}/popup.html`);
```

#### Option B: Test Panel HTML Directly via HTTP Server
```typescript
// e2e/fixtures/extension.ts
import { preview } from 'vite';

let previewServer: any;

export const test = base.extend({
  context: async ({}, use) => {
    // Start Vite preview server
    previewServer = await preview({
      preview: { port: 4173 },
      build: { outDir: 'dist' },
    });

    const context = await chromium.launch({
      channel: 'chromium',
      headless: true,
    });

    await use(context);
    await context.close();
    await previewServer.close();
  },

  panelPage: async ({ context }, use) => {
    const page = await context.newPage();

    // Mock Chrome APIs
    await page.addInitScript(() => {
      (window as any).chrome = {
        storage: {
          sync: {
            get: (keys: any, callback: any) => {
              const result: any = {};
              if (Array.isArray(keys)) {
                for (const key of keys) result[key] = undefined;
              }
              setTimeout(() => callback(result), 0);
            },
            set: (items: any, callback?: any) => {
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

    // Load from HTTP server (not file://)
    await page.goto('http://localhost:4173/src/devtools/panel.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    await use(page);
  },
});
```

#### Option C: Use Puppeteer for DevTools Extensions
Puppeteer still has better support for Chrome-specific features:

```typescript
import puppeteer from 'puppeteer';
import path from 'path';

const pathToExtension = path.join(__dirname, 'dist');

const browser = await puppeteer.launch({
  headless: 'new', // Use new headless mode
  args: [
    `--disable-extensions-except=${pathToExtension}`,
    `--load-extension=${pathToExtension}`,
  ],
});

// Open panel directly
const page = await browser.newPage();
await page.goto(`chrome-extension://${extensionId}/devtools/panel.html`);
```

## 🏆 Playwright vs Puppeteer (2025 Update)

### When to Use Playwright ✅
- **Multi-browser testing** (Chrome, Firefox, WebKit)
- **Modern API** with better ergonomics
- **Better documentation** and community support
- **Cross-language support** (JS, Python, Java, .NET)
- **Standard extensions** (popup, options, content scripts)

### When to Use Puppeteer ⚠️
- **DevTools extensions specifically** (better Chrome DevTools integration)
- **Chrome-only requirements**
- **Lightweight setup** (fewer dependencies)
- **Closer to Chrome internals**

**Verdict**: Start with Playwright, fall back to Puppeteer for DevTools extensions if needed.

## 📝 Official Google Recommendations (2025)

From Chrome for Developers documentation:

1. **Use automation frameworks**: Puppeteer, Selenium, or Playwright
2. **Avoid internal state access**: Test what users see
3. **Execute in extension context**: Use `page.evaluate()` when needed
4. **Test across browsers**: Extensions should work in Chrome, Edge, etc.

## 🔧 Practical Implementation for Cube Explorer

### Recommended Approach: HTTP Server + Mocked APIs

```bash
# Package.json
{
  "scripts": {
    "test:e2e": "pnpm build && playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  workers: 1,
  use: {
    headless: true,
    channel: 'chromium',
  },
  webServer: {
    command: 'vite preview --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
```

### Why This Works Best

1. ✅ **Vite handles assets correctly** (no file:// CORS issues)
2. ✅ **Mock Chrome APIs easily** via `addInitScript`
3. ✅ **Fast and reliable** in CI/CD
4. ✅ **No extension ID detection needed**
5. ✅ **Works in headless mode** without Xvfb

## 🎨 Test Structure Best Practices

### 1. Use Page Object Model

```typescript
// e2e/pages/panel.ts
export class PanelPage {
  constructor(private page: Page) {}

  async getEmptyState() {
    return this.page.getByTestId('empty-state');
  }

  async getRequestList() {
    return this.page.getByTestId('request-list');
  }

  async selectRequest(id: string) {
    await this.page.getByTestId(`request-item-${id}`).click();
  }

  async openSettings() {
    await this.page.getByTestId('settings-toggle-button').click();
  }
}
```

### 2. Create Helper Functions

```typescript
// e2e/helpers/requests.ts
export async function simulateRequest(page: Page, request: CubeRequest) {
  await page.evaluate((req) => {
    const event = new CustomEvent('cube-request', { detail: req });
    window.dispatchEvent(event);
  }, request);
}
```

### 3. Use Fixtures for State Management

```typescript
// e2e/fixtures/with-requests.ts
export const test = base.extend({
  panelWithRequests: async ({ panelPage }, use) => {
    // Pre-populate with test data
    await simulateRequest(panelPage, mockRequest1);
    await simulateRequest(panelPage, mockRequest2);
    await use(panelPage);
  },
});
```

## 🚨 Common Pitfalls to Avoid

### ❌ Don't Use file:// Protocol
```typescript
// BAD - Module loading issues
await page.goto(`file://${distPath}/panel.html`);

// GOOD - Use HTTP server
await page.goto('http://localhost:4173/src/devtools/panel.html');
```

### ❌ Don't Forget to Mock Chrome APIs
```typescript
// BAD - Tests fail with "chrome is not defined"
const page = await context.newPage();
await page.goto(url);

// GOOD - Mock before navigation
await page.addInitScript(() => {
  (window as any).chrome = { /* ... */ };
});
await page.goto(url);
```

### ❌ Don't Use Chrome/Edge Channels
```typescript
// BAD - Extensions flags removed in Chrome/Edge
channel: 'chrome'

// GOOD - Use bundled Chromium
channel: 'chromium'
```

## 📊 Coverage Goals

Based on real-world examples:
- **Contentsquare achieved 73.7% E2E coverage** (17 of 28 tests automated)
- **Focus on critical user paths** first
- **Complement with unit tests** for 90%+ overall coverage

## 🎯 Recommended Test Suite Structure

```
e2e/
├── fixtures/
│   ├── extension.ts          # Base extension fixture
│   └── with-data.ts           # Pre-populated data fixtures
├── helpers/
│   ├── requests.ts            # Request simulation
│   ├── storage.ts             # Storage mocking
│   └── assertions.ts          # Custom assertions
├── pages/
│   ├── panel.ts               # Panel page object
│   └── settings.ts            # Settings page object
└── tests/
    ├── 01-empty-state.spec.ts
    ├── 02-receive-event.spec.ts
    ├── 03-click-event.spec.ts
    ├── 04-tab-switching.spec.ts
    ├── 05-settings.spec.ts
    └── 06-pin-persistence.spec.ts
```

## 🔄 Migration Path from Current Setup

### Step 1: Add Vite Preview Server
```typescript
// playwright.config.ts
webServer: {
  command: 'vite preview --port 4173',
  port: 4173,
  reuseExistingServer: !process.env.CI,
}
```

### Step 2: Update Fixture
```typescript
// Load from HTTP instead of file://
await page.goto('http://localhost:4173/src/devtools/panel.html');
```

### Step 3: Verify First Test
```bash
pnpm build
pnpm test:e2e
```

### Step 4: Implement Remaining Tests
One test per commit, verify each passes before moving on.

## 📚 Additional Resources

- [Playwright Chrome Extensions Docs](https://playwright.dev/docs/chrome-extensions)
- [Chrome Extension Testing Guide](https://developer.chrome.com/docs/extensions/how-to/test/end-to-end-testing)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Contentsquare E2E Blog Post](https://engineering.contentsquare.com/2024/automating-e2e-tests-chrome-extensions/)

## 🎉 Summary

**2025 State of Chrome Extension Testing:**
- ✅ Headless mode fully supports extensions
- ✅ Playwright is the modern standard
- ✅ Vite preview server solves module loading issues
- ✅ Comprehensive testing is now practical and reliable

**Next Action:** Update the fixture to use Vite preview server, verify it works, then proceed with test implementation.
