import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { createDefaultProject, projectToInputProps } from '../remotion/inputProps';
import { getFormat } from '../lib/formats';
import type { Project } from '../types';
import { RESOLUTION_MAP } from '../types';
import { getDefaultFields } from '../data/templateDefaults';
import { getExportsDir, getServeUrl } from '../lib/runtimeConfig';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

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
    enableCaching: false,
  });
  return bundleLocation;
}

function mergeProject(partial: Partial<Project>): Project {
  const template = partial.template ?? 'mission-passed';
  const base = createDefaultProject(template);
  return {
    ...base,
    ...partial,
    template,
    fields: { ...getDefaultFields(template), ...partial.fields },
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
  const compositionId = project.template;

  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
  });

  const exportsDir = outputDir ?? getExportsDir();
  await fs.mkdir(exportsDir, { recursive: true });

  const timestamp = Date.now();
  const ext = project.export.format;
  const suffix = formatSuffix(project);
  const outputPath = path.join(exportsDir, `${compositionId}${suffix}-${timestamp}.${ext}`);

  const { width, height } = RESOLUTION_MAP[project.export.resolution];
  const compositionOverride = {
    ...composition,
    width,
    height,
    durationInFrames: project.animation.durationInFrames,
    fps: project.export.fps,
  };

  if (project.export.format === 'png' || project.export.format === 'jpg') {
    await renderStill({
      serveUrl,
      composition: compositionOverride,
      inputProps,
      output: outputPath,
      imageFormat: project.export.format === 'jpg' ? 'jpeg' : project.export.format,
      frame: project.animation.durationInFrames - 1,
    });
    return outputPath;
  }

  const transparent = project.export.transparent && project.export.format === 'webm';

  await renderMedia({
    serveUrl,
    composition: compositionOverride,
    inputProps,
    codec: project.export.format === 'webm' ? 'vp9' : 'h264',
    outputLocation: outputPath,
    pixelFormat: transparent ? 'yuva420p' : 'yuv420p',
    imageFormat: transparent ? 'png' : undefined,
  });

  return outputPath;
}

export async function renderBatch(items: Partial<Project>[]): Promise<string> {
  const folder = path.join(getExportsDir(), `batch-${Date.now()}`);
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
