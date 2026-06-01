import type { TemplateDefinition } from './templateSchema';

export function fieldsFromDef(def: TemplateDefinition): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const f of def.fields) {
    fields[f.key] = f.default;
  }
  return fields;
}

export function defToMeta(def: TemplateDefinition) {
  return {
    id: def.id,
    glyph: def.glyph,
    label: def.name,
    group: def.group,
    defaultDurationSeconds: def.durationSeconds,
    compositionWidth: 1920,
    compositionHeight: 1080,
    isCustom: true as const,
    recommendedFormats: def.recommendedFormats,
  };
}

export function isDuplicateTemplateName(name: string, existingNames: string[]): boolean {
  const norm = name.trim().toLowerCase();
  return existingNames.some((n) => n.trim().toLowerCase() === norm);
}
