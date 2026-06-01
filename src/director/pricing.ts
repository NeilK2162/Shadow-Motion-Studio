import type { TokenUsage } from './types';

interface ModelPricing {
  inputPer1M: number;
  outputPer1M: number;
  cachedInputPer1M: number;
  cacheWritePer1M?: number;
}

const PRICING: Record<string, ModelPricing> = {
  'gpt-4o-mini': { inputPer1M: 0.15, outputPer1M: 0.6, cachedInputPer1M: 0.075, cacheWritePer1M: 0.1875 },
  'gpt-4o': { inputPer1M: 2.5, outputPer1M: 10, cachedInputPer1M: 1.25, cacheWritePer1M: 3.125 },
  'claude-haiku-4-5-20251001': { inputPer1M: 1, outputPer1M: 5, cachedInputPer1M: 0.1, cacheWritePer1M: 1.25 },
  'claude-sonnet-4-6': { inputPer1M: 3, outputPer1M: 15, cachedInputPer1M: 0.3, cacheWritePer1M: 3.75 },
};

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cachedInputTokens = 0,
  cacheWriteTokens = 0,
): number {
  const p = PRICING[model] ?? PRICING['gpt-4o-mini'];
  const freshInput = Math.max(0, inputTokens - cachedInputTokens - cacheWriteTokens);
  const inputCost = (freshInput / 1_000_000) * p.inputPer1M;
  const cachedCost = (cachedInputTokens / 1_000_000) * p.cachedInputPer1M;
  const writeCost = (cacheWriteTokens / 1_000_000) * (p.cacheWritePer1M ?? p.inputPer1M * 1.25);
  const outputCost = (outputTokens / 1_000_000) * p.outputPer1M;
  return inputCost + cachedCost + writeCost + outputCost;
}

export function emptyUsage(): TokenUsage {
  return { inputTokens: 0, outputTokens: 0, cachedInputTokens: 0, cacheWriteTokens: 0, estimatedCostUsd: 0 };
}

export function mergeUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cachedInputTokens: a.cachedInputTokens + b.cachedInputTokens,
    cacheWriteTokens: a.cacheWriteTokens + b.cacheWriteTokens,
    estimatedCostUsd: a.estimatedCostUsd + b.estimatedCostUsd,
  };
}
