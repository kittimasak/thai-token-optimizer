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

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const TRACKER_PATH = path.join(__dirname, '..', 'hooks', 'tto-mode-tracker.js');

function runTracker(prompt, env = {}) {
  return spawnSync(process.execPath, [TRACKER_PATH], {
    env: { ...process.env, ...env },
    input: JSON.stringify({ prompt }),
    encoding: 'utf8',
    timeout: 5000
  });
}

function makeTempHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'tto-test-'));
}

function readState(home) {
  const p = path.join(home, 'state.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

test('tracker exits 0 with empty stdout when state disabled and no trigger', () => {
  const home = makeTempHome();
  try {
    const result = runTracker('hello world', { TTO_HOME: home });
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), '');
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('tracker emits hookSpecificOutput JSON when optimizer enabled', () => {
  const home = makeTempHome();
  try {
    fs.writeFileSync(path.join(home, 'state.json'),
      JSON.stringify({ enabled: true, level: 'full', version: 1 }));
    const result = runTracker('regular prompt', { TTO_HOME: home });
    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
    assert.match(parsed.hookSpecificOutput.additionalContext, /THAI TOKEN OPTIMIZER ACTIVE/);
    assert.match(parsed.hookSpecificOutput.additionalContext, /full/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('tracker exits 0 on malformed stdin JSON (silent)', () => {
  const home = makeTempHome();
  try {
    const result = spawnSync(process.execPath, [TRACKER_PATH], {
      env: { ...process.env, TTO_HOME: home },
      input: '{not valid json',
      encoding: 'utf8',
      timeout: 5000
    });
    assert.equal(result.status, 0);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('tracker ignores trigger inside code fence', () => {
  const home = makeTempHome();
  try {
    const promptWithFence = 'see this:\n```\n/tto lite\n```\nthat was inside a fence';
    const result = runTracker(promptWithFence, { TTO_HOME: home });
    assert.equal(result.status, 0);
    const state = readState(home);
    assert.ok(state === null || state.enabled === false,
      'state should NOT be enabled when trigger is inside code fence');
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('tracker activates with /tto', () => {
  const home = makeTempHome();
  try {
    runTracker('/tto', { TTO_HOME: home });
    const state = readState(home);
    assert.ok(state, 'state file should be written');
    assert.equal(state.enabled, true);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('tracker switches level with /tto lite', () => {
  const home = makeTempHome();
  try {
    runTracker('/tto lite', { TTO_HOME: home });
    const state = readState(home);
    assert.equal(state.enabled, true);
    assert.equal(state.level, 'lite');
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('tracker disables with /tto off', () => {
  const home = makeTempHome();
  try {
    fs.writeFileSync(path.join(home, 'state.json'),
      JSON.stringify({ enabled: true, level: 'full', version: 1 }));
    runTracker('/tto off', { TTO_HOME: home });
    const state = readState(home);
    assert.equal(state.enabled, false);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
