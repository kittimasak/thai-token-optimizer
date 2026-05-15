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


try {
  const { getState } = require('./tto-config');
  const { getProfileRules, getPolicy } = require('./tto-policy');
  const { getLatestContinuitySummary } = require('./tto-runtime-analytics');
  const state = getState();
  const policy = getPolicy();
  if (!state.enabled) process.exit(0);

  const level = ['auto', 'lite', 'full', 'safe'].includes(state.level) ? state.level : 'auto';
  const profile = state.profile || policy.defaultProfile || 'coding';
  const profileRules = getProfileRules(profile);
  const continuity = getLatestContinuitySummary();
  
  // Dynamic Skill Hinting: Detect project context to guide SLM/Agent focus
  let skillHint = 'General focus';
  try {
    const files = fs.readdirSync(process.cwd());
    const hasJs = files.some(f => /\.(js|ts|jsx|tsx|json)$/.test(f));
    const hasPy = files.some(f => /\.py$/.test(f));
    const hasDocs = files.some(f => /\.(md|txt|pdf)$/.test(f));
    skillHint = [
      hasJs ? 'JS/TS focus' : null,
      hasPy ? 'Python focus' : null,
      hasDocs ? 'Docs focus' : null
    ].filter(Boolean).join(', ') || 'General focus';
  } catch (_) {}

  const ruleset =
    `TTO v2 active — ${level}:${profile} (${skillHint}). ` +
    `Rule: ${profileRules.response}. ` +
    'ตอบไทยกระชับ; keep commands/paths/errors/IDs exact; safety tasks include risk/backup/verify/rollback. ' +
    'Use `tto auto|lite|full|safe|off`.' +
    (continuity
      ? ` Checkpoint: ${continuity.id} (${continuity.summary})\n`
      : '\n');

  process.stdout.write(ruleset);
  process.exit(0);
} catch (_) {
  process.exit(0);
}
