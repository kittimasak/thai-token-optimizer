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


#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME_DIR = process.env.TTO_HOME || process.env.THAI_TOKEN_OPTIMIZER_HOME || path.join(os.homedir(), '.thai-token-optimizer');
const STATE_PATH = path.join(HOME_DIR, 'state.json');
const ERROR_LOG_PATH = path.join(HOME_DIR, 'error.log');
const STATS_PATH = path.join(HOME_DIR, 'stats.jsonl');

const DEFAULT_STATE = Object.freeze({
  enabled: false,
  level: 'auto',
  profile: 'coding',
  safetyMode: 'strict',
  version: 1
});

const VALID_LEVELS = new Set(['auto', 'lite', 'full', 'safe']);
const VALID_PROFILES = new Set(['coding', 'research', 'teaching', 'command', 'paper', 'ultra']);
const VALID_SAFETY_MODES = new Set(['strict', 'normal', 'off']);

function logError(msg) {
  try {
    fs.mkdirSync(HOME_DIR, { recursive: true });
    fs.appendFileSync(ERROR_LOG_PATH, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (_) {
    // Logging is best-effort.
  }
}

function normalizeState(parsed = {}) {
  return {
    enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_STATE.enabled,
    level: VALID_LEVELS.has(parsed.level) ? parsed.level : DEFAULT_STATE.level,
    profile: VALID_PROFILES.has(parsed.profile) ? parsed.profile : DEFAULT_STATE.profile,
    safetyMode: VALID_SAFETY_MODES.has(parsed.safetyMode) ? parsed.safetyMode : DEFAULT_STATE.safetyMode,
    version: typeof parsed.version === 'number' ? parsed.version : DEFAULT_STATE.version,
    lastChanged: parsed.lastChanged || undefined,
    lastSafetyCategory: parsed.lastSafetyCategory || undefined,
    lastEstimatedSaving: typeof parsed.lastEstimatedSaving === 'number' ? parsed.lastEstimatedSaving : undefined
  };
}

function getState() {
  try {
    if (!fs.existsSync(STATE_PATH)) return { ...DEFAULT_STATE };
    return normalizeState(JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')));
  } catch (e) {
    logError(`getState: ${e.message}`);
    return { ...DEFAULT_STATE };
  }
}

function setState(patch) {
  try {
    fs.mkdirSync(HOME_DIR, { recursive: true });
    const current = getState();
    const merged = normalizeState({
      ...current,
      ...patch,
      version: 1,
      lastChanged: new Date().toISOString()
    });
    const tmpPath = STATE_PATH + '.tmp';
    fs.writeFileSync(tmpPath, JSON.stringify(merged, null, 2));
    fs.renameSync(tmpPath, STATE_PATH);
    return merged;
  } catch (e) {
    logError(`setState: ${e.message}`);
    return null;
  }
}

function appendStats(record) {
  try {
    fs.mkdirSync(HOME_DIR, { recursive: true });
    fs.appendFileSync(STATS_PATH, JSON.stringify({ ts: new Date().toISOString(), ...record }) + '\n');
  } catch (e) {
    logError(`appendStats: ${e.message}`);
  }
}

module.exports = {
  HOME_DIR,
  STATE_PATH,
  ERROR_LOG_PATH,
  STATS_PATH,
  DEFAULT_STATE,
  VALID_LEVELS,
  VALID_PROFILES,
  VALID_SAFETY_MODES,
  getState,
  setState,
  appendStats,
  logError,
  normalizeState
};
