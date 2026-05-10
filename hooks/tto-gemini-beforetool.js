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



const { getState, logError } = require('./tto-config');
const { classifyText, extractTextFromHookPayload } = require('./tto-safety-classifier');
let input='';
process.stdin.on('data', c => input += c);
process.stdin.on('end', () => {
  try {
    const state = getState();
    if (!state.enabled) process.exit(0);
    let payload = {}; try { payload = JSON.parse(input || '{}'); } catch (_) {}
    const safety = classifyText(extractTextFromHookPayload(payload));
    if (safety.shouldRelaxCompression) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          additionalContext:
            `THAI TOKEN OPTIMIZER v1.0 GEMINI SAFETY: ${safety.categories.join(', ')}. ` +
            'Preserve exact tool input/command. Explain risk briefly. Include backup, rollback, and verification. Do not over-compress.'
        }
      }));
    }
  } catch (e) { logError(`gemini-beforetool: ${e.message}`); }
  process.exit(0);
});
