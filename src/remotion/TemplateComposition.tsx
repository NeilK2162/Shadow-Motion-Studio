import { CardStage } from '@/components/templates/shared/CardStage';
import { Stage } from '@/components/templates/shared/Stage';
import { TEMPLATE_COMPONENTS } from '@/components/templates';
import { getFormat } from '@/lib/formats';
import { safeAreaStyle } from '@/lib/placement';
import type { CompositionInputProps } from '@/remotion/inputProps';
import type { TemplateId } from '@/types';
import { RESOLUTION_MAP } from '@/types';

export type TemplateCompositionProps = CompositionInputProps;

export function TemplateComposition(props: TemplateCompositionProps) {
  const {
    templateId,
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

  const Component = TEMPLATE_COMPONENTS[templateId as TemplateId];
  const { width, height } = RESOLUTION_MAP[resolution];
  const format = getFormat(formatId);

  return (
    <CardStage width={width} height={height} backgroundMode={backgroundMode} customBackground={customBackground}>
      {showSafeAreaGuides && format.platform !== 'youtube' && (
        <div style={safeAreaStyle(format)} />
      )}
      <Stage format={format} placement={placement}>
        <Component
          fields={fields}
          theme={theme}
          globalSpeed={globalSpeed}
          stripCardBackground={stripCardBackground}
          formatId={formatId}
        />
      </Stage>
    </CardStage>
  );
}
