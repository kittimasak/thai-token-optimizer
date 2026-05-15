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



const { getState, setState, appendStats, logError } = require('./tto-config');
const { classifyText } = require('./tto-safety-classifier');
const { estimateTokens } = require('./tto-token-estimator');
const { getPolicy, getProfileRules } = require('./tto-policy');

function stripCodeFences(text) {
  return String(text || '').replace(/```[\s\S]*?```/g, '').replace(/```[\s\S]*$/, '');
}

function parseTrigger(prompt) {
  const cleaned = stripCodeFences(prompt);
  const trimmed = cleaned.trim();
  const lower = trimmed.toLowerCase();

  const slashMatch = trimmed.match(/^\/(?:tto|thai-token-optimizer)(?:\s+(\w+))?$/i);
  if (slashMatch) {
    const arg = (slashMatch[1] || '').toLowerCase();
    if (['auto', 'lite', 'full', 'safe'].includes(arg)) return { enabled: true, level: arg };
    if (arg === 'spec' || arg === 'speculative') return { enabled: true, speculative: true };
    if (arg === 'nospec' || arg === 'no-speculative') return { speculative: false };
    if (arg === 'interactive') return { autoCompressInput: false };
    if (arg === 'nointeractive') return { autoCompressInput: true };
    if (arg === 'stop' || arg === 'off') return { enabled: false };
    if (arg === '') return { enabled: true, level: 'full' };
    return null;
  }

  const ttoMatch = lower.match(/^(?:token thai|thai token|thai compact|tto)\s+(on|start|enable|auto|lite|full|safe|off|stop|disable|spec|speculative|nospec|no-speculative|interactive|nointeractive)$/);
  if (ttoMatch) {
    const arg = ttoMatch[1];
    if (['off', 'stop', 'disable'].includes(arg)) return { enabled: false };
    if (arg === 'spec' || arg === 'speculative') return { enabled: true, speculative: true };
    if (arg === 'nospec' || arg === 'no-speculative') return { speculative: false };
    if (arg === 'interactive') return { autoCompressInput: false };
    if (arg === 'nointeractive') return { autoCompressInput: true };
    if (arg === 'on' || arg === 'start' || arg === 'enable') return { enabled: true, level: 'full' };
    return { enabled: true, level: arg };
  }

  const enableThai = ['ลด token ไทย', 'ประหยัด token ไทย', 'ตอบสั้น', 'พูดสั้นๆ', 'เปิดโหมดลด token', 'เปิดลด token'];
  const disableThai = ['หยุดลด token', 'ปิดลด token', 'พูดปกติ', 'ตอบปกติ'];

  for (const phrase of disableThai) if (trimmed === phrase) return { enabled: false };
  for (const phrase of enableThai) if (trimmed === phrase) return { enabled: true, level: 'full' };

  if (trimmed === 'เปิดโหมดคาดการณ์' || trimmed === 'เปิด speculation') return { enabled: true, speculative: true };
  if (trimmed === 'ปิดโหมดคาดการณ์' || trimmed === 'ปิด speculation') return { speculative: false };

  if (trimmed === 'ลด token ไทย auto' || trimmed === 'ลด token ไทย อัตโนมัติ') return { enabled: true, level: 'auto' };
  if (trimmed === 'ลด token ไทย lite' || trimmed === 'ลด token ไทย เบา') return { enabled: true, level: 'lite' };
  if (trimmed === 'ลด token ไทย full' || trimmed === 'ลด token ไทย เต็ม') return { enabled: true, level: 'full' };
  if (trimmed === 'ลด token ไทย safe' || trimmed === 'ลด token ไทย ปลอดภัย') return { enabled: true, level: 'safe' };

  return null;
}

function chooseEffectiveLevel(state, safety) {
  if (state.safetyMode !== 'off' && safety.safeCritical) return 'safe';
  if (state.level !== 'auto') return state.level;
  const profileRules = getProfileRules(state.profile || 'coding');
  if (profileRules.levelBias && !safety.shouldRelaxCompression) return profileRules.levelBias;
  if (safety.shouldRelaxCompression) return 'safe';
  return 'full';
}

function emitActiveReminder(state, prompt, safety) {
  const policy = getPolicy();
  const effectiveLevel = chooseEffectiveLevel(state, safety);
  const est = estimateTokens(prompt, 'codex/claude', { exact: policy.exactTokenizer });
  appendStats({ event: 'UserPromptSubmit', estimatedPromptTokens: est.estimatedTokens, level: state.level, effectiveLevel, safetyCategories: safety.categories });
  setState({ lastSafetyCategory: safety.categories[0] || undefined });
  const context =
    Number(est.estimatedTokens || 0) >= 300 || safety.safeCritical || safety.shouldRelaxCompression
      ? `[TTO Stage 1/4] Detect Intent\n` +
        `mode=${state.level}; effective=${effectiveLevel}; profile=${state.profile || 'coding'}; speculative=${state.speculative ? 'on' : 'off'}\n` +
        `[TTO Stage 3/4] Preserve Critical\n` +
        `คง command/path/error/identifier ให้ตรงเดิม; safety=${safety.categories.join(', ') || 'clear'}\n` +
        `[TTO Stage 4/4] Output Compact\n` +
        `ตอบไทยกระชับ พร้อม next action ที่จำเป็น`
      : `TTO: compact Thai active (${state.level}->${effectiveLevel}); keep command/path/error/ID exact.`;
  process.stdout.write(JSON.stringify({
    continue: true,
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: context
    }
  }));
}

if (require.main === module) {
  let input = '';
  let responded = false;
  const respondContinue = () => {
    if (responded) return;
    responded = true;
    process.stdout.write(JSON.stringify({ continue: true }));
  };
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input || '{}');
      const prompt = (data.prompt || data.message || '').toString();
      const trigger = parseTrigger(prompt);
      if (trigger) setState(trigger);
      const state = getState();
      if (state.enabled) emitActiveReminder(state, prompt, classifyText(prompt));
      else respondContinue();
    } catch (e) {
      logError(`mode-tracker: ${e.message}`);
      respondContinue();
    }
    process.exit(0);
  });
}

module.exports = { stripCodeFences, parseTrigger, chooseEffectiveLevel };
