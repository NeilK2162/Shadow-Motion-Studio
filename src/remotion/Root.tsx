import { Composition } from 'remotion';
import { createDefaultInputProps, DYNAMIC_TEMPLATE_COMPOSITION_ID } from './inputProps';
import { TEMPLATE_META } from '@/types';
import { getDefaultDurationSeconds } from '@/data/templateDefaults';
import { SAMPLE_MISSION_PASSED_DEF } from '@/director/templateSchema';
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
      <Composition
        id={DYNAMIC_TEMPLATE_COMPOSITION_ID}
        component={TemplateComposition}
        durationInFrames={Math.ceil((SAMPLE_MISSION_PASSED_DEF.durationSeconds + 1) * 30)}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={createDefaultInputProps('mission-passed', SAMPLE_MISSION_PASSED_DEF)}
      />
    </>
  );
};

export default RemotionRoot;
