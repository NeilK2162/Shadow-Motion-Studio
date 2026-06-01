import { applyMotionStyle, fadeL, pulse, radarSweep, slideInLeft } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getCardLayout, spx } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function GpsRoute({
  fields,
  theme = shadowOwnerTheme,
  globalSpeed = 1,
  stripCardBackground = false,
  formatId,
}: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = getCardLayout('gps-route', fields, formatId);
  const s = layout.contentScale;
  const gtag = getField(fields, 'gtag', 'ROUTE SET');
  const dest = getField(fields, 'dest', '');
  const distance = getField(fields, 'distance', '');
  const showRadar = getField(fields, 'showRadar', true);
  const radarSize = spx(48, s);

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          width: layout.cardWidth,
          minHeight: layout.cardHeight,
          background: stripCardBackground ? 'transparent' : 'rgba(5,5,5,0.92)',
          borderTop: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          borderBottom: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: spx(16, s),
          padding: spx(14, s),
          ...applyMotionStyle(slideInLeft(time, 0, 0.45, globalSpeed)),
        }}
      >
        {showRadar && (
          <div
            style={{
              width: radarSize,
              height: radarSize,
              borderRadius: '50%',
              border: `1px solid ${theme.dark5}`,
              position: 'relative',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '50%',
                height: 1,
                background: theme.gold,
                transformOrigin: 'left center',
                ...applyMotionStyle(radarSweep(time, 2.0)),
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '30%',
                right: '25%',
                width: spx(6, s),
                height: spx(6, s),
                borderRadius: '50%',
                background: theme.gold,
                ...applyMotionStyle(pulse(time, 1.8)),
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: spx(4, s),
                height: spx(4, s),
                borderRadius: '50%',
                background: theme.greenBright,
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: theme.monoFont,
              fontSize: spx(9, s),
              color: theme.gold,
              letterSpacing: 3,
              marginBottom: spx(4, s),
              ...applyMotionStyle(fadeL(time, 0.1, 0.4, globalSpeed)),
            }}
          >
            {gtag}
          </div>
          <div
            style={{
              fontFamily: theme.titleFont,
              fontSize: spx(30, s),
              color: '#fff',
              letterSpacing: 1,
              lineHeight: 1,
              marginBottom: spx(4, s),
              ...applyMotionStyle(fadeL(time, 0.2, 0.4, globalSpeed)),
            }}
          >
            {dest}
          </div>
          <div
            style={{
              fontFamily: theme.monoFont,
              fontSize: spx(10, s),
              color: theme.dim,
              ...applyMotionStyle(fadeL(time, 0.3, 0.4, globalSpeed)),
            }}
          >
            {distance}
          </div>
        </div>
      </div>
    </div>
  );
}
