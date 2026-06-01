import type { TemplateId } from '@/types';
import { getCardLayout } from '@/components/templates/shared/cardLayout';

/** Card dimensions for preview zoom. */
export function getTemplateCardSize(template: TemplateId, fields: Record<string, unknown>): { width: number; height: number } {
  const layout = getCardLayout(template, fields);
  return { width: layout.cardWidth, height: layout.cardHeight };
}

export function getDefaultLayoutFields(template: TemplateId): Record<string, number> {
  const base = getCardLayout(template, {});
  return {
    sizeMultiplier: base.sizeMultiplier,
    aspectMultiplier: base.aspectMultiplier,
    contentScale: 0,
    glowIntensity: base.glowIntensity,
    glowSpread: base.glowSpread,
    glowCenterY: base.glowCenterY,
  };
}
