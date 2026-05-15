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

test('compress --budget keeps package version constraint and fits approximate budget', () => {
  const input = 'ช่วยอธิบายรายละเอียดเกี่ยวกับการปรับแต่งระบบอย่างละเอียด แต่ยังเป็น Thai Token Optimizer v2.0 ไม่เปลี่ยนเวอร์ชันเด็ดขาด และต้องใช้คำสั่ง node bin/thai-token-optimizer.js install all';
  const res = run(['compress', '--budget', '80', '--target', 'codex', '--check', input]);
  assert.equal(res.status, 0, res.stderr);
  assert.match(res.stdout, /v2\.0/);
  assert.match(res.stdout, /node bin\/thai-token-optimizer\.js install all/);
  assert.match(res.stderr, /Budget: 80/);
  assert.match(res.stderr, /Preservation:/);
});

test('preservation checker reports missing constraints', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-preserve-'));
  try {
    const original = path.join(home, 'original.txt');
    const optimized = path.join(home, 'optimized.txt');
    fs.writeFileSync(original, 'ห้ามเปลี่ยนเวอร์ชัน v2.0 เด็ดขาด ใช้ไฟล์ package.json');
    fs.writeFileSync(optimized, 'ใช้ไฟล์ package.json');
    const res = run(['preserve', original, optimized]);
    assert.equal(res.status, 0, res.stderr);
    const json = JSON.parse(res.stdout);
    assert.equal(json.risk, 'high');
    assert.ok(json.missingCount >= 1);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('backup and rollback restore Codex hooks', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-backup-'));
  const codexHome = path.join(home, '.codex');
  const ttoHome = path.join(home, '.tto');
  fs.mkdirSync(codexHome, { recursive: true });
  const hooksPath = path.join(codexHome, 'hooks.json');
  fs.writeFileSync(hooksPath, JSON.stringify({ hooks: { Original: [{ keep: true }] } }, null, 2));
  const env = { HOME: home, CODEX_HOME: codexHome, TTO_HOME: ttoHome };
  try {
    const b = run(['backup', 'codex'], env);
    assert.equal(b.status, 0, b.stderr);
    fs.writeFileSync(hooksPath, JSON.stringify({ hooks: { Changed: [] } }, null, 2));
    const rb = run(['rollback', 'codex'], env);
    assert.equal(rb.status, 0, rb.stderr);
    const restored = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
    assert.deepEqual(restored, { hooks: { Original: [{ keep: true }] } });
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('doctor reports installed Codex and Claude hooks in isolated home', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-doctor-'));
  const env = { HOME: home, CODEX_HOME: path.join(home, '.codex'), CLAUDE_HOME: path.join(home, '.claude'), TTO_HOME: path.join(home, '.tto') };
  try {
    assert.equal(run(['install', 'all'], env).status, 0);
    assert.equal(run(['install-agents'], env).status, 0);
    const res = run(['doctor'], env);
    assert.equal(res.status, 0, res.stdout + res.stderr);
    assert.match(res.stdout, /Status: OK/);
    assert.match(res.stdout, /Package version remains 2\.0\.0/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('doctor codex validates only Codex integration with hook simulations', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-doctor-codex-'));
  const env = { HOME: home, CODEX_HOME: path.join(home, '.codex'), CLAUDE_HOME: path.join(home, '.claude'), TTO_HOME: path.join(home, '.tto') };
  try {
    assert.equal(run(['install', 'codex'], env).status, 0);
    const codex = run(['doctor', 'codex'], env);
    assert.equal(codex.status, 0, codex.stdout + codex.stderr);
    assert.match(codex.stdout, /Target: codex/);
    assert.match(codex.stdout, /Codex UserPromptSubmit hook simulation/);
    assert.doesNotMatch(codex.stdout, /Claude hooks installed/);

    const all = run(['doctor', 'all'], env);
    assert.notEqual(all.status, 0);
    assert.match(all.stdout, /Claude hooks installed/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('doctor codex fails when installed hook command points to the wrong script path', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-doctor-bad-hook-'));
  const codexHome = path.join(home, '.codex');
  const env = { HOME: home, CODEX_HOME: codexHome, TTO_HOME: path.join(home, '.tto') };
  try {
    assert.equal(run(['install', 'codex'], env).status, 0);
    const hooksPath = path.join(codexHome, 'hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
    hooks.hooks.UserPromptSubmit[0].hooks[0].command = 'node /tmp/missing/tto-mode-tracker.js';
    fs.writeFileSync(hooksPath, JSON.stringify(hooks, null, 2) + '\n');

    const res = run(['doctor', 'codex'], env);
    assert.notEqual(res.status, 0);
    assert.match(res.stdout, /Codex UserPromptSubmit hook command/);
    assert.match(res.stdout, /Status: WARN/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('doctor supports target-specific Claude Gemini and OpenCode checks', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-doctor-targets-'));
  const env = {
    HOME: home,
    CODEX_HOME: path.join(home, '.codex'),
    CLAUDE_HOME: path.join(home, '.claude'),
    GEMINI_HOME: path.join(home, '.gemini'),
    OPENCODE_CONFIG_DIR: path.join(home, '.config', 'opencode'),
    OPENCLAW_HOME: path.join(home, '.openclaw'),
    HERMES_HOME: path.join(home, '.hermes'),
    TTO_HOME: path.join(home, '.tto')
  };
  try {
    assert.equal(run(['install', 'claude'], env).status, 0);
    assert.equal(run(['doctor', 'claude'], env).status, 0);

    assert.equal(run(['install', 'gemini'], env).status, 0);
    const gemini = run(['doctor', 'gemini'], env);
    assert.equal(gemini.status, 0, gemini.stdout + gemini.stderr);
    assert.match(gemini.stdout, /Target: gemini/);

    assert.equal(run(['install', 'opencode'], env).status, 0);
    const opencode = run(['doctor', 'opencode'], env);
    assert.equal(opencode.status, 0, opencode.stdout + opencode.stderr);
    assert.match(opencode.stdout, /OpenCode plugin exposes hooks/);

    assert.equal(run(['install', 'openclaw'], env).status, 0);
    const openclaw = run(['doctor', 'openclaw'], env);
    assert.equal(openclaw.status, 0, openclaw.stdout + openclaw.stderr);
    assert.match(openclaw.stdout, /OpenClaw hook simulation/);

    assert.equal(run(['install', 'hermes'], env).status, 0);
    const hermes = run(['doctor', 'hermes'], env);
    assert.equal(hermes.status, 0, hermes.stdout + hermes.stderr);
    assert.match(hermes.stdout, /Hermes shell hook simulation/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
