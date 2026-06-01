import type { CSSProperties } from 'react';
import { applyMotionStyle } from '@/animations/presets';
import type { LineElement } from '@/director/templateSchema';
import type { ThemeTokens } from '@/themes/tokens';
import { PRESET_MAP } from './presetMap';
import { resolveColor } from './resolveColor';
import { spx } from './dynamicLayout';

interface LineProps {
  el: LineElement;
  theme: ThemeTokens;
  scale: number;
  time: number;
  globalSpeed: number;
  fullWidth?: number;
}

export function LinePrimitive({ el, theme, scale, time, globalSpeed, fullWidth }: LineProps) {
  const baseWidth = el.width === 'full' ? fullWidth ?? '100%' : spx(Number(el.width ?? 64), scale);
  const style: CSSProperties = {
    height: spx(el.height ?? 1, scale),
    background: resolveColor(el.color, theme, theme.dark4),
    margin: `${spx(10, scale)}px auto`,
    width: typeof baseWidth === 'number' ? baseWidth : baseWidth,
    ...(el.style as CSSProperties),
  };

  if (el.anim?.preset === 'expandLine') {
    Object.assign(
      style,
      applyMotionStyle(
        PRESET_MAP.expandLine(time, el.anim.delaySeconds, el.anim.durationSeconds, globalSpeed, el.anim.target ?? (typeof baseWidth === 'number' ? baseWidth : 200)),
      ),
    );
  } else if (el.anim) {
    Object.assign(style, applyMotionStyle(PRESET_MAP[el.anim.preset](time, el.anim.delaySeconds, el.anim.durationSeconds, globalSpeed, el.anim.target)));
  }

  return <div style={style} />;
}
