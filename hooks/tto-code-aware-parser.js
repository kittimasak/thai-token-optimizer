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



const { getDictionary } = require('./tto-config');
const { extractSymbols, pruneRedundantThai, isSelfDocumenting } = require('./tto-semantic-analyzer');

const PROTECTED_PATTERNS = [
  /```[\s\S]*?```/g,
  /`[^`\n]+`/g,
  /https?:\/\/[^\s)]+/g,
  /\b(?:[A-Za-z]:)?(?:\.?\.\/|~\/|\/)[A-Za-z0-9._@%+\-/]+/g,
  /\b(?:node|npm|npx|pnpm|yarn|bun|git|docker|docker-compose|kubectl|helm|ssh|scp|rsync|curl|wget|python3?|pip3?|php|composer|mysql|psql|sqlite3|redis-cli|mongosh|ollama|codex|claude|tto|thai-token-optimizer)\b/gi,
  /\b[A-Z0-9_]{2,}\b/g,
  /\bv?\d+\.\d+(?:\.\d+)?(?:[-+][A-Za-z0-9.-]+)?\b/g,
  /\b[A-Za-z0-9_-]+\.(?:js|mjs|cjs|ts|tsx|jsx|json|yaml|yml|toml|env|md|py|php|sql|sh|bash|zsh|txt|zip)\b/g,
  /^\s*["']?[A-Za-z0-9_.-]+["']?\s*[:=]\s*.+$/gm
];

function overlaps(aStart, aEnd, ranges) {
  return ranges.some(r => aStart < r.end && aEnd > r.start);
}

function addProtectedRange(ranges, start, end, text) {
  if (end <= start) return;
  const overlapsWith = ranges.filter(r => start < r.end && end > r.start);
  if (!overlapsWith.length) {
    ranges.push({ start, end, text });
    return;
  }
  const candidateLength = end - start;
  const shouldReplace = overlapsWith.every(r => candidateLength > (r.end - r.start));
  if (!shouldReplace) return;
  for (const r of overlapsWith) {
    const i = ranges.indexOf(r);
    if (i >= 0) ranges.splice(i, 1);
  }
  ranges.push({ start, end, text });
}

function collectProtectedRanges(text) {
  text = String(text || '');
  const ranges = [];

  // Adaptive Learning: Dynamically include user-specific words in protection
  const dictionary = getDictionary();
  const dynamicPatterns = [...PROTECTED_PATTERNS];
  if (dictionary.keep.length > 0) {
    const sortedKeep = [...dictionary.keep].sort((a, b) => b.length - a.length);
    const userWordsRe = new RegExp(sortedKeep.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi');
    dynamicPatterns.push(userWordsRe);
  }

  for (const pattern of dynamicPatterns) {
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      addProtectedRange(ranges, start, end, m[0]);
      if (m[0].length === 0) pattern.lastIndex++;
    }
  }
  ranges.sort((a, b) => a.start - b.start || b.end - a.end);
  return ranges;
}

function protectSegments(text) {
  text = String(text || '');
  const ranges = collectProtectedRanges(text);
  const protectedValues = [];
  let out = '';
  let cursor = 0;
  for (const r of ranges) {
    if (r.start < cursor) continue;
    out += text.slice(cursor, r.start);
    const token = `⟦TTO_PROTECT_${protectedValues.length}⟧`;
    protectedValues.push(r.text);
    out += token;
    cursor = r.end;
  }
  out += text.slice(cursor);
  return { text: out, protectedValues };
}

function restoreSegments(text, protectedValues) {
  let out = String(text || '');
  protectedValues.forEach((value, i) => {
    out = out.split(`⟦TTO_PROTECT_${i}⟧`).join(value);
  });
  return out;
}

function transformCodeAware(text, transform) {
  const protectedData = protectSegments(text);
  const transformed = transform(protectedData.text);
  return restoreSegments(transformed, protectedData.protectedValues);
}

/**
 * Semantic-aware transformation: Extracts symbols from protected code blocks
 * and uses them to prune redundancy in the Thai text during transformation.
 */
function transformSemanticAware(text, transform) {
  const ranges = collectProtectedRanges(text);
  const symbols = new Set();
  
  // 1. Gather all symbols from code blocks
  for (const r of ranges) {
    if (r.text.startsWith('```') || r.text.startsWith('`')) {
      const code = r.text.replace(/^```[a-z]*\n?|```$/g, '').replace(/^`|`$/g, '');
      const s = extractSymbols(code);
      s.forEach(sym => symbols.add(sym));
    }
  }
  const symbolList = Array.from(symbols);

  // 2. Perform transformation with symbol-awareness
  let out = '';
  let cursor = 0;
  const protectedValues = [];

  for (const r of ranges) {
    if (r.start < cursor) continue;
    
    // Transform Thai text before the code block
    let segment = text.slice(cursor, r.start);
    // Semantic Pruning: Remove redundancy before general compression
    segment = pruneRedundantThai(segment, symbolList);
    
    const transformedSegment = transform(segment);
    out += transformedSegment;
    
    const token = `⟦TTO_PROTECT_${protectedValues.length}⟧`;
    
    // Check for Self-Documenting code and mute if necessary
    let technicalContent = r.text;
    if (isSelfDocumenting(r.text.replace(/^```[a-z]*\n?|```$/g, '').replace(/^`|`$/g, ''), segment)) {
        // If code is self-documenting, we can omit the transformed segment
        // effectively muting the redundant Thai description.
        out = out.slice(0, out.length - transformedSegment.length);
    }

    protectedValues.push(technicalContent);
    out += token;
    cursor = r.end;
  }
  
  // Transform remaining Thai text
  let lastSegment = text.slice(cursor);
  lastSegment = pruneRedundantThai(lastSegment, symbolList);
  out += transform(lastSegment);

  return restoreSegments(out, protectedValues);
}

module.exports = { 
  PROTECTED_PATTERNS, 
  collectProtectedRanges, 
  protectSegments, 
  restoreSegments, 
  transformCodeAware,
  transformSemanticAware
};
