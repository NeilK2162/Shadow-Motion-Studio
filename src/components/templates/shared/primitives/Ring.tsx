import type { CSSProperties } from 'react';
import { applyMotionStyle } from '@/animations/presets';
import type { RingElement } from '@/director/templateSchema';
import type { ThemeTokens } from '@/themes/tokens';
import { PRESET_MAP } from './presetMap';
import { resolveColor } from './resolveColor';
import { spx } from './dynamicLayout';

interface RingProps {
  el: RingElement;
  theme: ThemeTokens;
  scale: number;
  time: number;
  globalSpeed: number;
}

export function RingPrimitive({ el, theme, scale, time, globalSpeed }: RingProps) {
  const size = spx(el.size ?? 80, scale);
  const stroke = spx(el.stroke ?? 3, scale);
  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    border: `${stroke}px solid ${resolveColor(el.color, theme, theme.gold)}`,
    position: 'relative',
    ...(el.style as CSSProperties),
  };

  if (el.anim) {
    Object.assign(style, applyMotionStyle(PRESET_MAP[el.anim.preset](time, el.anim.delaySeconds, el.anim.durationSeconds, globalSpeed, el.anim.target)));
  }

  return <div style={style} />;
}
