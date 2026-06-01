export const missionPassedTimeline = {
  scan: { delay: 0, duration: 0.8, preset: 'scanAnim' },
  check: { delay: 0, duration: 0.35, preset: 'popIn' },
  title: { delay: 0.15, duration: 0.4, preset: 'slideUp' },
  sub: { delay: 0.3, duration: 0.4, preset: 'slideUp' },
  resp: { delay: 0.45, duration: 0.4, preset: 'slideUp' },
  stats: { delay: 0.6, duration: 0.4, preset: 'slideUp' },
} as const;
