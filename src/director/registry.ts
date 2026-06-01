import { TEMPLATE_META } from '../types';
import type { TemplateId } from '../types';

export interface RegistryEntry {
  id: TemplateId;
  group: string;
  purpose: string;
}

const PURPOSES: Record<TemplateId, string> = {
  'mission-passed': 'Celebrate a win or milestone',
  'mission-failed': 'Show a setback or loss',
  'chapter-card': 'Open a new episode or chapter',
  'loading-screen': 'Transition with loading bar and tip',
  'side-quest': 'Introduce a new opportunity or task',
  'enter-location': 'Announce entering a new place',
  'phone-call': 'Incoming call from client or contact',
  'cheat-code': 'Unlock or activate a power-up',
  'weekly-stats': 'Recap weekly numbers and progress',
  'wanted-level': 'Show heat or attention level',
  'cash-pickup': 'Money earned or wallet update',
  'status-hud': 'Health/armor/energy style bars',
  'gps-route': 'Set next destination or goal',
  'character-intro': 'Introduce a person or persona',
  'now-playing': 'Music or vibe overlay',
  wasted: 'Dramatic failure or streak break',
  'subscribe-prompt': 'CTA to subscribe or follow',
  countdown: 'Count down to an event',
  'this-or-that': 'Poll or A/B engagement card',
};

export const COMPACT_REGISTRY: RegistryEntry[] = TEMPLATE_META.map((t) => ({
  id: t.id,
  group: t.group,
  purpose: PURPOSES[t.id],
}));

export function serializeRegistry(): string {
  return COMPACT_REGISTRY.map((e) => `${e.id} (${e.group}): ${e.purpose}`).join('\n');
}
