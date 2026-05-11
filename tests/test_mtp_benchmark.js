/**
 * ============================================================================
 * Thai Token Optimizer v1.0 - MTP Benchmark/Gate Test
 * ============================================================================
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
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
  assert.match(out.stdout, /Enhanced gain on mtp_corpus:/);
  assert.match(out.stdout, /Enhanced Corpus Gate/);
});

test('benchmark --pretty --strict --default-policy --mtp renders MTP metrics in UI', () => {
  const out = run(['benchmark', '--pretty', '--strict', '--default-policy', '--mtp']);
  assert.ok(out.status === 0 || out.status === 1, out.stdout + out.stderr);
  assert.match(out.stdout, /Thai Token Optimizer Benchmark/);
  assert.match(out.stdout, /MTP Compare/);
  assert.match(out.stdout, /Spec Hits/);
  assert.match(out.stdout, /MTP Gate/);
});
