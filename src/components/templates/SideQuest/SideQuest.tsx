import { applyMotionStyle, slideR } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function SideQuest({ fields, theme = shadowOwnerTheme, globalSpeed = 1, stripCardBackground = false }: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
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
          width: 480,
          background: stripCardBackground ? 'transparent' : theme.dark2,
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark5}`,
          borderLeft: stripCardBackground ? 'none' : `3px solid ${theme.gold}`,
          padding: 26,
          ...applyMotionStyle(slideR(time, 0, 0.4, globalSpeed)),
        }}
      >
        <div
          style={{
            fontFamily: theme.monoFont,
            fontSize: 9,
            color: theme.gold,
            letterSpacing: 3,
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textTransform: 'uppercase',
          }}
        >
          <span>◈</span> {qtag}
        </div>
        <div style={{ fontFamily: theme.titleFont, fontSize: 34, color: '#fff', letterSpacing: 2, lineHeight: 1, marginBottom: 10 }}>{qtitle}</div>
        <div
          style={{
            fontFamily: theme.monoFont,
            fontSize: 11,
            color: '#777',
            lineHeight: 1.75,
            paddingBottom: 18,
            marginBottom: 18,
            borderBottom: `1px solid ${theme.dark4}`,
          }}
        >
          {qdesc}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 22 }}>
          <div style={{ fontFamily: theme.monoFont, fontSize: 9, color: theme.dim, letterSpacing: 2, textTransform: 'uppercase' }}>{rewardLabel}</div>
          <div style={{ fontFamily: theme.titleFont, fontSize: 24, color: theme.gold, letterSpacing: 2 }}>{rewardValue}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ fontFamily: theme.monoFont, fontSize: 10, letterSpacing: 2, padding: '9px 22px', background: theme.gold, color: '#000', fontWeight: 700, textTransform: 'uppercase' }}>
            {acceptLabel}
          </div>
          <div style={{ fontFamily: theme.monoFont, fontSize: 10, letterSpacing: 2, padding: '9px 22px', background: 'transparent', color: theme.dim, border: `1px solid ${theme.dark5}`, textTransform: 'uppercase' }}>
            {declineLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
