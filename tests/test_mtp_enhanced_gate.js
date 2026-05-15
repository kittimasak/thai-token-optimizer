/**
 * ============================================================================
 * Thai Token Optimizer v2.0 - Enhanced Corpus Gate Tests
 * ============================================================================
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'bin', 'thai-token-optimizer.js');

function run(args, env = {}) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd: ROOT,
    env: { ...process.env, ...env },
    encoding: 'utf8'
  });
}

test('enhanced corpus gate passes under default-policy mtp settings', () => {
  const out = run(['benchmark', '--strict', '--default-policy', '--mtp']);
  assert.equal(out.status, 0, out.stdout + out.stderr);
  assert.match(out.stdout, /Enhanced corpus gate: PASS/);
});

test('enhanced corpus gate fails when min gain threshold is forced too high', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-mtp-gate-'));
  const env = { HOME: home, TTO_HOME: path.join(home, '.tto') };
  try {
    const setCfg = run(['config', 'set', 'benchmarkStrict.mtpEnhancedMinGainPercent', '999999'], env);
    assert.equal(setCfg.status, 0, setCfg.stdout + setCfg.stderr);

    const out = run(['benchmark', '--strict', '--mtp'], env);
    assert.equal(out.status, 1, out.stdout + out.stderr);
    assert.match(out.stdout, /Enhanced corpus gate: FAIL/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('fixture corpus guard fails when fixture min gain threshold is forced too high', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-mtp-fixture-gate-'));
  const env = { HOME: home, TTO_HOME: path.join(home, '.tto') };
  try {
    const setCfg = run(['config', 'set', 'benchmarkStrict.mtpFixtureMinGainPercent', '9999'], env);
    assert.equal(setCfg.status, 0, setCfg.stdout + setCfg.stderr);

    const out = run(['benchmark', '--strict', '--mtp'], env);
    assert.equal(out.status, 1, out.stdout + out.stderr);
    assert.match(out.stdout, /Fixture corpus guard: FAIL/);
    assert.match(out.stdout, /MTP gate: FAIL/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('action routing gate fails and propagates to MTP gate when required_action is triggered', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-mtp-routing-gate-'));
  const env = { HOME: home, TTO_HOME: path.join(home, '.tto') };
  try {
    // Force high severity classification from existing detector counts in strict benchmark corpus.
    let setCfg = run(['config', 'set', 'benchmarkStrict.mtpHighOutputWasteMinCount', '1'], env);
    assert.equal(setCfg.status, 0, setCfg.stdout + setCfg.stderr);
    setCfg = run(['config', 'set', 'benchmarkStrict.mtpHighToolCascadeMinStreak', '1'], env);
    assert.equal(setCfg.status, 0, setCfg.stdout + setCfg.stderr);
    setCfg = run(['config', 'set', 'benchmarkStrict.mtpHighBadDecompositionMinCount', '1'], env);
    assert.equal(setCfg.status, 0, setCfg.stdout + setCfg.stderr);

    const out = run(['benchmark', '--strict', '--mtp'], env);
    assert.equal(out.status, 1, out.stdout + out.stderr);
    assert.match(out.stdout, /Action routing gate: FAIL/);
    assert.match(out.stdout, /MTP gate: FAIL/);
    assert.match(out.stdout, /required_action/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
