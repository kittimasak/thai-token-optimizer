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
let input='';
process.stdin.on('data', c => input += c);
process.stdin.on('end', () => {
  try {
    const state = getState();
    if (!state.enabled) {
      process.stdout.write('{}');
      process.exit(0);
    }
    let payload = {}; try { payload = JSON.parse(input || '{}'); } catch (_) {}
    const safety = classifyText(extractTextFromHookPayload(payload));
    
    const output = { hookSpecificOutput: { additionalContext: '' } };
    
    if (safety.shouldRelaxCompression) {
      output.hookSpecificOutput.additionalContext = 
        `[TTO Stage 3/4] Preserve Critical (Safety Override)\n` +
        `Gemini risk categories: ${safety.categories.join(', ')}\n` +
        'Preserve exact tool input/command. Explain risk briefly. Include backup, rollback, and verification. Do not over-compress.';
    } else {
      output.hookSpecificOutput.additionalContext = 'TTO v2.0.0 [Safety: Normal]: Proceed with standard compression.';
    }
    
    process.stdout.write(JSON.stringify(output));
  } catch (e) { 
    logError(`gemini-beforetool: ${e.message}`);
    process.stdout.write('{}');
  }
  process.exit(0);
});
