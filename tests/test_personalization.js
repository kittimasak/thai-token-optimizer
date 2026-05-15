/**
 * ============================================================================
 * Thai Token Optimizer v2.0
 * ============================================================================
 * Description :
 * A Thai token optimization tool for AI coding agents that keeps commands, code, and technical details accurate.
 *
 * Author      : Dr.Kittimasak Naijit
 * Repository  : https://github.com/kittimasak/thai-token-optimizer
 *
 * Copyright (c) 2026 Dr.Kittimasak Naijit
 *
 * Notes:
 * - Do not remove code-aware preservation, safety checks, or rollback behavior.
 * - This file is part of the Thai Token Optimizer local-first CLI/hook system.
 * ============================================================================
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'bin', 'thai-token-optimizer.js');

function tmpHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'tto-personal-'));
}

function env(home) {
  return {
    ...process.env,
    HOME: home,
    TTO_HOME: path.join(home, '.thai-token-optimizer'),
    THAI_TOKEN_OPTIMIZER_HOME: path.join(home, '.thai-token-optimizer'),
    CODEX_HOME: path.join(home, '.codex')
  };
}

function run(home, args) {
  return spawnSync(process.execPath, [CLI, ...args], { cwd: ROOT, env: env(home), encoding: 'utf8' });
}

test('keep protects user-specific filler phrase and forget removes the override', () => {
  const home = tmpHome();
  try {
    const input = 'รบกวนช่วยอธิบายขั้นตอนแบบละเอียดครับ';
    const baseline = run(home, ['compress', '--level', 'auto', input]);
    assert.equal(baseline.status, 0, baseline.stderr);
    assert.doesNotMatch(baseline.stdout, /รบกวนช่วย/);

    const keep = run(home, ['keep', 'รบกวนช่วย']);
    assert.equal(keep.status, 0, keep.stderr);
    const personalized = run(home, ['compress', '--level', 'auto', input]);
    assert.equal(personalized.status, 0, personalized.stderr);
    assert.match(personalized.stdout, /รบกวนช่วย/);

    const forget = run(home, ['forget', 'รบกวนช่วย']);
    assert.equal(forget.status, 0, forget.stderr);
    const afterForget = run(home, ['compress', '--level', 'auto', input]);
    assert.equal(afterForget.status, 0, afterForget.stderr);
    assert.doesNotMatch(afterForget.stdout, /รบกวนช่วย/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('keep handles regex metacharacters and overlapping dictionary entries', () => {
  const home = tmpHome();
  try {
    assert.equal(run(home, ['keep', 'API_KEY(foo)[bar]*']).status, 0);
    assert.equal(run(home, ['keep', 'ระบบ']).status, 0);
    assert.equal(run(home, ['keep', 'ระบบเทพ']).status, 0);

    const special = run(home, ['compress', '--level', 'auto', 'ช่วยดู API_KEY(foo)[bar]* และอธิบายขั้นตอนครับ']);
    assert.equal(special.status, 0, special.stderr);
    assert.match(special.stdout, /API_KEY\(foo\)\[bar\]\*/);

    const overlap = run(home, ['compress', '--level', 'auto', 'ช่วยสรุประบบเทพ และระบบ แบบละเอียดครับ']);
    assert.equal(overlap.status, 0, overlap.stderr);
    assert.match(overlap.stdout, /ระบบเทพ/);
    assert.match(overlap.stdout, /ระบบ/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('dictionary entry longer than built-in filler keeps the full phrase', () => {
  const home = tmpHome();
  try {
    assert.equal(run(home, ['keep', 'รบกวนช่วย49']).status, 0);
    const result = run(home, ['compress', '--level', 'auto', 'ช่วยอธิบาย รบกวนช่วย49 แบบละเอียดครับ']);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /รบกวนช่วย49/);
    assert.doesNotMatch(result.stdout, /(^|\s)ช่วย49(\s|$)/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('dictionary normalizes malformed persisted keep entries without crashing compression', () => {
  const home = tmpHome();
  try {
    const dictionaryPath = path.join(home, '.thai-token-optimizer', 'dictionary.json');
    fs.mkdirSync(path.dirname(dictionaryPath), { recursive: true });
    fs.writeFileSync(dictionaryPath, JSON.stringify({ keep: ['', '  ระบบเทพ  ', 123, 'ระบบเทพ', null], version: 99 }));

    const dictionary = run(home, ['dictionary']);
    assert.equal(dictionary.status, 0, dictionary.stderr);
    assert.deepEqual(JSON.parse(dictionary.stdout), { keep: ['ระบบเทพ', '123'], version: 1 });

    const compressed = run(home, ['compress', '--level', 'auto', 'ช่วยสรุประบบเทพ และเลข 123 ครับ']);
    assert.equal(compressed.status, 0, compressed.stderr);
    assert.match(compressed.stdout, /ระบบเทพ/);
    assert.match(compressed.stdout, /123/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('backup and rollback preserve personal dictionary', () => {
  const home = tmpHome();
  try {
    assert.equal(run(home, ['keep', 'ระบบเทพ']).status, 0);
    const backup = run(home, ['backup', 'codex']);
    assert.equal(backup.status, 0, backup.stderr);
    const payload = JSON.parse(backup.stdout);
    const manifest = JSON.parse(fs.readFileSync(path.join(home, '.thai-token-optimizer', 'backups', payload.backup, 'manifest.json'), 'utf8'));
    const dictionaryPath = path.join(home, '.thai-token-optimizer', 'dictionary.json');
    assert.ok(manifest.files.some(f => f.path === dictionaryPath && f.existed), 'dictionary.json should be included in backup');

    assert.equal(run(home, ['forget', 'ระบบเทพ']).status, 0);
    assert.equal(run(home, ['rollback', 'codex', '--no-prebackup']).status, 0);
    const dictionary = JSON.parse(run(home, ['dictionary']).stdout);
    assert.deepEqual(dictionary.keep, ['ระบบเทพ']);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
