import { Composition } from 'remotion';
import { createDefaultInputProps } from './inputProps';
import { TEMPLATE_META } from '@/types';
import { getDefaultDurationSeconds } from '@/data/templateDefaults';
import { TemplateComposition } from './TemplateComposition';

function durationForTemplate(templateId: (typeof TEMPLATE_META)[number]['id'], fps = 30): number {
  return Math.ceil((getDefaultDurationSeconds(templateId) + 1) * fps);
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {TEMPLATE_META.map((meta) => (
        <Composition
          key={meta.id}
          id={meta.id}
          component={TemplateComposition}
          durationInFrames={durationForTemplate(meta.id)}
          fps={30}
          width={meta.compositionWidth}
          height={meta.compositionHeight}
          defaultProps={createDefaultInputProps(meta.id)}
        />
      ))}
    </>
  );
};

export default RemotionRoot;
