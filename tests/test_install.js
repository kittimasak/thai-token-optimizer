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
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

const cli = path.resolve(__dirname, '..', 'bin', 'thai-token-optimizer.js');
function isolatedEnv(patch = {}) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-test-home-'));
  return {
    ...process.env,
    HOME: home,
    TTO_HOME: path.join(home, '.thai-token-optimizer'),
    ...patch
  };
}

test('install writes Codex hooks and enables codex_hooks feature', () => {
  const codexHome = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-home-'));
  const r = spawnSync(process.execPath, [cli, 'install'], {
    env: isolatedEnv({ CODEX_HOME: codexHome }),
    encoding: 'utf8'
  });
  assert.equal(r.status, 0);
  const hooks = JSON.parse(fs.readFileSync(path.join(codexHome, 'hooks.json'), 'utf8'));
  assert.ok(JSON.stringify(hooks).includes('tto-activate.js'));
  assert.ok(JSON.stringify(hooks).includes('tto-mode-tracker.js'));
  const config = fs.readFileSync(path.join(codexHome, 'config.toml'), 'utf8');
  assert.match(config, /\[features\][\s\S]*codex_hooks\s*=\s*true/);
});

test('install writes Claude Code hooks into settings.json', () => {
  const claudeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-home-'));
  const r = spawnSync(process.execPath, [cli, 'install', 'claude'], {
    env: isolatedEnv({ CLAUDE_HOME: claudeHome }),
    encoding: 'utf8'
  });
  assert.equal(r.status, 0);
  const settings = JSON.parse(fs.readFileSync(path.join(claudeHome, 'settings.json'), 'utf8'));
  assert.ok(JSON.stringify(settings).includes('tto-activate.js'));
  assert.ok(JSON.stringify(settings).includes('tto-mode-tracker.js'));
});
