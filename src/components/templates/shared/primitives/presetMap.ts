import { getLocalProgress } from '@/animations/presets';
import {
  counterUp,
  expandLine,
  flashIn,
  lFill,
  popIn,
  pulse,
  radarSweep,
  scanAnim,
  shake,
  slideDown,
  slideInLeft,
  slideInRight,
  slideR,
  slideUp,
} from '@/animations/presets';
import type { PresetName } from '@/director/templateSchema';
import type { MotionStyle } from '@/animations/presets';

type PresetFn = (
  time: number,
  delaySeconds: number,
  durationSeconds: number,
  globalSpeed: number,
  target?: number | string,
) => MotionStyle;

function fadeIn(time: number, delay: number, duration: number, globalSpeed: number): MotionStyle {
  return { opacity: getLocalProgress(time, delay, duration, globalSpeed) };
}

function fadeOut(time: number, delay: number, duration: number, globalSpeed: number): MotionStyle {
  return { opacity: 1 - getLocalProgress(time, delay, duration, globalSpeed) };
}

function scaleOut(time: number, delay: number, duration: number, globalSpeed: number): MotionStyle {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  return { opacity: 1 - p, transform: `scale(${1 - p * 0.3})` };
}

function glowPulse(time: number, delay: number, duration: number, globalSpeed: number): MotionStyle {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  return { opacity: 0.4 + p * 0.6, filter: `blur(${8 + p * 12}px)` };
}

function typewriter(_time: number, delay: number, duration: number, globalSpeed: number, target?: number | string): MotionStyle {
  const text = String(target ?? '');
  const p = getLocalProgress(_time, delay, duration, globalSpeed);
  const chars = Math.floor(p * text.length);
  return { opacity: 1, transform: `scaleX(${chars / Math.max(text.length, 1)})` };
}

function bounceIn(time: number, delay: number, duration: number, globalSpeed: number): MotionStyle {
  return popIn(time, delay, duration, globalSpeed);
}

function flash(time: number, delay: number, duration: number, globalSpeed: number): MotionStyle {
  return flashIn(time, delay, duration, globalSpeed);
}

function rotateIn(time: number, delay: number, duration: number, globalSpeed: number): MotionStyle {
  const p = getLocalProgress(time, delay, duration, globalSpeed);
  return { opacity: p, transform: `rotate(${(1 - p) * -90}deg) scale(${0.5 + p * 0.5})` };
}

function asPreset(fn: (time: number, delay: number, duration: number, globalSpeed: number, arg?: number) => MotionStyle): PresetFn {
  return (time, delay, duration, globalSpeed, target) =>
    fn(time, delay, duration, globalSpeed, typeof target === 'number' ? target : undefined);
}

/** Uniform adapter: period-based presets ignore delay/duration args. */
export const PRESET_MAP: Record<PresetName, PresetFn> = {
  fadeIn,
  fadeOut,
  slideUp: asPreset(slideUp),
  slideDown: asPreset(slideDown),
  slideInLeft: asPreset(slideInLeft),
  slideInRight: asPreset(slideInRight),
  slideR: asPreset(slideR),
  scaleIn: popIn,
  scaleOut,
  pulse: (t, _d, dur) => pulse(t, dur > 0 ? dur : 2),
  glowPulse,
  counterUp: (t, d, dur, gs, target) => {
    counterUp(t, d, dur, gs, typeof target === 'number' ? target : parseFloat(String(target ?? 0)) || 0);
    return { opacity: 1 };
  },
  lFill: (t, d, dur, gs, target) =>
    lFill(t, d, dur, gs, typeof target === 'number' ? target : parseFloat(String(target ?? 0)) || 0),
  expandLine: (t, d, dur, gs, target) =>
    expandLine(t, d, dur, gs, typeof target === 'number' ? target : parseFloat(String(target ?? 100)) || 100),
  scanAnim,
  radarSweep: (t, _d, dur) => radarSweep(t, dur > 0 ? dur : 3),
  typewriter,
  bounceIn,
  shake: asPreset(shake),
  flash,
  rotateIn,
};

export { counterUp };
