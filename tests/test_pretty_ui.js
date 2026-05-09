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
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const ROOT = path.resolve(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'thai-token-optimizer.js');
function tmpHome() { return fs.mkdtempSync(path.join(os.tmpdir(), 'tto-ui-')); }
function run(args, env = {}) {
  return spawnSync(process.execPath, [BIN, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

test('pretty status and dashboard render terminal boxes', () => {
  const home = tmpHome();
  const env = { TTO_HOME: path.join(home, '.tto'), HOME: home };
  run(['auto'], env);
  const status = run(['status', '--pretty'], env);
  assert.equal(status.status, 0);
  assert.match(status.stdout, /╭/);
  assert.match(status.stdout, /Thai Token Optimizer v1\.0/);
  assert.match(status.stdout, /Token Saving/);

  const ui = run(['ui'], env);
  assert.equal(ui.status, 0);
  assert.match(ui.stdout, /Codex/);
  assert.match(ui.stdout, /OpenCode/);
});

test('pretty compress, classify, doctor, and benchmark render visual UI', () => {
  const home = tmpHome();
  const env = { TTO_HOME: path.join(home, '.tto'), HOME: home, CODEX_HOME: path.join(home, '.codex'), CLAUDE_HOME: path.join(home, '.claude'), GEMINI_HOME: path.join(home, '.gemini'), OPENCODE_CONFIG_DIR: path.join(home, '.config', 'opencode') };
  const compress = run(['compress', '--pretty', '--level', 'auto', '--budget', '80', '--target', 'codex', '--check', 'ช่วยอธิบายรายละเอียด Thai Token Optimizer v1.0 โดยห้ามเปลี่ยน package version 1.0.0'], env);
  assert.equal(compress.status, 0);
  assert.match(compress.stdout, /Prompt Compression Result/);
  assert.match(compress.stdout, /█|░/);

  const classify = run(['classify', '--pretty', 'DROP TABLE users production secret token'], env);
  assert.equal(classify.status, 0);
  assert.match(classify.stdout, /Safety Classifier/);
  assert.match(classify.stdout, /HIGH/);

  const doctor = run(['doctor', '--pretty', '--ci'], env);
  assert.equal(doctor.status, 0);
  assert.match(doctor.stdout, /Thai Token Optimizer Doctor/);
  assert.match(doctor.stdout, /PASS/);

  const benchmark = run(['benchmark', '--pretty', '--strict', '--default-policy'], env);
  assert.equal(benchmark.status, 0);
  assert.match(benchmark.stdout, /Thai Token Optimizer Benchmark/);
  assert.match(benchmark.stdout, /Strict Gate/);
});
