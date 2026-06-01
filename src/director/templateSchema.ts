import type { FormatId } from '@/lib/formats';
import type { Placement } from '@/lib/placement';
import type { TemplateGroup } from '@/types';

export const TEMPLATE_SCHEMA_VERSION = 1 as const;

export type ColorToken =
  | 'gold'
  | 'silver'
  | 'dim'
  | 'dark1'
  | 'dark2'
  | 'dark3'
  | 'dark4'
  | 'dark5'
  | 'green'
  | 'red'
  | 'blue'
  | 'purple';

export type FontToken = 'title' | 'ui' | 'mono';

export type PresetName =
  | 'fadeIn'
  | 'fadeOut'
  | 'slideUp'
  | 'slideDown'
  | 'slideInLeft'
  | 'slideInRight'
  | 'slideR'
  | 'scaleIn'
  | 'scaleOut'
  | 'pulse'
  | 'glowPulse'
  | 'counterUp'
  | 'lFill'
  | 'expandLine'
  | 'scanAnim'
  | 'radarSweep'
  | 'typewriter'
  | 'bounceIn'
  | 'shake'
  | 'flash'
  | 'rotateIn';

export type ElementKind =
  | 'text'
  | 'glyph'
  | 'line'
  | 'statRow'
  | 'bar'
  | 'statBox'
  | 'glow'
  | 'scanline'
  | 'badge'
  | 'buttonRow'
  | 'ring'
  | 'watermark';

export type ColorValue = ColorToken | `#${string}`;

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'color' | 'statRow' | 'statBox' | 'bar' | 'buttonRow';
  default: unknown;
  maxLength?: number;
}

export interface ElementAnim {
  preset: PresetName;
  delaySeconds: number;
  durationSeconds: number;
  /** For counterUp / lFill / expandLine */
  target?: number | string;
}

export interface BaseElement {
  kind: ElementKind;
  key: string;
  anim?: ElementAnim;
  style?: Record<string, string | number>;
}

export interface TextElement extends BaseElement {
  kind: 'text';
  bind?: string;
  static?: string;
  font?: FontToken;
  fontSize?: number;
  color?: ColorValue;
  letterSpacing?: number;
  uppercase?: boolean;
}

export interface GlyphElement extends BaseElement {
  kind: 'glyph';
  bind?: string;
  static?: string;
  fontSize?: number;
  color?: ColorValue;
}

export interface LineElement extends BaseElement {
  kind: 'line';
  width?: number | 'full';
  height?: number;
  color?: ColorValue;
}

export interface StatRowElement extends BaseElement {
  kind: 'statRow';
  bind?: string;
  fontSize?: number;
  color?: ColorValue;
  labelColor?: ColorValue;
}

export interface BarElement extends BaseElement {
  kind: 'bar';
  bind?: string;
  label?: string;
  pct?: number;
  color?: ColorValue;
  showPct?: boolean;
}

export interface StatBoxElement extends BaseElement {
  kind: 'statBox';
  bind?: string;
  labelColor?: ColorValue;
  valueColor?: ColorValue;
  changeColor?: ColorValue;
}

export interface GlowElement extends BaseElement {
  kind: 'glow';
  color?: ColorValue;
  size?: number;
  opacity?: number;
}

export interface ScanlineElement extends BaseElement {
  kind: 'scanline';
  color?: ColorValue;
  height?: number;
}

export interface BadgeElement extends BaseElement {
  kind: 'badge';
  bind?: string;
  static?: string;
  color?: ColorValue;
  bgColor?: ColorValue;
}

export interface ButtonRowElement extends BaseElement {
  kind: 'buttonRow';
  bind?: string;
  primaryColor?: ColorValue;
  secondaryColor?: ColorValue;
}

export interface RingElement extends BaseElement {
  kind: 'ring';
  size?: number;
  stroke?: number;
  color?: ColorValue;
}

export interface WatermarkElement extends BaseElement {
  kind: 'watermark';
  bind?: string;
  static?: string;
  fontSize?: number;
  color?: ColorValue;
  opacity?: number;
}

export type TemplateElement =
  | TextElement
  | GlyphElement
  | LineElement
  | StatRowElement
  | BarElement
  | StatBoxElement
  | GlowElement
  | ScanlineElement
  | BadgeElement
  | ButtonRowElement
  | RingElement
  | WatermarkElement;

export interface TemplateDefinition {
  schemaVersion: typeof TEMPLATE_SCHEMA_VERSION;
  id: string;
  name: string;
  glyph: string;
  group: TemplateGroup;
  description?: string;
  canvas: { width: number; height: number };
  durationSeconds: number;
  defaultPlacement: Placement;
  recommendedFormats: FormatId[];
  background: 'solid' | 'gradient' | 'transparent';
  /** Two #rrggbb hex colors for a custom gradient (start → end). Only used when background = 'gradient'. */
  backgroundColors?: [string, string];
  fields: FieldDef[];
  elements: TemplateElement[];
}

/** Hard-coded Mission Passed as declarative data (M16 sample). */
export const SAMPLE_MISSION_PASSED_DEF: TemplateDefinition = {
  schemaVersion: TEMPLATE_SCHEMA_VERSION,
  id: 'sample-mission-passed',
  name: 'Mission Passed (Sample)',
  glyph: '✓',
  group: 'stingers',
  description: 'Declarative replica of the built-in mission-passed template.',
  canvas: { width: 520, height: 320 },
  durationSeconds: 4,
  defaultPlacement: 'center',
  recommendedFormats: ['youtube-landscape', 'shorts-vertical', 'feed-square'],
  background: 'solid',
  fields: [
    { key: 'title', label: 'Title', type: 'text', default: 'MISSION PASSED', maxLength: 40 },
    { key: 'subtitle', label: 'Subtitle', type: 'text', default: 'Respect +', maxLength: 40 },
    { key: 'amount', label: 'Amount', type: 'text', default: '₹500', maxLength: 20 },
    { key: 'stats', label: 'Stats', type: 'statRow', default: [{ value: '₹500', label: 'CASH' }, { value: '+50', label: 'RESPECT' }] },
    { key: 'sizeMultiplier', label: 'Size', type: 'number', default: 1 },
  ],
  elements: [
    { kind: 'glow', key: 'glow', color: 'gold', size: 200, opacity: 0.15, anim: { preset: 'pulse', delaySeconds: 0, durationSeconds: 2 } },
    { kind: 'scanline', key: 'scan', color: 'gold', height: 2, anim: { preset: 'scanAnim', delaySeconds: 0.3, durationSeconds: 1.5 } },
    { kind: 'glyph', key: 'check', static: '✓', fontSize: 48, color: 'gold', anim: { preset: 'scaleIn', delaySeconds: 0.1, durationSeconds: 0.5 } },
    { kind: 'text', key: 'title', bind: 'title', font: 'title', fontSize: 42, color: 'gold', letterSpacing: 6, uppercase: true, anim: { preset: 'slideUp', delaySeconds: 0.2, durationSeconds: 0.5 } },
    { kind: 'line', key: 'divider', width: 'full', height: 1, color: 'dark4', anim: { preset: 'expandLine', delaySeconds: 0.4, durationSeconds: 0.6, target: 100 } },
    { kind: 'text', key: 'subtitle', bind: 'subtitle', font: 'mono', fontSize: 11, color: 'dim', letterSpacing: 3, uppercase: true, anim: { preset: 'fadeIn', delaySeconds: 0.5, durationSeconds: 0.4 } },
    { kind: 'text', key: 'amount', bind: 'amount', font: 'title', fontSize: 36, color: 'silver', anim: { preset: 'counterUp', delaySeconds: 0.6, durationSeconds: 0.8, target: 500 } },
    { kind: 'statRow', key: 'stats', bind: 'stats', fontSize: 10, color: 'silver', labelColor: 'dim', anim: { preset: 'fadeIn', delaySeconds: 0.8, durationSeconds: 0.4 } },
  ],
};
