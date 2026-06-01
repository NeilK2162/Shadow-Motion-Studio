import type { SystemBlock } from '../providers/types';
import { TEMPLATE_AUTHOR_INSTRUCTIONS } from './templateAuthor';
import { ELEMENT_REFERENCE, FEWSHOT_EXAMPLES, SCHEMA_REFERENCE } from './schemaReference';

export function buildAuthorSystemBlocks(): SystemBlock[] {
  return [
    { text: TEMPLATE_AUTHOR_INSTRUCTIONS },
    { text: SCHEMA_REFERENCE },
    { text: ELEMENT_REFERENCE },
    { text: FEWSHOT_EXAMPLES, cacheBreakpoint: true },
  ];
}

export function buildAuthorUserMessage(args: {
  beatIntent: string;
  concept: string;
  voiceDescription: string;
  paletteHint?: string;
  existingNames: string[];
}): string {
  return `VOICE: ${args.voiceDescription}
CONCEPT: ${args.concept}
BEAT INTENT: ${args.beatIntent}
PALETTE HINT: ${args.paletteHint ?? 'gold on dark green/black'}
EXISTING TEMPLATE NAMES (do not duplicate): ${args.existingNames.join(', ')}

Author a new TemplateDefinition JSON for this beat. Include unique id slug.
Output ONLY the JSON object.`;
}

export function buildAuthorRepairUserMessage(args: {
  errors: string[];
  previousJson: unknown;
  beatIntent: string;
}): string {
  return `The previous TemplateDefinition failed validation.
ERRORS:
${args.errors.join('\n')}

BEAT INTENT: ${args.beatIntent}
PREVIOUS JSON:
${JSON.stringify(args.previousJson)}

Fix ONLY the validation errors. Output ONLY corrected JSON.`;
}
