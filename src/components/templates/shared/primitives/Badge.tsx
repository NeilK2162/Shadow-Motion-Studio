import type { CSSProperties } from 'react';
import { applyMotionStyle } from '@/animations/presets';
import type { BadgeElement } from '@/director/templateSchema';
import type { ThemeTokens } from '@/themes/tokens';
import { PRESET_MAP } from './presetMap';
import { resolveColor } from './resolveColor';
import { resolveFont } from './resolveFont';
import { spx } from './dynamicLayout';

interface BadgeProps {
  el: BadgeElement;
  value: string;
  theme: ThemeTokens;
  scale: number;
  time: number;
  globalSpeed: number;
}

export function BadgePrimitive({ el, value, theme, scale, time, globalSpeed }: BadgeProps) {
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spx(8, scale),
    fontFamily: resolveFont('mono', theme),
    fontSize: spx(9, scale),
    color: resolveColor(el.color, theme, theme.gold),
    background: resolveColor(el.bgColor, theme, theme.dark3),
    padding: `${spx(6, scale)}px ${spx(12, scale)}px`,
    letterSpacing: 3,
    textTransform: 'uppercase',
    border: `1px solid ${theme.dark4}`,
    ...(el.style as CSSProperties),
  };

  if (el.anim) {
    Object.assign(style, applyMotionStyle(PRESET_MAP[el.anim.preset](time, el.anim.delaySeconds, el.anim.durationSeconds, globalSpeed, el.anim.target)));
  }

  return <div style={style}>{value}</div>;
}
