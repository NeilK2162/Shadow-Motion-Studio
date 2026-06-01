import { TEMPLATE_DEFAULTS } from '../data/templateDefaults';
import type { TemplateId } from '../types';

/** Layout keys — never sent to LLM or validated as required content. */
const LAYOUT_FIELD_KEYS = new Set([
  'sizeMultiplier',
  'aspectMultiplier',
  'contentScale',
  'glowIntensity',
  'glowSpread',
  'glowCenterY',
  'cardWidth',
  'cardHeight',
]);

/** Style/toggle keys with sensible defaults — excluded from LLM prompts. */
const STYLE_FIELD_KEYS = new Set([
  'showPct',
  'showRing',
  'showRadar',
  'showEq',
  'flashOnGain',
  'pulseCta',
  'desaturate',
  'overlayOpacity',
  'positive',
  'maxStars',
  'litChar',
  'dimChar',
  'splitOrientation',
  'amountPrefix',
  'accentColor',
]);

export type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface FieldSchema {
  key: string;
  type: FieldType;
  example?: unknown;
  required: boolean;
}

export interface TemplateSchema {
  id: TemplateId;
  contentFields: FieldSchema[];
  allFields: FieldSchema[];
}

function inferType(value: unknown): FieldType {
  if (Array.isArray(value)) return 'array';
  if (value !== null && typeof value === 'object') return 'object';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'string';
}

function isContentField(key: string): boolean {
  return !LAYOUT_FIELD_KEYS.has(key) && !STYLE_FIELD_KEYS.has(key);
}

function buildFieldsForTemplate(templateId: TemplateId): TemplateSchema {
  const defaults = TEMPLATE_DEFAULTS[templateId].fields;
  const allFields: FieldSchema[] = Object.entries(defaults).map(([key, value]) => ({
    key,
    type: inferType(value),
    example: value,
    required: isContentField(key),
  }));
  const contentFields = allFields.filter((f) => isContentField(f.key));
  return { id: templateId, contentFields, allFields };
}

const schemaCache = new Map<TemplateId, TemplateSchema>();

export function getTemplateSchema(templateId: TemplateId): TemplateSchema {
  let s = schemaCache.get(templateId);
  if (!s) {
    s = buildFieldsForTemplate(templateId);
    schemaCache.set(templateId, s);
  }
  return s;
}

export function getSchemasForTemplates(templateIds: TemplateId[]): TemplateSchema[] {
  return templateIds.map(getTemplateSchema);
}

export function serializeSchemasForPrompt(schemas: TemplateSchema[]): string {
  return schemas
    .map((s) => {
      const fields = s.contentFields
        .map((f) => `  ${f.key}: ${f.type}${f.example !== undefined ? ` (e.g. ${JSON.stringify(f.example).slice(0, 60)})` : ''}`)
        .join('\n');
      return `${s.id}:\n${fields}`;
    })
    .join('\n\n');
}

export function mergeWithDefaults(templateId: TemplateId, partial: Record<string, unknown>): Record<string, unknown> {
  const defaults = structuredClone(TEMPLATE_DEFAULTS[templateId].fields);
  const contentKeys = new Set(getTemplateSchema(templateId).contentFields.map((f) => f.key));
  const merged = { ...defaults };
  for (const [key, value] of Object.entries(partial)) {
    if (contentKeys.has(key)) {
      merged[key] = value;
    }
  }
  return merged;
}

export { LAYOUT_FIELD_KEYS, STYLE_FIELD_KEYS };
