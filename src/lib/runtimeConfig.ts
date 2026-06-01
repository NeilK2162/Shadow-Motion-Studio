import path from 'path';

interface RuntimeConfig {
  /** Base dir for user data: projects/, exports/, data/, assets/. */
  dataDir: string;
  /** Pre-built Remotion bundle dir (production). Null => bundle at runtime (dev). */
  serveUrl: string | null;
}

const config: RuntimeConfig = {
  dataDir: process.env.SMS_DATA_DIR ?? process.cwd(),
  serveUrl: process.env.REMOTION_SERVE_URL ?? null,
};

export function configureRuntime(opts: Partial<RuntimeConfig>): void {
  if (opts.dataDir) config.dataDir = opts.dataDir;
  if (opts.serveUrl !== undefined) config.serveUrl = opts.serveUrl;
}

export function getDataDir(): string {
  return config.dataDir;
}

export function getProjectsDir(): string {
  return path.join(config.dataDir, 'projects');
}

export function getExportsDir(): string {
  return path.join(config.dataDir, 'exports');
}

export function getDataFilesDir(): string {
  return path.join(config.dataDir, 'data');
}

export function getAssetsDir(): string {
  return path.join(config.dataDir, 'assets');
}

export function getServeUrl(): string | null {
  return config.serveUrl;
}
