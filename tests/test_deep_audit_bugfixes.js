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
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'bin', 'thai-token-optimizer.js');
function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'tto-deepfix-')); }
function env(home) {
  return {
    ...process.env,
    HOME: home,
    TTO_HOME: path.join(home, '.thai-token-optimizer'),
    THAI_TOKEN_OPTIMIZER_HOME: path.join(home, '.thai-token-optimizer'),
    CODEX_HOME: path.join(home, '.codex'),
    CLAUDE_HOME: path.join(home, '.claude'),
    GEMINI_HOME: path.join(home, '.gemini'),
    OPENCODE_CONFIG_DIR: path.join(home, '.config', 'opencode'),
    OPENCLAW_HOME: path.join(home, '.openclaw'),
    HERMES_HOME: path.join(home, '.hermes')
  };
}
function run(home, args, opts = {}) {
  return spawnSync(process.execPath, [CLI, ...args], { cwd: ROOT, env: env(home), encoding: 'utf8', input: opts.input });
}

test('backup ids do not collide when created rapidly for the same target', () => {
  const home = tmp();
  const a = run(home, ['backup', 'codex']);
  const b = run(home, ['backup', 'codex']);
  assert.equal(a.status, 0, a.stderr);
  assert.equal(b.status, 0, b.stderr);
  const ja = JSON.parse(a.stdout);
  const jb = JSON.parse(b.stdout);
  assert.notEqual(ja.backup, jb.backup);
  const dirs = fs.readdirSync(path.join(home, '.thai-token-optimizer', 'backups')).filter(Boolean);
  assert.equal(dirs.length, 2);
});

test('uninstall all removes Gemini/OpenCode and guidance adapter files', () => {
  const home = tmp();
  assert.equal(run(home, ['install', 'all']).status, 0);
  const paths = [
    path.join(home, '.gemini', 'extensions', 'thai-token-optimizer', 'gemini-extension.json'),
    path.join(home, '.config', 'opencode', 'plugins', 'thai-token-optimizer.js'),
    path.join(home, '.openclaw', 'hooks', 'thai-token-optimizer', 'handler.ts'),
    path.join(home, '.hermes', 'plugins', 'thai-token-optimizer', '__init__.py'),
    path.join(home, '.hermes', 'agent-hooks', 'thai-token-optimizer-pre_tool_call.cjs'),
    path.join(home, '.cursor', 'rules', 'thai-token-optimizer.mdc'),
    path.join(home, '.aider', 'thai-token-optimizer.md'),
    path.join(home, '.cline', 'rules', 'thai-token-optimizer.md'),
    path.join(home, '.roo', 'rules', 'thai-token-optimizer.md')
  ];
  for (const p of paths) assert.ok(fs.existsSync(p), p);
  const out = run(home, ['uninstall', 'all']);
  assert.equal(out.status, 0, out.stderr);
  for (const p of paths) assert.equal(fs.existsSync(p), false, p);
});

test('rollback target filters gemini backups and never falls back to codex backup', () => {
  const home = tmp();
  const geminiFile = path.join(home, '.gemini', 'extensions', 'thai-token-optimizer', 'GEMINI.md');
  fs.mkdirSync(path.dirname(geminiFile), { recursive: true });
  fs.writeFileSync(geminiFile, 'gemini-original');
  assert.equal(run(home, ['backup', 'gemini']).status, 0);
  const codexFile = path.join(home, '.codex', 'hooks.json');
  fs.mkdirSync(path.dirname(codexFile), { recursive: true });
  fs.writeFileSync(codexFile, '{"codex":true}');
  assert.equal(run(home, ['backup', 'codex']).status, 0);
  fs.writeFileSync(geminiFile, 'gemini-mutated');
  const rb = run(home, ['rollback', 'gemini']);
  assert.equal(rb.status, 0, rb.stderr);
  assert.match(rb.stdout, /gemini/);
  assert.equal(fs.readFileSync(geminiFile, 'utf8'), 'gemini-original');
});

test('backup cursor captures adapter rule file', () => {
  const home = tmp();
  const cursorFile = path.join(home, '.cursor', 'rules', 'thai-token-optimizer.mdc');
  fs.mkdirSync(path.dirname(cursorFile), { recursive: true });
  fs.writeFileSync(cursorFile, 'cursor-rule-v1');
  const out = run(home, ['backup', 'cursor']);
  assert.equal(out.status, 0, out.stderr);
  const id = JSON.parse(out.stdout).backup;
  const mf = JSON.parse(fs.readFileSync(path.join(home, '.thai-token-optimizer', 'backups', id, 'manifest.json'), 'utf8'));
  assert.ok(mf.files.some(f => f.path === cursorFile && f.existed));
});

test('ci command ignores user benchmark policy and doctor --ci does not require installed hooks', () => {
  const home = tmp();
  const cfgDir = path.join(home, '.thai-token-optimizer');
  fs.mkdirSync(cfgDir, { recursive: true });
  fs.writeFileSync(path.join(cfgDir, 'config.json'), JSON.stringify({ benchmarkStrict: { minAverageSavingPercent: 99 } }));
  const bench = run(home, ['benchmark', '--strict', '--default-policy']);
  assert.equal(bench.status, 0, bench.stderr + bench.stdout);
  const doctor = run(home, ['doctor', '--ci']);
  assert.equal(doctor.status, 0, doctor.stderr + doctor.stdout);
  assert.match(doctor.stdout, /Mode: ci/);
});

test('install all doctor is OK even before optional install-agents', () => {
  const home = tmp();
  assert.equal(run(home, ['install', 'all']).status, 0);
  const doctor = run(home, ['doctor']);
  assert.equal(doctor.status, 0, doctor.stderr + doctor.stdout);
  assert.match(doctor.stdout, /Codex AGENTS block \(optional\)/);
});

test('compress rejects unknown flags instead of treating them as prompt text', () => {
  const home = tmp();
  const out = run(home, ['compress', '--unknown', 'prompt']);
  assert.notEqual(out.status, 0);
  assert.match(out.stderr, /Unknown option: --unknown/);
});
