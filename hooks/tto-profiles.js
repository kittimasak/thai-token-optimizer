#!/usr/bin/env node
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



const { VALID_PROFILES, setState, getState } = require('./tto-config');
const { getProfileRules } = require('./tto-policy');

function listProfiles() {
  return Array.from(VALID_PROFILES).map(name => ({ name, ...getProfileRules(name) }));
}
function setProfile(profile) {
  if (!VALID_PROFILES.has(profile)) throw new Error(`Invalid profile: ${profile}. Valid: ${Array.from(VALID_PROFILES).join(', ')}`);
  return setState({ profile });
}
function describeProfile(profile) {
  const state = getState();
  const p = profile || state.profile || 'coding';
  return { profile: p, ...getProfileRules(p) };
}
module.exports = { listProfiles, setProfile, describeProfile };
