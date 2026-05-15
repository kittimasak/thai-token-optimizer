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
const { classifyText, extractTextFromHookPayload } = require('./tto-safety-classifier');

function emitContinue(payload = {}) {
  process.stdout.write(JSON.stringify({ continue: true, ...payload }));
}

let input = '';
process.stdin.on('data', c => input += c);
process.stdin.on('end', () => {
  try {
    const state = getState();
    if (!state.enabled) {
      emitContinue();
      process.exit(0);
    }
    let payload = {};
    try { payload = JSON.parse(input || '{}'); } catch (_) {}
    const text = extractTextFromHookPayload(payload);
    const safety = classifyText(text);
    if (safety.shouldRelaxCompression) {
      emitContinue({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext:
            `THAI TOKEN OPTIMIZER v2.0 SAFETY OVERRIDE: ${safety.categories.join(', ')}. ` +
            'Before tool use, preserve exact command, explain risk briefly, include backup/rollback/verification when relevant. Do not compress safety-critical steps.'
        }
      });
    } else {
      emitContinue();
    }
  } catch (e) {
    logError(`pretool-guard: ${e.message}`);
    emitContinue();
  }
  process.exit(0);
});
