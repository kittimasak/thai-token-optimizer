const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'calibration-ci-gate.js');

test('calibration ci gate fails on consecutive bad streak', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-cal-gate-'));
  const history = path.join(dir, 'calibration_history.jsonl');
  const rows = [
    { avgGapPct: 10 },
    { avgGapPct: 25 },
    { avgGapPct: 26 },
    { avgGapPct: 27 }
  ];
  fs.writeFileSync(history, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  const r = spawnSync(process.execPath, [SCRIPT, '--history', history, '--maxGapPct', '20', '--consecutive', '3'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  assert.notEqual(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stderr, /Calibration gate FAIL/);
});

test('calibration ci gate passes when streak condition not met', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-cal-gate-'));
  const history = path.join(dir, 'calibration_history.jsonl');
  const rows = [
    { avgGapPct: 30 },
    { avgGapPct: 12 },
    { avgGapPct: 23 }
  ];
  fs.writeFileSync(history, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  const r = spawnSync(process.execPath, [SCRIPT, '--history', history, '--maxGapPct', '20', '--consecutive', '3'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

