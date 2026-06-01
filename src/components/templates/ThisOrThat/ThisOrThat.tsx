import { applyMotionStyle, counterUp, lFill, popIn, slideInLeft, slideInRight, slideUp } from '@/animations/presets';
import { useTemplateTime } from '@/hooks/useTemplateTime';
import { shadowOwnerTheme } from '@/themes/tokens';
import type { PollOption } from '@/types';
import { getCardLayout, spx } from '../shared/cardLayout';
import { getField, themeVars, type TemplateComponentProps } from '../shared/types';

export function ThisOrThat({
  fields,
  theme = shadowOwnerTheme,
  globalSpeed = 1,
  stripCardBackground = false,
  formatId,
}: TemplateComponentProps) {
  const time = useTemplateTime(globalSpeed);
  const layout = getCardLayout('this-or-that', fields, formatId);
  const s = layout.contentScale;
  const question = getField(fields, 'question', 'WHICH PATH?');
  const prompt = getField(fields, 'prompt', '');
  const optionA = getField<PollOption>(fields, 'optionA', { key: 'A', label: 'GO ALL IN', pct: 62 });
  const optionB = getField<PollOption>(fields, 'optionB', { key: 'B', label: 'PLAY IT SAFE', pct: 38 });
  const showPct = getField(fields, 'showPct', true);
  const splitOrientation = getField<'horizontal' | 'vertical'>(fields, 'splitOrientation', 'horizontal');
  const isVertical = splitOrientation === 'vertical';

  const renderOption = (opt: PollOption, side: 'left' | 'right', delay: number) => {
    const slide = side === 'left' ? slideInLeft(time, delay, 0.45, globalSpeed) : slideInRight(time, delay, 0.45, globalSpeed);
    const pctDisplay = counterUp(time, 0.5, 0.8, globalSpeed, opt.pct);
    return (
      <div
        style={{
          flex: 1,
          background: stripCardBackground ? 'transparent' : theme.dark2,
          border: stripCardBackground ? 'none' : `1px solid ${theme.dark5}`,
          borderTop: stripCardBackground ? 'none' : `${spx(3, s)}px solid ${side === 'left' ? theme.gold : theme.redBright}`,
          padding: spx(20, s),
          ...applyMotionStyle(slide),
        }}
      >
        <div
          style={{
            fontFamily: theme.titleFont,
            fontSize: spx(28, s),
            color: side === 'left' ? theme.gold : theme.redBright,
            marginBottom: spx(8, s),
          }}
        >
          {opt.key}
        </div>
        <div style={{ fontFamily: theme.uiFont, fontSize: spx(16, s), color: theme.text, marginBottom: spx(12, s) }}>
          {opt.label}
        </div>
        {showPct && (
          <>
            <div style={{ height: spx(4, s), background: theme.dark4, marginBottom: spx(6, s) }}>
              <div
                style={{
                  height: '100%',
                  background: side === 'left' ? theme.gold : theme.redBright,
                  ...applyMotionStyle(lFill(time, 0.5, 0.8, globalSpeed, opt.pct)),
                }}
              />
            </div>
            <div style={{ fontFamily: theme.monoFont, fontSize: spx(10, s), color: theme.dim }}>{pctDisplay}%</div>
          </>
        )}
      </div>
    );
  };

  return (
    <div style={themeVars(theme)}>
      <div style={{ width: layout.cardWidth, minHeight: layout.cardHeight }}>
        <div
          style={{
            fontFamily: theme.titleFont,
            fontSize: spx(36, s),
            color: '#fff',
            letterSpacing: 2,
            textAlign: 'center',
            marginBottom: spx(8, s),
            ...applyMotionStyle(slideUp(time, 0, 0.4, globalSpeed)),
          }}
        >
          {question}
        </div>
        <div
          style={{
            fontFamily: theme.uiFont,
            fontSize: spx(12, s),
            color: theme.dim,
            textAlign: 'center',
            marginBottom: spx(16, s),
          }}
        >
          {prompt}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: isVertical ? 'column' : 'row',
            gap: spx(10, s),
            alignItems: 'stretch',
            position: 'relative',
          }}
        >
          {renderOption(optionA, 'left', 0.15)}
          <div
            style={{
              position: isVertical ? 'relative' : 'absolute',
              left: isVertical ? undefined : '50%',
              top: isVertical ? undefined : '50%',
              transform: isVertical ? undefined : 'translate(-50%, -50%)',
              alignSelf: 'center',
              fontFamily: theme.titleFont,
              fontSize: spx(18, s),
              color: theme.dim,
              background: theme.dark0,
              padding: spx(6, s),
              zIndex: 2,
              ...applyMotionStyle(popIn(time, 0.3, 0.35, globalSpeed)),
            }}
          >
            VS
          </div>
          {renderOption(optionB, 'right', 0.15)}
        </div>
      </div>
    </div>
  );
}
