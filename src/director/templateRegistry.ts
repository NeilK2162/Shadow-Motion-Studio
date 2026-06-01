import fs from 'fs/promises';
import path from 'path';
import type { TemplateDefinition } from './templateSchema';
import { formatValidationErrors, validateTemplate } from './validateTemplate';
import { getCustomTemplatesDir, getTemplatesIndexPath } from '../lib/runtimeConfig';

export interface TemplateIndexEntry {
  id: string;
  name: string;
  glyph: string;
  group: TemplateDefinition['group'];
  createdAt: string;
  updatedAt: string;
}

export interface TemplatesIndex {
  version: 1;
  templates: TemplateIndexEntry[];
}

async function readIndex(): Promise<TemplatesIndex> {
  const indexPath = getTemplatesIndexPath();
  try {
    const raw = await fs.readFile(indexPath, 'utf-8');
    const parsed = JSON.parse(raw) as TemplatesIndex;
    if (parsed.version === 1 && Array.isArray(parsed.templates)) return parsed;
  } catch {
    /* empty */
  }
  return { version: 1, templates: [] };
}

async function writeIndex(index: TemplatesIndex): Promise<void> {
  const indexPath = getTemplatesIndexPath();
  await fs.mkdir(path.dirname(indexPath), { recursive: true });
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
}

function defPath(id: string): string {
  return path.join(getCustomTemplatesDir(), `${id}.json`);
}

export async function listCustomTemplates(): Promise<TemplateIndexEntry[]> {
  const index = await readIndex();
  return index.templates;
}

export async function loadCustomTemplate(id: string): Promise<TemplateDefinition | null> {
  try {
    const raw = await fs.readFile(defPath(id), 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    const result = validateTemplate(parsed);
    return result.valid ? result.def! : null;
  } catch {
    return null;
  }
}

export async function saveCustomTemplate(def: TemplateDefinition): Promise<{ ok: true } | { ok: false; errors: string[] }> {
  const result = validateTemplate(def);
  if (!result.valid) {
    return { ok: false, errors: result.errors.map((e) => `${e.path}: ${e.message}`) };
  }

  const validated = result.def!;
  await fs.mkdir(getCustomTemplatesDir(), { recursive: true });
  await fs.writeFile(defPath(validated.id), JSON.stringify(validated, null, 2), 'utf-8');

  const index = await readIndex();
  const now = new Date().toISOString();
  const existing = index.templates.findIndex((t) => t.id === validated.id);
  const entry: TemplateIndexEntry = {
    id: validated.id,
    name: validated.name,
    glyph: validated.glyph,
    group: validated.group,
    createdAt: existing >= 0 ? index.templates[existing].createdAt : now,
    updatedAt: now,
  };

  if (existing >= 0) index.templates[existing] = entry;
  else index.templates.push(entry);

  await writeIndex(index);
  return { ok: true };
}

export async function deleteCustomTemplate(id: string): Promise<boolean> {
  const index = await readIndex();
  const next = index.templates.filter((t) => t.id !== id);
  if (next.length === index.templates.length) return false;

  await writeIndex({ ...index, templates: next });
  try {
    await fs.unlink(defPath(id));
  } catch {
    /* ignore */
  }
  return true;
}

export async function importCustomTemplate(raw: unknown): Promise<{ ok: true; def: TemplateDefinition } | { ok: false; errors: string[] }> {
  const result = validateTemplate(raw);
  if (!result.valid) {
    return { ok: false, errors: result.errors.map((e) => formatValidationErrors([e])) };
  }
  const save = await saveCustomTemplate(result.def!);
  if (!save.ok) return save;
  return { ok: true, def: result.def! };
}

export { fieldsFromDef, defToMeta, isDuplicateTemplateName } from './templateUtils';
