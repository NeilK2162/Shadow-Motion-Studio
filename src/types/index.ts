import type { ThemeTokens } from '@/themes/tokens';
import type { FormatId } from '@/lib/formats';
import type { Placement } from '@/lib/placement';
import type { TemplateDefinition } from '@/director/templateSchema';

export type TemplateId =
  | 'mission-passed'
  | 'mission-failed'
  | 'chapter-card'
  | 'loading-screen'
  | 'side-quest'
  | 'enter-location'
  | 'phone-call'
  | 'cheat-code'
  | 'weekly-stats'
  | 'wanted-level'
  | 'cash-pickup'
  | 'status-hud'
  | 'gps-route'
  | 'character-intro'
  | 'now-playing'
  | 'wasted'
  | 'subscribe-prompt'
  | 'countdown'
  | 'this-or-that';

export type Resolution = '1920x1080' | '1080x1920' | '1080x1350' | '1280x720' | '1080x1080';
export type ExportFormat = 'png' | 'jpg' | 'mp4' | 'webm';
export type BackgroundMode = 'dark' | 'transparent' | 'custom';

export type TemplateGroup = 'stingers' | 'hud' | 'cards' | 'engagement';

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

export interface StatusBar {
  label: string;
  pct: number;
  color: string;
}

export interface PollOption {
  key: string;
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
  formatId?: FormatId;
}

export interface Project {
  template: string;
  templateDef?: TemplateDefinition;
  fields: Record<string, unknown>;
  theme: ThemeTokens;
  animation: AnimationConfig;
  export: ExportConfig;
  placement?: Placement;
}

export interface CustomTemplateMeta {
  id: string;
  glyph: string;
  label: string;
  group: TemplateGroup;
  defaultDurationSeconds: number;
  compositionWidth: number;
  compositionHeight: number;
  isCustom: true;
  recommendedFormats: FormatId[];
}

export interface TemplateMeta {
  id: TemplateId;
  glyph: string;
  label: string;
  group: TemplateGroup;
  defaultDurationSeconds: number;
  compositionWidth: number;
  compositionHeight: number;
}

export const RESOLUTION_MAP: Record<Resolution, { width: number; height: number }> = {
  '1920x1080': { width: 1920, height: 1080 },
  '1080x1920': { width: 1080, height: 1920 },
  '1080x1350': { width: 1080, height: 1350 },
  '1280x720': { width: 1280, height: 720 },
  '1080x1080': { width: 1080, height: 1080 },
};

export const TEMPLATE_META: TemplateMeta[] = [
  { id: 'mission-passed', glyph: '✓', label: 'Mission Passed', group: 'stingers', defaultDurationSeconds: 1.6, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'mission-failed', glyph: '✗', label: 'Mission Failed', group: 'stingers', defaultDurationSeconds: 1.6, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'wasted', glyph: '☠', label: 'Wasted', group: 'stingers', defaultDurationSeconds: 2.4, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'countdown', glyph: '◷', label: 'Countdown', group: 'stingers', defaultDurationSeconds: 4.0, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'chapter-card', glyph: '◈', label: 'Chapter Card', group: 'cards', defaultDurationSeconds: 1.8, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'loading-screen', glyph: '▓', label: 'Loading Screen', group: 'cards', defaultDurationSeconds: 2.2, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'side-quest', glyph: '⬡', label: 'Side Quest', group: 'cards', defaultDurationSeconds: 1.4, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'enter-location', glyph: '◉', label: 'Enter Location', group: 'cards', defaultDurationSeconds: 2.0, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'phone-call', glyph: '☎', label: 'Phone Call', group: 'cards', defaultDurationSeconds: 1.6, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'cheat-code', glyph: '⚡', label: 'Cheat Code', group: 'cards', defaultDurationSeconds: 1.4, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'weekly-stats', glyph: '☰', label: 'Weekly Stats', group: 'cards', defaultDurationSeconds: 2.4, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'wanted-level', glyph: '✪', label: 'Wanted Level', group: 'hud', defaultDurationSeconds: 2.8, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'cash-pickup', glyph: '$', label: 'Cash Pickup', group: 'hud', defaultDurationSeconds: 2.2, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'status-hud', glyph: '▮', label: 'Status HUD', group: 'hud', defaultDurationSeconds: 2.6, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'gps-route', glyph: '◎', label: 'GPS Route', group: 'hud', defaultDurationSeconds: 3.0, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'character-intro', glyph: '◧', label: 'Character Intro', group: 'hud', defaultDurationSeconds: 2.8, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'now-playing', glyph: '♫', label: 'Now Playing', group: 'hud', defaultDurationSeconds: 3.2, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'subscribe-prompt', glyph: '➤', label: 'Subscribe Prompt', group: 'engagement', defaultDurationSeconds: 3.0, compositionWidth: 1920, compositionHeight: 1080 },
  { id: 'this-or-that', glyph: '⚖', label: 'This or That', group: 'engagement', defaultDurationSeconds: 3.0, compositionWidth: 1920, compositionHeight: 1080 },
];

export function getTemplateMeta(id: TemplateId): TemplateMeta {
  return TEMPLATE_META.find((t) => t.id === id)!;
}
