import Anthropic from '@anthropic-ai/sdk';
import { MODEL_DEFAULTS } from '../config';
import { estimateCost } from '../pricing';
import type { DirectorSettings } from '../types';
import type { LLMCompleteArgs, LLMProvider } from './types';

export class AnthropicProvider implements LLMProvider {
  readonly name = 'anthropic' as const;
  private client: Anthropic;
  private defaultModel: string;

  constructor(apiKey: string, model?: string) {
    this.client = new Anthropic({ apiKey });
    this.defaultModel = model ?? MODEL_DEFAULTS.anthropic;
  }

  async complete<T>(args: LLMCompleteArgs): Promise<{ data: T; usage: import('../types').TokenUsage }> {
    const model = args.model ?? this.defaultModel;
    const systemBlocks: Anthropic.Messages.TextBlockParam[] = args.cacheableSystem
      ? [{ type: 'text', text: args.system, cache_control: { type: 'ephemeral' } }]
      : [{ type: 'text', text: args.system }];

    const response = await this.client.messages.create({
      model,
      max_tokens: args.maxTokens,
      system: systemBlocks,
      messages: [{ role: 'user', content: args.user }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const text = textBlock && 'text' in textBlock ? textBlock.text : '{}';
    const usage = response.usage;
    const inputTokens = usage.input_tokens;
    const outputTokens = usage.output_tokens;
    const cachedInputTokens =
      (usage as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0;

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
        estimatedCostUsd: estimateCost(model, inputTokens, outputTokens, cachedInputTokens),
      },
    };
  }
}

export function createAnthropicProvider(settings: DirectorSettings): AnthropicProvider {
  if (!settings.apiKey) throw new Error('Anthropic API key required');
  return new AnthropicProvider(settings.apiKey, settings.model);
}
