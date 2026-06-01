import { getDefaultDurationSeconds, getDefaultFields } from '@/data/templateDefaults';
import { fieldsFromDef } from '@/director/templateUtils';
import type { TemplateDefinition } from '@/director/templateSchema';
import { resolutionToFormatId, type FormatId } from '@/lib/formats';
import { getDefaultPlacement } from '@/components/templates/shared/cardLayout';
import type { Placement } from '@/lib/placement';
import type { Project, TemplateId } from '@/types';
import type { ThemeTokens } from '@/themes/tokens';
import { shadowOwnerTheme } from '@/themes/tokens';

export interface CompositionInputProps extends Record<string, unknown> {
  templateId: string;
  templateDef?: TemplateDefinition;
  fields: Record<string, unknown>;
  theme: ThemeTokens;
  globalSpeed: number;
  stripCardBackground: boolean;
  backgroundMode: 'dark' | 'transparent' | 'custom';
  customBackground: string;
  resolution: Project['export']['resolution'];
  formatId: FormatId;
  placement: Placement;
  showSafeAreaGuides?: boolean;
}

function isBuiltInTemplate(template: string): template is TemplateId {
  return [
    'mission-passed',
    'mission-failed',
    'chapter-card',
    'loading-screen',
    'side-quest',
    'enter-location',
    'phone-call',
    'cheat-code',
    'weekly-stats',
    'wanted-level',
    'cash-pickup',
    'status-hud',
    'gps-route',
    'character-intro',
    'now-playing',
    'wasted',
    'subscribe-prompt',
    'countdown',
    'this-or-that',
  ].includes(template);
}

export function projectToInputProps(project: Project): CompositionInputProps {
  const formatId = project.export.formatId ?? resolutionToFormatId(project.export.resolution);
  const placement =
    project.placement ??
    (project.templateDef?.defaultPlacement ?? (isBuiltInTemplate(project.template) ? getDefaultPlacement(project.template) : 'center'));

  return {
    templateId: project.template,
    templateDef: project.templateDef,
    fields: project.fields,
    theme: project.theme,
    globalSpeed: project.animation.globalSpeed,
    stripCardBackground: project.export.stripCardBackground ?? false,
    backgroundMode: project.export.transparent ? 'transparent' : 'dark',
    customBackground: '#080808',
    resolution: project.export.resolution,
    formatId,
    placement,
    showSafeAreaGuides: false,
  };
}

export function createDefaultInputProps(template: TemplateId, templateDef?: TemplateDefinition): CompositionInputProps {
  if (templateDef) {
    return {
      templateId: templateDef.id,
      templateDef,
      fields: fieldsFromDef(templateDef),
      theme: { ...shadowOwnerTheme },
      globalSpeed: 1,
      stripCardBackground: false,
      backgroundMode: 'dark',
      customBackground: '#080808',
      resolution: '1920x1080',
      formatId: 'youtube-landscape',
      placement: templateDef.defaultPlacement,
      showSafeAreaGuides: false,
    };
  }

  return {
    templateId: template,
    fields: getDefaultFields(template),
    theme: { ...shadowOwnerTheme },
    globalSpeed: 1,
    stripCardBackground: false,
    backgroundMode: 'dark',
    customBackground: '#080808',
    resolution: '1920x1080',
    formatId: 'youtube-landscape',
    placement: getDefaultPlacement(template),
    showSafeAreaGuides: false,
  };
}

export const DEFAULT_COMPOSITION_PROPS = createDefaultInputProps('mission-passed');

export function createDefaultProject(template: TemplateId): Project;
export function createDefaultProject(template: string, templateDef: TemplateDefinition): Project;
export function createDefaultProject(template: string, templateDef?: TemplateDefinition): Project {
  if (templateDef) {
    const fps = 30;
    const durationSeconds = templateDef.durationSeconds;
    return {
      template: templateDef.id,
      templateDef,
      fields: fieldsFromDef(templateDef),
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
        formatId: 'youtube-landscape',
      },
      placement: templateDef.defaultPlacement,
    };
  }

  const builtIn = template as TemplateId;
  const durationSeconds = getDefaultDurationSeconds(builtIn);
  const fps = 30;
  return {
    template: builtIn,
    fields: getDefaultFields(builtIn),
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
      formatId: 'youtube-landscape',
    },
    placement: getDefaultPlacement(builtIn),
  };
}

export const DYNAMIC_TEMPLATE_COMPOSITION_ID = 'dynamic-template';
