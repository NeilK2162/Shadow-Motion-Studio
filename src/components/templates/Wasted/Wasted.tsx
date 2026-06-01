import { applyMotionStyle, impactZoom, shake, slideUp, vignettePulse } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getCardLayout, glowGradient, spx } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function Wasted({
  fields,
  theme = shadowOwnerTheme,
  globalSpeed = 1,
  stripCardBackground = false,
  formatId,
}: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = getCardLayout('wasted', fields, formatId);
  const s = layout.contentScale;
  const bigText = getField(fields, 'bigText', 'WASTED');
  const sub = getField(fields, 'sub', '');
  const overlayOpacity = getField(fields, 'overlayOpacity', 0.88);

  const titleStyle = applyMotionStyle({
    ...impactZoom(time, 0.15, 0.6, globalSpeed),
    ...shake(time, 0.15, 0.5, globalSpeed),
  });

  return (
    <div style={{ ...themeVars(theme), width: '100%', height: '100%', position: 'relative' }}>
      {!stripCardBackground && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#000',
            ...applyMotionStyle(vignettePulse(time, 0, 0.3, globalSpeed, overlayOpacity)),
          }}
        />
      )}
      {!stripCardBackground && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: glowGradient('rgba(180,32,32,ALPHA)', layout),
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily: theme.titleFont,
            fontSize: spx(120, s),
            color: '#eeeeee',
            letterSpacing: spx(8, s),
            lineHeight: 1,
            textShadow: `0 0 40px ${theme.redBright}`,
            ...titleStyle,
          }}
        >
          {bigText}
        </div>
        <div
          style={{
            fontFamily: theme.monoFont,
            fontSize: spx(12, s),
            color: theme.dim,
            letterSpacing: 3,
            marginTop: spx(16, s),
            textTransform: 'uppercase',
            ...applyMotionStyle(slideUp(time, 0.6, 0.4, globalSpeed)),
          }}
        >
          {sub}
        </div>
      </div>
    </div>
  );
}
