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
    emitContinue({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext:
          '[TTO Stage 4/4] Output Compact\nสรุปผลแบบสั้นและชัด: ไฟล์ที่เปลี่ยน, ผลลัพธ์สำคัญ, error (ถ้ามี), และ next action โดยคง path/error exact'
      }
    });
  } catch (e) {
    logError(`posttool-summary: ${e.message}`);
    emitContinue();
  }
  process.exit(0);
});
