/**
 * ============================================================================
 * Thai Token Optimizer v1.0 - MTP & Speculative Decoding Test
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

test('speculative compression logic picks candidate with best preservation', () => {
  const { compressToBudget } = require('../hooks/tto-budget-compressor');
  const input = 'ช่วยอธิบายการติดตั้ง Thai Token Optimizer v1.0 โดยห้ามเปลี่ยนเวอร์ชัน 1.0.0';
  
  // Test with speculative=true
  const result = compressToBudget(input, { speculative: true });
  
  assert.equal(result.speculative, true);
  assert.ok(result.optimized.includes('Thai Token Optimizer v1.0'));
  assert.ok(result.optimized.includes('1.0.0'));
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
