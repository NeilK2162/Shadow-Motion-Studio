import type { CSSProperties } from 'react';
import { applyMotionStyle } from '@/animations/presets';
import type { WatermarkElement } from '@/director/templateSchema';
import type { ThemeTokens } from '@/themes/tokens';
import { PRESET_MAP } from './presetMap';
import { resolveColor } from './resolveColor';
import { resolveFont } from './resolveFont';
import { spx } from './dynamicLayout';

interface WatermarkProps {
  el: WatermarkElement;
  value: string;
  theme: ThemeTokens;
  scale: number;
  time: number;
  globalSpeed: number;
}

export function WatermarkPrimitive({ el, value, theme, scale, time, globalSpeed }: WatermarkProps) {
  const style: CSSProperties = {
    position: 'absolute',
    bottom: spx(12, scale),
    right: spx(12, scale),
    fontFamily: resolveFont('mono', theme),
    fontSize: spx(el.fontSize ?? 8, scale),
    color: resolveColor(el.color, theme, theme.dim),
    opacity: el.opacity ?? 0.4,
    letterSpacing: 2,
    ...(el.style as CSSProperties),
  };

  if (el.anim) {
    Object.assign(style, applyMotionStyle(PRESET_MAP[el.anim.preset](time, el.anim.delaySeconds, el.anim.durationSeconds, globalSpeed, el.anim.target)));
  }

  return <div style={style}>{value}</div>;
}
