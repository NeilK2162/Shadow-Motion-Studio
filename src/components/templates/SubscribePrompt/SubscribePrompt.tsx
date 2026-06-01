import { applyMotionStyle, flashIn, popIn, pulse, slideUp, slideUp2 } from '@/animations/presets';
import { useCardLayout } from '@/hooks/useCardLayout';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getCardShellStyle, spx  } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function SubscribePrompt({
  fields,
  theme = shadowOwnerTheme,
  globalSpeed = 1,
  stripCardBackground = false,
  formatId,
}: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = useCardLayout('subscribe-prompt', fields, formatId);
  const s = layout.contentScale;
  const headline = getField(fields, 'headline', 'NEW OBJECTIVE');
  const action = getField(fields, 'action', 'SUBSCRIBE');
  const desc = getField(fields, 'desc', '');
  const reward = getField(fields, 'reward', '+1 RESPECT');
  const cta = getField(fields, 'cta', 'TAP THE BELL');
  const pulseCta = getField(fields, 'pulseCta', true);

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          ...getCardShellStyle(layout),
          background: stripCardBackground ? 'transparent' : theme.dark0,
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          borderLeft: stripCardBackground ? 'none' : `${spx(4, s)}px solid ${theme.gold}`,
          padding: spx(24, s),
          position: 'relative',
          overflow: 'hidden',
          ...applyMotionStyle(slideUp2(time, 0, 0.5, globalSpeed)),
        }}
      >
        {!stripCardBackground && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, ${theme.gold}11 0%, transparent 50%)`,
              pointerEvents: 'none',
            }}
          />
        )}
        <div style={{ fontFamily: theme.monoFont, fontSize: spx(9, s), color: theme.gold, letterSpacing: 3, marginBottom: spx(8, s) }}>
          {headline}
        </div>
        <div
          style={{
            fontFamily: theme.titleFont,
            fontSize: spx(44, s),
            color: '#fff',
            letterSpacing: 2,
            lineHeight: 1,
            marginBottom: spx(10, s),
            ...applyMotionStyle(popIn(time, 0.15, 0.35, globalSpeed)),
          }}
        >
          {action}
        </div>
        <div
          style={{
            fontFamily: theme.uiFont,
            fontSize: spx(14, s),
            color: theme.silver,
            marginBottom: spx(14, s),
            ...applyMotionStyle(slideUp(time, 0.3, 0.4, globalSpeed)),
          }}
        >
          {desc}
        </div>
        <div
          style={{
            display: 'inline-block',
            fontFamily: theme.monoFont,
            fontSize: spx(10, s),
            color: theme.gold,
            border: `1px solid ${theme.goldDim}`,
            padding: `${spx(6, s)}px ${spx(12, s)}px`,
            marginBottom: spx(16, s),
            ...applyMotionStyle(flashIn(time, 0.5, 0.4, globalSpeed)),
          }}
        >
          {reward}
        </div>
        <div
          style={{
            fontFamily: theme.monoFont,
            fontSize: spx(10, s),
            color: theme.gold,
            letterSpacing: 2,
            display: 'flex',
            alignItems: 'center',
            gap: spx(8, s),
            ...(pulseCta ? applyMotionStyle(pulse(time, 1.8)) : {}),
          }}
        >
          <span>➤</span> {cta}
        </div>
      </div>
    </div>
  );
}
