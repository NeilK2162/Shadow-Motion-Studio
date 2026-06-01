import { applyMotionStyle, slideUp2 } from '@/animations/presets';
import { useCardLayout } from '@/hooks/useCardLayout';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getCardShellStyle, spx  } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function PhoneCall({ fields, theme = shadowOwnerTheme, globalSpeed = 1, stripCardBackground = false }: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = useCardLayout('phone-call', fields);
  const s = layout.contentScale;
  const ptag = getField(fields, 'ptag', '☎ Incoming Call');
  const pname = getField(fields, 'pname', '');
  const prole = getField(fields, 'prole', '');
  const acceptLabel = getField(fields, 'acceptLabel', 'Accept');
  const declineLabel = getField(fields, 'declineLabel', 'Decline');

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          ...getCardShellStyle(layout),
          background: stripCardBackground ? 'transparent' : 'rgba(8,8,8,0.96)',
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          padding: spx(24, s),
          ...applyMotionStyle(slideUp2(time, 0, 0.4, globalSpeed)),
        }}
      >
        <div style={{ fontFamily: theme.monoFont, fontSize: spx(9, s), color: theme.dim, letterSpacing: 3, textAlign: 'center', marginBottom: spx(18, s), textTransform: 'uppercase' }}>
          {ptag}
        </div>
        <div style={{ fontFamily: theme.titleFont, fontSize: spx(38, s), color: '#fff', letterSpacing: 3, textAlign: 'center', marginBottom: spx(6, s) }}>{pname}</div>
        <div
          style={{
            fontFamily: theme.monoFont,
            fontSize: spx(10, s),
            color: theme.dim,
            textAlign: 'center',
            letterSpacing: 1.5,
            marginBottom: spx(24, s),
            paddingBottom: spx(20, s),
            borderBottom: `1px solid ${theme.dark4}`,
          }}
        >
          {prole}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: spx(52, s) }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spx(8, s) }}>
            <div style={{ width: spx(50, s), height: spx(50, s), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: spx(18, s), background: '#1a3d1a', color: '#5abf5a' }}>✓</div>
            <div style={{ fontFamily: theme.monoFont, fontSize: spx(9, s), color: theme.dim, letterSpacing: 1 }}>{acceptLabel}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spx(8, s) }}>
            <div style={{ width: spx(50, s), height: spx(50, s), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: spx(18, s), background: '#3d1a1a', color: '#bf5a5a' }}>✕</div>
            <div style={{ fontFamily: theme.monoFont, fontSize: spx(9, s), color: theme.dim, letterSpacing: 1 }}>{declineLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
