import { applyMotionStyle, fadeL, getLocalProgress, slideUp } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import type { StatBar, StatBox } from '@/types';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function WeeklyStats({ fields, theme = shadowOwnerTheme, globalSpeed = 1, stripCardBackground = false }: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
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
          width: 540,
          background: stripCardBackground ? 'transparent' : '#060606',
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          padding: 28,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 22,
            paddingBottom: 18,
            borderBottom: `1px solid ${theme.dark4}`,
            ...applyMotionStyle(fadeL(time, 0, 0.5, globalSpeed)),
          }}
        >
          <div>
            <div style={{ fontFamily: theme.titleFont, fontSize: 30, color: '#fff', letterSpacing: 3, lineHeight: 1 }}>{stitle}</div>
            <div style={{ fontFamily: theme.monoFont, fontSize: 8, color: theme.dim, letterSpacing: 2, marginTop: 5, textTransform: 'uppercase' }}>{ssub}</div>
          </div>
          <div style={{ fontFamily: theme.monoFont, fontSize: 9, color: theme.dim, textAlign: 'right', letterSpacing: 1, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {sweek}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
          {boxes.map((box, i) => (
            <div
              key={box.label}
              style={{
                background: '#0a0a0a',
                border: `1px solid ${theme.dark4}`,
                padding: '12px 14px',
                ...applyMotionStyle(slideUp(time, 0.1 + i * 0.1, 0.4, globalSpeed)),
              }}
            >
              <div style={{ fontFamily: theme.monoFont, fontSize: 8, color: theme.dim, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>{box.label}</div>
              <div style={{ fontFamily: theme.titleFont, fontSize: 28, color: theme.gold, letterSpacing: 2, lineHeight: 1 }}>{box.value}</div>
              <div style={{ fontFamily: theme.monoFont, fontSize: 9, color: theme.greenBright, marginTop: 4 }}>{box.change}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 18 }}>
          {bars.map((bar, i) => {
            const p = getLocalProgress(time, 0.5 + i * 0.1, 0.6, globalSpeed);
            return (
              <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 9 }}>
                <div style={{ fontFamily: theme.monoFont, fontSize: 9, color: theme.dim, letterSpacing: 1, width: 82, flexShrink: 0, textTransform: 'uppercase' }}>{bar.label}</div>
                <div style={{ flex: 1, height: 2, background: theme.dark4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: theme.gold, width: `${p * bar.pct}%` }} />
                </div>
                <div style={{ fontFamily: theme.monoFont, fontSize: 9, color: theme.dim, width: 26, textAlign: 'right' }}>{Math.round(p * bar.pct)}%</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, paddingTop: 16, borderTop: `1px solid ${theme.dark4}` }}>
          {[1, 2, 3, 4, 5].map((n) => {
            const lit = n <= stars;
            const starDelay = 0.8 + n * 0.05;
            const p = getLocalProgress(time, starDelay, 0.2, globalSpeed);
            return (
              <div key={n} style={{ fontSize: 16, color: lit && p > 0 ? theme.gold : theme.dark5, opacity: lit ? p : 1 }}>
                ★
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
