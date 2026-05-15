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



const { compressPrompt } = require('./tto-compressor');
const { estimateTokens, estimateSavings } = require('./tto-token-estimator');
const { checkPreservation } = require('./tto-preservation-checker');
const { appendMissingConstraints, extractConstraints } = require('./tto-constraint-locker');
const { collectProtectedRanges } = require('./tto-code-aware-parser');
const { classifyTask, TIERS } = require('./tto-profiles');

const HARD_LINE_RE = /(^\s*\|.*\|\s*$|^\s*[A-Za-z0-9_.-]+[ \t]*:[ \t]*$|(?:\s|^)(ห้าม|ต้อง|เด็ดขาด)(?:\s|$)|must|must not|do not|never|\bkeep\b|\bpreserve\b|version|เวอร์ชัน|v\d+(?:\.\d+)*|\b\d+\.\d+\.\d+\b|```|`|https?:\/\/|~\/|\.\/|\b[A-Za-z]:\\|\b(?:ERROR|WARN|Exception|TypeError|ReferenceError|Cannot find module|EADDRINUSE)\b|\b(?:node|npm|npx|pnpm|yarn|bun|git|docker|docker-compose|kubectl|helm|ssh|scp|rsync|curl|wget|python3?|pip3?|php|composer|mysql|psql|sqlite3|redis-cli|mongosh|ollama|codex|claude|tto|thai-token-optimizer)\b|codex_hooks\s*=\s*true)/i;
const STRUCTURE_SENSITIVE_LINE_RE = /^(\s+["']?[A-Za-z0-9_.-]+["']?\s*[:=]|\s+[A-Za-z0-9_.-]+\s*:|\s*[-*]\s+["']?[A-Za-z0-9_.-]+["']?\s*:|\s*\|.*\|\s*$|\s*at\s+|.*\b(?:ERROR|WARN|Exception|TypeError|ReferenceError|Cannot find module)\b)/i;

function normalizeBudgetLine(line) {
  const raw = String(line || '');
  return STRUCTURE_SENSITIVE_LINE_RE.test(raw) ? raw.replace(/[ \t]+$/g, '') : raw.trim();
}

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
  const missing = unique(protectedValues(original)).filter(v => !out.includes(v) && !out.includes(String(v).trim()));
  if (!missing.length) return out;
  
  // Smart Limiting: Only show up to 5 remnants to avoid budget overflow
  const displayMissing = missing.slice(0, 5);
  const remnantCount = missing.length - displayMissing.length;
  const suffix = [
    'รายการเทคนิคคงเดิม:', 
    ...displayMissing.map(v => `- ${v}`),
    remnantCount > 0 ? `- ... และอีก ${remnantCount} รายการ` : null
  ].filter(Boolean).join('\n');
  
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

function safeLineScore(line, tier = TIERS.ROUTINE, idx = -1, total = 0) {
  // Higher score = safer/more valuable to keep.
  let score = 0;
  if (HARD_LINE_RE.test(line)) score += 1000;
  
  // Semantic Anchor awareness: Keep headers like "BLOCK A:" or "STEP 1:"
  if (/^[A-Z0-9_\/ ]+:/.test(line)) score += 1500;

  // Head/Tail priority for SMT continuity (Equal high priority)
  if (idx === 0) score += 2000; 
  if (idx === total - 1 && total > 1) score += 1500;

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
  if (!s || s.length <= maxChars) return s;
  
  // Smart Middle-Truncation (SMT) for technical/prose continuity
  if (s.length > 30 && maxChars >= 20) {
    const headLen = Math.floor(maxChars * 0.4);
    const tailLen = Math.floor(maxChars * 0.4);
    const middlePlaceholder = ' ... ';
    
    // Only apply if it actually saves significant space and leaves meaningful head/tail
    if (headLen + tailLen + middlePlaceholder.length <= maxChars) {
      const head = s.slice(0, headLen).trim();
      const tail = s.slice(-tailLen).trim();
      return `${head}${middlePlaceholder}${tail}`;
    }
  }

  // Aggressive trimming for Informational tier (Fallback)
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
  const currentTokens = estimateTokens(out, target).estimatedTokens;
  if (!budget || budget <= 0) return enforcePreservation(original, out, budget);
  if (currentTokens <= budget) return enforcePreservation(original, out, budget);

  let lines = out.split(/\n+/).map(normalizeBudgetLine).filter(Boolean);

  // 1. Smart Middle-Truncation (SMT) for multi-line blocks - PRIORITY
  if (lines.length > 5 && tier !== TIERS.CRITICAL) {
    let headCount = Math.max(1, Math.floor(lines.length * 0.25));
    let tailCount = Math.max(1, Math.floor(lines.length * 0.4));
    
    // Iteratively shrink head/tail until it fits or reaches 1/1
    while (headCount >= 1 && tailCount >= 1) {
      const head = lines.slice(0, headCount);
      const tail = lines.slice(-tailCount);
      const middleMsg = `... [ย่อรายละเอียด ${lines.length - headCount - tailCount} บรรทัด] ...`;
      const smtCandidate = [...head, middleMsg, ...tail];
      if (estimateTokens(smtCandidate.join('\n'), target).estimatedTokens <= budget) {
        lines = smtCandidate;
        break;
      }
      if (headCount > 1) headCount--;
      else if (tailCount > 1) tailCount--;
      else break;
    }
  }

  // Tier 1 (Critical) is very reluctant to remove lines unless budget is tight
  let minLines = (tier === TIERS.CRITICAL && (!budget || budget > 50)) ? Math.max(1, lines.length - 1) : 1;
  
  // If budget is extremely tight, force minLines to 1
  if (budget > 0 && budget < 40) minLines = 1;

  while (lines.length > minLines && estimateTokens(lines.join('\n'), target).estimatedTokens > budget) {
    let removeIdx = -1;
    let lowest = Infinity;
    for (let i = 0; i < lines.length; i++) {
      if (HARD_LINE_RE.test(lines[i])) continue;
      const score = safeLineScore(lines[i], tier, i, lines.length);
      if (score < lowest) { lowest = score; removeIdx = i; }
    }
    if (removeIdx < 0) break;
    lines.splice(removeIdx, 1);
  }

  out = lines.join('\n').trim();
  if (estimateTokens(out, target).estimatedTokens <= budget) return enforcePreservation(original, out, budget);

  // Shorten non-hard plain lines
  lines = out.split(/\n+/).map(normalizeBudgetLine).filter(Boolean);
  for (let i = 0; i < lines.length && estimateTokens(lines.join('\n'), target).estimatedTokens > budget; i++) {
    const isHard = HARD_LINE_RE.test(lines[i]);
    if (isHard) continue;
    const currentLen = lines[i].length;
    const ratio = budget < 40 ? 0.3 : (tier === TIERS.INFORMATIONAL ? 0.4 : 0.65);
    const targetCharLen = Math.max(20, Math.floor(currentLen * ratio));
    lines[i] = trimPlainLine(lines[i], targetCharLen, tier);
  }
  out = lines.join('\n').trim();

  // Global budget optimizer (utility per token) before emergency removal.
  if (budget > 0 && estimateTokens(lines.join('\n'), target).estimatedTokens > budget) {
    const items = lines.map((line, idx) => {
      const tokens = Math.max(1, estimateTokens(line, target).estimatedTokens);
      const utility = safeLineScore(line, tier, idx, lines.length);
      const hard = HARD_LINE_RE.test(line);
      return { idx, line, tokens, utility, hard, ratio: utility / tokens };
    });
    const mandatory = items.filter(i => i.hard);
    const optional = items.filter(i => !i.hard).sort((a, b) => b.ratio - a.ratio);
    const selected = [...mandatory];
    let used = mandatory.reduce((s, i) => s + i.tokens, 0);
    for (const item of optional) {
      if (used + item.tokens <= budget) {
        selected.push(item);
        used += item.tokens;
      }
    }
    
    // Safety: If nothing was selected but we had optional lines, keep the best one
    if (selected.length === 0 && optional.length > 0) {
      selected.push(optional[0]);
    }

    // Context Anchor: Ensure the first line (Purpose) is kept if we keep multiple lines
    if (selected.length >= 1) {
      if (!selected.some(i => i.idx === 0)) {
        selected.unshift(items[0]); // Force to the front
      }
    }
    
    // Also ensure the LAST line is kept if possible
    if (selected.length > 1 && !selected.some(i => i.idx === items.length - 1)) {
      selected.push(items[items.length - 1]);
    }

    const selectedIdx = new Set(selected.map(i => i.idx));
    const keptItems = items.filter(item => selectedIdx.has(item.idx));
    
    // 2. Final emergency pass
    let emergencyLines = [...keptItems];
    while (budget > 0 && emergencyLines.length > 2 && estimateTokens(emergencyLines.map(l => l.line).join('\n'), target).estimatedTokens > budget) {
      let removeIdx = -1;
      let lowest = Infinity;
      // Don't remove first or last if we have > 2 lines
      for (let i = 1; i < emergencyLines.length - 1; i++) {
        if (emergencyLines[i].hard) continue;
        if (emergencyLines[i].utility < lowest) { lowest = emergencyLines[i].utility; removeIdx = i; }
      }
      if (removeIdx < 0) break;
      emergencyLines.splice(removeIdx, 1);
    }
    
    // Last resort: if still over budget with 2 lines, try to remove the one with lower utility
    if (budget > 0 && emergencyLines.length === 2 && estimateTokens(emergencyLines.map(l => l.line).join('\n'), target).estimatedTokens > budget) {
      if (emergencyLines[0].utility < emergencyLines[1].utility && !emergencyLines[0].hard) emergencyLines.shift();
      else if (!emergencyLines[1].hard) emergencyLines.pop();
    }
    
    lines = emergencyLines.map(l => l.line);
  }

  // Even if only 1 line left, if it's over budget, we MUST trim it
  // UNLESS it's a hard line (commands, constraints, versions) - Mandate v2.0
  if (budget > 0 && lines.length === 1 && estimateTokens(lines[0], target).estimatedTokens > budget) {
    if (!HARD_LINE_RE.test(lines[0])) {
      const currentLen = lines[0].length;
      const targetCharLen = Math.floor(currentLen * (budget / estimateTokens(lines[0], target).estimatedTokens));
      // Force SMT for single line emergency pass
      lines[0] = trimPlainLine(lines[0], targetCharLen, tier);
      
      // Fallback if SMT didn't fire or result is still too long
      if (estimateTokens(lines[0], target).estimatedTokens > budget) {
        lines[0] = lines[0].slice(0, targetCharLen).trim();
      }
    }
  }
  
  out = lines.join('\n').trim();

  // FINAL ANCHOR GUARANTEE: Ensure the very first significant line is ALWAYS present
  const originalFirst = original.split('\n').filter(l => l.trim().length > 5)[0] || '';
  if (originalFirst && !out.includes(originalFirst.slice(0, 15))) {
    const head = trimPlainLine(originalFirst, 40, tier);
    out = `${head}\n${out}`;
  }

  return enforcePreservation(original, out, budget);
}

function speculateCandidates(original, options = {}) {
  const budget = Number(options.budget || 0);
  const target = options.target || 'generic';
  const allLevels = ['lite', 'auto', 'full', 'ultra'];
  const families = [
    { name: 'baseline', opts: {} },
    { name: 'semantic_dedup', opts: { semanticDedup: true } },
    { name: 'selective_window', opts: { selectiveWindow: true } },
    { name: 'dedup_plus_selective', opts: { semanticDedup: true, selectiveWindow: true } }
  ];
  const candidates = [];
  const diagnostics = [];
  const familyPriority = {
    dedup_plus_selective: 4,
    selective_window: 3,
    semantic_dedup: 2,
    baseline: 1
  };
  const compareCandidates = (a, b) => {
    // 0. Prioritize Head Preservation (Purpose)
    const headDelta = (b.headBonus || 0) - (a.headBonus || 0);
    if (headDelta !== 0) return headDelta;

    const preserveDelta = b.preservation.preservationPercent - a.preservation.preservationPercent;
    if (preserveDelta !== 0) return preserveDelta;
    const familyDelta = (familyPriority[b.family] || 0) - (familyPriority[a.family] || 0);
    if (familyDelta !== 0) return familyDelta;
    const savedDelta = b.savings.savedTokens - a.savings.savedTokens;
    if (savedDelta !== 0) return savedDelta;
    return a.savings.after.estimatedTokens - b.savings.after.estimatedTokens;
  };

  for (const family of families) {
    for (const level of allLevels) {
      let optimized = enforcePreservation(
        original,
        compressPrompt(original, { ...options, ...family.opts, level, lockConstraints: false }),
        budget
      );
      
      // If still over budget, apply trimToBudget to this candidate
      if (budget > 0 && estimateTokens(optimized, target).estimatedTokens > budget) {
        optimized = trimToBudget(optimized, budget, target, original, classifyTask(options.agentName, original));
      }
      
      const preservation = checkPreservation(original, optimized);
      // HARD REQUIREMENT: Must keep first significant line to be considered a good candidate
      const firstLine = original.split('\n')[0].trim();
      const keepsFirst = optimized.includes(firstLine.slice(0, 10));
      const headBonus = keepsFirst ? 100 : 0;

      const savings = estimateSavings(original, optimized, target);
      const row = { optimized, savings, preservation, level, family: family.name, headBonus };
      candidates.push(row);
      diagnostics.push({
        family: family.name,
        level,
        savedTokens: savings.savedTokens,
        savingPercent: savings.savingPercent,
        afterTokens: savings.after.estimatedTokens,
        preservationPercent: preservation.preservationPercent,
        fitsBudget: !budget || savings.after.estimatedTokens <= budget
      });
    }
  }

  // 1. Prioritize 100% preservation that fits budget
  const perfectFits = candidates.filter(c => c.preservation.preservationPercent === 100 && (!budget || c.savings.after.estimatedTokens <= budget));
  if (perfectFits.length > 0) {
    const selected = perfectFits.sort(compareCandidates)[0];
    return { selected, diagnostics, selectedReason: 'perfect_preservation_and_budget_fit' };
  }

  // 2. Fallback to any that fits budget with highest preservation
  const fits = candidates.filter(c => !budget || c.savings.after.estimatedTokens <= budget);
  if (fits.length > 0) {
    const selected = fits.sort(compareCandidates)[0];
    return { selected, diagnostics, selectedReason: 'best_preservation_within_budget' };
  }

  // 3. Ultimate fallback: best preservation regardless of budget
  const selected = candidates.sort(compareCandidates)[0];
  return { selected, diagnostics, selectedReason: 'best_preservation_fallback' };
}

function compressToBudget(text, options = {}) {
  const budget = Number(options.budget || 0);
  const target = options.target || 'generic';
  const agentName = options.agentName || null;
  const contextUsage = Number(options.contextUsage || 0); // 0.0 to 1.0
  const speculative = options.speculative || false;
  const diagnosticsEnabled = Boolean(options.diagnostics);

  const original = String(text || '').trim();

  // 1. Determine Tier (Classification first for safety)
  let tier = classifyTask(agentName, text);

  // 2. Dynamic Ceiling: Force Informational/Ultra-lite if context usage > 70%
  if (contextUsage > 0.7) {
    tier = TIERS.INFORMATIONAL;
  }

  // 3. Speculative Mode (Only if NOT safety-critical)
  if (speculative && tier !== TIERS.CRITICAL) {
    const bestCandidate = speculateCandidates(original, options);
    const selected = bestCandidate.selected;
    return {
      optimized: selected.optimized,
      savings: selected.savings,
      preservation: selected.preservation,
      budget,
      target,
      speculative: true,
      level: selected.level,
      overBudget: budget > 0 && selected.savings.after.estimatedTokens > budget,
      diagnostics: diagnosticsEnabled ? {
        type: 'speculative_candidates',
        selectedLevel: selected.level,
        selectedFamily: selected.family,
        selectedReason: bestCandidate.selectedReason,
        candidates: bestCandidate.diagnostics
      } : undefined
    };
  }

  // 4. Select Compression Level based on Tier (Normal Logic)
  let levels;
  if (tier === TIERS.CRITICAL) {
    levels = ['lite', 'safe'];
  } else if (tier === TIERS.INFORMATIONAL) {
    levels = ['ultra', 'full']; 
  } else {
    levels = options.level && options.level !== 'auto' ? [options.level] : ['lite', 'auto', 'full'];
  }

  let best = original;
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
    overBudget: budget > 0 && savings.after.estimatedTokens > budget,
    diagnostics: diagnosticsEnabled ? {
      type: 'non_speculative',
      selectedLevel: levels[0],
      selectedReason: 'normal_tier_path',
      candidates: []
    } : undefined
  };
}

module.exports = { compressToBudget, trimToBudget, enforcePreservation, appendMissingProtected, speculateCandidates };
