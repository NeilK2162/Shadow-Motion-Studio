import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseLLMJson, salvageBeatsPlan } from './parseLLMJson';

describe('parseLLMJson', () => {
  it('parses JSON with trailing commas in arrays', () => {
    const raw = `{
  "beats": [
    { "template": "mission-passed", "intent": "win" },
    { "template": "weekly-stats", "intent": "recap" },
  ]
}`;
    const data = parseLLMJson<{ beats: unknown[] }>(raw);
    assert.equal(data.beats.length, 2);
  });

  it('strips markdown fences', () => {
    const raw = '```json\n{"ok": true}\n```';
    assert.deepEqual(parseLLMJson(raw), { ok: true });
  });

  it('extracts first object from surrounding prose', () => {
    const raw = 'Here you go:\n{"fields": {"title": "HELLO"}}\nThanks!';
    assert.deepEqual(parseLLMJson<{ fields: { title: string } }>(raw).fields.title, 'HELLO');
  });

  it('salvages complete beats from truncated planner JSON', () => {
    const raw = `\`\`\`json
{
  "beats": [
    { "template": "chapter-card", "intent": "Episode 2: Miami Heat", "mode": "reuse" },
    { "template": "enter-location", "intent": "Welcome to Miami Beac`;
    const data = parseLLMJson<{ beats: Array<{ template: string }> }>(raw);
    assert.ok(data.beats.length >= 1);
    assert.equal(data.beats[0].template, 'chapter-card');
  });
});

describe('salvageBeatsPlan', () => {
  it('pulls beat objects from partial text', () => {
    const result = salvageBeatsPlan(
      '{ "beats": [ { "template": "chapter-card", "intent": "Open ep 2", "mode": "reuse" }, { "template": "cash-pickup", "intent": "First Miami',
    );
    assert.ok(result);
    assert.equal(result!.beats.length, 1);
  });
});
