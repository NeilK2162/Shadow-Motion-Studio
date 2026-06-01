import { applyMotionStyle, expandLine, fadeL, fadeR } from '@/animations/presets';
import { useCardLayout } from '@/hooks/useCardLayout';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getCardShellStyle, spx  } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function ChapterCard({ fields, theme = shadowOwnerTheme, globalSpeed = 1, stripCardBackground = false }: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = useCardLayout('chapter-card', fields);
  const s = layout.contentScale;
  const num = getField(fields, 'num', 'CHAPTER 01');
  const titleLine1 = getField(fields, 'titleLine1', 'ENTERING');
  const titleLine2 = getField(fields, 'titleLine2', 'HYDERABAD');
  const csub = getField(fields, 'csub', '');
  const badge = getField(fields, 'badge', '');

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          ...getCardShellStyle(layout),
          background: stripCardBackground ? 'transparent' : '#000',
          position: 'relative',
          overflow: 'hidden',
          padding: `${spx(44, s)}px ${spx(48, s)}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {!stripCardBackground && (
          <>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(125deg, #0c0c18 0%, #060608 55%, #000 100%)' }} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.04,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: `${spx(200, s)}px ${spx(200, s)}px`,
              }}
            />
          </>
        )}
        <div
          style={{
            position: 'relative',
            fontFamily: theme.monoFont,
            fontSize: spx(10, s),
            color: theme.gold,
            letterSpacing: spx(5, s),
            textTransform: 'uppercase',
            marginBottom: spx(14, s),
            ...applyMotionStyle(fadeL(time, 0.1, 0.5, globalSpeed)),
          }}
        >
          {num}
        </div>
        <div
          style={{
            position: 'relative',
            height: 1,
            background: theme.gold,
            marginBottom: spx(24, s),
            ...applyMotionStyle(expandLine(time, 0.3, 0.5, globalSpeed, spx(64, s))),
          }}
        />
        <div
          style={{
            position: 'relative',
            fontFamily: theme.titleFont,
            fontSize: spx(56, s),
            color: '#fff',
            lineHeight: 0.9,
            letterSpacing: spx(3, s),
            ...applyMotionStyle(fadeL(time, 0.4, 0.5, globalSpeed)),
          }}
        >
          {titleLine1}
          <br />
          {titleLine2}
        </div>
        <div
          style={{
            position: 'relative',
            fontFamily: theme.monoFont,
            fontSize: spx(9, s),
            color: theme.dim,
            letterSpacing: spx(2.5, s),
            marginTop: spx(22, s),
            textTransform: 'uppercase',
            ...applyMotionStyle(fadeL(time, 0.6, 0.5, globalSpeed)),
          }}
        >
          {csub}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: spx(24, s),
            right: spx(28, s),
            fontFamily: theme.monoFont,
            fontSize: spx(9, s),
            color: theme.gold,
            letterSpacing: 1,
            border: `1px solid ${theme.dark5}`,
            padding: `${spx(4, s)}px ${spx(10, s)}px`,
            ...applyMotionStyle(fadeR(time, 0.7, 0.5, globalSpeed)),
          }}
        >
          {badge}
        </div>
      </div>
    </div>
  );
}
