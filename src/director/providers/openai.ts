import OpenAI from 'openai';
import { MODEL_DEFAULTS } from '../config';
import { estimateCost } from '../pricing';
import type { DirectorSettings } from '../types';
import type { LLMCompleteArgs, LLMProvider } from './types';

export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai' as const;
  private client: OpenAI;
  private defaultModel: string;

  constructor(apiKey: string, model?: string) {
    this.client = new OpenAI({ apiKey });
    this.defaultModel = model ?? MODEL_DEFAULTS.openai;
  }

  async complete<T>(args: LLMCompleteArgs): Promise<{ data: T; usage: import('../types').TokenUsage }> {
    const model = args.model ?? this.defaultModel;
    const response = await this.client.chat.completions.create({
      model,
      max_tokens: args.maxTokens,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: args.system },
        { role: 'user', content: args.user },
      ],
    });

    const text = response.choices[0]?.message?.content ?? '{}';
    const usage = response.usage;
    const inputTokens = usage?.prompt_tokens ?? 0;
    const outputTokens = usage?.completion_tokens ?? 0;
    const cachedInputTokens =
      (usage as { prompt_tokens_details?: { cached_tokens?: number } })?.prompt_tokens_details?.cached_tokens ?? 0;

    let data: T;
    try {
      data = JSON.parse(text) as T;
    } catch {
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      data = JSON.parse(match?.[0] ?? '{}') as T;
    }

    return {
      data,
      usage: {
        inputTokens,
        outputTokens,
        cachedInputTokens,
        cacheWriteTokens: 0,
        estimatedCostUsd: estimateCost(model, inputTokens, outputTokens, cachedInputTokens, 0),
      },
    };
  }
}

export function createOpenAIProvider(settings: DirectorSettings): OpenAIProvider {
  if (!settings.apiKey) throw new Error('OpenAI API key required');
  return new OpenAIProvider(settings.apiKey, settings.model);
}
