# Cube Explorer

A Chrome DevTools extension for debugging and exploring CubeJS queries in real-time.

## Setup

### Prerequisites

- Node.js 20+ 
- pnpm (package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/general-dexterity/cube-explorer.git
   cd cube-explorer
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Development

### Build Commands

- **Development server**: `pnpm dev`
- **Production build**: `pnpm build` 
- **TypeScript check**: `pnpm typecheck`
- **Lint**: `pnpm lint`
- **Format**: `pnpm format`

### Testing

- **Run all tests**: `pnpm test`
- **Watch mode**: `pnpm test:watch` 
- **Single test**: `pnpm test component-name`

### Chrome Extension Setup

1. Build the extension:
   ```bash
   pnpm build
   ```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the `dist/` directory
   - Or install the ZIP file from `release/` directory

3. Open DevTools on any page and look for the "Cube Explorer" tab

## Architecture

- **Chrome Extension** with Manifest V3
- **React + TypeScript** UI components
- **Ark-UI** for accessible headless components  
- **Phosphor Icons** for iconography
- **Tailwind CSS** for styling with dark mode support
- **Vitest** for testing

## Project Structure

```
src/
├── devtools/           # Main extension code
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── mock/          # Development mock data
│   └── main.tsx       # Entry point
├── types/             # TypeScript type definitions
└── ...
```

## Development Notes

- Extension includes mock data in development mode for testing
- Uses `@/` alias for `src/` directory imports
- Strict TypeScript configuration with null checks
- All components support light/dark mode via Tailwind classes
