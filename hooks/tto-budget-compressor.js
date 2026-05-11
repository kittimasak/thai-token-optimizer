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
const { classifyTask, TIERS } = require('./tto-profiles');

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

function enforcePreservation(original, optimized, budget = 0) {
  let out = optimized;

  // Try adding protected technical values
  out = appendMissingProtected(original, out);

  // Try adding constraints
  out = appendMissingConstraints(original, out);
  
  return out.trim();
}

function safeLineScore(line, tier = TIERS.ROUTINE) {
  // Higher score = safer/more valuable to keep.
  let score = 0;
  if (HARD_LINE_RE.test(line)) score += 1000;
  
  // Tier-based weighting
  if (tier === TIERS.CRITICAL) score += 500;
  if (tier === TIERS.INFORMATIONAL) score -= 100;

  if (/error|exception|stack|trace|production|rollback|backup|security|secret|token|password/i.test(line)) score += 200;
  if (/semantic preservation|tokenizer|benchmark|regression gate/i.test(line)) score += 100;
  score += Math.min(40, String(line).length / 8);
  return score;
}

function trimPlainLine(line, maxChars, tier = TIERS.ROUTINE) {
  const s = String(line || '').trim();
  if (!s || s.length <= maxChars || HARD_LINE_RE.test(s)) return s;
  
  // Aggressive trimming for Informational tier
  const ratio = tier === TIERS.INFORMATIONAL ? 0.4 : 0.65;
  const targetLen = Math.max(30, Math.floor(s.length * ratio));
  
  if (tier === TIERS.INFORMATIONAL) {
    // Ultra-lite: just keep keywords or first few words
    return s.split(/\s+/).slice(0, 5).join(' ') + '...';
  }

  const words = s.split(/\s+/);
  let out = '';
  for (const w of words) {
    const cand = out ? `${out} ${w}` : w;
    if (cand.length > maxChars) break;
    out = cand;
  }
  return out || s.slice(0, maxChars).trim();
}

function trimToBudget(text, budget, target = 'generic', original = text, tier = TIERS.ROUTINE) {
  let out = String(text || '').trim();
  if (!budget || budget <= 0) return enforcePreservation(original, out, budget);
  if (estimateTokens(out, target).estimatedTokens <= budget) return enforcePreservation(original, out, budget);

  let lines = out.split(/\n+/).map(x => x.trim()).filter(Boolean);

  // Tier 1 (Critical) is very reluctant to remove lines unless budget is tight
  let minLines = (tier === TIERS.CRITICAL && (!budget || budget > 50)) ? Math.max(1, lines.length - 1) : 1;
  
  // If budget is extremely tight, force minLines to 1
  if (budget > 0 && budget < 40) minLines = 1;

  while (lines.length > minLines && estimateTokens(lines.join('\n'), target).estimatedTokens > budget) {
    let removeIdx = -1;
    let lowest = Infinity;
    for (let i = 0; i < lines.length; i++) {
      if (HARD_LINE_RE.test(lines[i])) continue;
      const score = safeLineScore(lines[i], tier);
      if (score < lowest) { lowest = score; removeIdx = i; }
    }
    if (removeIdx < 0) break;
    lines.splice(removeIdx, 1);
  }

  out = lines.join('\n').trim();
  if (estimateTokens(out, target).estimatedTokens <= budget) return enforcePreservation(original, out, budget);

  // Shorten non-hard plain lines
  lines = out.split(/\n+/).map(x => x.trim()).filter(Boolean);
  for (let i = 0; i < lines.length && estimateTokens(lines.join('\n'), target).estimatedTokens > budget; i++) {
    if (HARD_LINE_RE.test(lines[i])) continue;
    // For very tight budget, be even more aggressive (0.3 ratio)
    const ratio = budget < 40 ? 0.3 : (tier === TIERS.INFORMATIONAL ? 0.4 : 0.65);
    lines[i] = trimPlainLine(lines[i], Math.max(20, Math.floor(lines[i].length * ratio)), tier);
  }
  out = lines.join('\n').trim();

  // Final emergency pass: remove lines even if they have hard keywords if still over budget
  while (budget > 0 && lines.length > 1 && estimateTokens(lines.join('\n'), target).estimatedTokens > budget) {
    lines.pop(); // Remove from end
  }
  
  // Even if only 1 line left, if it's over budget, we MUST trim it
  // UNLESS it's a hard line (commands, constraints, versions) - Mandate v1.0
  if (budget > 0 && lines.length === 1 && estimateTokens(lines[0], target).estimatedTokens > budget) {
    if (!HARD_LINE_RE.test(lines[0])) {
      lines[0] = lines[0].slice(0, Math.floor(lines[0].length * (budget / estimateTokens(lines[0], target).estimatedTokens))).trim();
    }
  }
  
  out = lines.join('\n').trim();

  return enforcePreservation(original, out, budget);
}

function speculateCandidates(original, options = {}) {
  const budget = Number(options.budget || 0);
  const target = options.target || 'generic';
  const allLevels = ['lite', 'auto', 'full', 'ultra'];
  const candidates = [];

  for (const level of allLevels) {
    const optimized = enforcePreservation(original, compressPrompt(original, { ...options, level, lockConstraints: false }), budget);
    const savings = estimateSavings(original, optimized, target);
    const preservation = checkPreservation(original, optimized);
    candidates.push({ optimized, savings, preservation, level });
  }

  // 1. Prioritize 100% preservation that fits budget
  const perfectFits = candidates.filter(c => c.preservation.preservationPercent === 100 && (!budget || c.savings.after.estimatedTokens <= budget));
  if (perfectFits.length > 0) {
    return perfectFits.sort((a, b) => b.savings.savedTokens - a.savings.savedTokens)[0];
  }

  // 2. Fallback to any that fits budget with highest preservation
  const fits = candidates.filter(c => !budget || c.savings.after.estimatedTokens <= budget);
  if (fits.length > 0) {
    return fits.sort((a, b) => b.preservation.preservationPercent - a.preservation.preservationPercent || b.savings.savedTokens - a.savings.savedTokens)[0];
  }

  // 3. Ultimate fallback: best preservation regardless of budget
  return candidates.sort((a, b) => b.preservation.preservationPercent - a.preservation.preservationPercent)[0];
}

function compressToBudget(text, options = {}) {
  const budget = Number(options.budget || 0);
  const target = options.target || 'generic';
  const agentName = options.agentName || null;
  const contextUsage = Number(options.contextUsage || 0); // 0.0 to 1.0
  const speculative = options.speculative || false;

  const original = String(text || '').trim();

  if (speculative) {
    const best = speculateCandidates(original, options);
    return {
      optimized: best.optimized,
      savings: best.savings,
      preservation: best.preservation,
      budget,
      target,
      speculative: true,
      level: best.level,
      overBudget: budget > 0 && best.savings.after.estimatedTokens > budget
    };
  }

  // 1. Determine Tier
  let tier = classifyTask(agentName, text);

  // 2. Dynamic Ceiling: Force Informational/Ultra-lite if context usage > 70%
  if (contextUsage > 0.7) {
    tier = TIERS.INFORMATIONAL;
  }

  // 3. Select Compression Level based on Tier
  let levels;
  if (tier === TIERS.CRITICAL) {
    levels = ['lite', 'safe'];
  } else if (tier === TIERS.INFORMATIONAL) {
    levels = ['ultra', 'full']; 
  } else {
    levels = options.level && options.level !== 'auto' ? [options.level] : ['lite', 'auto', 'full'];
  }

  for (const level of levels) {
    const candidate = enforcePreservation(original, compressPrompt(original, { ...options, level, lockConstraints: false }), budget);
    best = candidate;
    if (!budget || estimateTokens(candidate, target).estimatedTokens <= budget) break;
  }

  
  if (budget && estimateTokens(best, target).estimatedTokens > budget) {
    best = trimToBudget(best, budget, target, original, tier);
  }
  
  best = enforcePreservation(original, best, budget);
  const savings = estimateSavings(original, best, target);
  const preservation = checkPreservation(original, best);
  
  return { 
    optimized: best, 
    savings, 
    preservation, 
    budget, 
    target, 
    tier,
    contextUsage,
    overBudget: budget > 0 && savings.after.estimatedTokens > budget 
  };
}

module.exports = { compressToBudget, trimToBudget, enforcePreservation, appendMissingProtected };
