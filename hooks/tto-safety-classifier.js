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



const CATEGORIES = [
  {
    id: 'destructive_command',
    severity: 'high',
    patterns: [/\brm\s+-rf\b/i, /\bchmod\s+777\b/i, /\bchown\s+-R\b/i, /\bgit\s+reset\s+--hard\b/i, /\bgit\s+push\s+--force\b/i, /\bmkfs\b/i, /\bdd\s+if=/i, /พุชฟอร์ซ|ลบไฟล์ทั้งหมด|ฟอร์แมต/i]
  },
  {
    id: 'database_migration',
    severity: 'high',
    patterns: [/\bDROP\s+TABLE\b/i, /\bTRUNCATE\s+TABLE\b/i, /\bALTER\s+TABLE\b/i, /\bDELETE\s+FROM\b/i, /migration/i, /schema/i, /ฐานข้อมูล|ตาราง|ลบข้อมูล|ย้ายข้อมูล|ดรอปเทเบิ้ล|ดรอปดาต้าเบส/i]
  },
  {
    id: 'production_deploy',
    severity: 'high',
    patterns: [/production|prod\b|deploy|release|rollback|hotfix/i, /ขึ้นระบบจริง|โปรดักชัน|ปล่อยระบบ|ดีพลอย|ดันขึ้นโปรดักชัน/i]
  },
  {
    id: 'security_secret',
    severity: 'high',
    patterns: [/api[_\s-]?key|secret|access[_\s-]?token|bearer\s+token|auth[_\s-]?token|password|credential|private key|ssh key/i, /รหัสผ่าน|คีย์ลับ|โทเคนลับ|โทเคนยืนยันตัวตน|ความปลอดภัย|ช่องโหว่/]
  },
  {
    id: 'auth_payment',
    severity: 'medium',
    patterns: [/auth|oauth|jwt|session|permission|role|payment|billing|invoice/i, /สิทธิ์|ยืนยันตัวตน|ชำระเงิน|ใบแจ้งหนี้|จ่ายเงิน|เก็บเงิน/]
  },
  {
    id: 'clarification_requested',
    severity: 'medium',
    patterns: [/อธิบายละเอียด|อธิบายชัด|ขยายความ|อะไรนะ|พูดอีกที|ละเอียดมาก|step by step|ทีละขั้น/i]
  }
];

const WHITELIST_RE = [
  /^git\s+(push|commit|pull|add|status|log|diff|show|branch|checkout|fetch|merge|rebase|remote|init|config)/i,
  /^discord\s+(reply|fetch_messages)/i,
  /^maw\s+(hey|peek)/i,
  /^origin-send\.sh/i,
  /^room\s+say/i,
  /^npm\s+(install|test|run|start|list|info|view)/i,
  /^ls\b/i, /^cat\b/i, /^grep\b/i, /^find\b/i, /^echo\b/i, /^mkdir\b/i, /^touch\b/i, /^cp\b/i, /^mv\b/i
];

function classifyText(text) {
  const source = String(text || '').trim();
  const matches = [];
  
  const isWhitelisted = WHITELIST_RE.some(re => re.test(source));

  for (const category of CATEGORIES) {
    for (const pattern of category.patterns) {
      if (pattern.test(source)) {
        // Skip medium severity matches if whitelisted
        if (isWhitelisted && category.severity === 'medium') continue;
        
        matches.push({ id: category.id, severity: category.severity, pattern: pattern.toString() });
        break;
      }
    }
  }
  const score = matches.reduce((sum, m) => sum + (m.severity === 'high' ? 3 : 1), 0);
  return {
    safeCritical: matches.some(m => m.severity === 'high'),
    shouldRelaxCompression: matches.length > 0,
    score,
    categories: matches.map(m => m.id),
    matches
  };
}

function extractTextFromHookPayload(payload) {
  if (!payload || typeof payload !== 'object') return '';
  const fields = [payload.prompt, payload.command, payload.tool_input, payload.toolInput, payload.input, payload.args, payload.message];
  return fields.map(x => typeof x === 'string' ? x : JSON.stringify(x || '')).join('\n');
}

if (require.main === module) {
  const chunks = [];
  process.stdin.on('data', c => chunks.push(c));
  process.stdin.on('end', () => {
    let text = Buffer.concat(chunks).toString('utf8');
    try { text = extractTextFromHookPayload(JSON.parse(text)); } catch (_) {}
    process.stdout.write(JSON.stringify(classifyText(text), null, 2) + '\n');
  });
}

module.exports = { classifyText, extractTextFromHookPayload, CATEGORIES };
