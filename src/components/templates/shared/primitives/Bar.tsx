import type { CSSProperties } from 'react';
import { applyMotionStyle, counterUp } from '@/animations/presets';
import type { BarElement } from '@/director/templateSchema';
import type { ThemeTokens } from '@/themes/tokens';
import { PRESET_MAP } from './presetMap';
import { resolveColor } from './resolveColor';
import { spx } from './dynamicLayout';

interface BarProps {
  el: BarElement;
  label: string;
  pct: number;
  theme: ThemeTokens;
  scale: number;
  time: number;
  globalSpeed: number;
  showPct?: boolean;
}

export function BarPrimitive({ el, label, pct, theme, scale, time, globalSpeed, showPct = true }: BarProps) {
  const barColor = resolveColor(el.color, theme, theme.gold);
  const rowStyle: CSSProperties = {
    marginBottom: spx(12, scale),
    ...(el.style as CSSProperties),
  };

  if (el.anim && el.anim.preset !== 'lFill') {
    Object.assign(rowStyle, applyMotionStyle(PRESET_MAP[el.anim.preset](time, el.anim.delaySeconds, el.anim.durationSeconds, globalSpeed, el.anim.target)));
  }

  const fillAnim = el.anim?.preset === 'lFill' ? el.anim : undefined;

  return (
    <div style={rowStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spx(4, scale) }}>
        <span style={{ fontFamily: theme.monoFont, fontSize: spx(8, scale), color: theme.dim, letterSpacing: 2 }}>{label}</span>
        {showPct && (
          <span style={{ fontFamily: theme.monoFont, fontSize: spx(8, scale), color: theme.silver }}>
            {fillAnim ? counterUp(time, fillAnim.delaySeconds, fillAnim.durationSeconds, globalSpeed, pct) : pct}%
          </span>
        )}
      </div>
      <div style={{ height: spx(4, scale), background: theme.dark4, borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            background: barColor,
            ...(fillAnim
              ? applyMotionStyle(PRESET_MAP.lFill(time, fillAnim.delaySeconds, fillAnim.durationSeconds, globalSpeed, pct))
              : { width: `${pct}%` }),
          }}
        />
      </div>
    </div>
  );
}
