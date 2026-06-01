import { create } from 'zustand';
import { getDefaultDurationSeconds, getDefaultFields } from '@/data/templateDefaults';
import { createDefaultProject } from '@/remotion/inputProps';
import type { BackgroundMode, Project, TemplateId } from '@/types';
import { builtInThemes, shadowOwnerTheme } from '@/themes/tokens';

interface EditorState {
  project: Project;
  previewBackground: BackgroundMode;
  customBackground: string;
  playerKey: number;
  setTemplate: (template: TemplateId) => void;
  setField: (key: string, value: unknown) => void;
  setFields: (fields: Record<string, unknown>) => void;
  setThemeName: (name: string) => void;
  setGlobalSpeed: (speed: number) => void;
  setDurationInFrames: (frames: number) => void;
  setExportResolution: (resolution: Project['export']['resolution']) => void;
  setExportFps: (fps: 30 | 60) => void;
  setExportFormat: (format: Project['export']['format']) => void;
  setExportTransparent: (transparent: boolean) => void;
  setStripCardBackground: (strip: boolean) => void;
  setPreviewBackground: (mode: BackgroundMode) => void;
  setCustomBackground: (color: string) => void;
  loadProject: (project: Project) => void;
  resetProject: () => void;
  replay: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: createDefaultProject('mission-passed'),
  previewBackground: 'dark',
  customBackground: '#080808',
  playerKey: 0,

  setTemplate: (template) => {
    const durationSeconds = getDefaultDurationSeconds(template);
    const fps = get().project.export.fps;
    set({
      project: {
        ...createDefaultProject(template),
        theme: get().project.theme,
        export: get().project.export,
        animation: {
          globalSpeed: 1,
          durationInFrames: Math.ceil((durationSeconds + 1) * fps),
        },
      },
      playerKey: get().playerKey + 1,
    });
  },

  setField: (key, value) =>
    set((state) => ({
      project: {
        ...state.project,
        fields: { ...state.project.fields, [key]: value },
      },
    })),

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

  setExportResolution: (resolution) =>
    set((state) => ({
      project: { ...state.project, export: { ...state.project.export, resolution } },
    })),

  setExportFps: (fps) =>
    set((state) => {
      const durationSeconds = getDefaultDurationSeconds(state.project.template);
      return {
        project: {
          ...state.project,
          export: { ...state.project.export, fps },
          animation: {
            ...state.project.animation,
            durationInFrames: Math.ceil((durationSeconds + 1) * fps),
          },
        },
      };
    }),

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

  setPreviewBackground: (mode) => set({ previewBackground: mode }),

  setCustomBackground: (color) => set({ customBackground: color }),

  loadProject: (project) =>
    set({
      project: {
        ...project,
        fields: { ...getDefaultFields(project.template), ...project.fields },
      },
      playerKey: get().playerKey + 1,
    }),

  resetProject: () =>
    set((state) => ({
      project: createDefaultProject(state.project.template),
      playerKey: state.playerKey + 1,
    })),

  replay: () => set((state) => ({ playerKey: state.playerKey + 1 })),
}));
