import { applyMotionStyle, counterUp, flashIn, slideDown, slideUp } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getCardLayout, spx } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function CashPickup({
  fields,
  theme = shadowOwnerTheme,
  globalSpeed = 1,
  stripCardBackground = false,
  formatId,
}: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = getCardLayout('cash-pickup', fields, formatId);
  const s = layout.contentScale;
  const amountPrefix = getField(fields, 'amountPrefix', '₹');
  const amount = getField(fields, 'amount', 50000);
  const delta = getField(fields, 'delta', '+₹50,000');
  const label = getField(fields, 'label', 'WALLET');
  const positive = getField(fields, 'positive', true);
  const displayAmount = counterUp(time, 0.1, 1.2, globalSpeed, amount);

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          width: layout.cardWidth,
          minHeight: layout.cardHeight,
          background: stripCardBackground ? 'transparent' : 'rgba(8,8,8,0.94)',
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark4}`,
          padding: spx(16, s),
          textAlign: 'right',
          ...applyMotionStyle(slideDown(time, 0, 0.4, globalSpeed)),
        }}
      >
        <div style={{ fontFamily: theme.monoFont, fontSize: spx(9, s), color: theme.dim, letterSpacing: 3, marginBottom: spx(6, s) }}>
          {label}
        </div>
        <div
          style={{
            fontFamily: theme.titleFont,
            fontSize: spx(48, s),
            color: theme.gold,
            letterSpacing: 2,
            lineHeight: 1,
            textShadow: `0 0 20px ${theme.gold}44`,
            ...applyMotionStyle(flashIn(time, 1.2, 0.3, globalSpeed)),
          }}
        >
          {amountPrefix}
          {displayAmount.toLocaleString('en-IN')}
        </div>
        <div
          style={{
            fontFamily: theme.uiFont,
            fontWeight: 600,
            fontSize: spx(14, s),
            color: positive ? theme.greenBright : theme.redBright,
            marginTop: spx(8, s),
            ...applyMotionStyle(slideUp(time, 0.3, 0.4, globalSpeed)),
          }}
        >
          {delta}
        </div>
      </div>
    </div>
  );
}
