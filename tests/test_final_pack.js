/**
 * ============================================================================
 * Thai Token Optimizer v1.0
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
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const bin = path.join(root, 'bin', 'thai-token-optimizer.js');

function run(args, envExtra = {}) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-final-'));
  return execFileSync('node', [bin, ...args], {
    cwd: root,
    env: { ...process.env, TTO_HOME: tmp, HOME: tmp, ...envExtra },
    encoding: 'utf8'
  });
}

test('profile system can list and set coding profile', () => {
  const list = JSON.parse(run(['profile', 'list']));
  assert.ok(list.some(x => x.name === 'coding'));
  const set = JSON.parse(run(['profile', 'coding']));
  assert.equal(set.profile, 'coding');
});

test('configurable policy file supports get and exactTokenizer', () => {
  const cfg = JSON.parse(run(['config', 'get']));
  assert.equal(cfg.version, 1);
  assert.equal(cfg.defaultMode, 'auto');
});

test('exact tokenizer mode falls back safely without optional dependency', () => {
  const out = JSON.parse(run(['estimate', '--exact', '--target', 'codex', 'ทดสอบภาษาไทย']));
  assert.equal(out.requestedExact, true);
  assert.ok(out.estimatedTokens >= 1);
  assert.ok(out.tokenizer);
});

test('strict benchmark returns report and preserves v1.0 package version', () => {
  const out = run(['benchmark', '--strict']);
  assert.match(out, /Strict Regression Report/);
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.version, '1.0.0');
});

test('multi-agent adapter installs portable guidance', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-adapter-'));
  const out = run(['install', 'cursor'], { HOME: tmp, TTO_HOME: path.join(tmp, '.tto') });
  assert.match(out, /cursor/);
  assert.ok(fs.existsSync(path.join(tmp, '.cursor', 'rules', 'thai-token-optimizer.mdc')));
});
