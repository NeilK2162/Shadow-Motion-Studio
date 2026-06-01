import type { TokenUsage } from '../types';

export interface LLMCompleteArgs {
  system: string;
  user: string;
  maxTokens: number;
  cacheableSystem?: boolean;
  model?: string;
}

export interface LLMProvider {
  readonly name: 'openai' | 'anthropic' | 'local' | 'mock';
  complete<T>(args: LLMCompleteArgs): Promise<{ data: T; usage: TokenUsage }>;
}
