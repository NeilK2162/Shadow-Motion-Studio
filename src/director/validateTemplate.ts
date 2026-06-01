import type {
  ColorToken,
  ColorValue,
  ElementKind,
  PresetName,
  TemplateDefinition,
} from './templateSchema';
import {
  ELEMENT_KINDS,
  FIELD_TYPES,
  PRESET_NAMES,
  TEMPLATE_SCHEMA_VERSION,
  TEMPLATE_TOP_LEVEL_KEYS,
} from './templateSchemaConstants';

export interface TemplateValidationError {
  path: string;
  message: string;
}

export interface TemplateValidationResult {
  valid: boolean;
  errors: TemplateValidationError[];
  def?: TemplateDefinition;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const ID_RE = /^[a-z][a-z0-9-]{0,47}$/;
const KEY_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,23}$/;
const COLOR_TOKENS = new Set<string>([
  'gold',
  'silver',
  'dim',
  'dark1',
  'dark2',
  'dark3',
  'dark4',
  'dark5',
  'green',
  'red',
  'blue',
  'purple',
]);

function err(errors: TemplateValidationError[], path: string, message: string): void {
  errors.push({ path, message });
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function validateColorValue(value: unknown, path: string, errors: TemplateValidationError[]): void {
  if (typeof value === 'string') {
    if (COLOR_TOKENS.has(value)) return;
    if (HEX_RE.test(value)) return;
    err(errors, path, 'Color must be a theme token or #rrggbb hex');
    return;
  }
  err(errors, path, 'Color must be a string token or hex');
}

function validateElement(el: unknown, fieldKeys: Set<string>, errors: TemplateValidationError[], index: number): void {
  const path = `elements[${index}]`;
  if (!isPlainObject(el)) {
    err(errors, path, 'Element must be an object');
    return;
  }

  const kind = el.kind;
  if (typeof kind !== 'string' || !ELEMENT_KINDS.has(kind as ElementKind)) {
    err(errors, `${path}.kind`, `Unknown element kind: ${String(kind)}`);
    return;
  }

  if (typeof el.key !== 'string' || !KEY_RE.test(el.key)) {
    err(errors, `${path}.key`, 'Element key must match /^[a-zA-Z][a-zA-Z0-9_]{0,23}$/');
  }

  if ('bind' in el && el.bind !== undefined) {
    if (typeof el.bind !== 'string' || !fieldKeys.has(el.bind)) {
      err(errors, `${path}.bind`, `bind must reference an existing field key`);
    }
  }

  if ('color' in el && el.color !== undefined) validateColorValue(el.color, `${path}.color`, errors);
  if ('labelColor' in el && el.labelColor !== undefined) validateColorValue(el.labelColor, `${path}.labelColor`, errors);
  if ('valueColor' in el && el.valueColor !== undefined) validateColorValue(el.valueColor, `${path}.valueColor`, errors);
  if ('changeColor' in el && el.changeColor !== undefined) validateColorValue(el.changeColor, `${path}.changeColor`, errors);
  if ('bgColor' in el && el.bgColor !== undefined) validateColorValue(el.bgColor, `${path}.bgColor`, errors);
  if ('primaryColor' in el && el.primaryColor !== undefined) validateColorValue(el.primaryColor, `${path}.primaryColor`, errors);
  if ('secondaryColor' in el && el.secondaryColor !== undefined) validateColorValue(el.secondaryColor, `${path}.secondaryColor`, errors);

  if ('fontSize' in el && el.fontSize !== undefined) {
    const fs = el.fontSize;
    if (typeof fs !== 'number' || fs < 8 || fs > 96) {
      err(errors, `${path}.fontSize`, 'fontSize must be 8..96');
    }
  }

  if ('anim' in el && el.anim !== undefined) {
    const animPath = `${path}.anim`;
    if (!isPlainObject(el.anim)) {
      err(errors, animPath, 'anim must be an object');
    } else {
      const preset = el.anim.preset;
      if (typeof preset !== 'string' || !PRESET_NAMES.has(preset as PresetName)) {
        err(errors, `${animPath}.preset`, `Unknown preset: ${String(preset)}`);
      }
      if (typeof el.anim.delaySeconds !== 'number' || el.anim.delaySeconds < 0 || el.anim.delaySeconds > 10) {
        err(errors, `${animPath}.delaySeconds`, 'delaySeconds must be 0..10');
      }
      if ('durationSeconds' in el.anim && el.anim.durationSeconds !== undefined) {
        const dur = el.anim.durationSeconds;
        if (typeof dur !== 'number' || dur < 0.05 || dur > 10) {
          err(errors, `${animPath}.durationSeconds`, 'durationSeconds must be 0.05..10');
        }
      }
    }
  }

  for (const key of Object.keys(el)) {
    const allowed = new Set([
      'kind',
      'key',
      'bind',
      'static',
      'font',
      'fontSize',
      'color',
      'letterSpacing',
      'uppercase',
      'width',
      'height',
      'label',
      'pct',
      'showPct',
      'labelColor',
      'valueColor',
      'changeColor',
      'bgColor',
      'primaryColor',
      'secondaryColor',
      'size',
      'stroke',
      'opacity',
      'anim',
      'style',
    ]);
    if (!allowed.has(key)) {
      err(errors, `${path}.${key}`, `Unknown element property: ${key}`);
    }
  }
}

function validateField(field: unknown, errors: TemplateValidationError[], index: number): string | null {
  const path = `fields[${index}]`;
  if (!isPlainObject(field)) {
    err(errors, path, 'Field must be an object');
    return null;
  }

  if (typeof field.key !== 'string' || !KEY_RE.test(field.key)) {
    err(errors, `${path}.key`, 'Field key must match /^[a-zA-Z][a-zA-Z0-9_]{0,23}$/');
    return null;
  }

  if (typeof field.label !== 'string' || field.label.length === 0 || field.label.length > 40) {
    err(errors, `${path}.label`, 'label must be 1..40 chars');
  }

  if (typeof field.type !== 'string' || !FIELD_TYPES.has(field.type)) {
    err(errors, `${path}.type`, `Unknown field type: ${String(field.type)}`);
  }

  if (!('default' in field)) {
    err(errors, `${path}.default`, 'default is required');
  }

  if ('maxLength' in field && field.maxLength !== undefined) {
    if (typeof field.maxLength !== 'number' || field.maxLength < 1 || field.maxLength > 500) {
      err(errors, `${path}.maxLength`, 'maxLength must be 1..500');
    }
  }

  return field.key;
}

export function validateTemplate(input: unknown): TemplateValidationResult {
  const errors: TemplateValidationError[] = [];

  if (!isPlainObject(input)) {
    return { valid: false, errors: [{ path: '', message: 'Template must be a JSON object' }] };
  }

  for (const key of Object.keys(input)) {
    if (!TEMPLATE_TOP_LEVEL_KEYS.has(key)) {
      err(errors, key, `Unknown top-level key: ${key}`);
    }
  }

  if (input.schemaVersion !== TEMPLATE_SCHEMA_VERSION) {
    err(errors, 'schemaVersion', `schemaVersion must be ${TEMPLATE_SCHEMA_VERSION}`);
  }

  if (typeof input.id !== 'string' || !ID_RE.test(input.id)) {
    err(errors, 'id', 'id must be lowercase slug (a-z, 0-9, hyphen, max 48)');
  }

  if (typeof input.name !== 'string' || input.name.length < 1 || input.name.length > 60) {
    err(errors, 'name', 'name must be 1..60 chars');
  }

  if (typeof input.glyph !== 'string' || [...input.glyph].length !== 1) {
    err(errors, 'glyph', 'glyph must be a single character');
  }

  const groups = new Set(['stingers', 'hud', 'cards', 'engagement']);
  if (typeof input.group !== 'string' || !groups.has(input.group)) {
    err(errors, 'group', 'group must be stingers|hud|cards|engagement');
  }

  if (!isPlainObject(input.canvas)) {
    err(errors, 'canvas', 'canvas must be an object');
  } else {
    for (const dim of ['width', 'height'] as const) {
      const v = input.canvas[dim];
      if (typeof v !== 'number' || v < 320 || v > 1080) {
        err(errors, `canvas.${dim}`, 'canvas dimension must be 320..1080');
      }
    }
  }

  if (typeof input.durationSeconds !== 'number' || input.durationSeconds < 1 || input.durationSeconds > 6) {
    err(errors, 'durationSeconds', 'durationSeconds must be 1..6');
  }

  const placements = new Set([
    'center',
    'top-left',
    'top-center',
    'top-right',
    'middle-left',
    'middle-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
    'fullscreen',
  ]);
  if (typeof input.defaultPlacement !== 'string' || !placements.has(input.defaultPlacement)) {
    err(errors, 'defaultPlacement', 'invalid placement');
  }

  if (!Array.isArray(input.recommendedFormats) || input.recommendedFormats.length === 0) {
    err(errors, 'recommendedFormats', 'recommendedFormats must be a non-empty array');
  }

  const backgrounds = new Set(['solid', 'gradient', 'transparent']);
  if (typeof input.background !== 'string' || !backgrounds.has(input.background)) {
    err(errors, 'background', 'background must be solid|gradient|transparent');
  }

  if ('backgroundColors' in input && input.backgroundColors !== undefined) {
    if (
      !Array.isArray(input.backgroundColors) ||
      input.backgroundColors.length !== 2 ||
      !HEX_RE.test(String(input.backgroundColors[0])) ||
      !HEX_RE.test(String(input.backgroundColors[1]))
    ) {
      err(errors, 'backgroundColors', 'backgroundColors must be exactly [\"#rrggbb\", \"#rrggbb\"]');
    }
  }

  if (!Array.isArray(input.fields) || input.fields.length < 1 || input.fields.length > 12) {
    err(errors, 'fields', 'fields must contain 1..12 entries');
  }

  const fieldKeys = new Set<string>();
  if (Array.isArray(input.fields)) {
    for (let i = 0; i < input.fields.length; i++) {
      const key = validateField(input.fields[i], errors, i);
      if (key) fieldKeys.add(key);
    }
  }

  if (!Array.isArray(input.elements) || input.elements.length < 1 || input.elements.length > 20) {
    err(errors, 'elements', 'elements must contain 1..20 entries');
  } else {
    for (let i = 0; i < input.elements.length; i++) {
      validateElement(input.elements[i], fieldKeys, errors, i);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], def: input as unknown as TemplateDefinition };
}

export function formatValidationErrors(errors: TemplateValidationError[]): string {
  return errors.map((e) => `${e.path}: ${e.message}`).join('\n');
}

export type { ColorToken, ColorValue };
