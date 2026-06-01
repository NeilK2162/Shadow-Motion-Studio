import { useMemo } from 'react';
import type { TemplateDefinition, TemplateElement } from '@/director/templateSchema';
import { useTemplateLayoutContext } from '@/hooks/useCardLayout';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import type { StatBox, StatField } from '@/types';
import {
  BadgePrimitive,
  BarPrimitive,
  ButtonRowPrimitive,
  getCardShellStyle,
  getDynamicBackground,
  getDynamicCardLayout,
  GlowPrimitive,
  GlyphPrimitive,
  LinePrimitive,
  RingPrimitive,
  ScanlinePrimitive,
  StatBoxPrimitive,
  StatRowPrimitive,
  TextPrimitive,
  WatermarkPrimitive,
} from './shared/primitives';
import { themeVars, type TemplateComponentProps } from './shared/types';

export interface DynamicTemplateProps extends TemplateComponentProps {
  def: TemplateDefinition;
}

function resolveFieldValue(
  el: TemplateElement,
  fields: Record<string, unknown>,
  def: TemplateDefinition,
): unknown {
  const bindKey = 'bind' in el ? el.bind : undefined;
  if (bindKey && fields[bindKey] !== undefined) return fields[bindKey];
  if ('static' in el && el.static !== undefined) return el.static;
  if (bindKey) {
    const fieldDef = def.fields.find((f) => f.key === bindKey);
    if (fieldDef) return fieldDef.default;
  }
  return '';
}

function renderElement(
  el: TemplateElement,
  fields: Record<string, unknown>,
  def: TemplateDefinition,
  theme: typeof shadowOwnerTheme,
  scale: number,
  time: number,
  globalSpeed: number,
  layout: ReturnType<typeof getDynamicCardLayout>,
) {
  switch (el.kind) {
    case 'text':
      return (
        <TextPrimitive
          key={el.key}
          el={el}
          value={String(resolveFieldValue(el, fields, def))}
          theme={theme}
          scale={scale}
          time={time}
          globalSpeed={globalSpeed}
        />
      );
    case 'glyph':
      return (
        <GlyphPrimitive
          key={el.key}
          el={el}
          value={String(resolveFieldValue(el, fields, def))}
          theme={theme}
          scale={scale}
          time={time}
          globalSpeed={globalSpeed}
        />
      );
    case 'line':
      return (
        <LinePrimitive
          key={el.key}
          el={el}
          theme={theme}
          scale={scale}
          time={time}
          globalSpeed={globalSpeed}
          fullWidth={layout.cardWidth * 0.6}
        />
      );
    case 'statRow':
      return (
        <StatRowPrimitive
          key={el.key}
          el={el}
          stats={(resolveFieldValue(el, fields, def) as StatField[]) ?? []}
          theme={theme}
          scale={scale}
          time={time}
          globalSpeed={globalSpeed}
        />
      );
    case 'bar':
      return (
        <BarPrimitive
          key={el.key}
          el={el}
          label={el.label ?? 'Stat'}
          pct={el.pct ?? 50}
          showPct={el.showPct}
          theme={theme}
          scale={scale}
          time={time}
          globalSpeed={globalSpeed}
        />
      );
    case 'statBox': {
      const box = resolveFieldValue(el, fields, def) as StatBox;
      return (
        <StatBoxPrimitive key={el.key} el={el} box={box} theme={theme} scale={scale} time={time} globalSpeed={globalSpeed} />
      );
    }
    case 'glow':
      return <GlowPrimitive key={el.key} el={el} theme={theme} layout={layout} time={time} globalSpeed={globalSpeed} />;
    case 'scanline':
      return <ScanlinePrimitive key={el.key} el={el} theme={theme} scale={scale} time={time} globalSpeed={globalSpeed} />;
    case 'badge':
      return (
        <BadgePrimitive
          key={el.key}
          el={el}
          value={String(resolveFieldValue(el, fields, def))}
          theme={theme}
          scale={scale}
          time={time}
          globalSpeed={globalSpeed}
        />
      );
    case 'buttonRow':
      return (
        <ButtonRowPrimitive
          key={el.key}
          el={el}
          buttons={(resolveFieldValue(el, fields, def) as { primary?: string; secondary?: string }) ?? {}}
          theme={theme}
          scale={scale}
          time={time}
          globalSpeed={globalSpeed}
        />
      );
    case 'ring':
      return <RingPrimitive key={el.key} el={el} theme={theme} scale={scale} time={time} globalSpeed={globalSpeed} />;
    case 'watermark':
      return (
        <WatermarkPrimitive
          key={el.key}
          el={el}
          value={String(resolveFieldValue(el, fields, def))}
          theme={theme}
          scale={scale}
          time={time}
          globalSpeed={globalSpeed}
        />
      );
    default:
      return null;
  }
}

export function DynamicTemplate({
  def,
  fields,
  theme = shadowOwnerTheme,
  globalSpeed = 1,
  stripCardBackground = false,
  formatId,
  placement,
  canvasWidth,
  canvasHeight,
}: DynamicTemplateProps) {
  const time = useTemplateTime(globalSpeed);
  const ctx = useTemplateLayoutContext();

  const layout = useMemo(
    () =>
      getDynamicCardLayout(def, fields, formatId ?? ctx?.formatId, {
        placement: placement ?? ctx?.placement ?? def.defaultPlacement,
        canvasWidth: canvasWidth ?? ctx?.canvasWidth,
        canvasHeight: canvasHeight ?? ctx?.canvasHeight,
      }),
    [def, fields, formatId, placement, canvasWidth, canvasHeight, ctx],
  );

  const s = layout.contentScale;
  const sorted = useMemo(
    () => [...def.elements].sort((a, b) => (a.anim?.delaySeconds ?? 0) - (b.anim?.delaySeconds ?? 0)),
    [def.elements],
  );

  const overlayKinds = new Set(['glow', 'scanline', 'watermark']);
  const overlays = sorted.filter((e) => overlayKinds.has(e.kind));
  const content = sorted.filter((e) => !overlayKinds.has(e.kind));

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          ...getCardShellStyle(layout),
          background: getDynamicBackground(def, stripCardBackground),
          border: stripCardBackground ? 'none' : '1px solid #1a341a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: stripCardBackground ? 0 : undefined,
        }}
      >
        {overlays.map((el) => renderElement(el, fields, def, theme, s, time, globalSpeed, layout))}
        {content.map((el) => renderElement(el, fields, def, theme, s, time, globalSpeed, layout))}
      </div>
    </div>
  );
}
