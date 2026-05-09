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

function runTracker(prompt, home) {
  return spawnSync(process.execPath, [TRACKER_PATH], {
    env: { ...process.env, TTO_HOME: home },
    input: JSON.stringify({ prompt }),
    encoding: 'utf8',
    timeout: 5000
  });
}

function readState(home) {
  const p = path.join(home, 'state.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const cases = [
  { input: '/tto', enabled: true, level: 'full' },
  { input: '/tto lite', enabled: true, level: 'lite' },
  { input: '/tto full', enabled: true, level: 'full' },
  { input: '/tto stop', enabled: false, level: 'full' },
  { input: '/thai-token-optimizer', enabled: true, level: 'full' },
  { input: 'token thai on', enabled: true, level: 'full' },
  { input: 'token thai lite', enabled: true, level: 'lite' },
  { input: 'token thai full', enabled: true, level: 'full' },
  { input: 'token thai off', enabled: false, level: 'full' },
  { input: 'ลด token ไทย', enabled: true, level: 'full' },
  { input: 'พูดสั้นๆ', enabled: true, level: 'full' },
  { input: 'หยุดลด token', enabled: false, level: 'full' },
  { input: 'พูดปกติ', enabled: false, level: 'full' }
];

for (const tc of cases) {
  test(`trigger: "${tc.input}" → enabled=${tc.enabled} level=${tc.level}`, () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-trig-'));
    try {
      if (!tc.enabled) {
        fs.writeFileSync(path.join(home, 'state.json'),
          JSON.stringify({ enabled: true, level: 'full', version: 1 }));
      }
      runTracker(tc.input, home);
      const state = readState(home);
      assert.ok(state, `state should be written for "${tc.input}"`);
      assert.equal(state.enabled, tc.enabled, `enabled mismatch for "${tc.input}"`);
      assert.equal(state.level, tc.level, `level mismatch for "${tc.input}"`);
    } finally {
      fs.rmSync(home, { recursive: true, force: true });
    }
  });
}

test('trigger NOT detected when input is unrelated', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-trig-'));
  try {
    runTracker('how do I write a python script', home);
    const state = readState(home);
    assert.ok(state === null || state.enabled === false,
      'no trigger should leave state at defaults');
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('trigger NOT detected when keyword is part of a larger Thai sentence', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-trig-'));
  try {
    runTracker('ช่วยลด token ไทยของบทความนี้ให้หน่อย', home);
    const state = readState(home);
    assert.ok(state === null || state.enabled === false,
      'substring match should not fire');
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
