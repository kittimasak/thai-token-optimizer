/**
 * ============================================================================
 * Thai Token Optimizer v2.0 - MTP Benchmark/Gate Test
 * ============================================================================
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'bin', 'thai-token-optimizer.js');

function run(args) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env }
  });
}

test('benchmark --strict --default-policy --mtp returns MTP section and gate status', () => {
  const out = run(['benchmark', '--strict', '--default-policy', '--mtp']);
  assert.ok(out.status === 0 || out.status === 1, out.stdout + out.stderr);
  assert.match(out.stdout, /MTP \/ Speculative Comparison/);
  assert.match(out.stdout, /MTP gate:/);
  assert.match(out.stdout, /Normal latency/);
  assert.match(out.stdout, /Spec latency/);
  assert.match(out.stdout, /Enhanced gain on .*corpus_long_repetitive_mixed_tech_v1:/);
  assert.match(out.stdout, /Enhanced Corpus Gate/);
  assert.match(out.stdout, /Drift Monitor \(repeated-run stability\)/);
  assert.match(out.stdout, /Overfit Guard Corpus \(non-gating monitor\)/);
  assert.match(out.stdout, /Fixture corpus guard: PASS|Fixture corpus guard: FAIL/);
  assert.match(out.stdout, /Action routing gate: PASS|Action routing gate: FAIL/);
  assert.match(out.stdout, /Waste Detector Signals/);
  assert.match(out.stdout, /Detector Action Suggestions/);
  assert.match(out.stdout, /tool_cascade|bad_decomposition|low_saving_cluster|output_waste/);
  const artifact = path.join(ROOT, 'benchmarks', 'regression_report.json');
  assert.ok(fs.existsSync(artifact), 'benchmark diagnostics artifact should exist');
  const parsed = JSON.parse(fs.readFileSync(artifact, 'utf8'));
  assert.ok(Array.isArray(parsed.wasteSignals), 'artifact should include wasteSignals');
  assert.ok(Array.isArray(parsed.actionSuggestions), 'artifact should include actionSuggestions');
  assert.ok(parsed.actionRouting && typeof parsed.actionRouting.gateOk === 'boolean', 'artifact should include actionRouting');
});

test('benchmark --pretty --strict --default-policy --mtp renders MTP metrics in UI', () => {
  const out = run(['benchmark', '--pretty', '--strict', '--default-policy', '--mtp']);
  assert.ok(out.status === 0 || out.status === 1, out.stdout + out.stderr);
  assert.match(out.stdout, /Thai Token Optimizer v2\.0\.0 Benchmark/);
  assert.match(out.stdout, /MTP Compare/);
  assert.match(out.stdout, /Spec Hits/);
  assert.match(out.stdout, /MTP Gate/);
});
