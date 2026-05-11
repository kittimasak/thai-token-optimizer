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
const os = require('node:os');
const fs = require('node:fs');

const root = path.resolve(__dirname, '..');
const tracker = path.join(root, 'hooks', 'tto-mode-tracker.js');
const cli = path.join(root, 'bin', 'thai-token-optimizer.js');

function runTracker(prompt, home) {
  return spawnSync(process.execPath, [tracker], {
    input: JSON.stringify({ hook_event_name: 'UserPromptSubmit', prompt, cwd: process.cwd() }),
    env: { ...process.env, TTO_HOME: home },
    encoding: 'utf8'
  });
}

test('Codex Thai triggers enable and disable Thai Token Optimizer', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-codex-'));
  let r = runTracker('token thai lite', home);
  assert.equal(r.status, 0);
  assert.equal(r.stdout.trim(), '{"continue":true}');
  const state = JSON.parse(fs.readFileSync(path.join(home, 'state.json'), 'utf8'));
  assert.equal(state.enabled, true);
  assert.equal(state.level, 'lite');

  r = runTracker('หยุดลด token', home);
  assert.equal(r.status, 0);
  assert.equal(r.stdout.trim(), '');
  const state2 = JSON.parse(fs.readFileSync(path.join(home, 'state.json'), 'utf8'));
  assert.equal(state2.enabled, false);
});

test('Thai Token Optimizer CLI changes state', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-cli-'));
  let r = spawnSync(process.execPath, [cli, 'full'], { env: { ...process.env, TTO_HOME: home }, encoding: 'utf8' });
  assert.equal(r.status, 0);
  let state = JSON.parse(fs.readFileSync(path.join(home, 'state.json'), 'utf8'));
  assert.equal(state.enabled, true);
  assert.equal(state.level, 'full');

  r = spawnSync(process.execPath, [cli, 'off'], { env: { ...process.env, TTO_HOME: home }, encoding: 'utf8' });
  assert.equal(r.status, 0);
  state = JSON.parse(fs.readFileSync(path.join(home, 'state.json'), 'utf8'));
  assert.equal(state.enabled, false);
});
