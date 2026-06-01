import type { TokenUsage } from '../types';

export interface SystemBlock {
  text: string;
  cacheBreakpoint?: boolean;
}

export interface LLMCompleteArgs {
  system: string;
  user: string;
  maxTokens: number;
  cacheableSystem?: boolean;
  systemBlocks?: SystemBlock[];
  model?: string;
}

export interface LLMProvider {
  readonly name: 'openai' | 'anthropic' | 'local' | 'mock';
  complete<T>(args: LLMCompleteArgs): Promise<{ data: T; usage: TokenUsage }>;
}
