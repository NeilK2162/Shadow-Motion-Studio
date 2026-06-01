import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

await esbuild.build({
  entryPoints: [path.join(ROOT, 'electron', 'main.ts')],
  outfile: path.join(ROOT, 'dist-electron', 'main.cjs'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  // Keep node_modules external; only bundle our own TS (incl. @/ aliases).
  packages: 'external',
  alias: {
    '@': path.join(ROOT, 'src'),
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    // import.meta.url is unavailable in CJS output; map it to a banner-defined identifier.
    'import.meta.url': '__IMPORT_META_URL__',
  },
  banner: {
    js: 'const __IMPORT_META_URL__ = require("url").pathToFileURL(__filename).href;',
  },
  logLevel: 'info',
});

console.log('Built dist-electron/main.cjs');
