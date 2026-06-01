import type { CSSProperties } from 'react';
import type { FormatPreset } from './formats';

export type Placement =
  | 'center'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'fullscreen';

export const PLACEMENT_OPTIONS: { value: Placement; label: string }[] = [
  { value: 'center', label: 'Center' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'middle-left', label: 'Middle Left' },
  { value: 'middle-right', label: 'Middle Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'fullscreen', label: 'Fullscreen' },
];

export function placementStyle(placement: Placement, format: FormatPreset): CSSProperties {
  if (placement === 'center') {
    return {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
  }

  if (placement === 'fullscreen') {
    return {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'stretch',
    };
  }

  const padTop = Math.round(format.height * format.safeTop);
  const padBottom = Math.round(format.height * format.safeBottom);
  const padSides = Math.round(format.width * format.safeSides);

  const base: CSSProperties = {
    position: 'absolute',
    paddingTop: padTop,
    paddingBottom: padBottom,
    paddingLeft: padSides,
    paddingRight: padSides,
  };

  switch (placement) {
    case 'top-left':
      return { ...base, top: 0, left: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' };
    case 'top-center':
      return { ...base, top: 0, left: 0, right: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' };
    case 'top-right':
      return { ...base, top: 0, right: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' };
    case 'middle-left':
      return { ...base, top: 0, bottom: 0, left: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' };
    case 'middle-right':
      return { ...base, top: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' };
    case 'bottom-left':
      return { ...base, bottom: 0, left: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' };
    case 'bottom-center':
      return { ...base, bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' };
    case 'bottom-right':
      return { ...base, bottom: 0, right: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' };
    default:
      return { ...base, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' };
  }
}

export function safeAreaStyle(format: FormatPreset): CSSProperties {
  const padTop = Math.round(format.height * format.safeTop);
  const padBottom = Math.round(format.height * format.safeBottom);
  const padSides = Math.round(format.width * format.safeSides);

  return {
    position: 'absolute',
    top: padTop,
    left: padSides,
    right: padSides,
    bottom: padBottom,
    border: '1px dashed rgba(232, 200, 74, 0.35)',
    pointerEvents: 'none',
    zIndex: 10,
  };
}
