import { serializeRegistry } from './registry';
import type { DirectorFormatTarget, VoiceProfile } from './types';

export const PLANNER_SYSTEM = `You are The Director, a motion-graphics show-runner for a creator's video series.
Given a video concept, choose 3 to 7 narrative beats.
Each beat = one template + a one-line intent + mode reuse or create.

For each beat:
- mode "reuse" + template id from the built-in registry when an existing template fits well
- mode "create" + customName when NO built-in fits the beat (unique visual need)
Do NOT create duplicates of existing built-in purposes. Prefer reuse when possible.

Open with chapter-card if the concept implies a new episode/section.
End with subscribe-prompt only for YouTube concepts.
Maintain series continuity using SERIES CONTEXT. Match VOICE.

Output ONLY raw JSON on one line if possible (NO markdown fences, NO prose):
{"beats":[{"template":"<id>","intent":"<max 32 chars>","mode":"reuse"|"create"}]}
Rules: 3-5 beats max. Each intent <= 32 characters. Omit customName unless mode is create.

BUILT-IN REGISTRY:
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
