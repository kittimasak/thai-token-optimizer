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

test('install all installs multi-agent adapters exactly once', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-install-all-once-'));
  const env = { HOME: home, CODEX_HOME: path.join(home, '.codex'), CLAUDE_HOME: path.join(home, '.claude'), OPENCLAW_HOME: path.join(home, '.openclaw'), HERMES_HOME: path.join(home, '.hermes'), TTO_HOME: path.join(home, '.tto') };
  try {
    const res = run(['install', 'all'], env);
    assert.equal(res.status, 0, res.stdout + res.stderr);
    const jsonStart = res.stdout.indexOf('{');
    const jsonEnd = res.stdout.lastIndexOf('}') + 1;
    assert.ok(jsonStart >= 0 && jsonEnd > jsonStart, res.stdout);
    const payload = JSON.parse(res.stdout.slice(jsonStart, jsonEnd));
    const files = payload.installed.map(x => x.file);
    assert.equal(new Set(files).size, files.length, 'adapter files should not be duplicated');
    assert.equal(files.length, 25, res.stdout);
    assert.ok(files.some(file => file.endsWith(path.join('.openclaw', 'hooks', 'thai-token-optimizer', 'handler.ts'))), res.stdout);
    assert.ok(files.some(file => file.endsWith(path.join('.hermes', 'plugins', 'thai-token-optimizer', '__init__.py'))), res.stdout);
    assert.ok(files.some(file => file.endsWith(path.join('.hermes', 'agent-hooks', 'thai-token-optimizer-pre_tool_call.cjs'))), res.stdout);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('budget compression preserves inline command, version, and codex_hooks without token-breaking', () => {
  const input = 'ปรับ Thai Token Optimizer v1.0 โดยห้ามเปลี่ยนเวอร์ชันเด็ดขาด และคงคำสั่ง `node bin/thai-token-optimizer.js install all` กับ codex_hooks = true ใน ~/.codex/config.toml';
  const res = run(['compress', '--level', 'auto', '--budget', '15', '--target', 'codex', '--check', input]);
  assert.equal(res.status, 0, res.stdout + res.stderr);
  assert.match(res.stdout, /Thai Token Optimizer v1\.0/);
  assert.doesNotMatch(res.stdout, /v1\.\s+0/);
  assert.match(res.stdout, /`node bin\/thai-token-optimizer\.js install all`/);
  assert.match(res.stdout, /codex_hooks = true/);
  assert.match(res.stdout, /~\/\.codex\/config\.toml/);
  assert.match(res.stderr, /Preservation: 100%/);
});

test('strict benchmark uses nonzero regression gate and passes clean default policy', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-strict-gate-'));
  const env = { HOME: home, TTO_HOME: path.join(home, '.tto') };
  try {
    const res = run(['benchmark', '--strict'], env);
    assert.equal(res.status, 0, res.stdout + res.stderr);
    assert.match(res.stdout, /Strict gate: PASS/);
    const cfg = JSON.parse(fs.readFileSync(path.join(home, '.tto', 'config.json'), 'utf8'));
    assert.ok(cfg.benchmarkStrict.minAverageSavingPercent >= 10);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
