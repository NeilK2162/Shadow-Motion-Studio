import type { TemplateId } from '../../types';
import type { Beat, DirectorFormatTarget, DirectorPlan, SeriesMemory } from '../types';

interface Rule {
  keywords: string[];
  template: TemplateId;
  priority: number;
}

const RULES: Rule[] = [
  { keywords: ['recap', 'week', 'weekly', 'debrief', 'stats'], template: 'weekly-stats', priority: 10 },
  { keywords: ['closed', 'client', '₹', 'rs', 'paid', 'cash', 'earned', 'wallet'], template: 'cash-pickup', priority: 9 },
  { keywords: ['failed', 'fell through', 'lost', 'rejected', 'dark', 'ghosted'], template: 'mission-failed', priority: 9 },
  { keywords: ['passed', 'won', 'closed deal', 'milestone', 'success'], template: 'mission-passed', priority: 8 },
  { keywords: ['wasted', 'streak', 'dead'], template: 'wasted', priority: 8 },
  { keywords: ['subscribe', 'follow', 'bell', 'crew'], template: 'subscribe-prompt', priority: 7 },
  { keywords: ['countdown', 'starts in', 'ready'], template: 'countdown', priority: 7 },
  { keywords: ['poll', 'which', 'or', 'vote', 'comment a or b'], template: 'this-or-that', priority: 6 },
  { keywords: ['quest', 'opportunity', 'side'], template: 'side-quest', priority: 6 },
  { keywords: ['location', 'entering', 'arrived', 'banjara', 'hyderabad'], template: 'enter-location', priority: 5 },
  { keywords: ['call', 'phone', 'incoming'], template: 'phone-call', priority: 5 },
  { keywords: ['cheat', 'unlock', 'activated'], template: 'cheat-code', priority: 5 },
  { keywords: ['wanted', 'heat', 'stars'], template: 'wanted-level', priority: 4 },
  { keywords: ['route', 'gps', 'destination', 'next goal'], template: 'gps-route', priority: 4 },
  { keywords: ['introducing', 'meet', 'character'], template: 'character-intro', priority: 4 },
  { keywords: ['playing', 'music', 'track', 'fm'], template: 'now-playing', priority: 3 },
  { keywords: ['loading', 'transition'], template: 'loading-screen', priority: 3 },
  { keywords: ['status', 'health', 'energy', 'armor', 'hud'], template: 'status-hud', priority: 3 },
];

function matches(concept: string, keywords: string[]): boolean {
  const lower = concept.toLowerCase();
  return keywords.some((k) => lower.includes(k.toLowerCase()));
}

export function localPlan(concept: string, formatTarget: DirectorFormatTarget, memory: SeriesMemory): DirectorPlan {
  const beats: Beat[] = [];
  const lower = concept.toLowerCase();

  const openEpisode =
    lower.includes('episode') || lower.includes('chapter') || lower.includes('arc') || lower.includes('entering');
  if (openEpisode) {
    beats.push({
      template: 'chapter-card',
      intent: `Open episode ${memory.episode}`,
    });
  }

  const scored = RULES.map((rule) => ({
    rule,
    score: matches(concept, rule.keywords) ? rule.priority : 0,
  }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const used = new Set<TemplateId>(beats.map((b) => b.template));

  for (const { rule } of scored) {
    if (used.has(rule.template)) continue;
    beats.push({
      template: rule.template,
      intent: concept.slice(0, 80),
    });
    used.add(rule.template);
    if (beats.length >= 6) break;
  }

  if (beats.length < 3) {
    if (!used.has('weekly-stats')) beats.push({ template: 'weekly-stats', intent: 'Recap progress' });
    if (!used.has('mission-passed') && beats.length < 3)
      beats.push({ template: 'mission-passed', intent: 'Highlight a win' });
  }

  if (
    (formatTarget === 'youtube' || formatTarget === 'both') &&
    !used.has('subscribe-prompt') &&
    beats.length < 7
  ) {
    beats.push({ template: 'subscribe-prompt', intent: 'Follow the arc' });
  }

  return { beats: beats.slice(0, 7) };
}
