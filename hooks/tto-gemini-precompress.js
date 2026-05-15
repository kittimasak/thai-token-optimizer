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
          'THAI TOKEN OPTIMIZER v2.0.0 GEMINI PRE-COMPRESS: Systematically compress previous conversation history. Discard narrative filler, keep only the latest technical state, decisions, changed files, commands, and errors. Summarize Thai compactly to prevent context bloat.'
      }
    }));
  } catch (e) { logError(`gemini-precompress: ${e.message}`); }
  process.exit(0);
});
