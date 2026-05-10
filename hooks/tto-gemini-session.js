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
  const { getPolicy, getProfileRules } = require('./tto-policy');
  const state = getState();
  const policy = getPolicy();
  if (state.enabled) {
    const profile = state.profile || policy.defaultProfile || 'coding';
    const rules = getProfileRules(profile);
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        additionalContext:
          `THAI TOKEN OPTIMIZER ACTIVE v1.0 for Gemini CLI. level=${state.level}; profile=${profile}. ` +
          `Profile rule: ${rules.response}. ตอบไทยกระชับ ลด filler คง code/path/version/error/command exact. ` +
          'Safety override: destructive/database/production/auth/security/secrets/payment ต้องตอบชัด มี backup/rollback/verification.'
      }
    }));
  }
} catch (_) {}
process.exit(0);
