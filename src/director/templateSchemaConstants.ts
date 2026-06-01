import type { ElementKind, PresetName } from './templateSchema';

export const TEMPLATE_SCHEMA_VERSION = 1;

export const TEMPLATE_TOP_LEVEL_KEYS = new Set([
  'schemaVersion',
  'id',
  'name',
  'glyph',
  'group',
  'description',
  'canvas',
  'durationSeconds',
  'defaultPlacement',
  'recommendedFormats',
  'background',
  'fields',
  'elements',
]);

export const ELEMENT_KINDS = new Set<ElementKind>([
  'text',
  'glyph',
  'line',
  'statRow',
  'bar',
  'statBox',
  'glow',
  'scanline',
  'badge',
  'buttonRow',
  'ring',
  'watermark',
]);

export const PRESET_NAMES = new Set<PresetName>([
  'fadeIn',
  'fadeOut',
  'slideUp',
  'slideDown',
  'slideInLeft',
  'slideInRight',
  'slideR',
  'scaleIn',
  'scaleOut',
  'pulse',
  'glowPulse',
  'counterUp',
  'lFill',
  'expandLine',
  'scanAnim',
  'radarSweep',
  'typewriter',
  'bounceIn',
  'shake',
  'flash',
  'rotateIn',
]);

export const FIELD_TYPES = new Set(['text', 'number', 'boolean', 'color', 'statRow', 'statBox', 'bar', 'buttonRow']);
