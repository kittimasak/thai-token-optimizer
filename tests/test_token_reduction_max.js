/**
 * ============================================================================
 * Thai Token Optimizer v2.0 - Max Token Reduction Tests
 * ============================================================================
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { compressPrompt, semanticDedup, selectiveWindowCompress, normalizeSemanticKey, collapseRepeatedPhrases } = require('../hooks/tto-compressor');
const { compressToBudget } = require('../hooks/tto-budget-compressor');

test('semantic dedup removes duplicate lines/paragraphs', () => {
  const input = [
    'ช่วยอธิบายวิธีติดตั้งระบบ',
    'ช่วยอธิบายวิธีติดตั้งระบบ',
    '',
    'ขั้นตอนที่ต้องทำมีดังนี้',
    'ขั้นตอนที่ต้องทำมีดังนี้'
  ].join('\n');
  const out = semanticDedup(input);
  assert.equal((out.match(/ช่วยอธิบายวิธีติดตั้งระบบ/g) || []).length, 1);
  assert.equal((out.match(/ขั้นตอนที่ต้องทำมีดังนี้/g) || []).length, 1);
});

test('semantic dedup collapses repeated phrases inside one paragraph without touching technical terms', () => {
  const repeated = 'ช่วยอธิบาย workflow นี้แบบละเอียดมาก '.repeat(4);
  const input = `${repeated}ต้องคง \`npm run ci\` และ \`~/.codex/config.toml\``;
  const out = semanticDedup(input);
  assert.equal((out.match(/ช่วยอธิบาย workflow นี้แบบละเอียดมาก/g) || []).length, 1);
  assert.match(out, /`npm run ci`/);
  assert.match(out, /`~\/\.codex\/config\.toml`/);
});

test('collapseRepeatedPhrases does not collapse repeated protected command groups', () => {
  const input = '`npm run ci` `npm run ci` ต้องตรวจซ้ำ';
  const out = collapseRepeatedPhrases(input);
  assert.equal((out.match(/`npm run ci`/g) || []).length, 2);
});

test('semantic pruning keeps technical gate phrases separated from versions', () => {
  const input = 'ช่วยเขียนรายงานผล benchmark แบบละเอียด ช่วยเขียนรายงานผล benchmark แบบละเอียด โดยยังคงคำสำคัญ Thai Token Optimizer v2.0 package version 2.0.0 strict gate PASS และอธิบายว่า preservation ต้อง 100% และห้ามทำให้คำสั่ง `tto benchmark --pretty --strict --default-policy` หาย';
  const out = compressPrompt(input, { level: 'auto', semanticDedup: true });
  assert.match(out, /2\.0\.0 strict gate PASS/);
  assert.doesNotMatch(out, /2\.0\.0PASS/);
  assert.doesNotMatch(out, /ข้อกำหนดคงเดิม:[\s\S]*0 strict gate PASS/);
});

test('selective window keeps high-value technical lines', () => {
  const input = [
    'รายละเอียดทั่วไปที่ยาวมากและซ้ำซ้อนมาก',
    'รันคำสั่ง `tto doctor --pretty`',
    'ห้ามเปลี่ยน version 2.0.0',
    'ข้อความอธิบายทั่วไปเพิ่มเติมที่ฟุ่มเฟือย'
  ].join('\n');
  const out = selectiveWindowCompress(input, 'auto');
  assert.match(out, /`tto doctor --pretty`/);
  assert.match(out, /2\.0\.0/);
});

test('compressPrompt applies semantic dedup and selective window', () => {
  const input = [
    'ช่วยอธิบายวิธีติดตั้งระบบ',
    'ช่วยอธิบายวิธีติดตั้งระบบ',
    'วิธีติดตั้งทั่วไปยาวมาก',
    'รันคำสั่ง `tto doctor --pretty` และห้ามเปลี่ยน version 2.0.0'
  ].join('\n');
  const out = compressPrompt(input, { level: 'auto', selectiveWindow: true, semanticDedup: true });
  const lines = out.split('\n').map(x => normalizeSemanticKey(x)).filter(Boolean);
  const installLike = lines.filter(x => x.includes('อธิบาย') && x.includes('ติดตั้ง') && x.includes('ระบบ'));
  assert.ok(installLike.length <= 1);
  assert.match(out, /`tto doctor --pretty`/);
  assert.match(out, /2\.0\.0/);
});

test('speculative diagnostics reports family and selectedFamily', () => {
  const input = 'ช่วยอธิบายวิธีติดตั้ง Thai Token Optimizer v2.0 และคงคำสั่ง tto doctor --pretty';
  const result = compressToBudget(input, {
    level: 'auto',
    target: 'codex',
    budget: 80,
    speculative: true,
    diagnostics: true
  });
  assert.equal(result.speculative, true);
  assert.ok(result.diagnostics);
  assert.equal(result.diagnostics.type, 'speculative_candidates');
  assert.ok(result.diagnostics.selectedFamily);
  assert.ok(Array.isArray(result.diagnostics.candidates));
  assert.ok(result.diagnostics.candidates.some(c => c.family === 'dedup_plus_selective'));
});

test('speculative tie-break prefers dedup_plus_selective when preservation is equal', () => {
  const input = [
    'ช่วยอธิบายวิธีติดตั้งระบบอย่างละเอียด',
    'ช่วยอธิบายวิธีติดตั้งระบบอย่างละเอียด',
    'ต้องคง `tto doctor --pretty` และ version 2.0.0'
  ].join('\n');
  const result = compressToBudget(input, {
    level: 'auto',
    target: 'codex',
    budget: 120,
    speculative: true,
    diagnostics: true
  });
  assert.equal(result.preservation.preservationPercent, 100);
  assert.equal(result.diagnostics.selectedFamily, 'dedup_plus_selective');
});
