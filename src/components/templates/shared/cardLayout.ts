import type { FormatId } from '@/lib/formats';
import type { Placement } from '@/lib/placement';
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
  autoHeight: boolean;
  defaultPlacement: Placement;
}

export interface TemplateBaseSize {
  width: number;
  height: number;
  defaultSizeMultiplier?: number;
  hasGlow?: boolean;
  autoHeight?: boolean;
  defaultPlacement?: Placement;
  recommendedFormats?: FormatId[];
  formatSizeMultiplier?: Partial<Record<FormatId, number>>;
}

const ALL_FORMATS: FormatId[] = ['youtube-landscape', 'youtube-720', 'shorts-vertical', 'feed-square', 'feed-portrait'];
const YT_FORMATS: FormatId[] = ['youtube-landscape', 'youtube-720', 'shorts-vertical'];

export const TEMPLATE_BASE_SIZES: Record<TemplateId, TemplateBaseSize> = {
  'mission-passed': { width: 540, height: 360, defaultSizeMultiplier: 1.33, hasGlow: true, defaultPlacement: 'center', recommendedFormats: ALL_FORMATS },
  'mission-failed': { width: 540, height: 360, defaultSizeMultiplier: 1.33, hasGlow: true, defaultPlacement: 'center', recommendedFormats: ALL_FORMATS },
  'chapter-card': { width: 560, height: 360, defaultSizeMultiplier: 1.0, defaultPlacement: 'center', recommendedFormats: ALL_FORMATS },
  'loading-screen': { width: 560, height: 360, defaultSizeMultiplier: 1.0, defaultPlacement: 'center', recommendedFormats: ALL_FORMATS },
  'side-quest': { width: 480, height: 320, defaultSizeMultiplier: 1.0, autoHeight: true, defaultPlacement: 'center', recommendedFormats: ALL_FORMATS },
  'enter-location': { width: 480, height: 120, defaultSizeMultiplier: 1.0, autoHeight: true, defaultPlacement: 'bottom-left', recommendedFormats: ALL_FORMATS },
  'phone-call': { width: 420, height: 260, defaultSizeMultiplier: 1.0, autoHeight: true, defaultPlacement: 'center', recommendedFormats: ALL_FORMATS },
  'cheat-code': { width: 440, height: 180, defaultSizeMultiplier: 1.0, autoHeight: true, defaultPlacement: 'center', recommendedFormats: ALL_FORMATS },
  'weekly-stats': { width: 540, height: 420, defaultSizeMultiplier: 1.0, autoHeight: true, defaultPlacement: 'center', recommendedFormats: ALL_FORMATS },
  'wanted-level': { width: 300, height: 90, defaultSizeMultiplier: 1.0, autoHeight: true, defaultPlacement: 'top-right', recommendedFormats: ALL_FORMATS, formatSizeMultiplier: { 'shorts-vertical': 1.25 } },
  'cash-pickup': { width: 340, height: 110, defaultSizeMultiplier: 1.0, autoHeight: true, defaultPlacement: 'top-right', recommendedFormats: ALL_FORMATS },
  'status-hud': { width: 320, height: 140, defaultSizeMultiplier: 1.0, autoHeight: true, defaultPlacement: 'bottom-left', recommendedFormats: YT_FORMATS },
  'gps-route': { width: 380, height: 120, defaultSizeMultiplier: 1.0, autoHeight: true, defaultPlacement: 'bottom-left', recommendedFormats: YT_FORMATS },
  'character-intro': { width: 460, height: 150, defaultSizeMultiplier: 1.0, autoHeight: true, defaultPlacement: 'bottom-left', recommendedFormats: ALL_FORMATS },
  'now-playing': { width: 420, height: 90, defaultSizeMultiplier: 1.0, autoHeight: true, defaultPlacement: 'bottom-center', recommendedFormats: ALL_FORMATS },
  'wasted': { width: 1920, height: 1080, defaultSizeMultiplier: 1.0, hasGlow: true, defaultPlacement: 'fullscreen', recommendedFormats: ALL_FORMATS, formatSizeMultiplier: { 'shorts-vertical': 1.4, 'feed-square': 1.2 } },
  'subscribe-prompt': { width: 480, height: 180, defaultSizeMultiplier: 1.0, autoHeight: true, hasGlow: true, defaultPlacement: 'bottom-center', recommendedFormats: ALL_FORMATS },
  'countdown': { width: 360, height: 360, defaultSizeMultiplier: 1.0, hasGlow: true, defaultPlacement: 'center', recommendedFormats: ALL_FORMATS, formatSizeMultiplier: { 'shorts-vertical': 1.3 } },
  'this-or-that': { width: 520, height: 300, defaultSizeMultiplier: 1.0, autoHeight: true, defaultPlacement: 'center', recommendedFormats: ALL_FORMATS },
};

export const DEFAULT_LAYOUT_FIELDS = {
  sizeMultiplier: 1.0,
  aspectMultiplier: 1.0,
  contentScale: 0,
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
  'cardWidth',
  'cardHeight',
]);

function resolveSizeMultiplier(
  templateId: TemplateId,
  fields: Record<string, unknown>,
  formatId?: FormatId,
): number {
  const base = TEMPLATE_BASE_SIZES[templateId];
  const formatMult = formatId ? base.formatSizeMultiplier?.[formatId] : undefined;
  const defaultMult = base.defaultSizeMultiplier ?? formatMult ?? DEFAULT_LAYOUT_FIELDS.sizeMultiplier;

  if (fields.sizeMultiplier !== undefined) {
    return getField(fields, 'sizeMultiplier', defaultMult);
  }
  if (fields.cardWidth !== undefined) {
    return Number(fields.cardWidth) / base.width;
  }
  if (formatMult !== undefined) {
    return formatMult;
  }
  return defaultMult;
}

export function getDefaultPlacement(templateId: TemplateId): Placement {
  return TEMPLATE_BASE_SIZES[templateId].defaultPlacement ?? 'center';
}

export function getCardLayout(
  templateId: TemplateId,
  fields: Record<string, unknown>,
  formatId?: FormatId,
): CardLayout {
  const base = TEMPLATE_BASE_SIZES[templateId];
  const sizeMultiplier = resolveSizeMultiplier(templateId, fields, formatId);
  const aspectMultiplier = getField(fields, 'aspectMultiplier', DEFAULT_LAYOUT_FIELDS.aspectMultiplier);
  const contentScaleRaw = getField(fields, 'contentScale', DEFAULT_LAYOUT_FIELDS.contentScale);
  const contentScale = contentScaleRaw > 0 ? contentScaleRaw : sizeMultiplier;

  let cardWidth = Math.round(base.width * sizeMultiplier);
  let cardHeight = Math.round(base.height * sizeMultiplier * aspectMultiplier);

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
    defaultPlacement: base.defaultPlacement ?? 'center',
  };
}

export function glowGradient(rgb: string, layout: CardLayout): string {
  return `radial-gradient(ellipse at 50% ${layout.glowCenterY}%, ${rgb.replace('ALPHA', String(layout.glowIntensity))} 0%, transparent ${layout.glowSpread}%)`;
}

export function spx(base: number, scale: number): number {
  return base * scale;
}
