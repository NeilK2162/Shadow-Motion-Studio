import { applyMotionStyle, flashIn, popIn, slideInRight } from '@/animations/presets';
import { useCardLayout } from '@/hooks/useCardLayout';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getCardShellStyle, spx  } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function WantedLevel({
  fields,
  theme = shadowOwnerTheme,
  globalSpeed = 1,
  stripCardBackground = false,
  formatId,
}: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = useCardLayout('wanted-level', fields, formatId);
  const s = layout.contentScale;
  const wtag = getField(fields, 'wtag', 'WANTED');
  const stars = getField(fields, 'stars', 3);
  const maxStars = getField(fields, 'maxStars', 5);
  const litChar = getField(fields, 'litChar', '★');
  const dimChar = getField(fields, 'dimChar', '☆');
  const flashOnGain = getField(fields, 'flashOnGain', true);

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          ...getCardShellStyle(layout),
          background: stripCardBackground ? 'transparent' : 'rgba(8,8,8,0.92)',
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          padding: spx(14, s),
          ...applyMotionStyle(slideInRight(time, 0, 0.45, globalSpeed)),
        }}
      >
        <div
          style={{
            fontFamily: theme.monoFont,
            fontSize: spx(9, s),
            color: theme.gold,
            letterSpacing: 4,
            marginBottom: spx(8, s),
            textTransform: 'uppercase',
          }}
        >
          {wtag}
        </div>
        <div style={{ display: 'flex', gap: spx(6, s), fontSize: spx(26, s), lineHeight: 1 }}>
          {Array.from({ length: maxStars }, (_, i) => {
            const lit = i < stars;
            const style = lit
              ? applyMotionStyle(
                  flashOnGain && i === stars - 1
                    ? { ...popIn(time, 0.12 + i * 0.12, 0.35, globalSpeed), ...flashIn(time, 0.12 + i * 0.12, 0.4, globalSpeed) }
                    : popIn(time, 0.12 + i * 0.12, 0.35, globalSpeed),
                )
              : { opacity: 0.4, color: theme.dim };
            return (
              <span key={i} style={{ color: lit ? theme.gold : theme.dim, ...style }}>
                {lit ? litChar : dimChar}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
