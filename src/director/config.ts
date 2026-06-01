export const MODEL_DEFAULTS = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-haiku-4-5-20251001',
} as const;

export const QUALITY_MODELS = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-6',
} as const;

export const MAX_BEATS = 7;
export const MAX_REPAIR_ATTEMPTS = 2;
export const DEFAULT_SESSION_TOKEN_BUDGET = 50_000;

export const TOKEN_LIMITS = {
  plan: 300,
  draft: 1600,
  repair: 500,
  create: 4096,
  createRepair: 4096,
} as const;
