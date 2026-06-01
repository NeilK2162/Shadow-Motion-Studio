import { applyMotionStyle, pulse, slideUp2 } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getCardLayout, spx } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function EnterLocation({ fields, theme = shadowOwnerTheme, globalSpeed = 1, stripCardBackground = false }: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = getCardLayout('enter-location', fields);
  const s = layout.contentScale;
  const eltag = getField(fields, 'eltag', 'Now Entering');
  const lname = getField(fields, 'lname', '');
  const lsub = getField(fields, 'lsub', '');

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          width: layout.cardWidth,
          minHeight: layout.cardHeight,
          background: stripCardBackground ? 'transparent' : 'rgba(5,5,5,0.92)',
          borderTop: stripCardBackground ? 'none' : `1px solid ${theme.dark5}`,
          borderBottom: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          padding: `${spx(22, s)}px ${spx(28, s)}px`,
          backdropFilter: 'blur(12px)',
          ...applyMotionStyle(slideUp2(time, 0, 0.5, globalSpeed)),
        }}
      >
        <div
          style={{
            fontFamily: theme.monoFont,
            fontSize: spx(9, s),
            color: theme.dim,
            letterSpacing: 4,
            marginBottom: spx(7, s),
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: spx(8, s),
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: spx(5, s),
              height: spx(5, s),
              background: theme.gold,
              borderRadius: '50%',
              ...applyMotionStyle(pulse(time)),
            }}
          />
          {eltag}
        </div>
        <div style={{ fontFamily: theme.titleFont, fontSize: spx(44, s), color: '#fff', letterSpacing: 4, lineHeight: 1, marginBottom: spx(7, s) }}>{lname}</div>
        <div style={{ fontFamily: theme.monoFont, fontSize: spx(10, s), color: theme.dim, letterSpacing: 2 }}>{lsub}</div>
      </div>
    </div>
  );
}
