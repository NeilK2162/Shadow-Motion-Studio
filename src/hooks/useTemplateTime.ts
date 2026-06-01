import { useCurrentFrame, useVideoConfig } from 'remotion';
import { getTimeSeconds } from '@/animations/presets';

export function useTemplateTime(globalSpeed = 1): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return getTimeSeconds(frame, fps) * globalSpeed;
}

export function useTemplateFrame(): { frame: number; fps: number; time: number } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, time: getTimeSeconds(frame, fps) };
}
