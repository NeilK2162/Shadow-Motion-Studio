export const MODEL_DEFAULTS = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-haiku-20241022',
} as const;

export const MAX_BEATS = 7;
export const MAX_REPAIR_ATTEMPTS = 2;
export const DEFAULT_SESSION_TOKEN_BUDGET = 50_000;

export const TOKEN_LIMITS = {
  plan: 300,
  draft: 1600,
  repair: 500,
} as const;
