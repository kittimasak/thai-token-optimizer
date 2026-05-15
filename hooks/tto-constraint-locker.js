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



const { extractSymbols } = require('./tto-semantic-analyzer');

const LOCK_KEYWORDS = /(?:ห้าม|ต้อง(?!การ)|เด็ดขาด|คงเดิม|ห้ามเปลี่ยน|ไม่เปลี่ยน|อย่าเปลี่ยน|เท่านั้น|must|must not|do not|never|keep|preserve)/gi;
const TECHNICAL_PATTERNS = [
  /(?:version|เวอร์ชัน|v\d+(?:\.\d+)*|\b\d+\.\d+\.\d+\b)/gi,
  /(?:API key|secret|token|password|credential|private key|รหัสผ่าน|คีย์ลับ)/gi,
  /\b[A-Za-z]:\\[A-Za-z0-9._@%+\-\\]+/g,
  /\b(?:[A-Za-z]:)?(?:\.?\.\/|~\/|\/)[A-Za-z0-9._@%+\-/]+\b/gi,
  /\b[A-Za-z0-9_-]+\.(?:js|mjs|cjs|ts|tsx|jsx|json|yaml|yml|toml|env|md|py|php|sql|sh|bash|zsh|txt|zip|log)\b/gi,
  /\b[A-Z][A-Z0-9_]{2,}\b/g,
  /\b[A-Za-z_][A-Za-z0-9_]*[A-Z][A-Za-z0-9_]*\b/g,
  /\b[A-Za-z0-9_./@#-]*[0-9_/@#-][A-Za-z0-9_./@#-]{2,}\b/gi
];

const LOG_OR_NOISE_RE = /^(?:\[[\d\s-:.TZ]+\]|(?:\d{4}-\d{2}-\d{2}|\d{2}:\d{2}:\d{2})|\[\d+\]|[\w\s.-]+:|\s*at\s+[\w.<>]+\s+\(|\[[#=-]+\]|\s*[\d.]+(?:%|MB|KB|GB|B)\s*)/i;

function hasLockKeyword(text) {
  LOCK_KEYWORDS.lastIndex = 0;
  const ok = LOCK_KEYWORDS.test(String(text || ''));
  LOCK_KEYWORDS.lastIndex = 0;
  return ok;
}

function matchLockKeywords(text) {
  LOCK_KEYWORDS.lastIndex = 0;
  const matches = String(text || '').match(LOCK_KEYWORDS) || [];
  LOCK_KEYWORDS.lastIndex = 0;
  return matches;
}

function isTechnicalTarget(value) {
  const v = String(value || '').trim();
  if (v.length < 2) return false;
  if (/^(?:must|keep|preserve|exactly|please|rename|change|after|fixing|summarize|errors?)$/i.test(v)) return false;
  if (/[\/\\]/.test(v)) return true;
  if (/[._@#-]/.test(v)) return true;
  if (/^v?\d+(?:\.\d+)+/.test(v)) return true;
  if (/^[A-Z][A-Z0-9_]{2,}$/.test(v)) return true;
  if (/^[A-Za-z_][A-Za-z0-9_]*[A-Z][A-Za-z0-9_]*$/.test(v)) return true;
  return false;
}

function extractSemanticBlocks(text) {
  text = String(text || '');
  const lines = text.split('\n');
  const blocks = [];
  const seen = new Set();

  for (const line of lines) {
    const rawLine = line.trim();
    if (!rawLine || rawLine.length < 3) continue;

    // Ignore lines that look like logs, stack traces, or noise
    if (LOG_OR_NOISE_RE.test(rawLine) && !hasLockKeyword(rawLine)) continue;

    // Split into clauses/sentences without breaking file names such as README_EN.md.
    const clauses = rawLine.split(/([。!\?|]| และ | โดย | ซึ่ง | แล้ว | ครับ | ค่ะ)/);
    for (const clause of clauses) {
      const s = clause.trim();
      if (!s || s.length < 3 || s.length > 1000) continue; 

      const hasKeyword = hasLockKeyword(s);
      const symbols = extractSymbols(s).filter(isTechnicalTarget);
      
      // Find technical patterns not caught by extractSymbols (e.g. paths, versions)
      const techMatches = [];
      for (const pattern of TECHNICAL_PATTERNS) {
        pattern.lastIndex = 0;
        let m;
        while ((m = pattern.exec(s)) !== null) {
          if (m[0].length > 1) techMatches.push(m[0]);
        }
      }
      const allTargets = Array.from(new Set([...symbols, ...techMatches])).filter(t => t.length > 2 && isTechnicalTarget(t));

      if ((hasKeyword && allTargets.length > 0) || (techMatches.length > 0)) {
        const key = s.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          blocks.push({
            raw: s,
            targets: allTargets,
            isHard: hasKeyword
          });
        }
      }
    }
  }
  return blocks;
}
function containsConstraint(output, block) {
  const out = String(output || '');
  if (typeof block === 'string') {
    if (out.includes(block)) return true;
    const targets = [];
    for (const pattern of TECHNICAL_PATTERNS) {
      pattern.lastIndex = 0;
      let m;
      while ((m = pattern.exec(block)) !== null) {
        if (m[0].length > 2) targets.push(m[0]);
      }
    }
    const targetsPresent = Array.from(new Set(targets)).every(t => out.includes(t));
    const keywords = matchLockKeywords(block);
    const keywordsPresent = keywords.every(k => out.includes(k));

    // For structural lines like JSON brackets, ensure they exist if they were in the block
    const structuralChars = (block.match(/[{}[\],]/g) || []);
    const structuralPresent = structuralChars.every(c => out.includes(c));

    return targetsPresent && keywordsPresent && structuralPresent;
  }

  if (out.includes(block.raw)) return true;

  // Semantic verification: All technical targets AND hard keywords must be present
  const targetsPresent = (block.targets || []).every(t => out.includes(t));
  if (!targetsPresent) return false;

  if (block.isHard) {
    const keywords = matchLockKeywords(block.raw);
    if (!keywords.every(k => out.includes(k))) return false;
  }

  // Structural integrity check for technical/code blocks
  const structuralChars = (block.raw.match(/[{}[\],]/g) || []);
  if (!structuralChars.every(c => out.includes(c))) return false;

  return true;
}

function appendMissingConstraints(original, optimized) {
  const blocks = extractSemanticBlocks(original);
  const missing = blocks.filter(b => !containsConstraint(optimized, b));
  if (missing.length === 0) return String(optimized || '').trim();
  const suffix = ['ข้อกำหนดคงเดิม:', ...missing.map(b => `- ${b.raw}`)].join('\n');
  return `${String(optimized || '').trim()}\n\n${suffix}`.trim();
}

function extractConstraints(text) {
  return extractSemanticBlocks(text).map(b => b.raw);
}

module.exports = { 
  LOCK_KEYWORDS, 
  hasLockKeyword,
  isTechnicalTarget,
  extractSemanticBlocks, 
  extractConstraints,
  containsConstraint, 
  appendMissingConstraints 
};
