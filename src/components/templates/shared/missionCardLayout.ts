import { getField } from './types';

export interface MissionCardLayout {
  cardWidth: number;
  cardHeight: number;
  contentScale: number;
  glowIntensity: number;
  glowSpread: number;
  glowCenterY: number;
}

export const DEFAULT_MISSION_CARD_LAYOUT: MissionCardLayout = {
  cardWidth: 720,
  cardHeight: 480,
  contentScale: 1.33,
  glowIntensity: 0.18,
  glowSpread: 85,
  glowCenterY: 60,
};

const BASE_CARD_WIDTH = 540;

export function getMissionCardLayout(fields: Record<string, unknown>): MissionCardLayout {
  const cardWidth = getField(fields, 'cardWidth', DEFAULT_MISSION_CARD_LAYOUT.cardWidth);
  const cardHeight = getField(fields, 'cardHeight', DEFAULT_MISSION_CARD_LAYOUT.cardHeight);
  const autoScale = cardWidth / BASE_CARD_WIDTH;

  return {
    cardWidth,
    cardHeight,
    contentScale: getField(fields, 'contentScale', autoScale),
    glowIntensity: getField(fields, 'glowIntensity', DEFAULT_MISSION_CARD_LAYOUT.glowIntensity),
    glowSpread: getField(fields, 'glowSpread', DEFAULT_MISSION_CARD_LAYOUT.glowSpread),
    glowCenterY: getField(fields, 'glowCenterY', DEFAULT_MISSION_CARD_LAYOUT.glowCenterY),
  };
}

export function glowGradient(
  rgb: string,
  layout: MissionCardLayout,
): string {
  return `radial-gradient(ellipse at 50% ${layout.glowCenterY}%, ${rgb.replace('ALPHA', String(layout.glowIntensity))} 0%, transparent ${layout.glowSpread}%)`;
}
