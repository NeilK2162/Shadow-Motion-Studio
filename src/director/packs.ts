import path from 'path';
import fs from 'fs/promises';
import { getDirectorPacksDir, getProjectsDir } from '../lib/runtimeConfig';
import { mergeProject } from '../renderer/render';
import { packToBatchItems } from './orchestrator';
import type { DirectorPack, SavedPackMeta } from './types';

function packFileName(id: string): string {
  return path.join(getDirectorPacksDir(), `${id}.json`);
}

export async function persistDirectorPack(pack: DirectorPack): Promise<{
  packId: string;
  packPath: string;
  projectNames: string[];
}> {
  await fs.mkdir(getDirectorPacksDir(), { recursive: true });
  await fs.mkdir(getProjectsDir(), { recursive: true });

  const packId = `pack-${Date.now()}`;
  const packPath = packFileName(packId);

  const items = packToBatchItems(pack);
  const projectNames: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const name = `director-ep${pack.episode}-${String(i + 1).padStart(2, '0')}-${item.template}`;
    const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '-');
    const filePath = path.join(getProjectsDir(), `${safeName}.json`);
    const project = mergeProject(item);
    await fs.writeFile(filePath, JSON.stringify(project, null, 2), 'utf-8');
    projectNames.push(safeName);
  }

  await fs.writeFile(packPath, JSON.stringify({ ...pack, packId, projectNames }, null, 2), 'utf-8');

  return { packId, packPath, projectNames };
}

export async function listSavedPacks(): Promise<SavedPackMeta[]> {
  try {
    const dir = getDirectorPacksDir();
    const files = await fs.readdir(dir);
    const metas: SavedPackMeta[] = [];

    for (const file of files.filter((f) => f.endsWith('.json'))) {
      const raw = await fs.readFile(path.join(dir, file), 'utf-8');
      const pack = JSON.parse(raw) as DirectorPack & { packId?: string; projectNames?: string[] };
      metas.push({
        id: pack.packId ?? file.replace(/\.json$/, ''),
        episode: pack.episode,
        concept: pack.concept,
        createdAt: pack.createdAt,
        assetCount: pack.assets.length,
        projectNames: pack.projectNames ?? [],
      });
    }

    return metas.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function loadSavedPack(packId: string): Promise<DirectorPack | null> {
  try {
    const raw = await fs.readFile(packFileName(packId), 'utf-8');
    return JSON.parse(raw) as DirectorPack;
  } catch {
    return null;
  }
}
