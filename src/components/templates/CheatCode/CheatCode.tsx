import { applyMotionStyle, flashIn } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function CheatCode({ fields, theme = shadowOwnerTheme, globalSpeed = 1, stripCardBackground = false }: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const ctag = getField(fields, 'ctag', '⚡ Cheat Code Activated');
  const code = getField(fields, 'code', '');
  const cdesc = getField(fields, 'cdesc', '');
  const creward = getField(fields, 'creward', '');

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          width: 440,
          background: stripCardBackground ? 'transparent' : theme.dark0,
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          padding: '22px 26px',
          position: 'relative',
          overflow: 'hidden',
          ...applyMotionStyle(flashIn(time, 0, 0.4, globalSpeed)),
        }}
      >
        {!stripCardBackground && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(232,200,74,0.06) 0%, transparent 60%)',
            }}
          />
        )}
        <div
          style={{
            position: 'relative',
            fontFamily: theme.monoFont,
            fontSize: 9,
            color: theme.gold,
            letterSpacing: 4,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textTransform: 'uppercase',
          }}
        >
          {ctag}
        </div>
        <div style={{ position: 'relative', fontFamily: theme.titleFont, fontSize: 30, color: theme.gold, letterSpacing: 5, marginBottom: 8 }}>{code}</div>
        <div style={{ position: 'relative', fontFamily: theme.monoFont, fontSize: 12, color: '#ccc', letterSpacing: 0.5 }}>{cdesc}</div>
        <div style={{ position: 'relative', marginTop: 16, fontFamily: theme.monoFont, fontSize: 12, color: theme.gold, letterSpacing: 2 }}>{creward}</div>
      </div>
    </div>
  );
}
