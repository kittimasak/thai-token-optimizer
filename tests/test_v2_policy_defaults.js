/**
 * ============================================================================
 * Thai Token Optimizer v2.0 - V2 Policy Defaults Guard
 * ============================================================================
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { DEFAULT_POLICY } = require('../hooks/tto-policy');

test('v2 benchmark defaults are locked for CI reproducibility', () => {
  const bs = DEFAULT_POLICY.benchmarkStrict || {};
  assert.equal(bs.mtpRepeats, 9);
  assert.equal(bs.mtpWarmupRuns, 1);
  assert.equal(bs.mtpSeed, 20260512);
  assert.equal(bs.mtpEnhancedMinGainPercent, 12);
  assert.equal(bs.mtpEnhancedCorpusPath, 'benchmarks/corpus_long_repetitive_mixed_tech_v1.jsonl');
  assert.equal(bs.mtpFixtureCorpusPath, 'benchmarks/corpus_overfit_guard_v1.jsonl');
  assert.equal(bs.mtpFixtureMinGainPercent, 0);
  assert.equal(bs.mtpHighOutputWasteMinCount, 4);
  assert.equal(bs.mtpHighToolCascadeMinStreak, 4);
  assert.equal(bs.mtpHighBadDecompositionMinCount, 2);
});
