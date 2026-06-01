import { CardStage } from '@/components/templates/shared/CardStage';
import { Stage } from '@/components/templates/shared/Stage';
import { DynamicTemplate } from '@/components/templates/DynamicTemplate';
import { TEMPLATE_COMPONENTS } from '@/components/templates';
import { TemplateLayoutContext } from '@/hooks/useCardLayout';
import { getFormat } from '@/lib/formats';
import { safeAreaStyle } from '@/lib/placement';
import type { CompositionInputProps } from '@/remotion/inputProps';
import type { TemplateId } from '@/types';
import { RESOLUTION_MAP } from '@/types';

export type TemplateCompositionProps = CompositionInputProps;

export function TemplateComposition(props: TemplateCompositionProps) {
  const {
    templateId,
    templateDef,
    fields,
    theme,
    globalSpeed = 1,
    stripCardBackground = false,
    backgroundMode = 'dark',
    customBackground = '#080808',
    resolution = '1920x1080',
    formatId = 'youtube-landscape',
    placement = 'center',
    showSafeAreaGuides = false,
  } = props;

  const { width, height } = RESOLUTION_MAP[resolution];
  const format = getFormat(formatId);

  const layoutContext = {
    placement,
    canvasWidth: width,
    canvasHeight: height,
    formatId,
  };

  const useDynamic = !!templateDef || !(templateId in TEMPLATE_COMPONENTS);
  const Component = !useDynamic ? TEMPLATE_COMPONENTS[templateId as TemplateId] : null;

  return (
    <CardStage width={width} height={height} backgroundMode={backgroundMode} customBackground={customBackground}>
      {showSafeAreaGuides && placement !== 'fullscreen' && format.platform !== 'youtube' && (
        <div style={safeAreaStyle(format)} />
      )}
      <TemplateLayoutContext.Provider value={layoutContext}>
        <Stage format={format} placement={placement}>
          <div
            style={
              placement === 'fullscreen'
                ? { flex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', minHeight: 0 }
                : undefined
            }
          >
            {useDynamic && templateDef ? (
              <DynamicTemplate
                def={templateDef}
                fields={fields}
                theme={theme}
                globalSpeed={globalSpeed}
                stripCardBackground={stripCardBackground}
                formatId={formatId}
                placement={placement}
                canvasWidth={width}
                canvasHeight={height}
              />
            ) : Component ? (
              <Component
                fields={fields}
                theme={theme}
                globalSpeed={globalSpeed}
                stripCardBackground={stripCardBackground}
                formatId={formatId}
                placement={placement}
                canvasWidth={width}
                canvasHeight={height}
              />
            ) : null}
          </div>
        </Stage>
      </TemplateLayoutContext.Provider>
    </CardStage>
  );
}
