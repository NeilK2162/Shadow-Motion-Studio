import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { createDefaultProject, projectToInputProps } from '../remotion/inputProps';
import type { Project } from '../types';
import { RESOLUTION_MAP } from '../types';
import { getDefaultFields } from '../data/templateDefaults';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

let bundleLocation: string | null = null;

async function getBundle(): Promise<string> {
  if (bundleLocation) return bundleLocation;
  const entry = path.join(ROOT, 'src/remotion/index.ts');
  bundleLocation = await bundle({
    entryPoint: entry,
    webpackOverride: (config) => config,
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
  };
}

export async function renderProject(project: Project): Promise<string> {
  const serveUrl = await getBundle();
  const inputProps = projectToInputProps(project);
  const compositionId = project.template;

  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
  });

  const exportsDir = path.join(ROOT, 'exports');
  await fs.mkdir(exportsDir, { recursive: true });

  const timestamp = Date.now();
  const ext = project.export.format;
  const outputPath = path.join(exportsDir, `${compositionId}-${timestamp}.${ext}`);

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
  const folder = path.join(ROOT, 'exports', `batch-${Date.now()}`);
  await fs.mkdir(folder, { recursive: true });

  for (let i = 0; i < items.length; i++) {
    const project = mergeProject(items[i]);
    const output = await renderProject({ ...project, export: { ...project.export, format: project.export.format ?? 'webm' } });
    const dest = path.join(folder, path.basename(output));
    await fs.copyFile(output, dest);
  }

  return folder;
}

export { mergeProject };
