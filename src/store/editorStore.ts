import { create } from 'zustand';
import { getDefaultDurationSeconds, getDefaultFields } from '@/data/templateDefaults';
import type { TemplateDefinition } from '@/director/templateSchema';
import { fieldsFromDef } from '@/director/templateUtils';
import { getDefaultPlacement } from '@/components/templates/shared/cardLayout';
import { getFormat, PLATFORM_EXPORT_PRESETS, type FormatId } from '@/lib/formats';
import type { Placement } from '@/lib/placement';
import { createDefaultProject } from '@/remotion/inputProps';
import type { BackgroundMode, Project, TemplateId } from '@/types';
import { builtInThemes, shadowOwnerTheme } from '@/themes/tokens';

interface EditorState {
  project: Project;
  previewBackground: BackgroundMode;
  customBackground: string;
  playerKey: number;
  showSafeAreaGuides: boolean;
  platformFilter: 'all' | 'youtube' | 'reels' | 'feed';
  setTemplate: (template: TemplateId) => void;
  loadCustomTemplate: (def: TemplateDefinition) => void;
  setField: (key: string, value: unknown) => void;
  setFields: (fields: Record<string, unknown>) => void;
  setThemeName: (name: string) => void;
  setGlobalSpeed: (speed: number) => void;
  setDurationInFrames: (frames: number) => void;
  setFormat: (formatId: FormatId) => void;
  setPlacement: (placement: Placement) => void;
  setExportResolution: (resolution: Project['export']['resolution']) => void;
  setExportFps: (fps: 30 | 60) => void;
  setExportFormat: (format: Project['export']['format']) => void;
  setExportTransparent: (transparent: boolean) => void;
  setStripCardBackground: (strip: boolean) => void;
  applyPlatformExportPreset: (presetId: string) => void;
  setPreviewBackground: (mode: BackgroundMode) => void;
  setCustomBackground: (color: string) => void;
  setShowSafeAreaGuides: (show: boolean) => void;
  setPlatformFilter: (filter: 'all' | 'youtube' | 'reels' | 'feed') => void;
  loadProject: (project: Project) => void;
  resetProject: () => void;
  replay: () => void;
}

function durationFrames(template: string, fields: Record<string, unknown>, fps: number, templateDef?: TemplateDefinition): number {
  if (templateDef) {
    return Math.ceil((templateDef.durationSeconds + 1) * fps);
  }
  return Math.ceil((getDefaultDurationSeconds(template as TemplateId, fields) + 1) * fps);
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: createDefaultProject('mission-passed'),
  previewBackground: 'dark',
  customBackground: '#080808',
  playerKey: 0,
  showSafeAreaGuides: true,
  platformFilter: 'all',

  setTemplate: (template) => {
    const fps = get().project.export.fps;
    const fields = getDefaultFields(template);
    set({
      project: {
        ...createDefaultProject(template),
        templateDef: undefined,
        theme: get().project.theme,
        export: {
          ...get().project.export,
          formatId: get().project.export.formatId ?? 'youtube-landscape',
        },
        placement: getDefaultPlacement(template),
        animation: {
          globalSpeed: 1,
          durationInFrames: durationFrames(template, fields, fps),
        },
      },
      playerKey: get().playerKey + 1,
    });
  },

  loadCustomTemplate: (def) => {
    const fps = get().project.export.fps;
    set({
      project: {
        ...createDefaultProject(def.id, def),
        theme: get().project.theme,
        export: {
          ...get().project.export,
          formatId: get().project.export.formatId ?? 'youtube-landscape',
        },
        animation: {
          globalSpeed: 1,
          durationInFrames: durationFrames(def.id, fieldsFromDef(def), fps, def),
        },
      },
      playerKey: get().playerKey + 1,
    });
  },

  setField: (key, value) =>
    set((state) => {
      const fields = { ...state.project.fields, [key]: value };
      const durationInFrames =
        key === 'from' && state.project.template === 'countdown'
          ? durationFrames('countdown', fields, state.project.export.fps)
          : state.project.animation.durationInFrames;
      return {
        project: {
          ...state.project,
          fields,
          animation: { ...state.project.animation, durationInFrames },
        },
      };
    }),

  setFields: (fields) =>
    set((state) => ({
      project: { ...state.project, fields },
    })),

  setThemeName: (name) =>
    set((state) => ({
      project: {
        ...state.project,
        theme: { ...(builtInThemes[name] ?? shadowOwnerTheme) },
      },
    })),

  setGlobalSpeed: (speed) =>
    set((state) => ({
      project: {
        ...state.project,
        animation: { ...state.project.animation, globalSpeed: speed },
      },
    })),

  setDurationInFrames: (frames) =>
    set((state) => ({
      project: {
        ...state.project,
        animation: { ...state.project.animation, durationInFrames: frames },
      },
    })),

  setFormat: (formatId) => {
    const format = getFormat(formatId);
    set((state) => ({
      project: {
        ...state.project,
        export: {
          ...state.project.export,
          formatId,
          resolution: format.resolution,
        },
      },
      playerKey: state.playerKey + 1,
    }));
  },

  setPlacement: (placement) =>
    set((state) => ({
      project: { ...state.project, placement },
      playerKey: state.playerKey + 1,
    })),

  setExportResolution: (resolution) =>
    set((state) => ({
      project: { ...state.project, export: { ...state.project.export, resolution } },
      playerKey: state.playerKey + 1,
    })),

  setExportFps: (fps) =>
    set((state) => ({
      project: {
        ...state.project,
        export: { ...state.project.export, fps },
        animation: {
          ...state.project.animation,
          durationInFrames: durationFrames(state.project.template, state.project.fields, fps),
        },
      },
    })),

  setExportFormat: (format) =>
    set((state) => ({
      project: { ...state.project, export: { ...state.project.export, format } },
    })),

  setExportTransparent: (transparent) =>
    set((state) => ({
      project: { ...state.project, export: { ...state.project.export, transparent } },
    })),

  setStripCardBackground: (strip) =>
    set((state) => ({
      project: { ...state.project, export: { ...state.project.export, stripCardBackground: strip } },
    })),

  applyPlatformExportPreset: (presetId) => {
    const preset = PLATFORM_EXPORT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const format = getFormat(preset.formatId);
    set((state) => ({
      project: {
        ...state.project,
        export: {
          ...state.project.export,
          formatId: preset.formatId,
          resolution: format.resolution,
          fps: preset.fps,
          format: preset.format,
          transparent: preset.transparent,
        },
      },
      playerKey: state.playerKey + 1,
    }));
  },

  setPreviewBackground: (mode) => set({ previewBackground: mode }),

  setCustomBackground: (color) => set({ customBackground: color }),

  setShowSafeAreaGuides: (show) => set({ showSafeAreaGuides: show }),

  setPlatformFilter: (filter) => set({ platformFilter: filter }),

  loadProject: (project) => {
    const template = project.template;
    const baseFields = project.templateDef ? fieldsFromDef(project.templateDef) : getDefaultFields(template as TemplateId);
    const placement =
      project.placement ??
      project.templateDef?.defaultPlacement ??
      (project.templateDef ? 'center' : getDefaultPlacement(template as TemplateId));
    set({
      project: {
        ...project,
        fields: { ...baseFields, ...project.fields },
        placement,
        export: {
          ...(project.templateDef ? createDefaultProject(project.templateDef.id, project.templateDef).export : createDefaultProject(template as TemplateId).export),
          ...project.export,
        },
      },
      playerKey: get().playerKey + 1,
    });
  },

  resetProject: () =>
    set((state) => ({
      project: state.project.templateDef
        ? createDefaultProject(state.project.templateDef.id, state.project.templateDef)
        : createDefaultProject(state.project.template as TemplateId),
      playerKey: state.playerKey + 1,
    })),

  replay: () => set((state) => ({ playerKey: state.playerKey + 1 })),
}));
