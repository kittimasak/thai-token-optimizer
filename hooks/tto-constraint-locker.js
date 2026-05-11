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



const { extractSymbols } = require('./tto-semantic-analyzer');

const LOCK_PATTERNS = [
  /[^\n]*(?:ห้าม|ต้อง(?!การ)|เด็ดขาด|คงเดิม|ห้ามเปลี่ยน|ไม่เปลี่ยน|อย่าเปลี่ยน|เท่านั้น|must|must not|do not|never|keep|preserve)[^\n]*/gi,
  /[^\n]*(?:version|เวอร์ชัน|v\d+(?:\.\d+)*|\b\d+\.\d+\.\d+\b)[^\n]*/gi,
  /[^\n]*(?:API key|secret|token|password|credential|private key|รหัสผ่าน|คีย์ลับ)[^\n]*/gi
];

function extractConstraints(text) {
  text = String(text || '');
  const constraints = [];
  const seen = new Set();
  for (const pattern of LOCK_PATTERNS) {
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const value = m[0].trim();
      if (value && !seen.has(value)) {
        seen.add(value);
        constraints.push(value);
      }
      if (m[0].length === 0) pattern.lastIndex++;
    }
  }
  return constraints;
}

function containsConstraint(output, constraint, original = '') {
  const out = String(output || '');
  if (out.includes(constraint)) return true;

  // Semantic Awareness: If technical terms are in the code, the constraint might be satisfied
  const symbols = extractSymbols(original);
  
  const technicalTerms = constraint.match(/[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*/g) || [];
  if (technicalTerms.length > 0) {
    // If all technical terms in the constraint are present in EITHER the output OR the code symbols
    const allPresent = technicalTerms.every(t => out.includes(t) || symbols.includes(t));
    
    // If it's just a technical description without 'must/not', and all terms are in code, it's satisfied
    const isHardConstraint = /(ห้าม|ต้อง|เด็ดขาด|เวอร์ชัน|version|v\d+)/i.test(constraint);
    if (!isHardConstraint && allPresent) return true;
    
    // For hard constraints, we still need the keywords (must/not) to be in the output
    const keywords = constraint.match(/(ห้าม|ต้อง|เด็ดขาด|version|v\d+)/gi) || [];
    if (isHardConstraint && allPresent && keywords.every(k => out.includes(k))) return true;
  }

  return false;
}

function appendMissingConstraints(original, optimized) {
  const constraints = extractConstraints(original);
  const missing = constraints.filter(c => !containsConstraint(optimized, c, original));
  if (missing.length === 0) return String(optimized || '').trim();
  const suffix = ['ข้อกำหนดคงเดิม:', ...missing.map(c => `- ${c}`)].join('\n');
  return `${String(optimized || '').trim()}\n\n${suffix}`.trim();
}

module.exports = { LOCK_PATTERNS, extractConstraints, containsConstraint, appendMissingConstraints };
