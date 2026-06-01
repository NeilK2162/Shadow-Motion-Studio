import { applyMotionStyle, slideR } from '@/animations/presets';
import { useCardLayout } from '@/hooks/useCardLayout';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getCardShellStyle, spx  } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function SideQuest({ fields, theme = shadowOwnerTheme, globalSpeed = 1, stripCardBackground = false }: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = useCardLayout('side-quest', fields);
  const s = layout.contentScale;
  const qtag = getField(fields, 'qtag', 'New Side Quest Available');
  const qtitle = getField(fields, 'qtitle', '');
  const qdesc = getField(fields, 'qdesc', '');
  const rewardLabel = getField(fields, 'rewardLabel', 'Reward:');
  const rewardValue = getField(fields, 'rewardValue', '');
  const acceptLabel = getField(fields, 'acceptLabel', 'Accept');
  const declineLabel = getField(fields, 'declineLabel', 'Decline');

  return (
    <div style={themeVars(theme)}>
      <div
        style={{
          ...getCardShellStyle(layout),
          background: stripCardBackground ? 'transparent' : theme.dark2,
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark5}`,
          borderLeft: stripCardBackground ? 'none' : `${spx(3, s)}px solid ${theme.gold}`,
          padding: spx(26, s),
          ...applyMotionStyle(slideR(time, 0, 0.4, globalSpeed)),
        }}
      >
        <div
          style={{
            fontFamily: theme.monoFont,
            fontSize: spx(9, s),
            color: theme.gold,
            letterSpacing: 3,
            marginBottom: spx(14, s),
            display: 'flex',
            alignItems: 'center',
            gap: spx(8, s),
            textTransform: 'uppercase',
          }}
        >
          <span>◈</span> {qtag}
        </div>
        <div style={{ fontFamily: theme.titleFont, fontSize: spx(34, s), color: '#fff', letterSpacing: 2, lineHeight: 1, marginBottom: spx(10, s) }}>{qtitle}</div>
        <div
          style={{
            fontFamily: theme.monoFont,
            fontSize: spx(11, s),
            color: '#777',
            lineHeight: 1.75,
            paddingBottom: spx(18, s),
            marginBottom: spx(18, s),
            borderBottom: `1px solid ${theme.dark4}`,
          }}
        >
          {qdesc}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: spx(10, s), marginBottom: spx(22, s) }}>
          <div style={{ fontFamily: theme.monoFont, fontSize: spx(9, s), color: theme.dim, letterSpacing: 2, textTransform: 'uppercase' }}>{rewardLabel}</div>
          <div style={{ fontFamily: theme.titleFont, fontSize: spx(24, s), color: theme.gold, letterSpacing: 2 }}>{rewardValue}</div>
        </div>
        <div style={{ display: 'flex', gap: spx(10, s) }}>
          <div style={{ fontFamily: theme.monoFont, fontSize: spx(10, s), letterSpacing: 2, padding: `${spx(9, s)}px ${spx(22, s)}px`, background: theme.gold, color: '#000', fontWeight: 700, textTransform: 'uppercase' }}>
            {acceptLabel}
          </div>
          <div style={{ fontFamily: theme.monoFont, fontSize: spx(10, s), letterSpacing: 2, padding: `${spx(9, s)}px ${spx(22, s)}px`, background: 'transparent', color: theme.dim, border: `1px solid ${theme.dark5}`, textTransform: 'uppercase' }}>
            {declineLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
