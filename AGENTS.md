# Cube Explorer - Browser Extension for CubeJS Debugging

## Commands
- **Build**: `pnpm build` (runs TypeScript compilation + Vite build)
- **Lint**: `pnpm lint` (uses ultracite, **NEVER** call `biome` directly)
- **Format**: `pnpm format` (uses ultracite, **NEVER** call `biome` directly)
- **Typecheck**: `pnpm typecheck`
- **Test**: `pnpm test` (vitest run) or `pnpm test:watch` (vitest watch)
- **Single test**: Add pattern after test command, e.g., `pnpm test component-name`
- **E2E Tests**: `pnpm test:e2e` (Playwright tests for Chrome extension)
- **Dev**: `pnpm dev` (starts development server)

## Architecture
- **Chrome Extension** with Manifest V3 using CRX plugin
- **DevTools Panel** integration for debugging CubeJS queries
- **Main entry**: `src/devtools/main.tsx` renders extension UI
- **Types**: Custom types in `src/types/index.ts` + CubeJS types from `@cubejs-client/core`
- **Build output**: Extension packaged to `release/` directory as ZIP

## Code Style
- **Package manager**: Use `pnpm` exclusively
- **TypeScript**: Strict null checks enabled, use official CubeJS types
- **Imports**: Use `@/` alias for `src/` directory, relative paths for local components
- **Formatting**: Biome via ultracite (extends ultracite config)
- **Error handling**: Console.log/warn disabled, only console.info/error allowed
- **Components**: React functional components with TypeScript
- **File naming**: React components use `PascalCase.tsx`, hooks use `useSomething.ts`
- **Component organization**: Tab components live under `components/{Feature}/tabs/`

## UI Guidelines
- **Ark-UI Components**:
  - Prefer headless primitives for accessibility
  - Always forward `ref` and spread `{...props}` when creating wrapper components
  - Keep custom class names under `ark-` prefix when customizing
  - Use Ark-UI's built-in state management and data attributes

- **Phosphor Icons**:
  - **ALL icons MUST be from Phosphor Icons** - never manually create SVG icons or use other icon libraries
  - Import **outline** variant by default: `import { CaretDownIcon } from '@phosphor-icons/react'`
  - Use non-deprecated icon names (e.g., `CaretDownIcon`, not `CaretDown`)
  - Size icons via Tailwind `w-* h-*` classes, not via `size` prop
  - Icons inherit text color automatically; avoid setting `fill`/`stroke` inline
  - If a specific icon doesn't exist in Phosphor, find the closest equivalent rather than creating custom SVGs

- **Color and Theming**:
  - Use Tailwind semantic color tokens with dark mode variants: `text-gray-900 dark:text-gray-100`
  - Avoid hard-coded hex values; use Tailwind's color palette
  - Always provide dark mode variants for text, background, and border colors
  - Use `prefers-color-scheme` for automatic theme detection

- **Accessibility**:
  - Use semantic HTML elements and ARIA attributes
  - Ensure sufficient color contrast in both light and dark modes
  - Provide focus states for interactive elements

## E2E Testing

### Overview
- **Framework**: Playwright with Chrome extension support
- **Location**: `e2e/tests/*.spec.ts`
- **Fixtures**: `e2e/fixtures/extension.ts` provides Chrome API mocks
- **Config**: `playwright.config.ts` in project root

### Running E2E Tests
- **All tests**: `pnpm test:e2e` (builds + runs all tests)
- **Watch mode**: `pnpm test:e2e:ui` (opens Playwright UI)
- **Debug**: `pnpm test:e2e:debug` (debug mode with inspector)

### Writing E2E Tests

**Key Concepts**:
- Tests use `triggerCubeRequest()` helper to simulate Chrome DevTools network events
- Chrome APIs (`chrome.storage`, `chrome.devtools.network`) are mocked in fixtures
- Panel loads via HTTP from Vite preview server (not file://)
- Storage key is `cubeExplorerSettings_v1.20250118` (defined in constants)

**Test Structure**:
```typescript
import { expect, test } from '../fixtures/extension';

test.describe('Feature Name', () => {
  test('should do something', async ({ panelPage }) => {
    // Trigger a mock network request
    await panelPage.evaluate(() => {
      (window as Window & {
        triggerCubeRequest: (mockData: {
          url: string;
          query: unknown;
          response: unknown;
          duration?: number;
          status?: number;
        }) => void;
      }).triggerCubeRequest({
        url: 'https://api.example.com/cubejs-api/v1/load',
        query: { measures: ['Orders.count'] },
        response: { data: [...] },
        duration: 234,
        status: 200,
      });
    });

    // Wait for UI to update
    await panelPage.waitForTimeout(500);

    // Assert on UI state
    const element = panelPage.getByTestId('some-element');
    await expect(element).toBeVisible();
  });
});
```

**Test Selectors**:
- Always use `data-testid` attributes for selecting elements
- Format: `data-testid="feature-name"` (kebab-case)
- Request items: `data-testid="request-item-{id}"`
- Tabs: `data-testid="tab-{name}"` and `data-testid="tab-content-{name}"`

**Common Patterns**:
```typescript
// Wait for requests to appear
const requestItems = panelPage.locator('[data-testid^="request-item-"]');
await expect(requestItems.first()).toBeVisible();

// Click a request
await requestItems.first().click();

// Switch tabs
await panelPage.getByTestId('tab-response').click();

// Check visibility
await expect(panelPage.getByTestId('empty-state')).toBeVisible();
await expect(panelPage.getByTestId('request-details')).not.toBeVisible();
```

**Storage Mocking**:
- Settings are mocked in `e2e/fixtures/extension.ts`
- Default test URL: `https://api.example.com/cubejs-api/v1`
- Modify storage mock in fixture if you need different settings

**Timing**:
- Use `waitForTimeout(500)` after triggering requests
- Use `waitForTimeout(300)` after UI interactions (clicks, etc.)
- These timeouts account for React re-renders
