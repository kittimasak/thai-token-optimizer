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



const readline = require('readline');
const fs = require('fs');
const { compressPrompt } = require('./tto-compressor');
const { getState, setState, appendStats, logError } = require('./tto-config');
const { classifyText } = require('./tto-safety-classifier');
const { estimateTokens, estimateSavings } = require('./tto-token-estimator');
const { getPolicy, getProfileRules } = require('./tto-policy');
const { deriveMilestones, maybeCaptureLifecycleCheckpoint, getStaleContext } = require('./tto-runtime-analytics');

function stripCodeFences(text) {
  return String(text || '').replace(/```[\s\S]*?```/g, '').replace(/```[\s\S]*$/, '');
}

async function askUserInteractive(original, compressed, stats) {
  if (process.env.TTO_NON_INTERACTIVE || !process.stdout.isTTY) {
    return { action: 'reject', text: original };
  }
  return new Promise((resolve) => {
    let ttyIn, ttyOut;
    try {
      // Use /dev/tty to communicate directly with user even if stdin/stdout are piped
      ttyIn = fs.createReadStream('/dev/tty');
      ttyOut = fs.createWriteStream('/dev/tty');
    } catch (e) {
      return resolve({ action: 'reject', text: original });
    }

    const rl = readline.createInterface({ input: ttyIn, output: ttyOut });

    ttyOut.write(`\n\x1b[33m⚡ [Thai Token Optimizer] Prompt นี้ยาวเกินไป (${stats.before.estimatedTokens} tokens)\x1b[0m\n`);
    ttyOut.write(`\x1b[32mประหยัดได้ ${stats.savedTokens} tokens (${stats.savingPercent}%)\x1b[0m\n`);
    ttyOut.write(`\x1b[90m--- เวอร์ชันแนะนำ ---\x1b[0m\n${compressed}\n\x1b[90m--------------------\x1b[0m\n`);
    ttyOut.write('\x1b[1mยอมรับการบีบอัดนี้หรือไม่? (y/n/e:แก้ไข/a:อัตโนมัติตลอดไป): \x1b[0m');

    rl.on('line', (line) => {
      const choice = line.trim().toLowerCase();
      if (choice === 'a' || choice === 'always' || choice === 'auto') {
        rl.close();
        ttyIn.destroy();
        resolve({ action: 'always', text: compressed });
      } else if (choice === 'y' || choice === 'yes' || choice === '') {
        rl.close();
        ttyIn.destroy();
        resolve({ action: 'accept', text: compressed });
      } else if (choice === 'e' || choice === 'edit') {
        ttyOut.write('\x1b[36mกรุณาป้อนเวอร์ชันที่ต้องการ (จบด้วย Ctrl+D หรือบรรทัดว่างที่มีเพียงจุด .): \x1b[0m\n');
        let edited = '';
        const editRl = readline.createInterface({ input: ttyIn, output: ttyOut });
        editRl.on('line', (editLine) => {
           if (editLine.trim() === '.') {
             editRl.close();
             ttyIn.destroy();
             resolve({ action: 'accept', text: edited.trim() });
           } else {
             edited += editLine + '\n';
           }
        });
      } else {
        rl.close();
        ttyIn.destroy();
        resolve({ action: 'reject', text: original });
      }
    });
  });
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
    if (arg === 'nospec') return { speculative: false };
    if (arg === 'interactive') return { autoCompressInput: false };
    if (arg === 'nointeractive') return { autoCompressInput: true };
    if (arg === 'stop' || arg === 'off') return { enabled: false };
    if (arg === '') return { enabled: true, level: 'full' };
    return null;
  }

  const ttoMatch = lower.match(/^(?:token thai|thai token|thai compact|tto)\s+(on|start|enable|auto|lite|full|safe|off|stop|disable|spec|speculative|interactive|nointeractive)$/);
  if (ttoMatch) {
    const arg = ttoMatch[1];
    if (['off', 'stop', 'disable'].includes(arg)) return { enabled: false };
    if (arg === 'spec' || arg === 'speculative') return { enabled: true, speculative: true };
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

function shouldEmitVerboseContext({ trigger, safety, tokenEst, compressed }) {
  if (trigger) return true;
  if (safety.safeCritical || safety.shouldRelaxCompression) return true;
  if (compressed) return true;
  if (tokenEst?.gcHint) return true;
  return Number(tokenEst?.estimatedTokens || 0) >= 300;
}

function buildAdditionalContext({ state, effectiveLevel, safety, gcHint, verbose }) {
  if (!verbose) {
    return `TTO: compact Thai active (${state.level}->${effectiveLevel}); keep command/path/error/ID exact.`;
  }
  return (
    `[TTO Stage 1/4] Analyze Prompt\n` +
    `กำลังประเมินความเสี่ยงและประเภทงาน\n` +
    `[TTO Stage 2/4] Select Mode\n` +
    `สถานะ: level=${state.level}, effective=${effectiveLevel}, profile=${state.profile || 'coding'}, safety=${safety.safeCritical ? 'critical->safe' : 'normal'}\n` +
    `[TTO Stage 3/4] Preserve Critical\n` +
    `คง command/path/error/identifier ให้ตรงเดิม\n` +
    `[TTO Stage 4/4] Output Compact\n` +
    `ตอบกระชับ อ่านง่าย พร้อมขั้นตอนที่ทำต่อได้ทันที` +
    gcHint
  );
}

function emitActiveReminder(state, prompt, safety) {
  const policy = getPolicy();
  const effectiveLevel = chooseEffectiveLevel(state, safety);
  const est = estimateTokens(prompt, 'codex/claude', { exact: policy.exactTokenizer });
  
  // Automated Context Pruning Check
  const staleContext = getStaleContext(policy);
  let gcHint = '';
  if (staleContext.length > 0) {
    const fileList = staleContext.map(s => s.name).join(', ');
    gcHint = `\n[TTO Context GC] ตรวจพบไฟล์ที่ไม่ได้อ้างถึงนานกว่า ${policy.contextPruning.staleMinutesThreshold} นาที: [${fileList}] แนะนำให้สรุปย่อ (Summarize) หรือนำออกจากหน่วยความจำ (Forget) เพื่อประหยัด Token`;
  }

  appendStats({ event: 'UserPromptSubmit', estimatedPromptTokens: est.estimatedTokens, level: state.level, effectiveLevel, safetyCategories: safety.categories });
  setState({ lastSafetyCategory: safety.categories[0] || undefined });
  // Codex UserPromptSubmit is kept minimal to avoid schema incompatibilities.
  process.stdout.write(JSON.stringify({ continue: true }));
}

function emitContinue(payload = {}) {
  process.stdout.write(JSON.stringify({ continue: true, ...payload }));
}

function getSessionIdFromPayload(data = {}) {
  return data.session_id || data.sessionId || data.id || null;
}

function runFromStdin() {
if (require.main === module) {
  let input = '';
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', async () => {
    try {
      const trimmedInput = input.trim();
      if (!trimmedInput) {
        emitContinue();
        return process.exit(0);
      }

      const data = JSON.parse(trimmedInput);
      let prompt = (data.prompt || data.message || '').toString();
      const trigger = parseTrigger(prompt);
      if (trigger) setState(trigger);
      const state = getState();
      if (state.enabled) {
        const safety = classifyText(prompt);
        const policy = getPolicy();
        const tokenEst = estimateTokens(prompt, 'codex/claude', { exact: policy.exactTokenizer });
        
        // Interactive Pre-compression
        const threshold = policy.precompressThreshold || 300;
        if (tokenEst.estimatedTokens >= threshold) {
          const compressed = compressPrompt(prompt, { level: state.level });
          const compStats = estimateSavings(prompt, compressed, 'gemini', { exact: policy.exactTokenizer });
          if (compStats.savedTokens > 0) {
            if (state.autoCompressInput) {
              prompt = compressed;
              state._lastCompressed = true;
            } else {
              const result = await askUserInteractive(prompt, compressed, compStats);
              if (result.action === 'accept' || result.action === 'always') {
                prompt = result.text;
                state._lastCompressed = true;
                if (result.action === 'always') {
                  setState({ autoCompressInput: true });
                }
              }
            }
          }
        }

        const lifecycle = maybeCaptureLifecycleCheckpoint({
          sessionId: getSessionIdFromPayload(data),
          promptTokens: estimateTokens(prompt, 'codex/claude', { exact: policy.exactTokenizer }).estimatedTokens,
          milestones: deriveMilestones(prompt),
          gates: { strictGate: true, mtpGate: true, actionRoutingGate: !safety.safeCritical },
          signals: { wasteCount: safety.safeCritical ? 1 : 0 }
        });
        setState({ lastEstimatedSaving: Math.max(0, 100 - Math.round(lifecycle.fillPercent || 0)) });
        state._lastTrigger = !!trigger;
        emitActiveReminder(state, prompt, safety);
      } else {
        emitContinue();
      }
    } catch (e) {
      logError(`mode-tracker: ${e.message}`);
      emitContinue();
    }
    // Give stdout a moment to drain
    setTimeout(() => process.exit(0), 10);
  });
}
}

if (require.main === module) {
  runFromStdin();
}

module.exports = { stripCodeFences, parseTrigger, chooseEffectiveLevel };
