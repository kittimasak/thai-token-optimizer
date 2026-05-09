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


#!/usr/bin/env node

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

function containsConstraint(output, constraint) {
  const out = String(output || '');
  if (out.includes(constraint)) return true;
  const technicalTerms = constraint.match(/[A-Za-z][A-Za-z0-9_.-]*(?:\s+[A-Za-z][A-Za-z0-9_.-]*)?/g) || [];
  if (/คงคำว่า|keep|preserve/i.test(constraint) && technicalTerms.length) {
    return technicalTerms.every(k => out.toLowerCase().includes(k.toLowerCase()));
  }
  const keywords = constraint.match(/(?:v\d+(?:\.\d+)*|\b\d+\.\d+\.\d+\b|ห้าม|ต้อง(?!การ)|เด็ดขาด|ไม่เปลี่ยน|คงเดิม|version|เวอร์ชัน|must|never|do not)/gi) || [];
  return keywords.length > 0 && keywords.every(k => out.toLowerCase().includes(k.toLowerCase()));
}

function appendMissingConstraints(original, optimized) {
  const constraints = extractConstraints(original);
  const missing = constraints.filter(c => !containsConstraint(optimized, c));
  if (missing.length === 0) return String(optimized || '').trim();
  const suffix = ['ข้อกำหนดคงเดิม:', ...missing.map(c => `- ${c}`)].join('\n');
  return `${String(optimized || '').trim()}\n\n${suffix}`.trim();
}

module.exports = { LOCK_PATTERNS, extractConstraints, containsConstraint, appendMissingConstraints };
