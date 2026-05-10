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

const PROTECTED_PATTERNS = [
  /```[\s\S]*?```/g,
  /`[^`\n]+`/g,
  /https?:\/\/[^\s)]+/g,
  /\b(?:[A-Za-z]:)?(?:\.?\.\/|~\/|\/)[A-Za-z0-9._@%+\-/]+/g,
  /\b(?:node|npm|npx|pnpm|yarn|bun|git|docker|docker-compose|kubectl|helm|ssh|scp|rsync|curl|wget|python3?|pip3?|php|composer|mysql|psql|sqlite3|redis-cli|mongosh|ollama|codex|claude|tto|thai-token-optimizer)\b(?:\s+[^\n]*)?/gi,
  /\b[A-Z0-9_]{2,}\b/g,
  /\bv?\d+\.\d+(?:\.\d+)?(?:[-+][A-Za-z0-9.-]+)?\b/g,
  /\b[A-Za-z0-9_-]+\.(?:js|mjs|cjs|ts|tsx|jsx|json|yaml|yml|toml|env|md|py|php|sql|sh|bash|zsh|txt|zip)\b/g,
  /^\s*["']?[A-Za-z0-9_.-]+["']?\s*[:=]\s*.+$/gm
];

function overlaps(aStart, aEnd, ranges) {
  return ranges.some(r => aStart < r.end && aEnd > r.start);
}

function collectProtectedRanges(text) {
  text = String(text || '');
  const ranges = [];

  // Adaptive Learning: Dynamically include user-specific words in protection
  const dictionary = getDictionary();
  const dynamicPatterns = [...PROTECTED_PATTERNS];
  if (dictionary.keep.length > 0) {
    const sortedKeep = [...dictionary.keep].sort((a, b) => b.length - a.length);
    const userWordsRe = new RegExp(sortedKeep.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
    dynamicPatterns.unshift(userWordsRe);
  }

  for (const pattern of dynamicPatterns) {
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      if (end > start && !overlaps(start, end, ranges)) ranges.push({ start, end, text: m[0] });
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

module.exports = { PROTECTED_PATTERNS, collectProtectedRanges, protectSegments, restoreSegments, transformCodeAware };
