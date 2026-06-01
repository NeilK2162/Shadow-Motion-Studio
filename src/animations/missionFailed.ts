export const missionFailedTimeline = {
  scan: { delay: 0, duration: 0.8, preset: 'scanAnim' },
  cross: { delay: 0, duration: 0.35, preset: 'popIn' },
  title: { delay: 0.15, duration: 0.4, preset: 'slideUp' },
  sub: { delay: 0.3, duration: 0.4, preset: 'slideUp' },
  cause: { delay: 0.45, duration: 0.4, preset: 'slideUp' },
  retry: { delay: 0.6, duration: 0.4, preset: 'slideUp' },
} as const;
