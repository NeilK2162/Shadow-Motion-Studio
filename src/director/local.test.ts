import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { localPlan } from './local/planner';
import { localDraft } from './local/drafter';
import { defaultSeries } from './memory';
import { validateDraftEntries, validatePlanBeats } from './validate';
import { DEFAULT_VOICE } from './types';
import { packToBatchItems } from './orchestrator';

describe('Director local path', () => {
  it('produces a valid continuity-aware pack from a concept', () => {
    const memory = defaultSeries({ episode: 4, facts: { shadowUsers: 23, respectTotal: 250, weekNumber: 3 } });
    const concept =
      'Episode 4 — closed first ₹50K client, bigger deal fell through. Recap the week.';
    const plan = localPlan(concept, 'both', memory);
    assert.equal(validatePlanBeats(plan.beats), null);

    const entries = localDraft(plan.beats, memory, DEFAULT_VOICE);
    const validation = validateDraftEntries(entries);
    assert.equal(validation.valid, true);

    const weekly = validation.assets.find((a) => a.template === 'weekly-stats');
    assert.ok(weekly);
    const boxes = weekly!.fields.boxes as Array<{ label: string; value: string }>;
    const usersBox = boxes.find((b) => b.label.includes('User'));
    assert.ok(usersBox);
    assert.equal(usersBox!.value, '31');

    const batchItems = packToBatchItems({
      seriesId: memory.seriesId,
      episode: memory.episode,
      concept,
      plan,
      assets: validation.assets,
      usage: { inputTokens: 0, outputTokens: 0, cachedInputTokens: 0, cacheWriteTokens: 0, estimatedCostUsd: 0 },
      stepUsage: [],
      formatTarget: 'both',
      createdAt: new Date().toISOString(),
    });
    assert.ok(batchItems.length >= 3);
    assert.deepEqual(batchItems[0].formats, ['youtube-landscape', 'shorts-vertical']);
  });
});
