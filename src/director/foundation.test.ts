import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getProvider } from './providers';
import { getSchemasForTemplates, serializeSchemasForPrompt } from './schemas';
import { validateDraftEntries, validatePlanBeats } from './validate';
import type { DirectorPlan } from './types';
import { readDirectorSettings } from './settings';

describe('Director foundation', () => {
  it('validates a hard-coded plan and mock draft into batch-ready assets', async () => {
    const plan: DirectorPlan = {
      beats: [
        { template: 'chapter-card', intent: 'Open episode 4' },
        { template: 'cash-pickup', intent: '₹50K first client closed' },
        { template: 'weekly-stats', intent: 'Week 4 recap' },
      ],
    };

    assert.equal(validatePlanBeats(plan.beats), null);

    const settings = await readDirectorSettings();
    const provider = getProvider({ ...settings, provider: 'mock' });
    assert.ok(provider);

    const schemas = getSchemasForTemplates(plan.beats.map((b) => b.template as import('../types').TemplateId));
    const { data } = await provider.complete<Array<{ template: string; fields: Record<string, unknown> }>>({
      system: 'draft',
      user: `BEATS: ${JSON.stringify(plan.beats)}\nSCHEMAS:\n${serializeSchemasForPrompt(schemas)}`,
      maxTokens: 1600,
    });

    const validation = validateDraftEntries(data);
    assert.equal(validation.valid, true);
    assert.ok(validation.assets.length >= 3);

    for (const asset of validation.assets) {
      assert.equal(asset.valid, true);
      assert.ok(asset.fields);
      assert.ok(typeof asset.template === 'string');
    }
  });
});
