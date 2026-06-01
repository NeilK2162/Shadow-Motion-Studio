import type { Resolution } from '@/types';

export type FormatId =
  | 'youtube-landscape'
  | 'youtube-720'
  | 'shorts-vertical'
  | 'feed-square'
  | 'feed-portrait';

export interface FormatPreset {
  id: FormatId;
  label: string;
  platform: 'youtube' | 'reels' | 'feed';
  width: number;
  height: number;
  resolution: Resolution;
  safeTop: number;
  safeBottom: number;
  safeSides: number;
}

export const FORMAT_PRESETS: FormatPreset[] = [
  {
    id: 'youtube-landscape',
    label: 'YouTube 16:9',
    platform: 'youtube',
    width: 1920,
    height: 1080,
    resolution: '1920x1080',
    safeTop: 0.05,
    safeBottom: 0.08,
    safeSides: 0.05,
  },
  {
    id: 'youtube-720',
    label: 'YouTube 720p',
    platform: 'youtube',
    width: 1280,
    height: 720,
    resolution: '1280x720',
    safeTop: 0.05,
    safeBottom: 0.08,
    safeSides: 0.05,
  },
  {
    id: 'shorts-vertical',
    label: 'Shorts/Reels 9:16',
    platform: 'reels',
    width: 1080,
    height: 1920,
    resolution: '1080x1920',
    safeTop: 0.1,
    safeBottom: 0.18,
    safeSides: 0.06,
  },
  {
    id: 'feed-square',
    label: 'Square 1:1',
    platform: 'feed',
    width: 1080,
    height: 1080,
    resolution: '1080x1080',
    safeTop: 0.06,
    safeBottom: 0.1,
    safeSides: 0.06,
  },
  {
    id: 'feed-portrait',
    label: 'Feed 4:5',
    platform: 'feed',
    width: 1080,
    height: 1350,
    resolution: '1080x1350',
    safeTop: 0.06,
    safeBottom: 0.1,
    safeSides: 0.06,
  },
];

export function getFormat(id: FormatId): FormatPreset {
  return FORMAT_PRESETS.find((f) => f.id === id) ?? FORMAT_PRESETS[0];
}

export function resolutionToFormatId(resolution: Resolution): FormatId {
  const match = FORMAT_PRESETS.find((f) => f.resolution === resolution);
  return match?.id ?? 'youtube-landscape';
}

export interface PlatformExportPreset {
  id: string;
  label: string;
  formatId: FormatId;
  fps: 30 | 60;
  format: 'mp4' | 'webm' | 'png' | 'jpg';
  transparent: boolean;
}

export const PLATFORM_EXPORT_PRESETS: PlatformExportPreset[] = [
  { id: 'youtube-clip', label: 'YouTube Clip (MP4)', formatId: 'youtube-landscape', fps: 30, format: 'mp4', transparent: false },
  { id: 'youtube-overlay', label: 'YouTube Overlay (WebM)', formatId: 'youtube-landscape', fps: 30, format: 'webm', transparent: true },
  { id: 'reels-mp4', label: 'Reels/Shorts (MP4)', formatId: 'shorts-vertical', fps: 30, format: 'mp4', transparent: false },
  { id: 'reels-webm', label: 'Reels Overlay (WebM)', formatId: 'shorts-vertical', fps: 30, format: 'webm', transparent: true },
  { id: 'square-post', label: 'Square Post (MP4)', formatId: 'feed-square', fps: 30, format: 'mp4', transparent: false },
];
