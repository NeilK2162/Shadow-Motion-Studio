import type { CSSProperties } from 'react';
import { applyMotionStyle } from '@/animations/presets';
import type { StatBoxElement } from '@/director/templateSchema';
import type { StatBox } from '@/types';
import type { ThemeTokens } from '@/themes/tokens';
import { PRESET_MAP } from './presetMap';
import { resolveColor } from './resolveColor';
import { spx } from './dynamicLayout';

interface StatBoxProps {
  el: StatBoxElement;
  box: StatBox;
  theme: ThemeTokens;
  scale: number;
  time: number;
  globalSpeed: number;
}

export function StatBoxPrimitive({ el, box, theme, scale, time, globalSpeed }: StatBoxProps) {
  const style: CSSProperties = {
    background: '#0a0a0a',
    border: `1px solid ${theme.dark4}`,
    padding: `${spx(12, scale)}px ${spx(14, scale)}px`,
    ...(el.style as CSSProperties),
  };

  if (el.anim) {
    Object.assign(style, applyMotionStyle(PRESET_MAP[el.anim.preset](time, el.anim.delaySeconds, el.anim.durationSeconds, globalSpeed, el.anim.target)));
  }

  return (
    <div style={style}>
      <div style={{ fontFamily: theme.monoFont, fontSize: spx(8, scale), color: resolveColor(el.labelColor, theme, theme.dim), letterSpacing: 2, marginBottom: spx(6, scale), textTransform: 'uppercase' }}>
        {box.label}
      </div>
      <div style={{ fontFamily: theme.titleFont, fontSize: spx(28, scale), color: resolveColor(el.valueColor, theme, theme.gold), letterSpacing: 2, lineHeight: 1 }}>
        {box.value}
      </div>
      <div style={{ fontFamily: theme.monoFont, fontSize: spx(9, scale), color: resolveColor(el.changeColor, theme, theme.greenBright), marginTop: spx(4, scale) }}>
        {box.change}
      </div>
    </div>
  );
}
