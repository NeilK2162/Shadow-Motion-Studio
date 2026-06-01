import type { TemplateId } from '../types';
import { getTemplateSchema, mergeWithDefaults } from './schemas';
import type { Beat, GeneratedAsset } from './types';

export interface ValidationError {
  index: number;
  template: TemplateId;
  field?: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  assets: GeneratedAsset[];
  errors: ValidationError[];
}

function validateFieldValue(key: string, value: unknown, expectedType: string): string | null {
  if (value === undefined || value === null) return `${key} is missing`;
  const actual = Array.isArray(value) ? 'array' : typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : typeof value === 'object' ? 'object' : 'string';
  if (expectedType === 'array' && !Array.isArray(value)) return `${key} must be an array`;
  if (expectedType === 'object' && (typeof value !== 'object' || Array.isArray(value))) return `${key} must be an object`;
  if (expectedType === 'number' && typeof value !== 'number') return `${key} must be a number`;
  if (expectedType === 'boolean' && typeof value !== 'boolean') return `${key} must be a boolean`;
  if (expectedType === 'string' && typeof value !== 'string') return `${key} must be a string`;
  if (actual !== expectedType && expectedType !== 'object') {
    // allow number-as-string coercion message only for repair
  }
  return null;
}

export function validateDraftEntries(
  entries: Array<{ template: string; fields?: Record<string, unknown> }>,
): ValidationResult {
  const assets: GeneratedAsset[] = [];
  const errors: ValidationError[] = [];

  entries.forEach((entry, index) => {
    const template = entry.template as TemplateId;
    const schema = getTemplateSchema(template);

    const fields = mergeWithDefaults(template, entry.fields ?? {});
    const fieldErrors: string[] = [];

    for (const field of schema.contentFields) {
      const err = validateFieldValue(field.key, fields[field.key], field.type);
      if (err) fieldErrors.push(err);
    }

    const asset: GeneratedAsset = {
      template,
      fields,
      valid: fieldErrors.length === 0,
      errors: fieldErrors.length > 0 ? fieldErrors : undefined,
    };
    assets.push(asset);

    fieldErrors.forEach((msg) => {
      errors.push({ index, template, message: msg });
    });
  });

  return { valid: errors.length === 0, assets, errors };
}

export function applyDefaultFill(assets: GeneratedAsset[]): GeneratedAsset[] {
  return assets.map((asset) => {
    if (asset.valid) return asset;
    return {
      ...asset,
      fields: mergeWithDefaults(asset.template, asset.fields),
      valid: true,
      errors: undefined,
    };
  });
}

export function validatePlanBeats(beats: Beat[]): string | null {
  if (beats.length < 3) return 'Plan must have at least 3 beats';
  if (beats.length > 7) return 'Plan must have at most 7 beats';
  return null;
}
