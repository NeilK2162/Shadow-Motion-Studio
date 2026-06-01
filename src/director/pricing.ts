import type { TokenUsage } from './types';

interface ModelPricing {
  inputPer1M: number;
  outputPer1M: number;
  cachedInputPer1M: number;
}

const PRICING: Record<string, ModelPricing> = {
  'gpt-4o-mini': { inputPer1M: 0.15, outputPer1M: 0.6, cachedInputPer1M: 0.075 },
  'gpt-4o': { inputPer1M: 2.5, outputPer1M: 10, cachedInputPer1M: 1.25 },
  'claude-haiku-4-5-20251001': { inputPer1M: 1, outputPer1M: 5, cachedInputPer1M: 0.1 },
  'claude-sonnet-4-6': { inputPer1M: 3, outputPer1M: 15, cachedInputPer1M: 0.3 },
};

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cachedInputTokens = 0,
): number {
  const p = PRICING[model] ?? PRICING['gpt-4o-mini'];
  const uncachedInput = Math.max(0, inputTokens - cachedInputTokens);
  const inputCost = (uncachedInput / 1_000_000) * p.inputPer1M;
  const cachedCost = (cachedInputTokens / 1_000_000) * p.cachedInputPer1M;
  const outputCost = (outputTokens / 1_000_000) * p.outputPer1M;
  return inputCost + cachedCost + outputCost;
}

export function emptyUsage(): TokenUsage {
  return { inputTokens: 0, outputTokens: 0, cachedInputTokens: 0, estimatedCostUsd: 0 };
}

export function mergeUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cachedInputTokens: a.cachedInputTokens + b.cachedInputTokens,
    estimatedCostUsd: a.estimatedCostUsd + b.estimatedCostUsd,
  };
}
