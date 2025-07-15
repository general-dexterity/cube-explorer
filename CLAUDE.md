# Project Instructions

## Build and Package Management
- Use `pnpm` for all package management commands (install, build, etc.)
- For linting: use `pnpm lint` (never call biome directly)
- For formatting: use `pnpm format` (never call biome directly)

## TypeScript and Types
- The project uses official CubeJS types from `@cubejs-client/core` package
- Custom types are defined in `src/types/index.ts` alongside CubeJS re-exports