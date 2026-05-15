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
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'bin', 'thai-token-optimizer.js');
function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'tto-r2fix-')); }
function env(home) {
  return {
    ...process.env,
    HOME: home,
    TTO_HOME: path.join(home, '.thai-token-optimizer'),
    THAI_TOKEN_OPTIMIZER_HOME: path.join(home, '.thai-token-optimizer'),
    CODEX_HOME: path.join(home, '.codex'),
    CLAUDE_HOME: path.join(home, '.claude'),
    GEMINI_HOME: path.join(home, '.gemini'),
    OPENCODE_CONFIG_DIR: path.join(home, '.config', 'opencode')
  };
}
function run(home, args, opts = {}) {
  return spawnSync(process.execPath, [CLI, ...args], { cwd: ROOT, env: env(home), encoding: 'utf8', input: opts.input });
}

test('install codex replaces codex_hooks=false without duplicate TOML key', () => {
  const home = tmp();
  const cfg = path.join(home, '.codex', 'config.toml');
  fs.mkdirSync(path.dirname(cfg), { recursive: true });
  fs.writeFileSync(cfg, '[features]\ncodex_hooks = false\n');
  const out = run(home, ['install', 'codex']);
  assert.equal(out.status, 0, out.stderr + out.stdout);
  const text = fs.readFileSync(cfg, 'utf8');
  assert.equal((text.match(/^\s*codex_hooks\s*=/gm) || []).length, 1, text);
  assert.match(text, /^codex_hooks = true$/m);
  assert.doesNotMatch(text, /codex_hooks\s*=\s*false/);
});

test('rollback gemini from all backup restores only gemini files and does not touch codex', () => {
  const home = tmp();
  const codex = path.join(home, '.codex', 'hooks.json');
  const gemini = path.join(home, '.gemini', 'extensions', 'thai-token-optimizer', 'GEMINI.md');
  fs.mkdirSync(path.dirname(codex), { recursive: true });
  fs.mkdirSync(path.dirname(gemini), { recursive: true });
  fs.writeFileSync(codex, 'codex-old');
  fs.writeFileSync(gemini, 'gemini-old');
  assert.equal(run(home, ['backup', 'all']).status, 0);
  fs.writeFileSync(codex, 'codex-new');
  fs.writeFileSync(gemini, 'gemini-new');
  const rb = run(home, ['rollback', 'gemini', '--no-prebackup']);
  assert.equal(rb.status, 0, rb.stderr + rb.stdout);
  assert.match(rb.stdout, /Restored target scope: gemini/);
  assert.equal(fs.readFileSync(codex, 'utf8'), 'codex-new');
  assert.equal(fs.readFileSync(gemini, 'utf8'), 'gemini-old');
});

test('rollback dry-run previews files and does not mutate configs', () => {
  const home = tmp();
  const codex = path.join(home, '.codex', 'hooks.json');
  fs.mkdirSync(path.dirname(codex), { recursive: true });
  fs.writeFileSync(codex, 'codex-old');
  assert.equal(run(home, ['backup', 'codex']).status, 0);
  fs.writeFileSync(codex, 'codex-new');
  const rb = run(home, ['rollback', 'codex', '--dry-run']);
  assert.equal(rb.status, 0, rb.stderr + rb.stdout);
  const payload = JSON.parse(rb.stdout);
  assert.equal(payload.dryRun, true);
  assert.equal(payload.target, 'codex');
  assert.ok(payload.files.includes(codex));
  assert.equal(fs.readFileSync(codex, 'utf8'), 'codex-new');
});

test('rollback creates a pre-rollback backup before restore by default', () => {
  const home = tmp();
  const codex = path.join(home, '.codex', 'hooks.json');
  fs.mkdirSync(path.dirname(codex), { recursive: true });
  fs.writeFileSync(codex, 'codex-old');
  assert.equal(run(home, ['backup', 'codex']).status, 0);
  fs.writeFileSync(codex, 'codex-new');
  const rb = run(home, ['rollback', 'codex']);
  assert.equal(rb.status, 0, rb.stderr + rb.stdout);
  assert.match(rb.stdout, /Pre-rollback backup created:/);
  assert.equal(fs.readFileSync(codex, 'utf8'), 'codex-old');
  const backups = JSON.parse(run(home, ['backups']).stdout);
  const pre = backups.find(b => b.id.includes('-codex') && b.files > 0);
  assert.ok(pre);
});

test('adapter write backups do not overwrite when repeated rapidly', () => {
  const home = tmp();
  const file = path.join(home, '.cursor', 'rules', 'thai-token-optimizer.mdc');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, 'old');
  assert.equal(run(home, ['install', 'cursor']).status, 0);
  fs.writeFileSync(file, 'old2');
  assert.equal(run(home, ['install', 'cursor']).status, 0);
  const backupDir = path.join(home, '.thai-token-optimizer', 'adapter-backups');
  const backups = fs.existsSync(backupDir) ? fs.readdirSync(backupDir).filter(x => x.includes('thai-token-optimizer.mdc')) : [];
  assert.ok(backups.length >= 2, backups.join('\n'));
  assert.equal(new Set(backups).size, backups.length);
});
