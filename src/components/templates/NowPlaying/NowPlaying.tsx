import { applyMotionStyle, fadeL, slideUp2 } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getCardLayout, spx } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

function EqBars({ time, scale, theme }: { time: number; scale: number; theme: typeof shadowOwnerTheme }) {
  const bars = [0, 1, 2, 3, 4];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: spx(3, scale), height: spx(28, scale) }}>
      {bars.map((i) => {
        const h = spx(8, scale) + spx(12, scale) * Math.abs(Math.sin(time * 4 + i * 1.2));
        return (
          <div
            key={i}
            style={{
              width: spx(4, scale),
              height: h,
              background: theme.gold,
              borderRadius: 1,
            }}
          />
        );
      })}
    </div>
  );
}

export function NowPlaying({
  fields,
  theme = shadowOwnerTheme,
  globalSpeed = 1,
  stripCardBackground = false,
  formatId,
}: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = getCardLayout('now-playing', fields, formatId);
  const s = layout.contentScale;
  const station = getField(fields, 'station', 'SHADOW FM 101.1');
  const track = getField(fields, 'track', '');
  const showEq = getField(fields, 'showEq', true);

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          width: layout.cardWidth,
          minHeight: layout.cardHeight,
          background: stripCardBackground ? 'transparent' : 'rgba(8,8,8,0.92)',
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          borderRadius: spx(4, s),
          display: 'flex',
          alignItems: 'center',
          gap: spx(16, s),
          padding: spx(14, s),
          ...applyMotionStyle(slideUp2(time, 0, 0.5, globalSpeed)),
        }}
      >
        {showEq && <EqBars time={time} scale={s} theme={theme} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: theme.monoFont, fontSize: spx(8, s), color: theme.gold, letterSpacing: 2, marginBottom: spx(4, s) }}>
            {station}
          </div>
          <div
            style={{
              fontFamily: theme.uiFont,
              fontSize: spx(15, s),
              color: theme.text,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              ...applyMotionStyle(fadeL(time, 0.2, 0.4, globalSpeed)),
            }}
          >
            {track}
          </div>
        </div>
      </div>
    </div>
  );
}
