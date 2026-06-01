import type { CSSProperties } from 'react';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function easeOut(t: number): number {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
}

export function getLocalProgress(
  timeSeconds: number,
  delaySeconds: number,
  durationSeconds: number,
  globalSpeed = 1,
): number {
  const t = timeSeconds * globalSpeed;
  return easeOut(clamp((t - delaySeconds) / durationSeconds, 0, 1));
}

export function getTimeSeconds(frame: number, fps: number): number {
  return frame / fps;
}

export interface MotionStyle {
  opacity?: number;
  transform?: string;
  width?: string | number;
  scaleX?: number;
  filter?: string;
}

export function slideUp(time: number, delay = 0, duration = 0.4, globalSpeed = 1, distance = 18): MotionStyle {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * distance}px)`,
  };
}

export function slideUp2(time: number, delay = 0, duration = 0.5, globalSpeed = 1, distance = 24): MotionStyle {
  return slideUp(time, delay, duration, globalSpeed, distance);
}

export function slideR(time: number, delay = 0, duration = 0.4, globalSpeed = 1, distance = 24): MotionStyle {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  return {
    opacity: p,
    transform: `translateX(${(1 - p) * distance}px)`,
  };
}

export function fadeL(time: number, delay = 0, duration = 0.5, globalSpeed = 1, distance = 16): MotionStyle {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  return {
    opacity: p,
    transform: `translateX(${(p - 1) * distance}px)`,
  };
}

export function fadeR(time: number, delay = 0, duration = 0.5, globalSpeed = 1, distance = 16): MotionStyle {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  return {
    opacity: p,
    transform: `translateX(${(1 - p) * distance}px)`,
  };
}

export function popIn(time: number, delay = 0, duration = 0.35, globalSpeed = 1): MotionStyle {
  const raw = clamp((time * globalSpeed - delay) / duration, 0, 1);
  let scale = 1;
  if (raw < 0.65) {
    scale = 0.4 + (raw / 0.65) * 0.75;
  } else {
    scale = 1.15 - ((raw - 0.65) / 0.35) * 0.15;
  }
  return {
    opacity: raw,
    transform: `scale(${scale})`,
  };
}

export function expandLine(time: number, delay = 0.3, duration = 0.5, globalSpeed = 1, maxWidth = 64): MotionStyle {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  return { width: `${p * maxWidth}px` };
}

export function scanAnim(time: number, delay = 0, duration = 0.8, globalSpeed = 1): MotionStyle {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  return {
    scaleX: p,
  };
}

export function flashIn(time: number, delay = 0, duration = 0.4, globalSpeed = 1): MotionStyle {
  const raw = clamp((time * globalSpeed - delay) / duration, 0, 1);
  let opacity = 1;
  if (raw < 0.25) opacity = raw / 0.25;
  else if (raw < 0.45) opacity = 0.5;
  else opacity = 0.5 + ((raw - 0.45) / 0.55) * 0.5;
  return { opacity };
}

export function pulse(time: number, period = 1.8): MotionStyle {
  const phase = (time % period) / period;
  const opacity = phase < 0.5 ? 1 - phase * 1.6 : 0.2 + (phase - 0.5) * 1.6;
  return { opacity: clamp(opacity, 0.2, 1) };
}

export function lFill(time: number, delay = 0, duration = 1.8, globalSpeed = 1, targetPct = 68): MotionStyle {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  return { width: `${p * targetPct}%` };
}

export function counterUp(time: number, delay = 0, duration = 1.8, globalSpeed = 1, target = 68): number {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  return Math.round(p * target);
}

export function slideDown(time: number, delay = 0, duration = 0.4, globalSpeed = 1, distance = 18): MotionStyle {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  return {
    opacity: p,
    transform: `translateY(${(p - 1) * distance}px)`,
  };
}

export function slideInLeft(time: number, delay = 0, duration = 0.45, globalSpeed = 1, distance = 40): MotionStyle {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  return {
    opacity: p,
    transform: `translateX(${(p - 1) * distance}px)`,
  };
}

export function slideInRight(time: number, delay = 0, duration = 0.45, globalSpeed = 1, distance = 40): MotionStyle {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  return {
    opacity: p,
    transform: `translateX(${(1 - p) * distance}px)`,
  };
}

export function starPop(time: number, index: number, baseDelay = 0.12, step = 0.12, globalSpeed = 1): MotionStyle {
  return popIn(time, baseDelay + index * step, 0.35, globalSpeed);
}

export function impactZoom(time: number, delay = 0, duration = 0.6, globalSpeed = 1): MotionStyle {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  const scale = 1.35 - p * 0.35;
  const blur = 8 * (1 - p);
  return {
    opacity: p,
    transform: `scale(${scale})`,
    filter: `blur(${blur}px)`,
  };
}

export function shake(time: number, delay = 0, duration = 0.5, globalSpeed = 1, amplitude = 10): MotionStyle {
  const raw = clamp((time * globalSpeed - delay) / duration, 0, 1);
  if (raw <= 0) return { opacity: 0, transform: 'translateX(0)' };
  if (raw >= 1) return { opacity: 1, transform: 'translateX(0)' };
  const x = amplitude * Math.sin(raw * Math.PI * 6) * (1 - raw);
  return { opacity: 1, transform: `translateX(${x}px)` };
}

export function vignettePulse(time: number, delay = 0, duration = 0.3, globalSpeed = 1, target = 0.85): MotionStyle {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  return { opacity: p * target };
}

export function radarSweep(time: number, period = 2.0): MotionStyle {
  const angle = ((time % period) / period) * 360;
  return { transform: `rotate(${angle}deg)` };
}

export function applyMotionStyle(style: MotionStyle): CSSProperties {
  const css: CSSProperties = {};
  if (style.opacity !== undefined) css.opacity = style.opacity;
  if (style.filter !== undefined) css.filter = style.filter;
  if (style.width !== undefined) css.width = style.width;
  if (style.scaleX !== undefined) {
    css.transform = `scaleX(${style.scaleX})`;
    css.transformOrigin = 'left center';
  } else if (style.transform !== undefined) {
    css.transform = style.transform;
  }
  return css;
}
