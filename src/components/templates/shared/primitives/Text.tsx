import type { CSSProperties } from 'react';
import { applyMotionStyle } from '@/animations/presets';
import type { TextElement } from '@/director/templateSchema';
import type { ThemeTokens } from '@/themes/tokens';
import { counterUp, PRESET_MAP } from './presetMap';
import { resolveColor } from './resolveColor';
import { resolveFont } from './resolveFont';
import { spx } from './dynamicLayout';

interface TextProps {
  el: TextElement;
  value: string;
  theme: ThemeTokens;
  scale: number;
  time: number;
  globalSpeed: number;
}

export function TextPrimitive({ el, value, theme, scale, time, globalSpeed }: TextProps) {
  const anim = el.anim;
  let display = value;
  const style: CSSProperties = {
    fontFamily: resolveFont(el.font, theme),
    fontSize: spx(el.fontSize ?? 14, scale),
    color: resolveColor(el.color, theme),
    letterSpacing: el.letterSpacing ?? 0,
    textTransform: el.uppercase ? 'uppercase' : undefined,
    position: 'relative',
    textAlign: 'center',
    lineHeight: 1.1,
    ...(el.style as CSSProperties),
  };

  if (anim?.preset === 'counterUp') {
    const num = parseFloat(String(value).replace(/[^\d.-]/g, '')) || 0;
    const prefix = String(value).replace(/[\d.-]+/g, '').trim();
    const animated = counterUp(time, anim.delaySeconds, anim.durationSeconds, globalSpeed, num);
    display = prefix ? `${prefix}${animated}` : String(animated);
  }

  if (anim) {
    Object.assign(style, applyMotionStyle(PRESET_MAP[anim.preset](time, anim.delaySeconds, anim.durationSeconds, globalSpeed, anim.target)));
  }

  return <div style={style}>{display}</div>;
}
