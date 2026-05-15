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



const { transformSemanticAware } = require('./tto-code-aware-parser');
const { appendMissingConstraints } = require('./tto-constraint-locker');
const { getDictionary } = require('./tto-config');

const FILLER_PATTERNS = [
  [/(ได้เลยครับ|ได้เลยค่ะ|แน่นอนครับ|แน่นอนค่ะ|ขอบคุณครับ|ขอบคุณค่ะ)/g, ''],
  [/(ครับ|ค่ะ|คะ|นะครับ|นะคะ|หน่อยครับ|หน่อยค่ะ|ด้วยครับ|ด้วยค่ะ)/g, ''],
  [/(จริงๆ แล้ว|จริง ๆ แล้ว|โดยทั่วไปแล้ว|โดยปกติแล้ว|ในส่วนของ|ในเรื่องของ|ในกรณีที่|ทำการ|สามารถที่จะ|สามารถ)/g, ''],
  [/(อาจจะ|น่าจะ|ค่อนข้าง|ประมาณว่า|เหมือนกับว่า|ซึ่งเป็น|ที่เป็น)/g, ''],
  [/(ขอให้ช่วย|ช่วยทำการ|รบกวนช่วย|อยากให้ช่วย|รบกวน)/g, 'ช่วย'],
  [/(สวัสดีครับ|สวัสดีค่ะ|สวัสดี|ขอบพระคุณล่วงหน้าครับ|ขอบพระคุณล่วงหน้าค่ะ|ขอบพระคุณล่วงหน้า|ขอบคุณมากครับ|ขอบคุณมากค่ะ|ขอบคุณมาก)/g, '']
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
  ['อธิบายขั้นตอน', 'อธิบาย'],
  ['อย่างละเอียด', 'ละเอียด'],
  ['สาระสำคัญทั้งหมด', 'สาระสำคัญ'],
  ['ความหมายเดิมเปลี่ยนไป', 'ความหมายเปลี่ยน']
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
  const raw = String(text || '').trim();
  if (!raw) return '';
  // If the line is only structural/punctuation, keep it as is to avoid empty key
  if (/^[(){}\[\],.;:!?/\\|]+$/.test(raw)) return raw;
  
  return raw
    .toLowerCase()
    .replace(/[“”"']/g, '')
    .replace(/[(){}\[\],.;:!?/\\|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const HARD_WORD_RE = /(```|`|https?:\/\/|~\/|\.\/|\/|version|เวอร์ชัน|v\d+(?:\.\d+)*|\b\d+\.\d+\.\d+\b|\b(?:node|npm|pnpm|git|docker|tto|codex|claude)\b|codex_hooks)/i;
const STRUCTURE_SENSITIVE_RE = /^(\s+["']?[A-Za-z0-9_.-]+["']?\s*[:=]|\s+[A-Za-z0-9_.-]+\s*:|\s*[-*]\s+["']?[A-Za-z0-9_.-]+["']?\s*:|\s*\|.*\|\s*$|\s*at\s+|.*\b(?:ERROR|WARN|Exception|TypeError|ReferenceError|Cannot find module)\b)/i;

function collapseRepeatedPhrases(line) {
  const words = String(line || '').trim().split(/\s+/).filter(Boolean);
  if (words.length < 6) return String(line || '').trim();

  const sameGroup = (aStart, bStart, size) => {
    for (let offset = 0; offset < size; offset++) {
      const a = normalizeSemanticKey(words[aStart + offset]);
      const b = normalizeSemanticKey(words[bStart + offset]);
      if (!a || a !== b) return false;
    }
    return true;
  };
  const hasHardWord = (start, size) => words.slice(start, start + size).some(w => HARD_WORD_RE.test(w));

  const out = [];
  let i = 0;
  while (i < words.length) {
    let matched = false;
    const maxSize = Math.min(14, Math.floor((words.length - i) / 2));
    for (let size = 3; size <= maxSize; size++) {
      if (hasHardWord(i, size)) continue;
      if (!sameGroup(i, i + size, size)) continue;
      out.push(...words.slice(i, i + size));
      i += size;
      while (i + size <= words.length && sameGroup(i - size, i, size)) i += size;
      matched = true;
      break;
    }
    if (!matched) out.push(words[i++]);
  }
  return out.join(' ').trim();
}

function levenshtein(a, b) {
  const tmp = [];
  for (let i = 0; i <= a.length; i++) tmp[i] = [i];
  for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

function aggressiveLogDedup(lines, level = 'auto') {
  if (lines.length < 2) return lines;
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const current = lines[i];
    const key = normalizeSemanticKey(current);
    if (!key) { out.push(current); i++; continue; }

    // 1. Exact Repetition (Semantic Sequence Compression)
    let j = i + 1;
    while (j < lines.length && normalizeSemanticKey(lines[j]) === key) j++;
    const exactCount = j - i;
    if (exactCount >= 3) {
      out.push(`[${current.replace(/\.+$/, '')}] รันซ้ำ ${exactCount} ครั้งเพื่ออัปเดตสถานะ`);
      i = j;
      continue;
    }

    // 2. Pattern-Based Collapsing (Common Prefix)
    // E.g. "กำลังตรวจสอบไฟล์ index.js", "กำลังตรวจสอบไฟล์ package.json"
    const prefixMatch = current.match(/^([\u0E00-\u0E7F\s]+)/); // Thai prefix
    if (prefixMatch && prefixMatch[1].length > 4) {
      const prefix = prefixMatch[1];
      let k = i + 1;
      const items = [current.slice(prefix.length).replace(/\.+$/, '').trim()];
      while (k < lines.length && lines[k].startsWith(prefix)) {
        items.push(lines[k].slice(prefix.length).replace(/\.+$/, '').trim());
        k++;
      }
      if (items.length >= 3) {
        out.push(`${prefix.trim()} [${items.join(', ')}] (${items.length} รายการ)`);
        i = k;
        continue;
      }
    }

    // 3. Numerical Aggregation / Similarity (Levenshtein)
    // E.g. "พบข้อผิดพลาด 1 จุด" x 5
    let l = i + 1;
    while (l < lines.length) {
      const dist = levenshtein(current, lines[l]);
      const maxLen = Math.max(current.length, lines[l].length);
      const similarity = 1 - dist / maxLen;
      if (similarity < 0.6) break;
      l++;
    }
    const simCount = l - i;
    if (simCount >= 3) {
      out.push(`${current.replace(/\d+/, simCount).replace(/(\d+)\s*จุด/, simCount + ' จุด')} (พบซ้ำ ${simCount} ครั้งในบรรทัดใกล้เคียงกัน)`);
      i = l;
      continue;
    }

    out.push(lines[i++]);
  }
  return out;
}

function semanticDedup(text, level = 'auto') {
  const blocks = String(text || '').split(/\n{2,}/);
  const seenBlock = new Set();
  const dedupBlocks = [];

  for (const block of blocks) {
    let lines = block.split('\n').map(x => STRUCTURE_SENSITIVE_RE.test(x) ? x : collapseRepeatedPhrases(x)).filter(Boolean);
    
    // Apply Aggressive Log Deduplication
    if (level !== 'lite') {
      lines = aggressiveLogDedup(lines, level);
    }

    const seenLine = new Set();
    const keptLines = [];
    let politeSuffix = '';

    for (const line of lines) {
      const key = normalizeSemanticKey(line);
      if (!key) continue;
      if (seenLine.has(key)) continue;
      
      // Polite Particle & Filler Stripping (Aggressive)
      let processedLine = line;
      if (level === 'full' || level === 'ultra' || level === 'auto') {
        const m = processedLine.match(/(เสร็จแล้ว|เรียบร้อยแล้ว|แล้ว)(ครับ|ค่ะ|นะครับ|นะคะ)$/);
        if (m) {
          if (m[0].length > politeSuffix.length) politeSuffix = m[0];
          processedLine = processedLine.replace(m[0], '').trim();
        }
      }

      seenLine.add(key);
      keptLines.push(processedLine);
    }

    let merged = keptLines.join('\n').trim();
    if (politeSuffix && keptLines.length > 1) {
      // Grouping actions: [A, B, C] + Suffix
      if (keptLines.every(l => !l.includes('\n'))) {
        merged = `[${keptLines.join(', ')}] ${politeSuffix}`;
      } else {
        merged += `\n${politeSuffix}`;
      }
    } else if (politeSuffix && keptLines.length === 1) {
      merged += ' ' + politeSuffix;
    }

    const bKey = normalizeSemanticKey(merged);
    if (!merged || !bKey) continue;
    if (seenBlock.has(bKey)) continue;
    seenBlock.add(bKey);
    dedupBlocks.push(merged);
  }

  return dedupBlocks.join('\n\n').trim();
}

function selectiveWindowCompress(text, level = 'auto', semanticBlocks = []) {
  const lines = String(text || '').split('\n');
  const out = [];
  
  // Enhanced patterns for Logs, Progress Bars, and Stack Traces
  const LOG_RE = /^(?:\[[\d\s-:.TZ]+\]|(?:\d{4}-\d{2}-\d{2}|\d{2}:\d{2}:\d{2})(?:[.\d\s+-:TZ]*)|\[\d+\]|[\w\s.-]+:)/i;
  const PROGRESS_RE = /^(?:\[[#=-]+\]|\s*[\d.]+(?:%|MB|KB|GB|B)\s*|\s*\|\s*[\d.]+\/|Working:|Processing:)/i;
  const STACK_RE = /^\s*at\s+[\w.<>]+\s+\(.*\)|^\s*at\s+.*\d+:\d+/i;

  let batch = [];
  let batchType = null; // 'log', 'progress', 'stack'

  const flushBatch = () => {
    if (batch.length === 0) return;
    const isUltra = level === 'ultra' || level === 'full';

    if (batchType === 'progress' && isUltra && batch.length > 1) {
      // Progress bars: Keep only the latest state
      out.push(`... [${batch.length - 1} progress updates masked by TTO] ...`);
      out.push(batch[batch.length - 1]);
    } else if (batchType === 'progress' && isUltra && batch.length === 1) {
      out.push(batch[0]);
    } else if (batch.length > 4 && isUltra) {
      // Logs/Stacks: Keep start and end
      out.push(batch[0]);
      out.push(batch[1]);
      out.push(`... [${batch.length - 4} ${batchType} lines omitted/masked by TTO] ...`);
      out.push(batch[batch.length - 2]);
      out.push(batch[batch.length - 1]);
    } else {
      for (const b of batch) out.push(b);
    }
    batch = [];
    batchType = null;
  };

  for (const rawLine of lines) {
    const s = rawLine.trim();
    if (!s) { 
      flushBatch();
      out.push(''); 
      continue; 
    }

    let currentType = null;
    if (PROGRESS_RE.test(s)) currentType = 'progress';
    else if (STACK_RE.test(s)) currentType = 'stack';
    else if (LOG_RE.test(s)) currentType = 'log';

    if (currentType && (batchType === null || batchType === currentType)) {
      batchType = currentType;
      batch.push(rawLine);
      continue;
    } else {
      flushBatch();
      if (currentType) {
        batchType = currentType;
        batch.push(rawLine);
        continue;
      }
    }

    // Check against Semantic Blocks for proactive protection
    const matchingBlock = semanticBlocks.find(b => s.includes(b.raw) || b.targets.some(t => s.includes(t) && b.raw.match(/(ห้าม|ต้อง|เด็ดขาด)/)));
    if (matchingBlock) {
      // If it's a constraint, preserve it with minimal cleaning
      out.push(STRUCTURE_SENSITIVE_RE.test(rawLine) ? rawLine : compressSegment(rawLine, 'lite')); 
      continue;
    }

    const highValue = /(```|`|https?:\/\/|~\/|\.\.\/|\.\/|\b(?:\/|[a-zA-Z]:\\)[\w.-]+|version|เวอร์ชัน|v\d+\.\d+|\b\d+\.\d+\.\d+\b|\b(?:node|npm|pnpm|git|docker|tto|codex|claude)\b|error|stack|trace|rollback|backup|constraint|ห้าม|ต้อง|must|must not|do not|never|keep|preserve|^[{}[\],]+$|^".*":|^".*"$)/i.test(s);
    if (highValue) {
      out.push(STRUCTURE_SENSITIVE_RE.test(rawLine) ? rawLine : s);
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
  flushBatch();
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
  for (const [pattern, repl] of FILLER_PATTERNS) {
    // Skip particle removal for auto/full/ultra to let semanticDedup handle grouping
    if ((level === 'auto' || level === 'full' || level === 'ultra') && 
        (pattern.source.includes('ครับ') || pattern.source.includes('ค่ะ'))) {
      continue;
    }
    out = out.replace(pattern, repl);
  }
  // Avoid removing space before punctuation if it looks like a path or special technical notation
  out = out.replace(/\s+([,;:!?])/g, '$1').replace(/[ \t]+\n/g, '\n');
  // Specifically handle '.' to avoid breaking ./ or file extensions
  out = out.replace(/\s+\.(?!\/|\w)/g, '.');

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
    out = out
      .split('\n')
      .map(line => line.replace(/[ \t]+/g, ' ').trim())
      .join('\n');
  } else {
    out = out.replace(/[ \t]{2,}/g, ' ');
  }
  return out.trim();
}

function compressPrompt(text, options = {}) {
  const { extractSemanticBlocks } = require('./tto-constraint-locker');
  const level = options.level || 'auto';
  const original = String(text || '');
  const semanticBlocks = extractSemanticBlocks(original);
  
  const compressed = transformSemanticAware(original, seg => compressSegment(seg, level));
  let normalized = compressed.replace(/\n{3,}/g, '\n\n').trim();
  if (options.semanticDedup !== false) normalized = semanticDedup(normalized, level);
  if (options.selectiveWindow || level === 'ultra') normalized = selectiveWindowCompress(normalized, level, semanticBlocks);
  return options.lockConstraints === false ? normalized : appendMissingConstraints(original, normalized);
}

function formatCompressionReport(original, optimized, estimateSavings, preservation) {
  const stats = estimateSavings(original, optimized);
  const lines = [
    'Thai Token Optimizer v2.0.0 — compression report',
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
  collapseRepeatedPhrases,
  selectiveWindowCompress,
  normalizeSemanticKey
};
