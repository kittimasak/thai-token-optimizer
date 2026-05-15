/**
 * ============================================================================
 * Thai Token Optimizer v2.0 - MTP & Speculative Decoding Test
 * ============================================================================
 */

const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const BIN = path.join(__dirname, '..', 'bin', 'thai-token-optimizer.js');

function run(args, env = {}) {
  return spawnSync('node', [BIN, ...args], {
    env: { ...process.env, ...env },
    encoding: 'utf8'
  });
}

function runTracker(prompt, env = {}) {
  return spawnSync('node', [path.join(__dirname, '..', 'hooks', 'tto-mode-tracker.js')], {
    env: { ...process.env, ...env },
    input: JSON.stringify({ prompt }),
    encoding: 'utf8'
  });
}

test('speculative compression logic picks candidate with best preservation', () => {
  const { compressToBudget } = require('../hooks/tto-budget-compressor');
  const input = 'ช่วยอธิบายการติดตั้ง Thai Token Optimizer v2.0 โดยห้ามเปลี่ยนเวอร์ชัน 2.0.0';
  
  // Test with speculative=true
  const result = compressToBudget(input, { speculative: true });
  
  assert.equal(result.speculative, true);
  assert.ok(result.optimized.includes('Thai Token Optimizer v2.0'));
  assert.ok(result.optimized.includes('2.0.0'));
  assert.equal(result.preservation.preservationPercent, 100);
  assert.ok(['lite', 'auto', 'full', 'ultra'].includes(result.level));
});

test('CLI --speculative flag triggers speculative mode and shows indicator', () => {
  const input = 'ลด token ไทย: แนะนำวิธีใช้โปรแกรมนี้หน่อย';
  const res = run(['compress', '--speculative', input]);
  
  assert.equal(res.status, 0);
  assert.match(res.stderr, /Mode: Speculative/);
  assert.match(res.stderr, /Candidate:/);
});

test('CLI --speculative with --pretty shows badge', () => {
  const input = 'ทดสอบโหมดคาดการณ์';
  const res = run(['compress', '--speculative', '--pretty', input]);
  
  assert.equal(res.status, 0);
  assert.match(res.stdout, /\(SPECULATIVE\)/);
});

test('CLI --no-speculative overrides speculative state flag', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-nospec-'));
  const env = { HOME: home, TTO_HOME: path.join(home, '.tto') };
  try {
    const tr = runTracker('/tto speculative', env);
    assert.equal(tr.status, 0, tr.stderr);

    const res = run(['compress', '--no-speculative', 'ทดสอบปิด speculative'], env);
    assert.equal(res.status, 0);
    assert.match(res.stderr, /Forced non-speculative/);
    assert.doesNotMatch(res.stderr, /Mode: Speculative/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('CLI diagnostics prints candidate selection details', () => {
  const input = 'ช่วยอธิบาย Thai Token Optimizer v2.0 โดยคงคำสั่ง tto doctor --pretty';
  const res = run(['compress', '--speculative', '--diagnostics', input]);
  assert.equal(res.status, 0);
  assert.match(res.stderr, /Diagnostics:/);
  assert.match(res.stderr, /speculative_candidates/);
  assert.match(res.stderr, /selectedReason/);
});

test('Tracker triggers speculative mode from slash command', () => {
  const { parseTrigger } = require('../hooks/tto-mode-tracker');
  
  const res = parseTrigger('/tto spec');
  assert.deepEqual(res, { enabled: true, speculative: true });
  
  const res2 = parseTrigger('/tto speculative');
  assert.deepEqual(res2, { enabled: true, speculative: true });
  
  const res3 = parseTrigger('/tto nospec');
  assert.deepEqual(res3, { speculative: false });
});

test('Tracker triggers speculative mode from Thai phrases', () => {
  const { parseTrigger } = require('../hooks/tto-mode-tracker');
  
  const res = parseTrigger('เปิดโหมดคาดการณ์');
  assert.deepEqual(res, { enabled: true, speculative: true });
  
  const res2 = parseTrigger('เปิด speculation');
  assert.deepEqual(res2, { enabled: true, speculative: true });
  
  const res3 = parseTrigger('ปิดโหมดคาดการณ์');
  assert.deepEqual(res3, { speculative: false });
});

test('compressToBudget does not leak implicit global "best"', () => {
  const { compressToBudget } = require('../hooks/tto-budget-compressor');
  global.best = 'sentinel';
  compressToBudget('ทดสอบการบีบอัดทั่วไป', { level: 'auto' });
  assert.equal(global.best, 'sentinel');
});
