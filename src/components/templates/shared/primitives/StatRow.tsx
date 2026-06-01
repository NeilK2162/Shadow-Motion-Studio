import type { CSSProperties } from 'react';
import { applyMotionStyle } from '@/animations/presets';
import type { StatRowElement } from '@/director/templateSchema';
import type { StatField } from '@/types';
import type { ThemeTokens } from '@/themes/tokens';
import { PRESET_MAP } from './presetMap';
import { resolveColor } from './resolveColor';
import { spx } from './dynamicLayout';

interface StatRowProps {
  el: StatRowElement;
  stats: StatField[];
  theme: ThemeTokens;
  scale: number;
  time: number;
  globalSpeed: number;
}

export function StatRowPrimitive({ el, stats, theme, scale, time, globalSpeed }: StatRowProps) {
  const style: CSSProperties = {
    display: 'flex',
    gap: spx(36, scale),
    marginTop: spx(16, scale),
    position: 'relative',
    justifyContent: 'center',
    ...(el.style as CSSProperties),
  };

  if (el.anim) {
    Object.assign(style, applyMotionStyle(PRESET_MAP[el.anim.preset](time, el.anim.delaySeconds, el.anim.durationSeconds, globalSpeed, el.anim.target)));
  }

  return (
    <div style={style}>
      {stats.map((stat) => (
        <div key={stat.label} style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: theme.titleFont,
              fontSize: spx(el.fontSize ?? 20, scale),
              color: resolveColor(el.color, theme, theme.gold),
              letterSpacing: 2,
            }}
          >
            {stat.value}
          </div>
          <div
            style={{
              fontFamily: theme.monoFont,
              fontSize: spx(8, scale),
              color: resolveColor(el.labelColor, theme, theme.dim),
              letterSpacing: 1,
              marginTop: 2,
            }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
