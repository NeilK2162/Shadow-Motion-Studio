import { CardStage } from '@/components/templates/shared/CardStage';
import { TEMPLATE_COMPONENTS } from '@/components/templates';
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
  } = props;

  const Component = TEMPLATE_COMPONENTS[templateId as TemplateId];
  const { width, height } = RESOLUTION_MAP[resolution];

  return (
    <CardStage width={width} height={height} backgroundMode={backgroundMode} customBackground={customBackground}>
      <Component fields={fields} theme={theme} globalSpeed={globalSpeed} stripCardBackground={stripCardBackground} />
    </CardStage>
  );
}
