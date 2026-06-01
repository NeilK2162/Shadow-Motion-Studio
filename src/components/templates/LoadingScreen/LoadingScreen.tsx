import { applyMotionStyle, counterUp, lFill, slideUp2 } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getCardLayout, spx } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

function SkylineSvg({ bottom }: { bottom: number }) {
  return (
    <svg viewBox="0 0 560 80" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom, left: 0, right: 0, width: '100%' }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f0f1e" />
          <stop offset="100%" stopColor="#050508" />
        </linearGradient>
        <linearGradient id="gf2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
      </defs>
      <rect x="0" y="40" width="30" height="40" fill="url(#sg)" />
      <rect x="35" y="20" width="25" height="60" fill="url(#sg)" />
      <rect x="65" y="30" width="20" height="50" fill="url(#sg)" />
      <rect x="90" y="10" width="35" height="70" fill="url(#sg)" />
      <rect x="130" y="35" width="22" height="45" fill="url(#sg)" />
      <rect x="157" y="5" width="28" height="75" fill="url(#sg)" />
      <polygon points="171,5 185,0 199,5" fill="#0f0f1e" />
      <rect x="190" y="25" width="40" height="55" fill="url(#sg)" />
      <rect x="235" y="15" width="55" height="65" fill="url(#sg)" />
      <rect x="295" y="30" width="30" height="50" fill="url(#sg)" />
      <rect x="330" y="0" width="40" height="80" fill="url(#sg)" />
      <rect x="375" y="20" width="28" height="60" fill="url(#sg)" />
      <rect x="408" y="35" width="45" height="45" fill="url(#sg)" />
      <rect x="458" y="12" width="35" height="68" fill="url(#sg)" />
      <rect x="498" y="25" width="62" height="55" fill="url(#sg)" />
      <rect x="0" y="65" width="560" height="15" fill="url(#gf2)" />
    </svg>
  );
}

export function LoadingScreen({ fields, theme = shadowOwnerTheme, globalSpeed = 1, stripCardBackground = false }: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = getCardLayout('loading-screen', fields);
  const s = layout.contentScale;
  const bigText = getField(fields, 'bigText', 'HYDERABAD');
  const barLabel = getField(fields, 'barLabel', 'Loading');
  const tip = getField(fields, 'tip', '');
  const targetPct = getField(fields, 'targetPct', 68);
  const pct = counterUp(time, 0, 1.8, globalSpeed, targetPct);

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          width: layout.cardWidth,
          height: layout.cardHeight,
          background: stripCardBackground ? 'transparent' : '#000',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        {!stripCardBackground && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #08091a 0%, #040510 60%, #000 100%)' }} />
        )}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -60%)',
            fontFamily: theme.titleFont,
            fontSize: spx(60, s),
            letterSpacing: spx(12, s),
            color: theme.gold,
            opacity: 0.06,
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          {bigText}
        </div>
        <SkylineSvg bottom={spx(68, s)} />
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            padding: `${spx(14, s)}px ${spx(24, s)}px ${spx(20, s)}px`,
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.95) 20%)',
            borderTop: '1px solid #111',
            ...applyMotionStyle(slideUp2(time, 0, 0.5, globalSpeed)),
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: theme.monoFont,
              fontSize: spx(9, s),
              color: theme.dim,
              letterSpacing: 3,
              marginBottom: spx(7, s),
              textTransform: 'uppercase',
            }}
          >
            <span>{barLabel}</span>
            <span>{pct}%</span>
          </div>
          <div style={{ width: '100%', height: spx(2, s), background: theme.dark4, overflow: 'hidden', marginBottom: spx(12, s) }}>
            <div
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${theme.goldDim}, ${theme.gold})`,
                ...applyMotionStyle(lFill(time, 0, 1.8, globalSpeed, targetPct)),
              }}
            />
          </div>
          <div style={{ fontFamily: theme.monoFont, fontSize: spx(10, s), color: theme.dim, lineHeight: 1.65 }}>
            <em style={{ color: theme.gold, fontStyle: 'normal' }}>TIP:</em> {tip}
          </div>
        </div>
      </div>
    </div>
  );
}
