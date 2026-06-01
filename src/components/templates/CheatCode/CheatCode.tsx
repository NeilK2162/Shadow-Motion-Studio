import { applyMotionStyle, flashIn } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getCardLayout, spx } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function CheatCode({ fields, theme = shadowOwnerTheme, globalSpeed = 1, stripCardBackground = false }: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = getCardLayout('cheat-code', fields);
  const s = layout.contentScale;
  const ctag = getField(fields, 'ctag', '⚡ Cheat Code Activated');
  const code = getField(fields, 'code', '');
  const cdesc = getField(fields, 'cdesc', '');
  const creward = getField(fields, 'creward', '');

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          width: layout.cardWidth,
          minHeight: layout.cardHeight,
          background: stripCardBackground ? 'transparent' : theme.dark0,
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          padding: `${spx(22, s)}px ${spx(26, s)}px`,
          position: 'relative',
          overflow: 'hidden',
          ...applyMotionStyle(flashIn(time, 0, 0.4, globalSpeed)),
        }}
      >
        {!stripCardBackground && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(232,200,74,0.06) 0%, transparent 60%)' }} />
        )}
        <div
          style={{
            position: 'relative',
            fontFamily: theme.monoFont,
            fontSize: spx(9, s),
            color: theme.gold,
            letterSpacing: 4,
            marginBottom: spx(12, s),
            display: 'flex',
            alignItems: 'center',
            gap: spx(10, s),
            textTransform: 'uppercase',
          }}
        >
          {ctag}
        </div>
        <div style={{ position: 'relative', fontFamily: theme.titleFont, fontSize: spx(30, s), color: theme.gold, letterSpacing: 5, marginBottom: spx(8, s) }}>{code}</div>
        <div style={{ position: 'relative', fontFamily: theme.monoFont, fontSize: spx(12, s), color: '#ccc', letterSpacing: 0.5 }}>{cdesc}</div>
        <div style={{ position: 'relative', marginTop: spx(16, s), fontFamily: theme.monoFont, fontSize: spx(12, s), color: theme.gold, letterSpacing: 2 }}>{creward}</div>
      </div>
    </div>
  );
}
