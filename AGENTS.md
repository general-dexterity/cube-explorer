# Cube Explorer - Browser Extension for CubeJS Debugging

## Commands
- **Build**: `pnpm build` (runs TypeScript compilation + Vite build)
- **Lint**: `pnpm lint` (uses ultracite, don't call biome directly)
- **Format**: `pnpm format` (uses ultracite, don't call biome directly)
- **Typecheck**: `pnpm typecheck`
- **Test**: `pnpm test` (vitest run) or `pnpm test:watch` (vitest watch)
- **Single test**: Add pattern after test command, e.g., `pnpm test component-name`
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
  - Import **outline** variant by default: `import { CaretDownIcon } from '@phosphor-icons/react'`
  - Use non-deprecated icon names (e.g., `CaretDownIcon`, not `CaretDown`)
  - Size icons via Tailwind `w-* h-*` classes, not via `size` prop
  - Icons inherit text color automatically; avoid setting `fill`/`stroke` inline

- **Color and Theming**:
  - Use Tailwind semantic color tokens with dark mode variants: `text-gray-900 dark:text-gray-100`
  - Avoid hard-coded hex values; use Tailwind's color palette
  - Always provide dark mode variants for text, background, and border colors
  - Use `prefers-color-scheme` for automatic theme detection

- **Accessibility**:
  - Use semantic HTML elements and ARIA attributes
  - Ensure sufficient color contrast in both light and dark modes
  - Provide focus states for interactive elements
