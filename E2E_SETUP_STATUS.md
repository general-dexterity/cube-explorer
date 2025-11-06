# E2E Testing Setup Status

## Summary

This document outlines the work completed for adding E2E tests to the Cube Explorer Chrome extension, challenges encountered, and recommendations for completion.

## ✅ Completed

### 1. Dependencies Installed
- `@playwright/test@^1.56.1` - Modern E2E testing framework
- `msw@^2.12.0` - Mock Service Worker for API mocking
- Chromium browser installed via Playwright

### 2. Infrastructure Created
- `playwright.config.ts` - Playwright configuration
- `e2e/fixtures/extension.ts` - Test fixtures for extension loading
- `e2e/helpers/storage.ts` - Chrome storage helpers
- `e2e/helpers/mock-requests.ts` - Mock Cube API request generators
- Package scripts: `test:e2e`, `test:e2e:ui`, `test:e2e:debug`

### 3. Component Enhancements
Added `data-testid` attributes to all key components:
- `empty-state` - Empty state component
- `listening-message` - "Listening for requests" message
- `request-list` - Request list container
- `request-item-{id}` - Individual request items
- `settings-toggle-button` - Settings button
- `settings-panel` - Settings panel container
- `request-details` - Request details container
- `pin-button` - Pin/unpin button
- `tab-{name}` - Tab buttons (query, response, headers)
- `tab-content-{name}` - Tab content areas

### 4. Test Structure
- `e2e/tests/` - E2E test directory
- `01-empty-state.spec.ts` - First test (in progress)

### 5. TypeScript Fixes
- Fixed strict mode errors in `tests/utils/mock.ts`
- All code builds successfully

## ⚠️ Challenges Encountered

### Chrome Extension Testing Complexity

Testing Chrome DevTools extensions in headless mode presents unique challenges:

1. **No Service Worker**: DevTools extensions use `devtools_page` instead of background service workers, making standard extension ID detection methods unusable.

2. **Headless Mode Limitations**: While Chrome's new headless mode (`--headless=new`) supports extensions, DevTools extensions behave differently and don't load properly when accessed via `file://` protocol.

3. **Extension ID Detection**: Dynamically determining the extension ID for an unpacked extension in headless mode proved unreliable.

### Attempted Solutions

1. ✗ Service worker detection - DevTools extensions don't have service workers
2. ✗ chrome://extensions page parsing - Limited access in headless mode
3. ✗ Extension ID computation from path - Chrome's algorithm is complex
4. ✗ Loading panel.html via file:// - Module loading and CORS issues

## 🔧 Current Approach

The fixture now loads the panel HTML directly with mocked Chrome APIs:
- Loads `dist/src/devtools/panel.html` via `file://` protocol
- Mocks `chrome.storage` and `chrome.devtools.network` APIs
- Provides isolated testing environment

**Status**: Tests hang during page load, likely due to module loading issues with Vite-bundled assets when accessed via `file://`.

## 💡 Recommended Solutions

### Option 1: Use a Local Web Server (RECOMMENDED)

Serve the `dist/` folder via HTTP server to avoid `file://` limitations:

```typescript
// e2e/fixtures/extension.ts
import { preview } from 'vite';

let server: any;

export const test = base.extend<ExtensionFixtures>({
  context: async ({}, use) => {
    // Start preview server
    server = await preview({
      preview: { port: 4173 },
      build: { outDir: 'dist' },
    });

    const context = await chromium.launch({ headless: true });
    await use(context);

    await context.close();
    await server.close();
  },

  panelPage: async ({ context }, use) => {
    const page = await context.newPage();

    // Mock Chrome APIs
    await page.addInitScript(() => {
      // ... chrome mocks ...
    });

    // Load from HTTP server instead of file://
    await page.goto('http://localhost:4173/src/devtools/panel.html');
    await use(page);
  },
});
```

### Option 2: Use xvfb-run for Headed Mode

Run tests in headed mode with virtual display:

```bash
# In CI/CD
xvfb-run --auto-servernum pnpm test:e2e

# Update fixture to use headed mode
headless: false,
```

### Option 3: Simplify with Unit Tests

Given the complexity, consider comprehensive component tests instead:
- Test components in isolation with Testing Library
- Mock Chrome APIs thoroughly
- Use Vitest browser mode for real browser testing
- Reserve E2E for critical user flows only

## 📝 Remaining Test Scenarios

Once the fixture is working, implement these tests:

1. **Empty State** (`01-empty-state.spec.ts`) ⏳ In Progress
   - Panel displays empty list on open
   - Shows "Listening for requests" message
   - Shows "No request selected" empty state

2. **Receiving Events** (`02-receive-event.spec.ts`)
   - Event appears in request list
   - Empty state remains for content area
   - Request shows correct metadata

3. **Clicking Events** (`03-click-event.spec.ts`)
   - Event changes state (highlighted) in list
   - Content area shows request details
   - Pin button is visible

4. **Tab Switching** (`04-tab-switching.spec.ts`)
   - Query tab shows query data
   - Response tab shows response data
   - Headers tab shows headers

5. **Settings** (`05-settings.spec.ts`)
   - Can open settings panel
   - Can change URLs
   - Can toggle auto-capture
   - Settings persist

6. **Pin Persistence** (`06-pin-persistence.spec.ts`)
   - Can pin an event
   - Pinned event persists after reload
   - Can unpin event

## 📊 Recommended Unit Tests

While E2E tests are valuable, these unit tests provide faster feedback:

### Component Tests (`tests/components/`)

```typescript
// tests/components/empty-state.test.tsx
describe('EmptyState', () => {
  test('renders empty state message');
  test('displays icon');
});

// tests/components/request-item.test.tsx
describe('RequestItem', () => {
  test('displays timestamp');
  test('displays status code');
  test('displays cube names');
  test('shows pin indicator when pinned');
  test('shows error state for 4xx/5xx');
  test('shows correct tag counts');
  test('handles click event');
});

// tests/components/request-details.test.tsx
describe('RequestDetails', () => {
  test('renders request details');
  test('pin button toggles state');
  test('displays all tabs');
  test('switches between tabs');
  test('shows query data in query tab');
  test('shows response data in response tab');
  test('shows headers in headers tab');
});

// tests/components/sidebar.test.tsx
describe('Sidebar', () => {
  test('toggles between requests and settings');
  test('shows search input when toggled');
  test('clear button clears requests');
});

// tests/components/request-list-panel.test.tsx
describe('RequestListPanel', () => {
  test('shows listening message when empty');
  test('filters requests by query');
  test('displays pinned requests separately');
  test('shows "no matches" when filter excludes all');
});

// tests/components/settings-panel.test.tsx
describe('SettingsPanel', () => {
  test('loads settings from storage');
  test('saves settings on change');
  test('displays current version');
  test('validates URL format');
});
```

### Integration Tests (`tests/integration/`)

```typescript
// tests/integration/request-flow.test.tsx
describe('Request Flow', () => {
  test('end-to-end request capture and display');
  test('pin and unpin request');
  test('filter and select request');
  test('persist pinned requests across sessions');
});

// tests/integration/settings-flow.test.tsx
describe('Settings Flow', () => {
  test('change settings and verify persistence');
  test('settings affect request capture');
});
```

### Util Tests (`tests/utils/`)

```typescript
// tests/utils/parse-cube-query.test.ts (EXISTS)
describe('parseCubeQueryFromRequest', () => {
  test('parses GET request with query param');
  test('parses POST request with body');
  test('handles malformed queries');
});

// tests/utils/storage.test.ts (NEW)
describe('Storage Utils', () => {
  test('gets settings with defaults');
  test('saves settings');
  test('gets pinned requests');
  test('saves pinned requests');
});
```

## 🎯 Next Steps

1. **Choose an approach** from Option 1-3 above
2. **Fix the fixture** to reliably load the panel
3. **Verify first test passes** (`01-empty-state.spec.ts`)
4. **Implement remaining tests** one per commit
5. **Add unit tests** for faster feedback loop
6. **Update CI/CD** to run both unit and E2E tests

## 📚 Resources

- [Playwright Chrome Extensions](https://playwright.dev/docs/chrome-extensions)
- [Chrome Extension Testing Best Practices](https://developer.chrome.com/docs/extensions/how-to/test)
- [Vite Preview Server API](https://vite.dev/guide/api-javascript.html#preview)
- [MSW Browser Integration](https://mswjs.io/docs/integrations/browser)

## ⏱️ Time Investment

- Setup & Infrastructure: ✅ Complete (~2-3 hours)
- Component Data Attributes: ✅ Complete (~30 min)
- Debugging Extension Loading: ⚠️ Ongoing (~3+ hours)
- **Estimated to Complete**: 4-6 hours with Option 1 or 2

## 🚀 Quick Win

For immediate value, focus on unit tests first:
1. They're faster to write and run
2. Don't require complex fixture setup
3. Provide excellent coverage
4. Can be written while E2E infrastructure stabilizes

Then circle back to E2E for critical integration paths once the fixture is proven reliable.
