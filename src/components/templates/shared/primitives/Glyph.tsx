import type { CSSProperties } from 'react';
import { applyMotionStyle } from '@/animations/presets';
import type { GlyphElement } from '@/director/templateSchema';
import type { ThemeTokens } from '@/themes/tokens';
import { PRESET_MAP } from './presetMap';
import { resolveColor } from './resolveColor';
import { spx } from './dynamicLayout';

interface GlyphProps {
  el: GlyphElement;
  value: string;
  theme: ThemeTokens;
  scale: number;
  time: number;
  globalSpeed: number;
}

export function GlyphPrimitive({ el, value, theme, scale, time, globalSpeed }: GlyphProps) {
  const style: CSSProperties = {
    fontSize: spx(el.fontSize ?? 44, scale),
    color: resolveColor(el.color, theme, theme.greenBright),
    position: 'relative',
    textShadow: `0 0 ${spx(20, scale)}px rgba(90,200,90,0.4)`,
    ...(el.style as CSSProperties),
  };

  if (el.anim) {
    Object.assign(style, applyMotionStyle(PRESET_MAP[el.anim.preset](time, el.anim.delaySeconds, el.anim.durationSeconds, globalSpeed, el.anim.target)));
  }

  return <div style={style}>{value}</div>;
}
