import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json' with { type: 'json' };

const ExtensionName = 'Cube Explorer';

export default defineManifest({
  manifest_version: 3,
  name: ExtensionName,
  version: pkg.version,

  icons: {
    48: 'logo-48.png',
  },

  permissions: ['storage'],
  host_permissions: ['<all_urls>'],

  devtools_page: 'src/devtools/devtools.html',
  options_page: 'src/options/options.html',
});
