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



const { transformSemanticAware } = require('./tto-code-aware-parser');
const { appendMissingConstraints } = require('./tto-constraint-locker');
const { getDictionary } = require('./tto-config');

const FILLER_PATTERNS = [
  [/(ได้เลยครับ|ได้เลยค่ะ|แน่นอนครับ|แน่นอนค่ะ|ขอบคุณครับ|ขอบคุณค่ะ)/g, ''],
  [/(ครับ|ค่ะ|คะ|นะครับ|นะคะ|หน่อยครับ|หน่อยค่ะ|ด้วยครับ|ด้วยค่ะ)/g, ''],
  [/(จริงๆ แล้ว|จริง ๆ แล้ว|โดยทั่วไปแล้ว|โดยปกติแล้ว|ในส่วนของ|ในเรื่องของ|ในกรณีที่|ทำการ|สามารถที่จะ|สามารถ)/g, ''],
  [/(อาจจะ|น่าจะ|ค่อนข้าง|ประมาณว่า|เหมือนกับว่า|ซึ่งเป็น|ที่เป็น)/g, ''],
  [/(ขอให้ช่วย|ช่วยทำการ|รบกวนช่วย|อยากให้ช่วย|รบกวน)/g, 'ช่วย'],
  [/(สวัสดีครับ|สวัสดีค่ะ|สวัสดี|ขอบพระคุณล่วงหน้าครับ|ขอบพระคุณล่วงหน้าค่ะ|ขอบพระคุณล่วงหน้า|ขอบคุณมากครับ|ขอบคุณมากค่ะ|ขอบคุณมาก)/g, ''],
  [/\s+/g, ' ']
];

const REPLACEMENTS = [
  ['ตรวจสอบ', 'ดู'],
  ['ดำเนินการแก้ไข', 'แก้'],
  ['ดำเนินการ', 'ทำ'],
  ['เนื่องจาก', 'เพราะ'],
  ['รายละเอียดเกี่ยวกับ', 'รายละเอียด'],
  ['แนวทางการพัฒนา', 'แนวทางพัฒนา'],
  ['เพื่อให้สามารถ', 'เพื่อ'],
  ['มีความจำเป็นต้อง', 'ต้อง'],
  ['ประสิทธิภาพสูงสุด', 'เร็ว/ดีสุด'],
  ['ในรูปแบบของ', 'แบบ'],
  ['ทำการติดตั้ง', 'ติดตั้ง'],
  ['ทำการทดสอบ', 'ทดสอบ'],
  ['ทำการปรับแต่ง', 'ปรับแต่ง'],
  ['สรุปเนื้อหา', 'สรุป'],
  ['อธิบายขั้นตอน', 'อธิบาย']
];

const ULTRA_REPLACEMENTS = [
  ['แสดงให้ดูหน่อยว่า', 'โชว์'],
  ['ช่วยวิเคราะห์ให้หน่อยว่า', 'วิเคราะห์'],
  ['มีความเป็นไปได้ว่า', 'อาจ'],
  ['ในสถานการณ์ปัจจุบัน', 'ตอนนี้'],
  ['ตามมาตรฐานสากล', 'ตามมาตรฐาน'],
  ['อย่างไรก็ตาม', 'แต่'],
  ['นอกจากนี้', 'อีกทั้ง']
];

function normalizeSemanticKey(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[“”"']/g, '')
    .replace(/[(){}\[\],.;:!?/\\|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function semanticDedup(text) {
  const blocks = String(text || '').split(/\n{2,}/);
  const seenBlock = new Set();
  const dedupBlocks = [];

  for (const block of blocks) {
    const lines = block.split('\n').map(x => x.trim()).filter(Boolean);
    const seenLine = new Set();
    const keptLines = [];
    for (const line of lines) {
      const key = normalizeSemanticKey(line);
      if (!key) continue;
      if (seenLine.has(key)) continue;
      seenLine.add(key);
      keptLines.push(line);
    }
    const merged = keptLines.join('\n').trim();
    const bKey = normalizeSemanticKey(merged);
    if (!merged || !bKey) continue;
    if (seenBlock.has(bKey)) continue;
    seenBlock.add(bKey);
    dedupBlocks.push(merged);
  }

  return dedupBlocks.join('\n\n').trim();
}

function selectiveWindowCompress(text, level = 'auto') {
  const lines = String(text || '').split('\n');
  const out = [];
  for (const rawLine of lines) {
    const s = rawLine.trim();
    if (!s) { out.push(''); continue; }
    const highValue = /(```|`|https?:\/\/|~\/|\.\/|\/|version|เวอร์ชัน|v\d+\.\d+|\b\d+\.\d+\.\d+\b|\b(?:node|npm|pnpm|git|docker|tto|codex|claude)\b|error|stack|trace|rollback|backup|constraint|h้าม|ต้อง)/i.test(s);
    if (highValue) {
      out.push(s);
      continue;
    }
    const compactLevel = level === 'safe' ? 'lite' : (level === 'lite' ? 'lite' : 'ultra');
    let compacted = compressSegment(s, compactLevel);
    // Aggressive trim for low-value narrative lines (context-window selective compression)
    if (compactLevel === 'ultra' && compacted.length > 48) {
      const words = compacted.split(/\s+/).filter(Boolean);
      if (words.length > 8) compacted = words.slice(0, 8).join(' ') + '...';
    }
    out.push(compacted);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function stripCodeFences(text) {
  return String(text || '').replace(/```[\s\S]*?```/g, m => m);
}

function compressSegment(segment, level = 'auto') {
  let out = segment;
  for (const [from, to] of REPLACEMENTS) out = out.split(from).join(to);
  if (level === 'ultra') {
    for (const [from, to] of ULTRA_REPLACEMENTS) out = out.split(from).join(to);
  }
  for (const [pattern, repl] of FILLER_PATTERNS) out = out.replace(pattern, repl);
  out = out.replace(/\s+([,.;:!?])/g, '$1').replace(/[ \t]+\n/g, '\n');
  if (level === 'full' || level === 'auto' || level === 'ultra') {
    out = out
      .replace(/ช่วยอธิบาย/g, 'อธิบาย')
      .replace(/ช่วยเขียน/g, 'เขียน')
      .replace(/ช่วยสรุป/g, 'สรุป')
      .replace(/ให้เข้าใจง่าย/g, 'เข้าใจง่าย')
      .replace(/อย่างละเอียด/g, 'ละเอียด')
      .replace(/แบบละเอียด/g, 'ละเอียด')
      .replace(/มีอะไรบ้าง/g, 'มีอะไร')
      .replace(/ควรทำอย่างไร/g, 'ทำอย่างไร');
  }
  
  if (level === 'ultra') {
    // Aggressive Thai particle removal
    out = out
      .replace(/(ที่|ซึ่ง|อัน)(?=\s)/g, '')
      .replace(/เหล่านั้น/g, 'พวกนั้น')
      .replace(/จำนวนมาก/g, 'เยอะ')
      .replace(/เล็กน้อย/g, 'นิดหน่อย');
  }

  if (level === 'safe' || level === 'lite') {
    out = out.replace(/\s+/g, ' ');
  } else {
    out = out.replace(/[ \t]{2,}/g, ' ');
  }
  return out;
}

function compressPrompt(text, options = {}) {
  const level = options.level || 'auto';
  const original = String(text || '');
  const compressed = transformSemanticAware(original, seg => compressSegment(seg, level));
  let normalized = compressed.replace(/\n{3,}/g, '\n\n').trim();
  if (options.semanticDedup !== false) normalized = semanticDedup(normalized);
  if (options.selectiveWindow) normalized = selectiveWindowCompress(normalized, level);
  return options.lockConstraints === false ? normalized : appendMissingConstraints(original, normalized);
}

function formatCompressionReport(original, optimized, estimateSavings, preservation) {
  const stats = estimateSavings(original, optimized);
  const lines = [
    'Thai Token Optimizer v1.0 — compression report',
    `Original: ${stats.before.estimatedTokens} tokens / ${stats.before.chars} chars`,
    `Optimized: ${stats.after.estimatedTokens} tokens / ${stats.after.chars} chars`,
    `Saved: ${stats.savedTokens} tokens (${stats.savingPercent}%)`
  ];
  if (preservation) lines.push(`Preservation: ${preservation.preservationPercent}% (${preservation.risk})`);
  lines.push('', optimized);
  return lines.join('\n');
}

if (require.main === module) {
  const chunks = [];
  process.stdin.on('data', c => chunks.push(c));
  process.stdin.on('end', () => process.stdout.write(compressPrompt(Buffer.concat(chunks).toString('utf8')) + '\n'));
}

module.exports = {
  compressPrompt,
  stripCodeFences,
  compressSegment,
  formatCompressionReport,
  semanticDedup,
  selectiveWindowCompress,
  normalizeSemanticKey
};
