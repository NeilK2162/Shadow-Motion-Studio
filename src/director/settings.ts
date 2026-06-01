import fs from 'fs/promises';
import { getDirectorSettingsPath } from '../lib/runtimeConfig';
import { DEFAULT_DIRECTOR_SETTINGS, type DirectorSettings } from './types';

export async function readDirectorSettings(): Promise<DirectorSettings> {
  try {
    const raw = await fs.readFile(getDirectorSettingsPath(), 'utf-8');
    return { ...DEFAULT_DIRECTOR_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_DIRECTOR_SETTINGS };
  }
}

export async function writeDirectorSettings(settings: DirectorSettings): Promise<void> {
  const dir = getDirectorSettingsPath().replace(/[^/\\]+$/, '');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(getDirectorSettingsPath(), JSON.stringify(settings, null, 2), 'utf-8');
}

/** Safe settings for client — never includes apiKey. */
export function sanitizeSettings(settings: DirectorSettings) {
  return {
    provider: settings.provider,
    model: settings.model,
    qualityMode: settings.qualityMode,
    sessionTokenBudget: settings.sessionTokenBudget,
    dryRunDefault: settings.dryRunDefault,
    hasKey: Boolean(settings.apiKey),
  };
}
