/**
 * ============================================================================
 * Thai Token Optimizer v2.0 - Mixed Language Regression Tests
 * ============================================================================
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { compressPrompt } = require('../hooks/tto-compressor');
const { compressToBudget } = require('../hooks/tto-budget-compressor');
const { checkPreservation } = require('../hooks/tto-preservation-checker');

test('Thai mixed with English commands and versions preserves spacing and exact terms', () => {
  const input = 'รบกวนช่วยตรวจ Thai Token Optimizer v2.0 package version 2.0.0 แล้ว run `npm test` กับ `npm run ci` ห้ามเปลี่ยน README_EN.md';
  const out = compressToBudget(input, { budget: 80, target: 'codex', speculative: true }).optimized;
  assert.match(out, /Thai Token Optimizer v2\.0 package version 2\.0\.0/);
  assert.match(out, /`npm test`/);
  assert.match(out, /`npm run ci`/);
  assert.match(out, /README_EN\.md/);
  assert.doesNotMatch(out, /Optimizerv2\.0|version2\.0\.0|`npm test`กับ/);
  assert.equal(checkPreservation(input, out).preservationPercent, 100);
});

test('Thai mixed with English stack trace preserves embedded stack frame indentation', () => {
  const input = [
    'ช่วยดู error นี้: TypeError: Cannot read properties of undefined',
    '    at handle (/app/src/index.js:12:5) แล้วแก้ที่ /app/src/index.js โดย keep API_URL เดิม'
  ].join('\n');
  const plain = compressPrompt(input, { level: 'auto' });
  const budget = compressToBudget(input, { budget: 80, target: 'codex', speculative: true }).optimized;
  for (const out of [plain, budget]) {
    assert.match(out, /^    at handle \(\/app\/src\/index\.js:12:5\)/m);
    assert.match(out, /\/app\/src\/index\.js/);
    assert.match(out, /API_URL/);
    assert.equal(checkPreservation(input, out).preservationPercent, 100);
  }
});

test('Thai instructions around English JSON and YAML preserve technical structure', () => {
  const json = [
    'ช่วย update config นี้แต่ห้ามเปลี่ยน key อังกฤษ:',
    '{',
    '  "API_URL": "https://api.example.com/v1",',
    '  "codex_hooks": true,',
    '  "version": "2.0.0"',
    '}'
  ].join('\n');
  const yaml = [
    'ช่วยอธิบาย YAML นี้แบบสั้น และ preserve indentation:',
    'env:',
    '  NODE_ENV: production',
    '  DATABASE_URL: postgres://user:pass@localhost:5432/app',
    'command: `npm run test:ci`'
  ].join('\n');
  const jsonOut = compressToBudget(json, { budget: 90, target: 'codex', speculative: true }).optimized;
  const yamlOut = compressToBudget(yaml, { budget: 90, target: 'codex', speculative: true }).optimized;
  assert.match(jsonOut, /^  "API_URL"/m);
  assert.match(jsonOut, /^  "codex_hooks"/m);
  assert.match(yamlOut, /^  NODE_ENV/m);
  assert.match(yamlOut, /^  DATABASE_URL/m);
  assert.doesNotMatch(jsonOut + yamlOut, /รายการเทคนิคคงเดิม:[\s\S]*รายการเทคนิคคงเดิม/);
  assert.equal(checkPreservation(json, jsonOut).preservationPercent, 100);
  assert.equal(checkPreservation(yaml, yamlOut).preservationPercent, 100);
});

test('Thai summary around English markdown table preserves table rows', () => {
  const input = [
    'สรุปตารางนี้ให้สั้นแต่คง table:',
    '| File | Command | Status |',
    '|---|---|---|',
    '| README_EN.md | `npm test` | PASS |',
    '| package.json | `npm run ci` | PASS |'
  ].join('\n');
  const out = compressToBudget(input, { budget: 90, target: 'codex', speculative: true }).optimized;
  assert.match(out, /^\| File \| Command \| Status \|$/m);
  assert.match(out, /^\| README_EN\.md \| `npm test` \| PASS \|$/m);
  assert.match(out, /^\| package\.json \| `npm run ci` \| PASS \|$/m);
  assert.equal(checkPreservation(input, out).preservationPercent, 100);
});

test('Mixed Thai/English safety prompt keeps destructive command and secret marker exact', () => {
  const input = 'ห้าม run `git push --force` บน production และต้อง backup ก่อน deploy โดย keep DATABASE_URL secret';
  const out = compressToBudget(input, { budget: 60, target: 'codex', speculative: true }).optimized;
  assert.match(out, /`git push --force`/);
  assert.match(out, /prod(?:uction)?/);
  assert.match(out, /backup/);
  assert.match(out, /DATABASE_URL secret/);
  assert.equal(checkPreservation(input, out).preservationPercent, 100);
});
