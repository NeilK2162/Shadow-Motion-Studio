import { applyMotionStyle, slideUp2 } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function PhoneCall({ fields, theme = shadowOwnerTheme, globalSpeed = 1, stripCardBackground = false }: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const ptag = getField(fields, 'ptag', '☎ Incoming Call');
  const pname = getField(fields, 'pname', '');
  const prole = getField(fields, 'prole', '');
  const acceptLabel = getField(fields, 'acceptLabel', 'Accept');
  const declineLabel = getField(fields, 'declineLabel', 'Decline');

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          width: 420,
          background: stripCardBackground ? 'transparent' : 'rgba(8,8,8,0.96)',
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          padding: 24,
          ...applyMotionStyle(slideUp2(time, 0, 0.4, globalSpeed)),
        }}
      >
        <div style={{ fontFamily: theme.monoFont, fontSize: 9, color: theme.dim, letterSpacing: 3, textAlign: 'center', marginBottom: 18, textTransform: 'uppercase' }}>
          {ptag}
        </div>
        <div style={{ fontFamily: theme.titleFont, fontSize: 38, color: '#fff', letterSpacing: 3, textAlign: 'center', marginBottom: 6 }}>{pname}</div>
        <div
          style={{
            fontFamily: theme.monoFont,
            fontSize: 10,
            color: theme.dim,
            textAlign: 'center',
            letterSpacing: 1.5,
            marginBottom: 24,
            paddingBottom: 20,
            borderBottom: `1px solid ${theme.dark4}`,
          }}
        >
          {prole}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 52 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: '#1a3d1a', color: '#5abf5a' }}>✓</div>
            <div style={{ fontFamily: theme.monoFont, fontSize: 9, color: theme.dim, letterSpacing: 1 }}>{acceptLabel}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: '#3d1a1a', color: '#bf5a5a' }}>✕</div>
            <div style={{ fontFamily: theme.monoFont, fontSize: 9, color: theme.dim, letterSpacing: 1 }}>{declineLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
