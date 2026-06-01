import { applyMotionStyle, expandLine, fadeL, scanAnim, slideUp } from '@/animations/presets';
import { useCardLayout } from '@/hooks/useCardLayout';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getCardShellStyle, spx  } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function CharacterIntro({
  fields,
  theme = shadowOwnerTheme,
  globalSpeed = 1,
  stripCardBackground = false,
  formatId,
}: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = useCardLayout('character-intro', fields, formatId);
  const s = layout.contentScale;
  const tag = getField(fields, 'tag', 'NOW INTRODUCING');
  const name = getField(fields, 'name', '');
  const role = getField(fields, 'role', '');
  const accentColor = getField(fields, 'accentColor', theme.gold);

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          ...getCardShellStyle(layout),
          background: stripCardBackground ? 'transparent' : 'rgba(8,8,8,0.94)',
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          display: 'flex',
          padding: spx(20, s),
          gap: spx(16, s),
        }}
      >
        <div
          style={{
            width: spx(4, s),
            background: accentColor,
            flexShrink: 0,
            transformOrigin: 'top center',
            ...applyMotionStyle(scanAnim(time, 0, 0.5, globalSpeed)),
            minHeight: spx(80, s),
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: theme.monoFont,
              fontSize: spx(9, s),
              color: theme.gold,
              letterSpacing: 3,
              marginBottom: spx(8, s),
              ...applyMotionStyle(fadeL(time, 0.1, 0.4, globalSpeed)),
            }}
          >
            {tag}
          </div>
          <div
            style={{
              fontFamily: theme.titleFont,
              fontSize: spx(46, s),
              color: '#fff',
              letterSpacing: 2,
              lineHeight: 1,
              marginBottom: spx(8, s),
              ...applyMotionStyle(slideUp(time, 0.2, 0.4, globalSpeed)),
            }}
          >
            {name}
          </div>
          <div
            style={{
              height: 2,
              background: theme.gold,
              marginBottom: spx(10, s),
              ...applyMotionStyle(expandLine(time, 0.35, 0.5, globalSpeed, spx(64, s))),
            }}
          />
          <div
            style={{
              fontFamily: theme.uiFont,
              fontSize: spx(14, s),
              color: theme.text,
              ...applyMotionStyle(fadeL(time, 0.45, 0.4, globalSpeed)),
            }}
          >
            {role}
          </div>
        </div>
      </div>
    </div>
  );
}
