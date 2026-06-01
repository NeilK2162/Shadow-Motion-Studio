import { applyMotionStyle, counterUp, lFill, slideInLeft } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import type { StatusBar } from '@/types';
import { getCardLayout, spx } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function StatusHud({
  fields,
  theme = shadowOwnerTheme,
  globalSpeed = 1,
  stripCardBackground = false,
  formatId,
}: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = getCardLayout('status-hud', fields, formatId);
  const s = layout.contentScale;
  const bars = getField<StatusBar[]>(fields, 'bars', []);
  const showPct = getField(fields, 'showPct', true);

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          width: layout.cardWidth,
          minHeight: layout.cardHeight,
          background: stripCardBackground ? 'transparent' : 'rgba(5,5,5,0.9)',
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          padding: spx(16, s),
          ...applyMotionStyle(slideInLeft(time, 0, 0.45, globalSpeed)),
        }}
      >
        {bars.map((bar, i) => (
          <div key={bar.label} style={{ marginBottom: spx(12, s) }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spx(4, s) }}>
              <span style={{ fontFamily: theme.monoFont, fontSize: spx(8, s), color: theme.dim, letterSpacing: 2 }}>
                {bar.label}
              </span>
              {showPct && (
                <span style={{ fontFamily: theme.monoFont, fontSize: spx(8, s), color: theme.silver }}>
                  {counterUp(time, 0.5 + i * 0.12, 0.8, globalSpeed, bar.pct)}%
                </span>
              )}
            </div>
            <div style={{ height: spx(4, s), background: theme.dark4, borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: bar.color,
                  ...applyMotionStyle(lFill(time, 0.5 + i * 0.12, 0.8, globalSpeed, bar.pct)),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
