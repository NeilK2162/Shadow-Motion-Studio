import Anthropic from '@anthropic-ai/sdk';
import { MODEL_DEFAULTS } from '../config';
import { estimateCost } from '../pricing';
import type { DirectorSettings } from '../types';
import type { LLMCompleteArgs, LLMProvider } from './types';

const CACHE_TOKEN_FLOOR = 4096;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function warnCacheFloor(blocks: { text: string }[]): void {
  const total = blocks.reduce((sum, b) => sum + estimateTokens(b.text), 0);
  if (total < CACHE_TOKEN_FLOOR) {
    console.warn(
      `[anthropic] Static prompt prefix ~${total} tokens is below ${CACHE_TOKEN_FLOOR} floor; caching may not engage on Haiku 4.5.`,
    );
  }
}

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

    let systemBlocks: Anthropic.Messages.TextBlockParam[];
    if (args.systemBlocks && args.systemBlocks.length > 0) {
      warnCacheFloor(args.systemBlocks);
      systemBlocks = args.systemBlocks.map((block) => {
        const param: Anthropic.Messages.TextBlockParam = { type: 'text', text: block.text };
        if (block.cacheBreakpoint) {
          param.cache_control = { type: 'ephemeral' };
        }
        return param;
      });
    } else if (args.cacheableSystem) {
      systemBlocks = [{ type: 'text', text: args.system, cache_control: { type: 'ephemeral' } }];
    } else {
      systemBlocks = [{ type: 'text', text: args.system }];
    }

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
    const cacheWriteTokens =
      (usage as { cache_creation_input_tokens?: number }).cache_creation_input_tokens ?? 0;

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
        cacheWriteTokens,
        estimatedCostUsd: estimateCost(model, inputTokens, outputTokens, cachedInputTokens, cacheWriteTokens),
      },
    };
  }
}

export function createAnthropicProvider(settings: DirectorSettings): AnthropicProvider {
  if (!settings.apiKey) throw new Error('Anthropic API key required');
  return new AnthropicProvider(settings.apiKey, settings.model);
}

/** Optional pre-warm: writes cache on first authoring call. */
export async function prewarmAnthropicCache(provider: AnthropicProvider, systemBlocks: LLMCompleteArgs['systemBlocks']): Promise<void> {
  if (!systemBlocks?.length) return;
  await provider.complete<{ ok: boolean }>({
    system: systemBlocks.map((b) => b.text).join('\n'),
    systemBlocks,
    user: '{"ok":true}',
    maxTokens: 16,
  });
}
