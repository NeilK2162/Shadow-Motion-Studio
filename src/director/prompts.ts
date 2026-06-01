import { serializeRegistry } from './registry';
import type { DirectorFormatTarget, VoiceProfile } from './types';

export const PLANNER_SYSTEM = `You are The Director, a motion-graphics show-runner for a creator's video series.
Given a video concept, choose 3 to 7 narrative beats from the template registry.
Each beat = one template id + a one-line intent.
Open with chapter-card if the concept implies a new episode/section.
End with subscribe-prompt only for YouTube concepts.
Maintain series continuity using the provided SERIES CONTEXT.
Match the creator's VOICE.
Output ONLY JSON: { "beats": [{ "template": "<id>", "intent": "<line>" }] }
Use only ids from the registry. No prose. No markdown.

TEMPLATE REGISTRY:
${serializeRegistry()}`;

export const DRAFTER_SYSTEM = `You are The Director's copywriter. For each beat, fill every field of its template
schema with on-brand copy. Respect field types exactly (strings, numbers, arrays).
Keep continuity numbers consistent with SERIES CONTEXT (grow users, increase RESPECT).
Use ₹ for currency. Keep lines short and punchy. Match VOICE.
Output ONLY a JSON array of { "template", "fields" }. No prose. No markdown.`;

export function buildPlannerUser(
  concept: string,
  voice: VoiceProfile,
  seriesContext: string,
  formatTarget: DirectorFormatTarget,
): string {
  return `VOICE: ${voice.description}
${seriesContext}
CONCEPT: ${concept}
FORMAT TARGET: ${formatTarget}`;
}

export function buildDrafterUser(
  beats: unknown,
  voice: VoiceProfile,
  seriesContext: string,
  schemasText: string,
): string {
  return `VOICE: ${voice.description}
${seriesContext}
BEATS: ${JSON.stringify(beats)}
SCHEMAS (only the selected templates):
${schemasText}`;
}

export function buildRepairUser(
  errors: unknown,
  invalidEntries: unknown,
  schemasText: string,
): string {
  return `The following generated entries failed validation. Fix ONLY these.
ERRORS: ${JSON.stringify(errors)}
INVALID ENTRIES: ${JSON.stringify(invalidEntries)}
SCHEMAS: ${schemasText}
Output ONLY the corrected JSON array.`;
}
