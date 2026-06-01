import { emptyUsage } from '../pricing';
import type { DirectorPlan, TokenUsage } from '../types';
import type { LLMCompleteArgs, LLMProvider } from './types';

const MOCK_PLAN: DirectorPlan = {
  beats: [
    { template: 'chapter-card', intent: 'Open episode 4' },
    { template: 'cash-pickup', intent: '₹50K first client closed' },
    { template: 'mission-failed', intent: 'Bigger deal fell through' },
    { template: 'weekly-stats', intent: 'Week 4 recap' },
    { template: 'subscribe-prompt', intent: 'Follow the arc' },
  ],
};

const MOCK_DRAFT = MOCK_PLAN.beats.map((beat) => ({
  template: beat.template,
  fields: mockFieldsFor(beat.template, beat.intent),
}));

function mockFieldsFor(template: string, intent: string): Record<string, unknown> {
  const base: Record<string, Record<string, unknown>> = {
    'chapter-card': { num: 'CHAPTER 04', titleLine1: 'ENTERING', titleLine2: 'THE GRIND', csub: intent, badge: 'HYDERABAD' },
    'cash-pickup': { amount: 50000, delta: '+₹50,000', label: 'WALLET' },
    'mission-failed': { titleMain: 'FAILED', sub: intent, cause: 'DEAL FELL THROUGH', retry: '→ RETRY NEXT WEEK' },
    'weekly-stats': {
      stitle: 'WEEKLY DEBRIEF',
      ssub: 'Hyderabad Arc · Week 04',
      sweek: 'Week 04\nMain Quest Active',
      boxes: [
        { label: 'Shadow Users', value: '31', change: '↑ +8 new pilots' },
        { label: 'Cash Earned', value: '₹50K', change: '↑ First client closed' },
      ],
      bars: [{ label: 'Hustle', pct: 72 }],
      stars: 4,
    },
    'subscribe-prompt': { headline: 'NEW OBJECTIVE', action: 'SUBSCRIBE', desc: intent, reward: '+1 RESPECT', cta: 'TAP THE BELL' },
  };
  return base[template] ?? { note: intent };
}

export class MockProvider implements LLMProvider {
  readonly name = 'mock' as const;
  private callCount = 0;

  async complete<T>(args: LLMCompleteArgs): Promise<{ data: T; usage: TokenUsage }> {
    this.callCount += 1;
    const user = args.user.toLowerCase();

    if (user.includes('errors') || user.includes('fix only')) {
      const repaired = MOCK_DRAFT.map((d) => ({ ...d, fields: { ...d.fields } }));
      return { data: repaired as T, usage: emptyUsage() };
    }

    const isPlanCall =
      args.maxTokens <= 300 && !user.includes('schemas') && !user.includes('invalid entries');

    if (isPlanCall) {
      return { data: MOCK_PLAN as T, usage: emptyUsage() };
    }

    return { data: MOCK_DRAFT as T, usage: emptyUsage() };
  }
}

export function createMockProvider(): MockProvider {
  return new MockProvider();
}
