import type { DirectorSettings } from '../types';
import { createAnthropicProvider } from './anthropic';
import { createMockProvider } from './mock';
import { createOpenAIProvider } from './openai';
import type { LLMProvider } from './types';

export function getProvider(settings: DirectorSettings): LLMProvider | null {
  switch (settings.provider) {
    case 'openai':
      return settings.apiKey ? createOpenAIProvider(settings) : null;
    case 'anthropic':
      return settings.apiKey ? createAnthropicProvider(settings) : null;
    case 'mock':
      return createMockProvider();
    case 'local':
    default:
      return null;
  }
}

export { createMockProvider } from './mock';
export type { LLMProvider } from './types';
