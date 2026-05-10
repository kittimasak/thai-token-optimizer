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



const { extractConstraints, containsConstraint } = require('./tto-constraint-locker');

const IMPORTANT_PATTERNS = {
  urls: /https?:\/\/[^\s)]+/g,
  paths: /\b(?:[A-Za-z]:)?(?:\.?\.\/|~\/|\/)[A-Za-z0-9._@%+\-/]+/g,
  files: /\b[A-Za-z0-9_-]+\.(?:js|mjs|cjs|ts|tsx|jsx|json|yaml|yml|toml|env|md|py|php|sql|sh|bash|zsh|txt|zip)\b/g,
  versions: /\bv?\d+\.\d+(?:\.\d+)?(?:[-+][A-Za-z0-9.-]+)?\b/g,
  numbers: /\b\d+(?:\.\d+)?%?\b/g,
  env: /\b[A-Z][A-Z0-9_]{2,}\b/g,
  commands: /\b(?:node|npm|npx|pnpm|yarn|bun|git|docker|kubectl|curl|python3?|pip3?|php|mysql|psql|codex|claude|tto|thai-token-optimizer)\b(?:\s+[A-Za-z0-9_./:@#=+\-]+){0,6}/gi
};

function uniqueMatches(text, pattern) {
  text = String(text || '');
  pattern.lastIndex = 0;
  const out = [];
  const seen = new Set();
  let m;
  while ((m = pattern.exec(text)) !== null) {
    const value = m[0].trim();
    if (value && !seen.has(value)) { seen.add(value); out.push(value); }
    if (m[0].length === 0) pattern.lastIndex++;
  }
  return out;
}

function collectImportantItems(text) {
  const items = [];
  for (const [type, pattern] of Object.entries(IMPORTANT_PATTERNS)) {
    for (const value of uniqueMatches(text, pattern)) items.push({ type, value });
  }
  for (const value of extractConstraints(text)) items.push({ type: 'constraints', value });
  const seen = new Set();
  return items.filter(item => {
    const key = `${item.type}:${item.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizedIncludes(haystack, needle) {
  const h = String(haystack || '').toLowerCase();
  const n = String(needle || '').toLowerCase();
  if (!n) return true;
  if (h.includes(n)) return true;
  if (n.length > 60) {
    const tokens = n.match(/[A-Za-z0-9_.:@#=+\-/]+|[\u0E00-\u0E7F]+/g) || [];
    const important = tokens.filter(t => t.length > 1).slice(0, 12);
    return important.length > 0 && important.every(t => h.includes(t.toLowerCase()));
  }
  return false;
}

function checkPreservation(original, optimized) {
  const items = collectImportantItems(original);
  const missing = items.filter(item => item.type === 'constraints' ? !containsConstraint(optimized, item.value) : !normalizedIncludes(optimized, item.value));
  const total = items.length;
  const preserved = total - missing.length;
  const preservationPercent = total === 0 ? 100 : Math.round((preserved / total) * 1000) / 10;
  const risk = missing.some(m => m.type === 'constraints') ? 'high' : missing.length ? 'medium' : 'low';
  return { total, preserved, missingCount: missing.length, preservationPercent, risk, missing, items };
}

if (require.main === module) {
  const [originalFile, optimizedFile] = process.argv.slice(2);
  const fs = require('fs');
  const original = originalFile ? fs.readFileSync(originalFile, 'utf8') : '';
  const optimized = optimizedFile ? fs.readFileSync(optimizedFile, 'utf8') : '';
  process.stdout.write(JSON.stringify(checkPreservation(original, optimized), null, 2) + '\n');
}

module.exports = { IMPORTANT_PATTERNS, collectImportantItems, checkPreservation };
