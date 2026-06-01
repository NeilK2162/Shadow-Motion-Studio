import { applyMotionStyle, expandLine, fadeL, fadeR } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function ChapterCard({ fields, theme = shadowOwnerTheme, globalSpeed = 1, stripCardBackground = false }: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const num = getField(fields, 'num', 'CHAPTER 01');
  const titleLine1 = getField(fields, 'titleLine1', 'ENTERING');
  const titleLine2 = getField(fields, 'titleLine2', 'HYDERABAD');
  const csub = getField(fields, 'csub', '');
  const badge = getField(fields, 'badge', '');

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          width: 560,
          height: 360,
          background: stripCardBackground ? 'transparent' : '#000',
          position: 'relative',
          overflow: 'hidden',
          padding: '44px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {!stripCardBackground && (
          <>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(125deg, #0c0c18 0%, #060608 55%, #000 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.04,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: '200px 200px',
              }}
            />
          </>
        )}
        <div
          style={{
            position: 'relative',
            fontFamily: theme.monoFont,
            fontSize: 10,
            color: theme.gold,
            letterSpacing: 5,
            textTransform: 'uppercase',
            marginBottom: 14,
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
            marginBottom: 24,
            ...applyMotionStyle(expandLine(time, 0.3, 0.5, globalSpeed)),
          }}
        />
        <div
          style={{
            position: 'relative',
            fontFamily: theme.titleFont,
            fontSize: 56,
            color: '#fff',
            lineHeight: 0.9,
            letterSpacing: 3,
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
            fontSize: 9,
            color: theme.dim,
            letterSpacing: 2.5,
            marginTop: 22,
            textTransform: 'uppercase',
            ...applyMotionStyle(fadeL(time, 0.6, 0.5, globalSpeed)),
          }}
        >
          {csub}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            right: 28,
            fontFamily: theme.monoFont,
            fontSize: 9,
            color: theme.gold,
            letterSpacing: 1,
            border: `1px solid ${theme.dark5}`,
            padding: '4px 10px',
            ...applyMotionStyle(fadeR(time, 0.7, 0.5, globalSpeed)),
          }}
        >
          {badge}
        </div>
      </div>
    </div>
  );
}
