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

function makeTempHome() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-test-'));
  process.env.TTO_HOME = dir;
  delete require.cache[require.resolve('../hooks/tto-config.js')];
  return dir;
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  delete process.env.TTO_HOME;
}

test('getState returns defaults when state file missing', () => {
  const home = makeTempHome();
  try {
    const { getState, DEFAULT_STATE } = require('../hooks/tto-config.js');
    const state = getState();
    assert.equal(state.enabled, DEFAULT_STATE.enabled);
    assert.equal(state.level, DEFAULT_STATE.level);
    assert.equal(state.version, DEFAULT_STATE.version);
  } finally {
    cleanup(home);
  }
});

test('getState returns defaults when JSON malformed', () => {
  const home = makeTempHome();
  try {
    const { getState, STATE_PATH, DEFAULT_STATE } = require('../hooks/tto-config.js');
    fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
    fs.writeFileSync(STATE_PATH, '{not valid json');
    const state = getState();
    assert.equal(state.enabled, DEFAULT_STATE.enabled);
    assert.equal(state.level, DEFAULT_STATE.level);
  } finally {
    cleanup(home);
  }
});

test('setState creates optimizer dir if missing', () => {
  const home = makeTempHome();
  try {
    const { setState, STATE_PATH } = require('../hooks/tto-config.js');
    setState({ enabled: true, level: 'lite' });
    assert.ok(fs.existsSync(STATE_PATH), 'state file should exist');
    const written = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    assert.equal(written.enabled, true);
    assert.equal(written.level, 'lite');
    assert.equal(written.version, 1);
    assert.ok(written.lastChanged, 'lastChanged timestamp should be set');
  } finally {
    cleanup(home);
  }
});

test('setState writes atomically (no .tmp file remains)', () => {
  const home = makeTempHome();
  try {
    const { setState, STATE_PATH } = require('../hooks/tto-config.js');
    setState({ enabled: true, level: 'full' });
    const tmpPath = STATE_PATH + '.tmp';
    assert.ok(!fs.existsSync(tmpPath), '.tmp file should not exist after write');
  } finally {
    cleanup(home);
  }
});

test('setState merges with existing state (partial update)', () => {
  const home = makeTempHome();
  try {
    const { getState, setState } = require('../hooks/tto-config.js');
    setState({ enabled: true, level: 'full' });
    setState({ level: 'lite' });
    const state = getState();
    assert.equal(state.enabled, true, 'enabled should be preserved');
    assert.equal(state.level, 'lite', 'level should be updated');
  } finally {
    cleanup(home);
  }
});

test('STATE_PATH respects TTO_HOME env var', () => {
  const home = makeTempHome();
  try {
    const { STATE_PATH } = require('../hooks/tto-config.js');
    assert.ok(STATE_PATH.startsWith(home), `STATE_PATH (${STATE_PATH}) should start with ${home}`);
  } finally {
    cleanup(home);
  }
});

test('STATE_PATH uses default home when writable, otherwise uses fallback path', () => {
  delete process.env.TTO_HOME;
  delete process.env.THAI_TOKEN_OPTIMIZER_HOME;
  delete process.env.TTO_FALLBACK_HOME;
  delete require.cache[require.resolve('../hooks/tto-config.js')];
  const { STATE_PATH, canWriteDir } = require('../hooks/tto-config.js');
  const preferred = path.join(os.homedir(), '.thai-token-optimizer', 'state.json');
  if (canWriteDir(path.dirname(preferred))) {
    assert.equal(STATE_PATH, preferred);
  } else {
    assert.ok(STATE_PATH.startsWith(path.join(os.tmpdir(), 'thai-token-optimizer')), `STATE_PATH (${STATE_PATH}) should use tmp fallback`);
  }
});

test('STATE_PATH falls back to tmp path when default home is not writable', () => {
  delete process.env.TTO_HOME;
  delete process.env.THAI_TOKEN_OPTIMIZER_HOME;
  const fallbackRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-fallback-root-'));
  process.env.TTO_FALLBACK_HOME = fallbackRoot;
  const fsMod = require('node:fs');
  const origMkdir = fsMod.mkdirSync;
  const blocked = path.join(os.homedir(), '.thai-token-optimizer');
  try {
    fsMod.mkdirSync = function patchedMkdirSync(target, options) {
      if (String(target).startsWith(blocked)) {
        const err = new Error('operation not permitted');
        err.code = 'EPERM';
        throw err;
      }
      return origMkdir.call(this, target, options);
    };
    delete require.cache[require.resolve('../hooks/tto-config.js')];
    const { HOME_DIR, STATE_PATH } = require('../hooks/tto-config.js');
    assert.ok(HOME_DIR.startsWith(fallbackRoot), `HOME_DIR (${HOME_DIR}) should start with fallback root (${fallbackRoot})`);
    assert.ok(STATE_PATH.startsWith(fallbackRoot), `STATE_PATH (${STATE_PATH}) should start with fallback root (${fallbackRoot})`);
  } finally {
    fsMod.mkdirSync = origMkdir;
    delete process.env.TTO_FALLBACK_HOME;
    fs.rmSync(fallbackRoot, { recursive: true, force: true });
  }
});
