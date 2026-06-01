import type { TemplateId } from '../../types';
import type { Beat, SeriesMemory, VoiceProfile } from '../types';
import { mergeWithDefaults } from '../schemas';

function formatEpisode(num: string | number): string {
  const n = Number(num);
  return n < 10 ? `0${n}` : String(n);
}

export function localDraft(
  beats: Beat[],
  memory: SeriesMemory,
  _voice: VoiceProfile,
): Array<{ template: TemplateId; fields: Record<string, unknown> }> {
  const ep = memory.episode;
  const week = memory.facts.weekNumber ?? ep;
  const users = (memory.facts.shadowUsers ?? 23) + 8;
  const respect = (memory.facts.respectTotal ?? 250) + 150;

  return beats.map((beat) => ({
    template: beat.template,
    fields: mergeWithDefaults(beat.template, fillTemplate(beat.template, beat.intent, ep, week, users, respect, memory)),
  }));
}

function fillTemplate(
  template: TemplateId,
  intent: string,
  episode: number,
  week: number,
  users: number,
  respect: number,
  memory: SeriesMemory,
): Record<string, unknown> {
  const loc = String(memory.facts.location ?? 'Hyderabad');

  switch (template) {
    case 'chapter-card':
      return {
        num: `CHAPTER ${formatEpisode(episode)}`,
        titleLine1: 'ENTERING',
        titleLine2: intent.slice(0, 24).toUpperCase() || 'THE GRIND',
        csub: intent,
        badge: loc.toUpperCase(),
      };
    case 'cash-pickup':
      return { amount: 50000, delta: '+₹50,000', label: 'WALLET' };
    case 'mission-failed':
      return { sub: intent, cause: 'DEAL FELL THROUGH', retry: '→ RETRY NEXT WEEK' };
    case 'mission-passed':
      return { sub: intent, resp: `RESPECT +${respect}` };
    case 'weekly-stats':
      return {
        stitle: 'WEEKLY DEBRIEF',
        ssub: `${memory.title} · Week ${formatEpisode(week)}`,
        sweek: `Week ${formatEpisode(week)}\nMain Quest Active`,
        boxes: [
          { label: 'Shadow Users', value: String(users), change: '↑ new pilots' },
          { label: 'RESPECT', value: `+${respect}`, change: '↑ arc progress' },
          { label: 'Missions Done', value: '5 / 7', change: '↑ grinding' },
          { label: 'Cash Earned', value: memory.facts.cashTotal ?? '₹50K', change: '↑ momentum' },
        ],
      };
    case 'subscribe-prompt':
      return { desc: intent, reward: '+1 RESPECT' };
    case 'enter-location':
      return { lname: loc.toUpperCase(), lsub: intent };
    case 'side-quest':
      return { qtitle: intent.slice(0, 40), qdesc: intent };
    case 'countdown':
      return { caption: intent.slice(0, 40) };
    case 'this-or-that':
      return { question: intent.slice(0, 40).toUpperCase() };
    default:
      return { note: intent };
  }
}
