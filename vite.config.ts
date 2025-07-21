/// <reference types="vitest/config" />

import path from 'node:path';
import { crx, type ManifestV3Export } from '@crxjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import zip from 'vite-plugin-zip-pack';
import manifestConfig from './manifest.config.js';
import { name, version } from './package.json';

const EXTENSION_NAME = 'Cube Explorer';
type ManifestV3 = Extract<ManifestV3Export, { name: string; version: string }>;

export default defineConfig((env) => {
  const isProduction = env.mode === 'production';
  const manifestOverrides: Pick<ManifestV3, 'name'> = isProduction
    ? { name: EXTENSION_NAME }
    : {
        name: `${EXTENSION_NAME} (dev)`,
      };

  const manifest: ManifestV3 = {
    ...(manifestConfig as ManifestV3),
    ...manifestOverrides,
  };

  return {
    resolve: {
      alias: {
        '@': `${path.resolve(__dirname, 'src')}`,
      },
    },

    build: {
      rollupOptions: {
        input: {
          devtoolsPanel: 'src/devtools/panel.html',
        },
      },
    },

    plugins: [
      react(),
      tailwindcss(),
      crx({ manifest }),
      zip({ outDir: 'release', outFileName: `crx-${name}-${version}.zip` }),
    ],

    server: {
      cors: {
        origin: ['chrome-extension://'],
      },
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.test.tsx', 'src/**/*.test.ts'],
    },
  };
});
