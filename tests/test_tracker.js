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
    timeout: 5000,
    maxBuffer: 10 * 1024 * 1024 // 10MB
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

test('tracker exits 0 with continue JSON when state disabled and no trigger', () => {
  const home = makeTempHome();
  try {
    const result = runTracker('hello world', { TTO_HOME: home });
    assert.equal(result.status, 0);
    assert.equal(JSON.parse(result.stdout).continue, true);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('tracker emits minimal continue JSON when optimizer enabled', () => {
  const home = makeTempHome();
  try {
    fs.writeFileSync(path.join(home, 'state.json'),
      JSON.stringify({ enabled: true, level: 'full', version: 1 }));
    const result = runTracker('regular prompt', { TTO_HOME: home });
    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout);
    assert.deepEqual(parsed, { continue: true });
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
    assert.equal(JSON.parse(result.stdout).continue, true);
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

test('tracker records stats when stale files are detected without expanding hook output', () => {
  const home = makeTempHome();
  try {
    fs.writeFileSync(path.join(home, 'state.json'),
      JSON.stringify({ enabled: true, level: 'full', version: 1 }));
    
    // Create a policy with low threshold for testing
    fs.writeFileSync(path.join(home, 'config.json'),
      JSON.stringify({ contextPruning: { enabled: true, staleMinutesThreshold: 1 }, version: 1 }));

    // Create a stale read cache entry (2 minutes ago)
    const staleTime = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    fs.writeFileSync(path.join(home, 'read-cache-state.json'), JSON.stringify({
      files: {
        '/path/to/stale-file.js': {
          mtimeMs: Date.now(),
          size: 100,
          hash: 'abc',
          content: 'old content',
          lastReadAt: staleTime
        }
      }
    }));

    const result = runTracker('check gc', { TTO_HOME: home });
    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout);
    assert.deepEqual(parsed, { continue: true });
    const statsPath = path.join(home, 'stats.jsonl');
    assert.ok(fs.existsSync(statsPath));
    assert.match(fs.readFileSync(statsPath, 'utf8'), /UserPromptSubmit/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('tracker keeps Codex output minimal when pre-compression is considered', () => {
  const home = makeTempHome();
  try {
    fs.writeFileSync(path.join(home, 'state.json'),
      JSON.stringify({ enabled: true, level: 'full', version: 1 }));
    
    const longPrompt = 'สวัสดี '.repeat(110); 
    const result = runTracker(longPrompt, { TTO_HOME: home, TTO_NON_INTERACTIVE: '1' });
    assert.equal(result.status, 0);
    
    const stdout = result.stdout.trim();
    const jsonStart = stdout.indexOf('{');
    const jsonEnd = stdout.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error(`No JSON found in output: ${stdout}`);
    }
    const jsonPart = stdout.substring(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonPart);
    assert.deepEqual(parsed, { continue: true });
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
