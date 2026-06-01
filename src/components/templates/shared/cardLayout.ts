import type { TemplateId } from '@/types';
import { getField } from './types';

export interface CardLayout {
  cardWidth: number;
  cardHeight: number;
  contentScale: number;
  sizeMultiplier: number;
  aspectMultiplier: number;
  glowIntensity: number;
  glowSpread: number;
  glowCenterY: number;
  hasGlow: boolean;
  /** True when the template uses auto/min height instead of fixed box. */
  autoHeight: boolean;
}

export interface TemplateBaseSize {
  width: number;
  height: number;
  /** Default size multiplier for this template (1 = original HTML size). */
  defaultSizeMultiplier?: number;
  hasGlow?: boolean;
  autoHeight?: boolean;
}

export const TEMPLATE_BASE_SIZES: Record<TemplateId, TemplateBaseSize> = {
  'mission-passed': { width: 540, height: 360, defaultSizeMultiplier: 1.33, hasGlow: true },
  'mission-failed': { width: 540, height: 360, defaultSizeMultiplier: 1.33, hasGlow: true },
  'chapter-card': { width: 560, height: 360, defaultSizeMultiplier: 1.0 },
  'loading-screen': { width: 560, height: 360, defaultSizeMultiplier: 1.0 },
  'side-quest': { width: 480, height: 320, defaultSizeMultiplier: 1.0, autoHeight: true },
  'enter-location': { width: 480, height: 120, defaultSizeMultiplier: 1.0, autoHeight: true },
  'phone-call': { width: 420, height: 260, defaultSizeMultiplier: 1.0, autoHeight: true },
  'cheat-code': { width: 440, height: 180, defaultSizeMultiplier: 1.0, autoHeight: true },
  'weekly-stats': { width: 540, height: 420, defaultSizeMultiplier: 1.0, autoHeight: true },
};

export const DEFAULT_LAYOUT_FIELDS = {
  sizeMultiplier: 1.0,
  aspectMultiplier: 1.0,
  contentScale: 0, // 0 = auto (use sizeMultiplier)
  glowIntensity: 0.18,
  glowSpread: 85,
  glowCenterY: 60,
};

export const LAYOUT_FIELD_KEYS = new Set([
  'sizeMultiplier',
  'aspectMultiplier',
  'contentScale',
  'glowIntensity',
  'glowSpread',
  'glowCenterY',
  // legacy keys still excluded from text fields
  'cardWidth',
  'cardHeight',
]);

function resolveSizeMultiplier(templateId: TemplateId, fields: Record<string, unknown>): number {
  const base = TEMPLATE_BASE_SIZES[templateId];
  const defaultMult = base.defaultSizeMultiplier ?? DEFAULT_LAYOUT_FIELDS.sizeMultiplier;

  if (fields.sizeMultiplier !== undefined) {
    return getField(fields, 'sizeMultiplier', defaultMult);
  }
  // Legacy: derive from explicit cardWidth if present
  if (fields.cardWidth !== undefined) {
    return Number(fields.cardWidth) / base.width;
  }
  return defaultMult;
}

export function getCardLayout(templateId: TemplateId, fields: Record<string, unknown>): CardLayout {
  const base = TEMPLATE_BASE_SIZES[templateId];
  const sizeMultiplier = resolveSizeMultiplier(templateId, fields);
  const aspectMultiplier = getField(fields, 'aspectMultiplier', DEFAULT_LAYOUT_FIELDS.aspectMultiplier);
  const contentScaleRaw = getField(fields, 'contentScale', DEFAULT_LAYOUT_FIELDS.contentScale);
  const contentScale = contentScaleRaw > 0 ? contentScaleRaw : sizeMultiplier;

  let cardWidth = Math.round(base.width * sizeMultiplier);
  let cardHeight = Math.round(base.height * sizeMultiplier * aspectMultiplier);

  // Legacy: explicit cardHeight overrides aspect calculation
  if (fields.cardHeight !== undefined && fields.sizeMultiplier === undefined && fields.aspectMultiplier === undefined) {
    cardHeight = Number(fields.cardHeight);
  }

  return {
    cardWidth,
    cardHeight,
    contentScale,
    sizeMultiplier,
    aspectMultiplier,
    glowIntensity: getField(fields, 'glowIntensity', DEFAULT_LAYOUT_FIELDS.glowIntensity),
    glowSpread: getField(fields, 'glowSpread', DEFAULT_LAYOUT_FIELDS.glowSpread),
    glowCenterY: getField(fields, 'glowCenterY', DEFAULT_LAYOUT_FIELDS.glowCenterY),
    hasGlow: base.hasGlow ?? false,
    autoHeight: base.autoHeight ?? false,
  };
}

export function glowGradient(rgb: string, layout: CardLayout): string {
  return `radial-gradient(ellipse at 50% ${layout.glowCenterY}%, ${rgb.replace('ALPHA', String(layout.glowIntensity))} 0%, transparent ${layout.glowSpread}%)`;
}

/** Scale a base pixel value by content scale. */
export function spx(base: number, scale: number): number {
  return base * scale;
}
