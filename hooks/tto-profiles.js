#!/usr/bin/env node
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



const { VALID_PROFILES, setState, getState } = require('./tto-config');
const { getProfileRules } = require('./tto-policy');

const TIERS = {
  CRITICAL: 1, // High-fidelity: Minimal compression
  ROUTINE: 2,  // Standard: TTO Normal
  INFORMATIONAL: 3 // Ultra-lite: Aggressive compression
};

const AGENT_TIERS = {
  'security_expert': TIERS.CRITICAL,
  'db_admin': TIERS.CRITICAL,
  'codebase_investigator': TIERS.INFORMATIONAL,
  'generalist': TIERS.ROUTINE,
  'cli_help': TIERS.INFORMATIONAL
};

const TASK_KEYWORDS = {
  [TIERS.CRITICAL]: ['auth', 'security', 'secret', 'password', 'migrate', 'migration', 'deploy', 'production', 'rollback', 'backup', 'payment', 'database', 'db'],
  [TIERS.INFORMATIONAL]: ['research', 'doc', 'explain', 'understand', 'list', 'show', 'find', 'search', 'readme', 'summary', 'สรุป']
};

function classifyTask(agentName, text = '') {
  const content = String(text).toLowerCase();
  const agentTier = agentName ? AGENT_TIERS[agentName] : null;

  // 1. If agent is Informational, stay Informational (Specialized Role)
  if (agentTier === TIERS.INFORMATIONAL) return TIERS.INFORMATIONAL;

  // 2. If agent is Critical, stay Critical
  if (agentTier === TIERS.CRITICAL) return TIERS.CRITICAL;

  // 3. If Routine agent (or unknown), check for Critical keywords
  for (const word of TASK_KEYWORDS[TIERS.CRITICAL]) {
    if (content.includes(word)) return TIERS.CRITICAL;
  }

  // 4. Check for Informational keywords
  for (const word of TASK_KEYWORDS[TIERS.INFORMATIONAL]) {
    if (content.includes(word)) return TIERS.INFORMATIONAL;
  }

  // 5. Default to Routine
  return TIERS.ROUTINE;
}

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
module.exports = { listProfiles, setProfile, describeProfile, classifyTask, TIERS };
