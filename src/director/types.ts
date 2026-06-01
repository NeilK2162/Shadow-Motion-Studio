import type { FormatId } from '../lib/formats';
import type { ExportConfig, TemplateId } from '../types';

export type DirectorProvider = 'openai' | 'anthropic' | 'local' | 'mock';

export type DirectorFormatTarget = 'youtube' | 'shorts' | 'both';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  estimatedCostUsd: number;
}

export interface StepUsage {
  step: 'plan' | 'draft' | 'repair';
  usage: TokenUsage;
}

export interface Beat {
  template: TemplateId;
  intent: string;
}

export interface DirectorPlan {
  beats: Beat[];
  reasoning?: string;
}

export interface GeneratedAsset {
  template: TemplateId;
  fields: Record<string, unknown>;
  formatId?: FormatId;
  export?: Partial<ExportConfig>;
  valid: boolean;
  errors?: string[];
}

export interface DirectorPack {
  seriesId: string;
  episode: number;
  concept: string;
  plan: DirectorPlan;
  assets: GeneratedAsset[];
  usage: TokenUsage;
  stepUsage: StepUsage[];
  formatTarget: DirectorFormatTarget;
  createdAt: string;
}

export interface DirectorSettings {
  provider: DirectorProvider;
  apiKey?: string;
  model?: string;
  qualityMode: boolean;
  sessionTokenBudget: number;
  dryRunDefault: boolean;
}

export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  examples?: string[];
}

export interface SeriesMemory {
  seriesId: string;
  title: string;
  episode: number;
  voiceProfileId: string;
  facts: {
    shadowUsers?: number;
    respectTotal?: number;
    cashTotal?: string;
    lastMilestone?: string;
    weekNumber?: number;
    location?: string;
    [key: string]: unknown;
  };
  history: Array<{
    episode: number;
    summary: string;
    date: string;
  }>;
}

export interface GenerateRequest {
  concept: string;
  formatTarget: DirectorFormatTarget;
  seriesId?: string;
  dryRun?: boolean;
}

export interface GenerateResult {
  pack: DirectorPack;
  budgetExceeded?: boolean;
}

export const DEFAULT_DIRECTOR_SETTINGS: DirectorSettings = {
  provider: 'local',
  qualityMode: false,
  sessionTokenBudget: 50_000,
  dryRunDefault: true,
};

export const DEFAULT_VOICE: VoiceProfile = {
  id: 'hustle',
  name: 'Hustle',
  description:
    'Confident, slightly witty, GTA-flavored. Short punchy lines. Indian creator voice. Uses ₹ for money. Never corporate. Never cringe.',
};
