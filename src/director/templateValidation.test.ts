import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE_MISSION_PASSED_DEF } from './templateSchema';
import { validateTemplate } from './validateTemplate';

describe('validateTemplate', () => {
  it('accepts the sample mission-passed def', () => {
    const result = validateTemplate(SAMPLE_MISSION_PASSED_DEF);
    assert.equal(result.valid, true);
    assert.ok(result.def);
  });

  it('rejects bad hex colors in elements', () => {
    const bad = structuredClone(SAMPLE_MISSION_PASSED_DEF);
    bad.elements[2] = { ...bad.elements[2], kind: 'glyph', color: '#gggggg' as never };
    const result = validateTemplate(bad);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.path.includes('color')));
  });

  it('rejects unknown element kind', () => {
    const bad = structuredClone(SAMPLE_MISSION_PASSED_DEF);
    (bad.elements[0] as { kind: string }).kind = 'iframe';
    const result = validateTemplate(bad);
    assert.equal(result.valid, false);
  });

  it('rejects oversized canvas', () => {
    const bad = structuredClone(SAMPLE_MISSION_PASSED_DEF);
    bad.canvas.width = 2000;
    const result = validateTemplate(bad);
    assert.equal(result.valid, false);
  });

  it('rejects unknown top-level keys', () => {
    const bad = { ...SAMPLE_MISSION_PASSED_DEF, evilScript: 'alert(1)' };
    const result = validateTemplate(bad);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.message.includes('Unknown top-level')));
  });

  it('rejects bind to missing field', () => {
    const bad = structuredClone(SAMPLE_MISSION_PASSED_DEF);
    bad.elements[3] = { ...bad.elements[3], kind: 'text', bind: 'nonexistent' };
    const result = validateTemplate(bad);
    assert.equal(result.valid, false);
  });
});

describe('interpreter sample def round-trip', () => {
  it('sample def has required render fields', () => {
    assert.equal(SAMPLE_MISSION_PASSED_DEF.schemaVersion, 1);
    assert.ok(SAMPLE_MISSION_PASSED_DEF.elements.length > 0);
    assert.ok(SAMPLE_MISSION_PASSED_DEF.fields.length > 0);
    for (const el of SAMPLE_MISSION_PASSED_DEF.elements) {
      assert.ok(el.key);
      assert.ok(el.kind);
    }
  });
});
