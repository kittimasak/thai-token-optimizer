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



const { compressPrompt } = require('./tto-compressor');
const { estimateTokens, estimateSavings } = require('./tto-token-estimator');
const { checkPreservation } = require('./tto-preservation-checker');
const { appendMissingConstraints, extractConstraints } = require('./tto-constraint-locker');
const { collectProtectedRanges } = require('./tto-code-aware-parser');

const HARD_LINE_RE = /(ห้าม|ต้อง|เด็ดขาด|version|เวอร์ชัน|v\d+(?:\.\d+)*|\b\d+\.\d+\.\d+\b|```|`|https?:\/\/|~\/|\.\/|\/|\b(?:node|npm|npx|pnpm|yarn|bun|git|docker|docker-compose|kubectl|helm|ssh|scp|rsync|curl|wget|python3?|pip3?|php|composer|mysql|psql|sqlite3|redis-cli|mongosh|ollama|codex|claude|tto|thai-token-optimizer)\b|codex_hooks\s*=\s*true)/i;

function unique(arr) {
  const seen = new Set();
  return arr.filter(x => {
    const v = String(x || '').trim();
    if (!v || seen.has(v)) return false;
    seen.add(v);
    return true;
  });
}

function protectedValues(text) {
  return collectProtectedRanges(text).map(r => r.text).filter(Boolean);
}

function appendMissingProtected(original, optimized) {
  let out = String(optimized || '').trim();
  const missing = unique(protectedValues(original)).filter(v => !out.includes(v));
  if (!missing.length) return out;
  const suffix = ['รายการเทคนิคคงเดิม:', ...missing.map(v => `- ${v}`)].join('\n');
  return `${out}\n\n${suffix}`.trim();
}

function enforcePreservation(original, optimized) {
  let out = appendMissingProtected(original, optimized);
  out = appendMissingConstraints(original, out);
  return out.trim();
}

function safeLineScore(line) {
  // Higher score = safer/more valuable to keep.
  let score = 0;
  if (HARD_LINE_RE.test(line)) score += 1000;
  if (/error|exception|stack|trace|production|rollback|backup|security|secret|token|password/i.test(line)) score += 200;
  if (/semantic preservation|tokenizer|benchmark|regression gate/i.test(line)) score += 100;
  score += Math.min(40, String(line).length / 8);
  return score;
}

function trimPlainLine(line, maxChars) {
  const s = String(line || '').trim();
  if (!s || s.length <= maxChars || HARD_LINE_RE.test(s)) return s;
  const words = s.split(/\s+/);
  let out = '';
  for (const w of words) {
    const cand = out ? `${out} ${w}` : w;
    if (cand.length > maxChars) break;
    out = cand;
  }
  return out || s.slice(0, maxChars).trim();
}

function trimToBudget(text, budget, target = 'generic', original = text) {
  let out = String(text || '').trim();
  if (!budget || budget <= 0) return enforcePreservation(original, out);
  if (estimateTokens(out, target).estimatedTokens <= budget) return enforcePreservation(original, out);

  // Work at line level first; this avoids the previous bug where sentence splitting
  // split `v1.0` into `v1. 0` and cut inline commands in half.
  let lines = out.split(/\n+/).map(x => x.trim()).filter(Boolean);

  // Remove lowest-value non-hard lines until budget is reached or only protected lines remain.
  while (lines.length > 1 && estimateTokens(lines.join('\n'), target).estimatedTokens > budget) {
    let removeIdx = -1;
    let lowest = Infinity;
    for (let i = 0; i < lines.length; i++) {
      if (HARD_LINE_RE.test(lines[i])) continue;
      const score = safeLineScore(lines[i]);
      if (score < lowest) { lowest = score; removeIdx = i; }
    }
    if (removeIdx < 0) break;
    lines.splice(removeIdx, 1);
  }

  out = lines.join('\n').trim();
  if (estimateTokens(out, target).estimatedTokens <= budget) return enforcePreservation(original, out);

  // If still over budget, shorten only non-hard plain lines. Protected lines are kept intact.
  lines = out.split(/\n+/).map(x => x.trim()).filter(Boolean);
  for (let i = 0; i < lines.length && estimateTokens(lines.join('\n'), target).estimatedTokens > budget; i++) {
    if (HARD_LINE_RE.test(lines[i])) continue;
    lines[i] = trimPlainLine(lines[i], Math.max(40, Math.floor(lines[i].length * 0.65)));
  }
  out = lines.join('\n').trim();

  // Final preservation pass may exceed budget. That is intentional: correctness beats budget.
  return enforcePreservation(original, out);
}

function compressToBudget(text, options = {}) {
  const budget = Number(options.budget || 0);
  const target = options.target || 'generic';
  const levels = options.level && options.level !== 'auto' ? [options.level] : ['lite', 'auto', 'full'];
  const original = String(text || '').trim();
  let best = original;
  for (const level of levels) {
    const candidate = enforcePreservation(original, compressPrompt(original, { ...options, level }));
    best = candidate;
    if (!budget || estimateTokens(candidate, target).estimatedTokens <= budget) break;
  }
  if (budget && estimateTokens(best, target).estimatedTokens > budget) best = trimToBudget(best, budget, target, original);
  best = enforcePreservation(original, best);
  const savings = estimateSavings(original, best, target);
  const preservation = checkPreservation(original, best);
  return { optimized: best, savings, preservation, budget, target, overBudget: budget > 0 && savings.after.estimatedTokens > budget };
}

module.exports = { compressToBudget, trimToBudget, enforcePreservation, appendMissingProtected };
