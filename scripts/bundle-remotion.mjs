import path from 'path';
import { fileURLToPath } from 'url';
import { bundle } from '@remotion/bundler';
import { webpackOverride } from '../src/remotion/webpack-override';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const entry = path.join(ROOT, 'src', 'remotion', 'index.ts');
const outDir = path.join(ROOT, 'dist-remotion');

console.log('Bundling Remotion compositions ->', outDir);

await bundle({
  entryPoint: entry,
  outDir,
  rootDir: ROOT,
  webpackOverride,
  enableCaching: false,
});

console.log('Remotion bundle ready.');
