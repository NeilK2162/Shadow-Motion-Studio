import path from 'path';
import { fileURLToPath } from 'url';
import type { WebpackOverrideFn } from '@remotion/bundler';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

/** Absolute project root — never rely on process.cwd(). */
export const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const SRC_ROOT = path.join(PROJECT_ROOT, 'src');

export const webpackOverride: WebpackOverrideFn = (config) => {
  const srcSlash = `${SRC_ROOT}${path.sep}`;

  config.resolve = config.resolve ?? {};

  // '@/…' must be aliased with trailing slash so webpack does not treat '@' as an npm scope.
  config.resolve.alias = {
    ...(typeof config.resolve.alias === 'object' && !Array.isArray(config.resolve.alias)
      ? config.resolve.alias
      : {}),
    '@/': srcSlash,
    '@': SRC_ROOT,
  };

  config.resolve.plugins = [
    ...(config.resolve.plugins ?? []),
    new TsconfigPathsPlugin({
      configFile: path.join(PROJECT_ROOT, 'tsconfig.json'),
    }),
  ];

  return config;
};
