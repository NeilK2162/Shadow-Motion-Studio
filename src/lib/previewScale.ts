import type { TemplateId } from '@/types';
import { DEFAULT_MISSION_CARD_LAYOUT } from '@/components/templates/shared/missionCardLayout';

/** Approximate card dimensions per template for preview zoom. */
export function getTemplateCardSize(template: TemplateId, fields: Record<string, unknown>): { width: number; height: number } {
  switch (template) {
    case 'mission-passed':
    case 'mission-failed':
      return {
        width: Number(fields.cardWidth ?? DEFAULT_MISSION_CARD_LAYOUT.cardWidth),
        height: Number(fields.cardHeight ?? DEFAULT_MISSION_CARD_LAYOUT.cardHeight),
      };
    case 'chapter-card':
    case 'loading-screen':
      return { width: 560, height: 360 };
    case 'side-quest':
      return { width: 480, height: 320 };
    case 'enter-location':
      return { width: 480, height: 120 };
    case 'phone-call':
      return { width: 420, height: 260 };
    case 'cheat-code':
      return { width: 440, height: 180 };
    case 'weekly-stats':
      return { width: 540, height: 420 };
    default:
      return { width: 540, height: 360 };
  }
}
