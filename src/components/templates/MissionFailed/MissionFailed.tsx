import { applyMotionStyle, popIn, scanAnim, slideUp } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';
import { getMissionCardLayout, glowGradient } from '../shared/missionCardLayout';

export function MissionFailed({ fields, theme = shadowOwnerTheme, globalSpeed = 1, stripCardBackground = false }: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = getMissionCardLayout(fields);
  const s = layout.contentScale;
  const cross = getField(fields, 'cross', '✕');
  const titleAccent = getField(fields, 'titleAccent', 'MISSION');
  const titleMain = getField(fields, 'titleMain', 'FAILED');
  const sub = getField(fields, 'sub', '');
  const cause = getField(fields, 'cause', '');
  const retry = getField(fields, 'retry', '');

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          width: layout.cardWidth,
          height: layout.cardHeight,
          background: stripCardBackground ? 'transparent' : 'linear-gradient(135deg, #100404 0%, #0a0202 100%)',
          border: stripCardBackground ? 'none' : '1px solid #380e0e',
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
            background: `linear-gradient(90deg, transparent, ${theme.redBright}, transparent)`,
            ...applyMotionStyle(scanAnim(time, 0, 0.8, globalSpeed)),
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: glowGradient('rgba(180,30,30,ALPHA)', layout),
          }}
        />
        <div
          style={{
            fontSize: 44 * s,
            color: theme.redBright,
            position: 'relative',
            textShadow: `0 0 ${20 * s}px rgba(200,60,60,0.4)`,
            ...applyMotionStyle(popIn(time, 0, 0.35, globalSpeed)),
          }}
        >
          {cross}
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
          <span style={{ color: theme.redBright }}>{titleAccent}</span>
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
            fontFamily: theme.monoFont,
            fontSize: 10 * s,
            color: '#555',
            letterSpacing: 1,
            marginTop: 12 * s,
            ...applyMotionStyle(slideUp(time, 0.45, 0.4, globalSpeed, 18 * s)),
          }}
        >
          {cause}
        </div>
        <div
          style={{
            position: 'relative',
            fontFamily: theme.uiFont,
            fontWeight: 600,
            fontSize: 14 * s,
            color: theme.redBright,
            letterSpacing: 4,
            marginTop: 20 * s,
            textTransform: 'uppercase',
            ...applyMotionStyle(slideUp(time, 0.6, 0.4, globalSpeed, 18 * s)),
          }}
        >
          {retry}
        </div>
      </div>
    </div>
  );
}
