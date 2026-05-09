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

const { getState, logError } = require('./tto-config');
let input='';
process.stdin.on('data', c => input += c);
process.stdin.on('end', () => {
  try {
    const state = getState();
    if (!state.enabled) process.exit(0);
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        additionalContext:
          'THAI TOKEN OPTIMIZER v1.0 GEMINI PRE-COMPRESS: preserve current task, decisions, changed files, commands, errors, constraints, versions, and next action. Summarize Thai compactly.'
      }
    }));
  } catch (e) { logError(`gemini-precompress: ${e.message}`); }
  process.exit(0);
});
