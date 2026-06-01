import { applyMotionStyle, impactZoom, popIn } from '@/animations/presets';
import { useCardLayout } from '@/hooks/useCardLayout';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getCardShellStyle, glowGradient, spx  } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function Countdown({
  fields,
  theme = shadowOwnerTheme,
  globalSpeed = 1,
  stripCardBackground = false,
  formatId,
}: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = useCardLayout('countdown', fields, formatId);
  const s = layout.contentScale;
  const from = getField(fields, 'from', 3);
  const goText = getField(fields, 'goText', 'GO');
  const caption = getField(fields, 'caption', 'MISSION STARTS IN');
  const showRing = getField(fields, 'showRing', true);

  const t = time * globalSpeed;
  const elapsed = Math.floor(t);
  const isGo = elapsed >= from;
  const currentNum = isGo ? goText : String(Math.max(from - elapsed, 1));
  const ringProgress = isGo ? 1 : ((t % 1) * 100);

  const numStyle = isGo
    ? applyMotionStyle(impactZoom(time, from, 0.5, globalSpeed))
    : applyMotionStyle(popIn(time, elapsed, 0.3, globalSpeed));

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          ...getCardShellStyle(layout),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: stripCardBackground ? 'transparent' : 'rgba(8,8,8,0.85)',
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          borderRadius: layout.isFullscreen ? 0 : '50%',
        }}
      >
        {!stripCardBackground && layout.hasGlow && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: glowGradient('rgba(232,200,74,ALPHA)', layout),
              pointerEvents: 'none',
            }}
          />
        )}
        {showRing && (
          <svg
            style={{ position: 'absolute', width: '90%', height: '90%', transform: 'rotate(-90deg)' }}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="46" fill="none" stroke={theme.dark4} strokeWidth="2" />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke={theme.gold}
              strokeWidth="2"
              strokeDasharray={`${ringProgress * 2.89} 289`}
              strokeLinecap="round"
            />
          </svg>
        )}
        <div
          style={{
            fontFamily: theme.monoFont,
            fontSize: spx(10, s),
            color: theme.gold,
            letterSpacing: 3,
            marginBottom: spx(12, s),
            textTransform: 'uppercase',
            zIndex: 1,
          }}
        >
          {caption}
        </div>
        <div
          style={{
            fontFamily: theme.titleFont,
            fontSize: spx(isGo ? 80 : 140, s),
            color: '#fff',
            letterSpacing: 4,
            lineHeight: 1,
            zIndex: 1,
            ...numStyle,
          }}
        >
          {currentNum}
        </div>
      </div>
    </div>
  );
}
