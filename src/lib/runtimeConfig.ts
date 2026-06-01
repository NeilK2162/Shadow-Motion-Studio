import path from 'path';
import { existsSync } from 'fs';

interface RuntimeConfig {
  /** Base dir for user data: projects/, exports/, data/, assets/. */
  dataDir: string;
  /** Pre-built Remotion bundle dir (production). Null => bundle at runtime (dev). */
  serveUrl: string | null;
  /** Remotion compositor/ffmpeg dir (required in packaged Electron). */
  binariesDirectory: string | null;
}

const config: RuntimeConfig = {
  dataDir: process.env.SMS_DATA_DIR ?? process.cwd(),
  serveUrl: process.env.REMOTION_SERVE_URL ?? null,
  binariesDirectory: process.env.REMOTION_BINARIES_DIR ?? null,
};

export function configureRuntime(opts: Partial<RuntimeConfig>): void {
  if (opts.dataDir) config.dataDir = opts.dataDir;
  if (opts.serveUrl !== undefined) config.serveUrl = opts.serveUrl;
  if (opts.binariesDirectory !== undefined) config.binariesDirectory = opts.binariesDirectory;
}

function resolvePackagedCompositorDir(): string | null {
  const resourcesPath = (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath;
  if (!resourcesPath) return null;

  const candidates = [
    path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', '@remotion', 'compositor-win32-x64-msvc'),
    path.join(resourcesPath, 'node_modules', '@remotion', 'compositor-win32-x64-msvc'),
  ];

  for (const dir of candidates) {
    const exe = path.join(dir, process.platform === 'win32' ? 'remotion.exe' : 'remotion');
    if (existsSync(exe)) return dir;
  }

  return null;
}

/** Directory containing remotion.exe, ffmpeg.exe, ffprobe.exe for @remotion/renderer. */
export function getBinariesDirectory(): string | null {
  if (config.binariesDirectory) return config.binariesDirectory;
  if (process.versions.electron) return resolvePackagedCompositorDir();
  return null;
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
