import { applyMotionStyle, pulse, slideUp2 } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function EnterLocation({ fields, theme = shadowOwnerTheme, globalSpeed = 1, stripCardBackground = false }: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const eltag = getField(fields, 'eltag', 'Now Entering');
  const lname = getField(fields, 'lname', '');
  const lsub = getField(fields, 'lsub', '');

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          width: 480,
          background: stripCardBackground ? 'transparent' : 'rgba(5,5,5,0.92)',
          borderTop: stripCardBackground ? 'none' : `1px solid ${theme.dark5}`,
          borderBottom: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          padding: '22px 28px',
          backdropFilter: 'blur(12px)',
          ...applyMotionStyle(slideUp2(time, 0, 0.5, globalSpeed)),
        }}
      >
        <div
          style={{
            fontFamily: theme.monoFont,
            fontSize: 9,
            color: theme.dim,
            letterSpacing: 4,
            marginBottom: 7,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 5,
              height: 5,
              background: theme.gold,
              borderRadius: '50%',
              ...applyMotionStyle(pulse(time)),
            }}
          />
          {eltag}
        </div>
        <div style={{ fontFamily: theme.titleFont, fontSize: 44, color: '#fff', letterSpacing: 4, lineHeight: 1, marginBottom: 7 }}>{lname}</div>
        <div style={{ fontFamily: theme.monoFont, fontSize: 10, color: theme.dim, letterSpacing: 2 }}>{lsub}</div>
      </div>
    </div>
  );
}
