import { applyMotionStyle, fadeL, getLocalProgress, slideUp } from '@/animations/presets';
import { useCardLayout } from '@/hooks/useCardLayout';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import type { StatBar, StatBox } from '@/types';
import { getCardShellStyle, spx  } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function WeeklyStats({ fields, theme = shadowOwnerTheme, globalSpeed = 1, stripCardBackground = false }: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = useCardLayout('weekly-stats', fields);
  const s = layout.contentScale;
  const stitle = getField(fields, 'stitle', 'WEEKLY DEBRIEF');
  const ssub = getField(fields, 'ssub', '');
  const sweek = getField(fields, 'sweek', '');
  const boxes = getField<StatBox[]>(fields, 'boxes', []);
  const bars = getField<StatBar[]>(fields, 'bars', []);
  const stars = getField(fields, 'stars', 3);

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          ...getCardShellStyle(layout),
          background: stripCardBackground ? 'transparent' : '#060606',
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          padding: spx(28, s),
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: spx(22, s),
            paddingBottom: spx(18, s),
            borderBottom: `1px solid ${theme.dark4}`,
            ...applyMotionStyle(fadeL(time, 0, 0.5, globalSpeed)),
          }}
        >
          <div>
            <div style={{ fontFamily: theme.titleFont, fontSize: spx(30, s), color: '#fff', letterSpacing: 3, lineHeight: 1 }}>{stitle}</div>
            <div style={{ fontFamily: theme.monoFont, fontSize: spx(8, s), color: theme.dim, letterSpacing: 2, marginTop: spx(5, s), textTransform: 'uppercase' }}>{ssub}</div>
          </div>
          <div style={{ fontFamily: theme.monoFont, fontSize: spx(9, s), color: theme.dim, textAlign: 'right', letterSpacing: 1, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {sweek}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spx(12, s), marginBottom: spx(22, s) }}>
          {boxes.map((box, i) => (
            <div
              key={box.label}
              style={{
                background: '#0a0a0a',
                border: `1px solid ${theme.dark4}`,
                padding: `${spx(12, s)}px ${spx(14, s)}px`,
                ...applyMotionStyle(slideUp(time, 0.1 + i * 0.1, 0.4, globalSpeed)),
              }}
            >
              <div style={{ fontFamily: theme.monoFont, fontSize: spx(8, s), color: theme.dim, letterSpacing: 2, marginBottom: spx(6, s), textTransform: 'uppercase' }}>{box.label}</div>
              <div style={{ fontFamily: theme.titleFont, fontSize: spx(28, s), color: theme.gold, letterSpacing: 2, lineHeight: 1 }}>{box.value}</div>
              <div style={{ fontFamily: theme.monoFont, fontSize: spx(9, s), color: theme.greenBright, marginTop: spx(4, s) }}>{box.change}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: spx(18, s) }}>
          {bars.map((bar, i) => {
            const p = getLocalProgress(time, 0.5 + i * 0.1, 0.6, globalSpeed);
            return (
              <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: spx(12, s), marginBottom: spx(9, s) }}>
                <div style={{ fontFamily: theme.monoFont, fontSize: spx(9, s), color: theme.dim, letterSpacing: 1, width: spx(82, s), flexShrink: 0, textTransform: 'uppercase' }}>{bar.label}</div>
                <div style={{ flex: 1, height: spx(2, s), background: theme.dark4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: theme.gold, width: `${p * bar.pct}%` }} />
                </div>
                <div style={{ fontFamily: theme.monoFont, fontSize: spx(9, s), color: theme.dim, width: spx(26, s), textAlign: 'right' }}>{Math.round(p * bar.pct)}%</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: spx(10, s), paddingTop: spx(16, s), borderTop: `1px solid ${theme.dark4}` }}>
          {[1, 2, 3, 4, 5].map((n) => {
            const lit = n <= stars;
            const starDelay = 0.8 + n * 0.05;
            const p = getLocalProgress(time, starDelay, 0.2, globalSpeed);
            return (
              <div key={n} style={{ fontSize: spx(16, s), color: lit && p > 0 ? theme.gold : theme.dark5, opacity: lit ? p : 1 }}>
                ★
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
