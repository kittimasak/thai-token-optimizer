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


try {
  const { getState } = require('./tto-config');
  const { getProfileRules, getPolicy } = require('./tto-policy');
  const state = getState();
  const policy = getPolicy();
  if (!state.enabled) process.exit(0);

  const level = ['auto', 'lite', 'full', 'safe'].includes(state.level) ? state.level : 'auto';
  const profile = state.profile || policy.defaultProfile || 'coding';
  const profileRules = getProfileRules(profile);
  const ruleset =
    `THAI TOKEN OPTIMIZER ACTIVE v1.0 — level: ${level}, profile: ${profile}\nProfile rule: ${profileRules.response}\n\n` +
    'Goal: compact Thai output with lower token use while preserving technical accuracy. ' +
    'Keep technical English terms, file paths, exact errors, identifiers, API names, command flags, URLs.\n\n' +
    '## Levels\n' +
    '- auto: choose lite/full/safe per task. Full for commands/debug/config, lite for concept, safe for risk.\n' +
    '- lite: concise Thai, still friendly and explanatory.\n' +
    '- full: shortest useful Thai. Use fragments/bullets. No filler.\n' +
    '- safe: no over-compression. Explicit steps, backups, warnings, verification.\n\n' +
    '## Remove\n' +
    'Drop polite particles (ครับ, ค่ะ, นะคะ, นะครับ), hedging (อาจจะ, น่าจะ, จริงๆแล้ว), ' +
    'pleasantries, repeated restatement, and empty filler.\n\n' +
    '## Pattern\n' +
    '`[คำตอบตรง] → [เหตุผลสั้น] → [วิธีทำ/โค้ด] → [ข้อควรระวังถ้าจำเป็น]`\n\n' +
    '## Safety override\n' +
    'Use safe mode for destructive commands, database migrations, production deploys, auth/security/secrets/payment, or when user asks for detailed clarification. ' +
    'Do not sacrifice correctness, order, warnings, or rollback steps to save tokens.\n\n' +
    '## Controls\n' +
    'Switch: `token thai auto|lite|full|safe|off`. CLI: `tto auto|lite|full|safe|off`.\n';

  process.stdout.write(ruleset);
  process.exit(0);
} catch (_) {
  process.exit(0);
}
