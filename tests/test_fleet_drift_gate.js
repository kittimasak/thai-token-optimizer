const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const GATE = path.join(ROOT, 'scripts', 'fleet-drift-gate.js');

test('fleet drift gate fails on consecutive threshold breaches', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-fleet-gate-'));
  const history = path.join(dir, 'fleet_history.jsonl');
  const rows = [
    { detectorWasteTokens: 300000, detectorEstimatedMonthlyUsd: 12, avgConfidence: 0.4 },
    { detectorWasteTokens: 310000, detectorEstimatedMonthlyUsd: 13, avgConfidence: 0.42 },
    { detectorWasteTokens: 320000, detectorEstimatedMonthlyUsd: 15, avgConfidence: 0.45 }
  ];
  fs.writeFileSync(history, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  const r = spawnSync(process.execPath, [GATE, '--history', history, '--consecutive', '3', '--maxWasteTokens', '200000', '--maxUsd', '10', '--minConfidence', '0.5'], {
    cwd: ROOT, encoding: 'utf8'
  });
  assert.notEqual(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stderr, /Fleet drift gate FAIL/);
});

test('fleet drift gate passes when no consecutive breach', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-fleet-gate-'));
  const history = path.join(dir, 'fleet_history.jsonl');
  const rows = [
    { detectorWasteTokens: 100000, detectorEstimatedMonthlyUsd: 4, avgConfidence: 0.7 },
    { detectorWasteTokens: 250000, detectorEstimatedMonthlyUsd: 8, avgConfidence: 0.6 },
    { detectorWasteTokens: 90000, detectorEstimatedMonthlyUsd: 3, avgConfidence: 0.72 }
  ];
  fs.writeFileSync(history, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  const r = spawnSync(process.execPath, [GATE, '--history', history], {
    cwd: ROOT, encoding: 'utf8'
  });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

