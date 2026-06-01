import type { CSSProperties } from 'react';
import type { TemplateDefinition } from '@/director/templateSchema';
import type { FormatId } from '@/lib/formats';
import type { Placement } from '@/lib/placement';
import { DEFAULT_LAYOUT_FIELDS, getCardShellStyle, spx, type CardLayout } from '../cardLayout';
import { getField } from '../types';

export function getDynamicCardLayout(
  def: TemplateDefinition,
  fields: Record<string, unknown>,
  formatId?: FormatId,
  options?: { placement?: Placement; canvasWidth?: number; canvasHeight?: number },
): CardLayout {
  void formatId;
  const placement = options?.placement ?? def.defaultPlacement;
  const canvasWidth = options?.canvasWidth;
  const canvasHeight = options?.canvasHeight;
  const isFullscreen = placement === 'fullscreen' && !!canvasWidth && !!canvasHeight;

  const sizeMultiplier = getField(fields, 'sizeMultiplier', 1);
  const aspectMultiplier = getField(fields, 'aspectMultiplier', DEFAULT_LAYOUT_FIELDS.aspectMultiplier);
  const contentScaleRaw = getField(fields, 'contentScale', DEFAULT_LAYOUT_FIELDS.contentScale);

  let cardWidth = Math.round(def.canvas.width * sizeMultiplier);
  let cardHeight = Math.round(def.canvas.height * sizeMultiplier * aspectMultiplier);
  let contentScale = contentScaleRaw > 0 ? contentScaleRaw : sizeMultiplier;
  let autoHeight = false;

  if (isFullscreen && canvasWidth && canvasHeight) {
    cardWidth = canvasWidth;
    cardHeight = canvasHeight;
    const wScale = canvasWidth / def.canvas.width;
    const hScale = canvasHeight / def.canvas.height;
    const fillScale = Math.min(wScale, hScale) * sizeMultiplier;
    contentScale = contentScaleRaw > 0 ? contentScaleRaw : fillScale;
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
    hasGlow: def.elements.some((e) => e.kind === 'glow'),
    autoHeight,
    defaultPlacement: def.defaultPlacement,
    isFullscreen,
  };
}

export function getDynamicBackground(
  def: TemplateDefinition,
  stripCardBackground: boolean,
): CSSProperties['background'] {
  if (stripCardBackground) return 'transparent';
  switch (def.background) {
    case 'transparent':
      return 'transparent';
    case 'gradient': {
      const [c0, c1] = def.backgroundColors ?? ['#050f05', '#030a03'];
      return `linear-gradient(135deg, ${c0} 0%, ${c1} 100%)`;
    }
    case 'solid':
    default:
      return '#050f05';
  }
}

export { getCardShellStyle, spx };
