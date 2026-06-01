import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { openBrowser, renderMedia, renderStill, type HeadlessBrowser } from '@remotion/renderer';
import { createDefaultProject, DYNAMIC_TEMPLATE_COMPOSITION_ID, projectToInputProps } from '../remotion/inputProps';
import { fieldsFromDef } from '../director/templateUtils';
import { getFormat } from '../lib/formats';
import type { Project, TemplateId } from '../types';
import { RESOLUTION_MAP } from '../types';
import { getDefaultFields } from '../data/templateDefaults';
import { getBinariesDirectory, getExportsDir, getServeUrl } from '../lib/runtimeConfig';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

/** Cap parallel frame rendering so memory stays bounded while still using multiple cores. */
const RENDER_CONCURRENCY = Math.max(1, Math.min(Math.floor(os.cpus().length / 2), 8));

let bundleLocation: string | null = null;

async function getBundle(): Promise<string> {
  if (bundleLocation) return bundleLocation;

  const prebuilt = getServeUrl();
  if (prebuilt) {
    bundleLocation = prebuilt;
    return bundleLocation;
  }

  const { bundle } = await import('@remotion/bundler');
  const { webpackOverride } = await import('../remotion/webpack-override');
  const entry = path.join(ROOT, 'src', 'remotion', 'index.ts');
  bundleLocation = await bundle({
    entryPoint: entry,
    rootDir: ROOT,
    webpackOverride,
    enableCaching: true,
  });
  return bundleLocation;
}

// Reuse a single headless Chromium across exports. Launching the browser is the
// dominant cost for short clips, so we pay it once and keep it warm.
let browser: HeadlessBrowser | null = null;
let browserPromise: Promise<HeadlessBrowser> | null = null;

async function getBrowser(): Promise<HeadlessBrowser> {
  if (browser) return browser;
  if (!browserPromise) {
    browserPromise = openBrowser('chrome', {
      logLevel: 'error',
      chromiumOptions: { gl: 'angle' },
    })
      .then((b) => {
        browser = b;
        return b;
      })
      .catch((err) => {
        browserPromise = null;
        throw err;
      });
  }
  return browserPromise;
}

/** Warm up the bundle + browser ahead of the first export (fire-and-forget). */
export async function warmupRenderer(): Promise<void> {
  await getBundle().catch(() => undefined);
  await getBrowser().catch(() => undefined);
}

/** Close the shared browser (call on server/app shutdown). */
export async function closeRenderer(): Promise<void> {
  const current = browser;
  browser = null;
  browserPromise = null;
  if (current) {
    await current.close({ silent: true }).catch(() => undefined);
  }
}

/**
 * Build the composition metadata directly instead of calling selectComposition,
 * which would launch/navigate a browser just to read values we already know.
 * Safe because our compositions have static metadata (no calculateMetadata).
 */
function buildComposition(
  compositionId: string,
  inputProps: Record<string, unknown>,
  width: number,
  height: number,
  durationInFrames: number,
  fps: number,
) {
  return {
    id: compositionId,
    width,
    height,
    fps,
    durationInFrames,
    props: inputProps,
    defaultProps: {},
    defaultCodec: null,
    defaultOutName: null,
    defaultVideoImageFormat: null,
    defaultPixelFormat: null,
    defaultProResProfile: null,
    defaultSampleRate: null,
  } as const;
}

function mergeProject(partial: Partial<Project>): Project {
  const template = partial.template ?? 'mission-passed';

  if (partial.templateDef) {
    const base = createDefaultProject(partial.templateDef.id, partial.templateDef);
    return {
      ...base,
      ...partial,
      template: partial.templateDef.id,
      templateDef: partial.templateDef,
      fields: { ...fieldsFromDef(partial.templateDef), ...partial.fields },
      theme: { ...base.theme, ...partial.theme },
      animation: { ...base.animation, ...partial.animation },
      export: { ...base.export, ...partial.export },
      placement: partial.placement ?? partial.templateDef.defaultPlacement,
    };
  }

  const builtIn = template as TemplateId;
  const base = createDefaultProject(builtIn);
  return {
    ...base,
    ...partial,
    template: builtIn,
    fields: { ...getDefaultFields(builtIn), ...partial.fields },
    theme: { ...base.theme, ...partial.theme },
    animation: { ...base.animation, ...partial.animation },
    export: { ...base.export, ...partial.export },
    placement: partial.placement ?? base.placement,
  };
}

function formatSuffix(project: Project): string {
  const formatId = project.export.formatId;
  if (!formatId) {
    const res = project.export.resolution;
    if (res === '1080x1920') return '_9x16';
    if (res === '1080x1080') return '_1x1';
    if (res === '1080x1350') return '_4x5';
    if (res === '1280x720') return '_720p';
    return '_16x9';
  }
  const map: Record<string, string> = {
    'youtube-landscape': '_16x9',
    'youtube-720': '_720p',
    'shorts-vertical': '_9x16',
    'feed-square': '_1x1',
    'feed-portrait': '_4x5',
  };
  return map[formatId] ?? '';
}

export async function renderProject(project: Project, outputDir?: string): Promise<string> {
  const serveUrl = await getBundle();
  const inputProps = projectToInputProps(project);
  const compositionId = project.templateDef ? DYNAMIC_TEMPLATE_COMPOSITION_ID : project.template;
  const binariesDirectory = getBinariesDirectory();

  const { width, height } = RESOLUTION_MAP[project.export.resolution];
  const composition = buildComposition(
    compositionId,
    inputProps,
    width,
    height,
    project.animation.durationInFrames,
    project.export.fps,
  );

  const exportsDir = outputDir ?? getExportsDir();
  await fs.mkdir(exportsDir, { recursive: true });

  const timestamp = Date.now();
  const ext = project.export.format;
  const suffix = formatSuffix(project);
  const outputPath = path.join(exportsDir, `${compositionId}${suffix}-${timestamp}.${ext}`);

  const run = async (puppeteerInstance: HeadlessBrowser): Promise<void> => {
    if (project.export.format === 'png' || project.export.format === 'jpg') {
      await renderStill({
        serveUrl,
        composition,
        inputProps,
        output: outputPath,
        imageFormat: project.export.format === 'jpg' ? 'jpeg' : project.export.format,
        frame: project.animation.durationInFrames - 1,
        binariesDirectory,
        puppeteerInstance,
        logLevel: 'error',
      });
      return;
    }

    const transparent = project.export.transparent && project.export.format === 'webm';

    await renderMedia({
      serveUrl,
      composition,
      inputProps,
      codec: project.export.format === 'webm' ? 'vp9' : 'h264',
      outputLocation: outputPath,
      pixelFormat: transparent ? 'yuva420p' : 'yuv420p',
      imageFormat: transparent ? 'png' : undefined,
      binariesDirectory,
      puppeteerInstance,
      concurrency: RENDER_CONCURRENCY,
      logLevel: 'error',
    });
  };

  try {
    await run(await getBrowser());
  } catch (error) {
    // A stale/crashed browser is the most common transient failure; reset and retry once.
    await closeRenderer();
    if (isBrowserError(error)) {
      await run(await getBrowser());
    } else {
      throw error;
    }
  }

  return outputPath;
}

function isBrowserError(error: unknown): boolean {
  const message = String((error as Error)?.message ?? error).toLowerCase();
  return (
    message.includes('browser') ||
    message.includes('target closed') ||
    message.includes('session closed') ||
    message.includes('websocket') ||
    message.includes('disconnected')
  );
}

export async function renderBatch(items: Partial<Project>[], outputFolder?: string): Promise<string> {
  const folder = outputFolder ?? path.join(getExportsDir(), `batch-${Date.now()}`);
  await fs.mkdir(folder, { recursive: true });

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const project = mergeProject(item);

    // Support multi-format fan-out via formats array on batch item
    const formats = (item as Partial<Project> & { formats?: string[] }).formats;
    if (formats && formats.length > 0) {
      for (const formatId of formats) {
        const format = getFormat(formatId as Parameters<typeof getFormat>[0]);
        const multiProject: Project = {
          ...project,
          export: {
            ...project.export,
            formatId: format.id,
            resolution: format.resolution,
          },
        };
        await renderProject({ ...multiProject, export: { ...multiProject.export, format: project.export.format ?? 'webm' } }, folder);
      }
    } else {
      await renderProject({ ...project, export: { ...project.export, format: project.export.format ?? 'webm' } }, folder);
    }
  }

  return folder;
}

export { mergeProject };
