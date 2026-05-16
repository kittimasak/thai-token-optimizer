#!/usr/bin/env node
/**
 * ============================================================================
 * Thai Token Optimizer v2.0
 * ============================================================================
 * Description : 
 * Validates technical preservation across original and optimized text.
 * ============================================================================
 */

const { extractConstraints, containsConstraint } = require('./tto-constraint-locker');
const { normalizedIncludes } = require('./tto-utils');

const IMPORTANT_PATTERNS = {
  urls: /https?:\/\/[^\s)]+/g,
  winPaths: /\b[A-Za-z]:\\[A-Za-z0-9._@%+\-\\]+/g,
  paths: /\b(?:[A-Za-z]:)?(?:\.?\.\/|~\/|\/)[A-Za-z0-9._@%+\-/]+/g,
  files: /\b[A-Za-z0-9_-]+\.(?:js|mjs|cjs|ts|tsx|jsx|json|yaml|yml|toml|env|md|py|php|sql|sh|bash|zsh|txt|zip)\b/g,
  commands: /\b(?:git|npm|npx|pnpm|yarn|bun|docker|docker-compose|kubectl|helm|ssh|scp|rsync|curl|wget|python3?|pip3?|php|composer|mysql|psql|sqlite3|redis-cli|mongosh|ollama|codex|claude|tto|thai-token-optimizer)\b/gi,
  versions: /\bv?\d+\.\d+(?:\.\d+)?(?:[-+][A-Za-z0-9.-]+)?\b/g,
  ips: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  numbers: /\b\d{3,}(?:\.\d+)?%?\b/g,
  hex: /\b0x[a-f0-9]+\b/gi
};

function collectImportantItems(text) {
  const items = [];
  const raw = String(text || '');
  
  for (const [type, pattern] of Object.entries(IMPORTANT_PATTERNS)) {
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(raw)) !== null) {
      if (m[0]) items.push({ type, value: m[0] });
    }
  }

  // Also include semantic constraints
  for (const value of extractConstraints(text)) items.push({ type: 'constraints', value });

  const seen = new Set();
  return items.filter(item => {
    const key = `${item.type}:${item.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function checkPreservation(original, optimized) {
  const items = collectImportantItems(original);
  const missing = items.filter(item => {
    if (item.type === 'constraints') return !containsConstraint(optimized, item.value);
    return !normalizedIncludes(optimized, item.value);
  });
  
  const total = items.length;
  const preserved = total - missing.length;
  const preservationPercent = total === 0 ? 100 : Math.round((preserved / total) * 1000) / 10;
  const risk = missing.some(m => m.type === 'constraints') ? 'high' : missing.length ? 'medium' : 'low';

  return { 
    total, 
    preserved, 
    missingCount: missing.length, 
    preservationPercent, 
    risk, 
    missing, 
    items 
  };
}

if (require.main === module) {
  const [originalFile, optimizedFile] = process.argv.slice(2);
  const fs = require('fs');
  const original = originalFile ? fs.readFileSync(originalFile, 'utf8') : '';
  const optimized = optimizedFile ? fs.readFileSync(optimizedFile, 'utf8') : '';
  process.stdout.write(JSON.stringify(checkPreservation(original, optimized), null, 2) + '\n');
}

module.exports = { 
    IMPORTANT_PATTERNS, 
    collectImportantItems, 
    checkPreservation, 
    normalizedIncludes 
};
