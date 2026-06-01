import type { CSSProperties } from 'react';
import { applyMotionStyle } from '@/animations/presets';
import type { ScanlineElement } from '@/director/templateSchema';
import type { ThemeTokens } from '@/themes/tokens';
import { PRESET_MAP } from './presetMap';
import { resolveColor } from './resolveColor';
import { spx } from './dynamicLayout';

interface ScanlineProps {
  el: ScanlineElement;
  theme: ThemeTokens;
  scale: number;
  time: number;
  globalSpeed: number;
}

export function ScanlinePrimitive({ el, theme, scale, time, globalSpeed }: ScanlineProps) {
  const color = resolveColor(el.color, theme, theme.greenBright);
  const style: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: spx(el.height ?? 2, scale),
    background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
    transformOrigin: 'left center',
    ...(el.style as CSSProperties),
  };

  if (el.anim) {
    Object.assign(style, applyMotionStyle(PRESET_MAP[el.anim.preset](time, el.anim.delaySeconds, el.anim.durationSeconds, globalSpeed, el.anim.target)));
  }

  return <div style={style} />;
}
