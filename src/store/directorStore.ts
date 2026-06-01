import { create } from 'zustand';
import type {
  DirectorPack,
  DirectorSettings,
  GenerateRequest,
  SeriesMemory,
  TokenUsage,
  VoiceProfile,
} from '@/director/types';
import { emptyUsage } from '@/director/pricing';

export type DirectorStatus = 'idle' | 'generating' | 'review' | 'rendering' | 'done' | 'error' | 'budget_paused';

interface DirectorState {
  panelOpen: boolean;
  concept: string;
  formatTarget: GenerateRequest['formatTarget'];
  dryRun: boolean;
  seriesId: string;
  settings: Partial<DirectorSettings> & { hasKey?: boolean };
  seriesList: SeriesMemory[];
  voices: VoiceProfile[];
  currentPack: DirectorPack | null;
  sessionUsage: TokenUsage;
  status: DirectorStatus;
  statusMessage: string;
  setPanelOpen: (open: boolean) => void;
  setConcept: (concept: string) => void;
  setFormatTarget: (target: GenerateRequest['formatTarget']) => void;
  setDryRun: (dryRun: boolean) => void;
  setSeriesId: (id: string) => void;
  setSettings: (settings: Partial<DirectorSettings> & { hasKey?: boolean }) => void;
  setSeriesList: (list: SeriesMemory[]) => void;
  setVoices: (voices: VoiceProfile[]) => void;
  setCurrentPack: (pack: DirectorPack | null) => void;
  setSessionUsage: (usage: TokenUsage) => void;
  setStatus: (status: DirectorStatus, message?: string) => void;
  updateAssetFields: (index: number, fields: Record<string, unknown>) => void;
}

export const useDirectorStore = create<DirectorState>((set) => ({
  panelOpen: false,
  concept: '',
  formatTarget: 'both',
  dryRun: true,
  seriesId: 'untitled',
  settings: { provider: 'local', dryRunDefault: true, sessionTokenBudget: 50_000 },
  seriesList: [],
  voices: [],
  currentPack: null,
  sessionUsage: emptyUsage(),
  status: 'idle',
  statusMessage: '',

  setPanelOpen: (open) => set({ panelOpen: open }),
  setConcept: (concept) => set({ concept }),
  setFormatTarget: (formatTarget) => set({ formatTarget }),
  setDryRun: (dryRun) => set({ dryRun }),
  setSeriesId: (seriesId) => set({ seriesId }),
  setSettings: (settings) => set((s) => ({ settings: { ...s.settings, ...settings } })),
  setSeriesList: (seriesList) => set({ seriesList }),
  setVoices: (voices) => set({ voices }),
  setCurrentPack: (currentPack) => set({ currentPack }),
  setSessionUsage: (sessionUsage) => set({ sessionUsage }),
  setStatus: (status, statusMessage = '') => set({ status, statusMessage }),
  updateAssetFields: (index, fields) =>
    set((state) => {
      if (!state.currentPack) return state;
      const assets = [...state.currentPack.assets];
      assets[index] = { ...assets[index], fields: { ...assets[index].fields, ...fields } };
      return { currentPack: { ...state.currentPack, assets } };
    }),
}));
