import { getDefaultDurationSeconds, getDefaultFields } from '@/data/templateDefaults';
import type { Project, TemplateId } from '@/types';
import type { ThemeTokens } from '@/themes/tokens';
import { shadowOwnerTheme } from '@/themes/tokens';

export interface CompositionInputProps extends Record<string, unknown> {
  templateId: TemplateId;
  fields: Record<string, unknown>;
  theme: ThemeTokens;
  globalSpeed: number;
  stripCardBackground: boolean;
  backgroundMode: 'dark' | 'transparent' | 'custom';
  customBackground: string;
  resolution: Project['export']['resolution'];
}

export function projectToInputProps(project: Project): CompositionInputProps {
  return {
    templateId: project.template,
    fields: project.fields,
    theme: project.theme,
    globalSpeed: project.animation.globalSpeed,
    stripCardBackground: project.export.stripCardBackground ?? false,
    backgroundMode: project.export.transparent ? 'transparent' : 'dark',
    customBackground: '#080808',
    resolution: project.export.resolution,
  };
}

export function createDefaultInputProps(template: TemplateId): CompositionInputProps {
  return {
    templateId: template,
    fields: getDefaultFields(template),
    theme: { ...shadowOwnerTheme },
    globalSpeed: 1,
    stripCardBackground: false,
    backgroundMode: 'dark',
    customBackground: '#080808',
    resolution: '1920x1080',
  };
}

export const DEFAULT_COMPOSITION_PROPS = createDefaultInputProps('mission-passed');

export function createDefaultProject(template: TemplateId): Project {
  const durationSeconds = getDefaultDurationSeconds(template);
  const fps = 30;
  return {
    template,
    fields: getDefaultFields(template),
    theme: { ...shadowOwnerTheme },
    animation: {
      globalSpeed: 1,
      durationInFrames: Math.ceil((durationSeconds + 1) * fps),
    },
    export: {
      resolution: '1920x1080',
      fps: 30,
      format: 'webm',
      transparent: true,
      stripCardBackground: false,
    },
  };
}
