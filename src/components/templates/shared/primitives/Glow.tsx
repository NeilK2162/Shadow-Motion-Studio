import type { CSSProperties } from 'react';
import { applyMotionStyle } from '@/animations/presets';
import type { GlowElement } from '@/director/templateSchema';
import type { ThemeTokens } from '@/themes/tokens';
import type { CardLayout } from '../cardLayout';
import { glowGradient } from '../cardLayout';
import { PRESET_MAP } from './presetMap';
import { resolveColor } from './resolveColor';

interface GlowProps {
  el: GlowElement;
  theme: ThemeTokens;
  layout: CardLayout;
  time: number;
  globalSpeed: number;
}

export function GlowPrimitive({ el, theme, layout, time, globalSpeed }: GlowProps) {
  const color = resolveColor(el.color, theme, theme.greenBright);
  const rgb = color.startsWith('#')
    ? `rgba(${parseInt(color.slice(1, 3), 16)},${parseInt(color.slice(3, 5), 16)},${parseInt(color.slice(5, 7), 16)},ALPHA)`
    : 'rgba(60,160,60,ALPHA)';

  const style: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: glowGradient(rgb, layout),
    opacity: el.opacity ?? layout.glowIntensity,
    pointerEvents: 'none',
    ...(el.style as CSSProperties),
  };

  if (el.anim) {
    Object.assign(style, applyMotionStyle(PRESET_MAP[el.anim.preset](time, el.anim.delaySeconds, el.anim.durationSeconds, globalSpeed, el.anim.target)));
  }

  return <div style={style} />;
}
