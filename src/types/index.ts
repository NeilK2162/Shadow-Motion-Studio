import type { ThemeTokens } from '@/themes/tokens';

export type TemplateId =
  | 'mission-passed'
  | 'mission-failed'
  | 'chapter-card'
  | 'loading-screen'
  | 'side-quest'
  | 'enter-location'
  | 'phone-call'
  | 'cheat-code'
  | 'weekly-stats';

export type Resolution = '1920x1080' | '1080x1920' | '1080x1350' | '1280x720';
export type ExportFormat = 'png' | 'jpg' | 'mp4' | 'webm';
export type BackgroundMode = 'dark' | 'transparent' | 'custom';

export interface StatField {
  value: string;
  label: string;
}

export interface StatBox {
  label: string;
  value: string;
  change: string;
}

export interface StatBar {
  label: string;
  pct: number;
}

export interface AnimationConfig {
  globalSpeed: number;
  durationInFrames: number;
  overrides?: Record<string, { delaySeconds?: number; durationSeconds?: number }>;
}

export interface ExportConfig {
  resolution: Resolution;
  fps: 30 | 60;
  format: ExportFormat;
  transparent: boolean;
  stripCardBackground?: boolean;
}

export interface Project {
  template: TemplateId;
  fields: Record<string, unknown>;
  theme: ThemeTokens;
  animation: AnimationConfig;
  export: ExportConfig;
}

export interface TemplateMeta {
  id: TemplateId;
  glyph: string;
  label: string;
  defaultDurationSeconds: number;
  compositionWidth: number;
  compositionHeight: number;
}

export const RESOLUTION_MAP: Record<Resolution, { width: number; height: number }> = {
  '1920x1080': { width: 1920, height: 1080 },
  '1080x1920': { width: 1080, height: 1920 },
  '1080x1350': { width: 1080, height: 1350 },
  '1280x720': { width: 1280, height: 720 },
};

export const TEMPLATE_META: TemplateMeta[] = [
  { id: 'mission-passed', glyph: '✓', label: 'Mission Passed', defaultDurationSeconds: 1.6, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'mission-failed', glyph: '✗', label: 'Mission Failed', defaultDurationSeconds: 1.6, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'chapter-card', glyph: '◈', label: 'Chapter Card', defaultDurationSeconds: 1.8, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'loading-screen', glyph: '▓', label: 'Loading Screen', defaultDurationSeconds: 2.2, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'side-quest', glyph: '⬡', label: 'Side Quest', defaultDurationSeconds: 1.4, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'enter-location', glyph: '◉', label: 'Enter Location', defaultDurationSeconds: 2.0, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'phone-call', glyph: '☎', label: 'Phone Call', defaultDurationSeconds: 1.6, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'cheat-code', glyph: '⚡', label: 'Cheat Code', defaultDurationSeconds: 1.4, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'weekly-stats', glyph: '☰', label: 'Weekly Stats', defaultDurationSeconds: 2.4, compositionWidth: 1920, compositionHeight: 1080 },
];

export function getTemplateMeta(id: TemplateId): TemplateMeta {
  return TEMPLATE_META.find((t) => t.id === id)!;
}
