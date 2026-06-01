import type { CSSProperties } from 'react';
import { applyMotionStyle } from '@/animations/presets';
import type { ButtonRowElement } from '@/director/templateSchema';
import type { ThemeTokens } from '@/themes/tokens';
import { PRESET_MAP } from './presetMap';
import { resolveColor } from './resolveColor';
import { resolveFont } from './resolveFont';
import { spx } from './dynamicLayout';

interface ButtonPair {
  primary?: string;
  secondary?: string;
}

interface ButtonRowProps {
  el: ButtonRowElement;
  buttons: ButtonPair;
  theme: ThemeTokens;
  scale: number;
  time: number;
  globalSpeed: number;
}

export function ButtonRowPrimitive({ el, buttons, theme, scale, time, globalSpeed }: ButtonRowProps) {
  const rowStyle: CSSProperties = {
    display: 'flex',
    gap: spx(12, scale),
    marginTop: spx(16, scale),
    ...(el.style as CSSProperties),
  };

  if (el.anim) {
    Object.assign(rowStyle, applyMotionStyle(PRESET_MAP[el.anim.preset](time, el.anim.delaySeconds, el.anim.durationSeconds, globalSpeed, el.anim.target)));
  }

  const btnBase: CSSProperties = {
    fontFamily: resolveFont('mono', theme),
    fontSize: spx(10, scale),
    letterSpacing: 2,
    padding: `${spx(10, scale)}px ${spx(20, scale)}px`,
    textTransform: 'uppercase',
    border: `1px solid ${theme.dark4}`,
  };

  return (
    <div style={rowStyle}>
      {buttons.primary && (
        <div style={{ ...btnBase, background: resolveColor(el.primaryColor, theme, theme.gold), color: '#000' }}>{buttons.primary}</div>
      )}
      {buttons.secondary && (
        <div style={{ ...btnBase, background: 'transparent', color: resolveColor(el.secondaryColor, theme, theme.dim) }}>{buttons.secondary}</div>
      )}
    </div>
  );
}
