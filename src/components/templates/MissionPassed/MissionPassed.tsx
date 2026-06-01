import { applyMotionStyle, popIn, scanAnim, slideUp } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import type { StatField } from '@/types';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';
import { getMissionCardLayout, glowGradient } from '../shared/missionCardLayout';

export function MissionPassed({ fields, theme = shadowOwnerTheme, globalSpeed = 1, stripCardBackground = false }: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = getMissionCardLayout(fields);
  const s = layout.contentScale;
  const check = getField(fields, 'check', '✓');
  const titleAccent = getField(fields, 'titleAccent', 'MISSION');
  const titleMain = getField(fields, 'titleMain', 'PASSED');
  const sub = getField(fields, 'sub', '');
  const resp = getField(fields, 'resp', '');
  const stats = getField<StatField[]>(fields, 'stats', []);

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          width: layout.cardWidth,
          height: layout.cardHeight,
          background: stripCardBackground ? 'transparent' : 'linear-gradient(135deg, #050f05 0%, #030a03 100%)',
          border: stripCardBackground ? 'none' : '1px solid #1a341a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2 * s,
            background: `linear-gradient(90deg, transparent 0%, ${theme.greenBright} 50%, transparent 100%)`,
            ...applyMotionStyle(scanAnim(time, 0, 0.8, globalSpeed)),
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: glowGradient('rgba(60,160,60,ALPHA)', layout),
          }}
        />
        <div
          style={{
            fontSize: 44 * s,
            color: theme.greenBright,
            position: 'relative',
            textShadow: `0 0 ${20 * s}px rgba(90,200,90,0.4)`,
            ...applyMotionStyle(popIn(time, 0, 0.35, globalSpeed)),
          }}
        >
          {check}
        </div>
        <div
          style={{
            position: 'relative',
            fontFamily: theme.titleFont,
            fontSize: 64 * s,
            letterSpacing: 6 * s,
            color: '#fff',
            lineHeight: 1,
            textAlign: 'center',
            ...applyMotionStyle(slideUp(time, 0.15, 0.4, globalSpeed, 18 * s)),
          }}
        >
          <span style={{ color: theme.greenBright }}>{titleAccent}</span>
          <br />
          {titleMain}
        </div>
        <div
          style={{
            position: 'relative',
            fontFamily: theme.monoFont,
            fontSize: 11 * s,
            color: '#888',
            letterSpacing: 2,
            marginTop: 10 * s,
            ...applyMotionStyle(slideUp(time, 0.3, 0.4, globalSpeed, 18 * s)),
          }}
        >
          {sub}
        </div>
        <div
          style={{
            position: 'relative',
            fontFamily: theme.uiFont,
            fontWeight: 600,
            fontSize: 17 * s,
            color: theme.gold,
            letterSpacing: 4,
            marginTop: 20 * s,
            ...applyMotionStyle(slideUp(time, 0.45, 0.4, globalSpeed, 18 * s)),
          }}
        >
          {resp}
        </div>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            gap: 36 * s,
            marginTop: 16 * s,
            ...applyMotionStyle(slideUp(time, 0.6, 0.4, globalSpeed, 18 * s)),
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: theme.titleFont, fontSize: 20 * s, color: theme.gold, letterSpacing: 2 }}>{stat.value}</div>
              <div style={{ fontFamily: theme.monoFont, fontSize: 8 * s, color: theme.dim, letterSpacing: 1, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
