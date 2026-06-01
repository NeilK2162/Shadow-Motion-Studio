import fs from 'fs/promises';
import path from 'path';
import { getSeriesDir } from '../lib/runtimeConfig';
import type { SeriesMemory } from './types';

const DEFAULT_SERIES_ID = 'untitled';

export function defaultSeries(overrides?: Partial<SeriesMemory>): SeriesMemory {
  return {
    seriesId: DEFAULT_SERIES_ID,
    title: 'Untitled',
    episode: 1,
    voiceProfileId: 'hustle',
    facts: {
      shadowUsers: 23,
      respectTotal: 250,
      weekNumber: 1,
      location: 'Hyderabad',
    },
    history: [],
    ...overrides,
  };
}

function seriesPath(seriesId: string): string {
  const safe = seriesId.replace(/[^a-zA-Z0-9-_]/g, '-');
  return path.join(getSeriesDir(), `${safe}.json`);
}

export async function listSeries(): Promise<SeriesMemory[]> {
  try {
    const dir = getSeriesDir();
    const files = await fs.readdir(dir);
    const results: SeriesMemory[] = [];
    for (const file of files.filter((f) => f.endsWith('.json'))) {
      const raw = await fs.readFile(path.join(dir, file), 'utf-8');
      results.push(JSON.parse(raw) as SeriesMemory);
    }
    return results;
  } catch {
    return [defaultSeries()];
  }
}

export async function readSeries(seriesId: string): Promise<SeriesMemory> {
  try {
    const raw = await fs.readFile(seriesPath(seriesId), 'utf-8');
    return JSON.parse(raw) as SeriesMemory;
  } catch {
    if (seriesId === DEFAULT_SERIES_ID) return defaultSeries();
    return defaultSeries({ seriesId, title: seriesId });
  }
}

export async function writeSeries(memory: SeriesMemory): Promise<void> {
  await fs.mkdir(getSeriesDir(), { recursive: true });
  await fs.writeFile(seriesPath(memory.seriesId), JSON.stringify(memory, null, 2), 'utf-8');
}

export function compressSeriesContext(memory: SeriesMemory): string {
  const last = memory.history[memory.history.length - 1];
  const lastLine = last
    ? `Last episode (${last.episode}): ${last.summary}.`
    : 'No prior episodes.';
  const facts = memory.facts;
  const factParts: string[] = [];
  if (facts.shadowUsers != null) factParts.push(`${facts.shadowUsers} Shadow users`);
  if (facts.respectTotal != null) factParts.push(`RESPECT +${facts.respectTotal}`);
  if (facts.weekNumber != null) factParts.push(`week ${facts.weekNumber}`);
  if (facts.cashTotal) factParts.push(`cash ${facts.cashTotal}`);
  if (facts.lastMilestone) factParts.push(`last: ${facts.lastMilestone}`);

  return `SERIES CONTEXT (${memory.seriesId}, episode ${memory.episode}):
${lastLine}
Facts: ${factParts.join(', ') || 'none yet'}.
Maintain continuity: users should grow, RESPECT should increase, this is week ${facts.weekNumber ?? memory.episode}.`;
}
