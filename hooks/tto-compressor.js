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
  [/(สวัสดีครับ|สวัสดีค่ะ|สวัสดี|ขอบพระคุณล่วงหน้าครับ|ขอบพระคุณล่วงหน้าค่ะ|ขอบพระคุณล่วงหน้า|ขอบคุณมากครับ|ขอบคุณมากค่ะ|ขอบคุณมาก)/g, ''],
  [/\b(please|could you|kindly|I would like you to|would you mind|thank you|sincerely|regards|best regards|thanks in advance|feel free to|in order to|due to the fact that|very much|in advance|just|simply)\b/gi, '']
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
  ['ความหมายเดิมเปลี่ยนไป', 'ความหมายเปลี่ยน'],
  ['information', 'info'],
  ['configuration', 'config'],
  ['specifications', 'specs'],
  ['requirements', 'reqs'],
  ['development', 'dev'],
  ['production', 'prod'],
  ['environment', 'env'],
  ['documentation', 'docs'],
  ['optimization', 'opt']
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
  // If the line is only structural/punctuation, return empty to trigger exact match in aggressiveLogDedup
  if (/^[(){}\[\]\s,.;:!?/\\|!@#$%^&*+=<>~`_-]+$/.test(raw)) return '';
  
  let masked = raw.toLowerCase().replace(/[“”"']/g, '');

  // 1. Mask patterns that depend on structural characters (dashes, colons, dots)
  masked = masked
    .replace(/\b\d{4}-\d{2}-\d{2}t\d{2}:\d{2}:\d{2}[.\d]*z?\b/g, '[time]') // ISO Time
    .replace(/\b\d{2}:\d{2}:\d{2}[.\d]*\b/g, '[time]') // HH:MM:SS
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g, '[uuid]')
    .replace(/\b\d+(\.\d+)?(ms|s|mb|kb|gb|b|%)\b/g, '[val]$2'); // Units with decimal

  // 2. Structural normalization to create clear word boundaries for everything else
  masked = masked.replace(/[(){}\[\]\s,.;:/\\|@#$%^&*+=<>~`_-]/g, ' ');

  // 3. Mask remaining patterns on normalized text
  masked = masked
    // Ignore Thai Particles/Fillers in Key
    .replace(/(นะครับ|นะคะ|ครับ|ค่ะ|คะ|นะ|หน่อย|ด้วย|จริง ๆ|จริงๆ|ทำการ|สามารถ)/g, '')
    .replace(/\b0x[a-f0-9]+\b/g, '[hex]')
    .replace(/\b\d{4} \d{2} \d{2}\b/g, '[date]')
    .replace(/\b\d{1,3} \d{1,3} \d{1,3} \d{1,3}\b/g, '[ip]')
    .replace(/\b[a-z0-9_.-]+ [a-z]{2,4}\b/g, '[file]')
    .replace(/\b\d+\b/g, '[n]')
    .replace(/\s+/g, ' ')
    .trim();

  return masked;
}

const HARD_WORD_RE = /(```|`|https?:\/\/|~\/|\.\/|\/|version|เวอร์ชัน|v\d+(?:\.\d+)*|\b\d+\.\d+\.\d+\b|\.(?:js|ts|tsx|jsx|py|go|rs|c|cpp|h|java|php|rb|sh|md|json|yaml|yml|toml|xml|html|css|sql|log)\b|\b(?:at|node|npm|pnpm|git|docker|tto|codex|claude)\b|codex_hooks)/i;
const STRUCTURE_SENSITIVE_RE = /^(\s*at\s+.*|^\s*\[[\!\?\+\-AMD R]\]|^\s*On\s+\b|\s*["']?(?!Progress|Step|Mission|Task|INFO|WARN|DEBUG|TRACE|LOG|Level|Memory|Usage|Current|Size|Status|[0-9]+)[A-Za-z0-9_.-]+["']?\s*[:=]|\s*(?!Progress|Step|Mission|Task|INFO|WARN|DEBUG|TRACE|LOG|Level|Memory|Usage|Current|Size|Status|[0-9]+)[A-Za-z0-9_.-]+\s*:|\s*[-*]\s+["']?[A-Za-z0-9_.-]+["']?\s*:|\s*\|.*\|\s*$|\b(?:ERROR|WARN|Exception|TypeError|ReferenceError|Cannot find module)\b|^\s*(?:MISSION|CONTEXT|CONCLUSION|OVERVIEW|SUMMARY|RESULT|PURPOSE|OBJECTIVE|สรุป|เป้าหมาย)\s*:?$|^\s*(?:node|npm|npx|pnpm|yarn|bun|git|docker|docker-compose|kubectl|helm|ssh|scp|rsync|curl|wget|python3?|pip3?|php|composer|mysql|psql|sqlite3|redis-cli|mongosh|ollama|codex|claude|tto|thai-token-optimizer)\b|\s*(?:DROP|TRUNCATE|DELETE|UPDATE|ALTER|INSERT)\b)/i;


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
    
    // 1. Symbol/Punctuation handling: Exact match only
    if (!key) {
      let j = i + 1;
      while (j < lines.length && lines[j] === current) j++;
      const count = j - i;
      if (count >= 3) {
        const savesSpace = (current.length * count) > (current.length + 20);
        if (count >= 5 || savesSpace) {
          out.push(`[${current.trim()}] รันซ้ำ ${count} ครั้ง`);
          i = j;
          continue;
        }
      }
      out.push(lines[i++]);
      continue;
    }

    // 1.1 Safety: If it's a structure sensitive line (e.g. destructive command),
    // skip aggressive dedup to preserve exactness.
    if (STRUCTURE_SENSITIVE_RE.test(current)) {
      out.push(current);
      i++;
      continue;
    }

    // 1.2 Exact Repetition (Semantic Sequence Compression) - Top Priority for size 1
    let j = i + 1;
    while (j < lines.length && normalizeSemanticKey(lines[j]) === key) j++;
    const exactCount = j - i;
    const savesSpace = (current.length * exactCount) > (current.length + 15);
    if (exactCount >= 3 && (exactCount >= 5 || savesSpace)) {
      out.push(`[${current.replace(/\.+$/, '').trim()}] รันซ้ำ ${exactCount} ครั้ง`);
      i = j;
      continue;
    }

    // 1.5 Sequence Detection (Multi-line Pattern)
    let bestSeqSize = 0;
    let bestSeqCount = 0;
    let maxReduction = 0;

    for (let size = 2; size <= 5; size++) {
      if (i + size * 2 > lines.length) continue;
      
      let hasSensitive = false;
      const patternKeys = [];
      for (let k = 0; k < size; k++) {
        if (STRUCTURE_SENSITIVE_RE.test(lines[i + k])) {
          hasSensitive = true;
          break;
        }
        patternKeys.push(normalizeSemanticKey(lines[i + k]));
      }
      if (hasSensitive) continue;

      let matchCount = 1;
      while (i + (matchCount + 1) * size <= lines.length) {
        let batchMatch = true;
        for (let k = 0; k < size; k++) {
          if (normalizeSemanticKey(lines[i + matchCount * size + k]) !== patternKeys[k]) {
            batchMatch = false;
            break;
          }
        }
        if (!batchMatch) break;
        matchCount++;
      }

      if (matchCount >= 2) {
        const reduction = size * matchCount;
        if (reduction > maxReduction) {
          maxReduction = reduction;
          bestSeqSize = size;
          bestSeqCount = matchCount;
        }
      }
    }

    if (bestSeqSize > 0) {
      const seqLines = lines.slice(i, i + bestSeqSize);
      const labels = seqLines.map(l => {
        const clean = l.replace(/^\[[time|date|val|uuid|hex|ip|file|n|val]+\]\s*/i, '').replace(/\.{2,}/g, '').trim();
        const m = clean.match(/^\[?([A-Z0-9/_-]{3,})\]?/i);
        if (m) return m[1];
        const words = clean.split(/[:\s]/).filter(Boolean);
        if (words.length >= 2 && words[0].length >= 3) return words.slice(0, 2).join(' ');
        return words[0] || 'seq';
      }).join('/');
      out.push(`[${labels}] sequence detected ${bestSeqCount} times`);
      i += bestSeqCount * bestSeqSize;
      continue;
    }

    // 3. Pattern-Based Collapsing (Common Prefix)
    const prefixMatch = current.match(/^([\u0E00-\u0E7F\s]+)([:\s-]*)/); // Thai prefix and optional separators
    if (prefixMatch && prefixMatch[1].length > 6) {
      const prefix = prefixMatch[1];
      const separator = prefixMatch[2] || '';
      let k = i + 1;
      const fullPrefix = prefix + separator;
      const items = [current.slice(fullPrefix.length).replace(/\.+$/, '').trim()].filter(Boolean);
      while (k < lines.length && lines[k].startsWith(fullPrefix)) {
        const item = lines[k].slice(fullPrefix.length).replace(/\.+$/, '').trim();
        if (item) items.push(item);
        k++;
      }
      if (items.length >= 2) {
        out.push(`${prefix.trim()}${separator} [${items.join(', ')}] (${items.length} รายการ)`);
        i = k;
        continue;
      }
    }

    // 4. Numerical Aggregation / Similarity (Levenshtein)
    let l = i + 1;
    let lastMatched = current;
    while (l < lines.length) {
      if (STRUCTURE_SENSITIVE_RE.test(lines[l])) break;
      const nextKey = normalizeSemanticKey(lines[l]);
      if (!nextKey) break;

      // Optimization: If length difference is huge, they can't be similar
      if (Math.abs(lastMatched.length - lines[l].length) > lastMatched.length * 0.8) break;

      const dist = levenshtein(normalizeSemanticKey(lastMatched), normalizeSemanticKey(lines[l]));
      const maxLen = Math.max(normalizeSemanticKey(lastMatched).length, normalizeSemanticKey(lines[l]).length);
      const similarity = 1 - dist / maxLen;
      if (similarity < 0.25) break; // Maximum capacity drift coverage
      lastMatched = lines[l];
      l++;
    }
    const simCount = l - i;
    const simSavesSpace = (current.length * simCount) > (current.length + 18);
    if (simCount >= 3 || (simCount >= 2 && simSavesSpace)) {
      out.push(`${current.replace(/\d+/, simCount).replace(/(\d+)\s*จุด/, simCount + ' จุด')} (พบซ้ำ ${simCount} ครั้ง)`);
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
    const rawLines = block.split('\n').filter(Boolean);
    
    // Care-aware preprocessing: only collapse phrases if NOT structure-sensitive
    const preprocessed = rawLines.map((line, idx) => {
      // Explicit Stack Trace / Indented line check
      if (/^\s{2,}at\s+/i.test(line)) return line;
      
      const match = STRUCTURE_SENSITIVE_RE.test(line);
      if (match) return line;
      return collapseRepeatedPhrases(line);
    });

    const deduped = (level === 'lite') ? preprocessed : aggressiveLogDedup(preprocessed, level);

    const seenLine = new Set();
    const keptLines = [];
    let politeSuffix = '';

    for (const line of deduped) {
      const key = normalizeSemanticKey(line);
      let processedLine = line;

      // Polite Particle & Filler Stripping (Aggressive)
      if (level === 'full' || level === 'ultra' || level === 'auto') {
        const m = processedLine.match(/(เสร็จแล้ว|เรียบร้อยแล้ว|แล้ว)(ครับ|ค่ะ|นะครับ|นะคะ)$/);
        if (m) {
          if (m[0].length > politeSuffix.length) politeSuffix = m[0];
          processedLine = processedLine.replace(m[0], '').trim();
        }
      }

      if (!key) {
        if (!seenLine.has(processedLine)) {
          seenLine.add(processedLine);
          keptLines.push(processedLine);
        }
        continue;
      }

      const isSensitive = STRUCTURE_SENSITIVE_RE.test(line);
      const isSummary = line.includes('รันซ้ำ') || line.includes('พบซ้ำ');

      if (seenLine.has(key) && !isSensitive && !isSummary) continue;
      seenLine.add(key);
      keptLines.push(processedLine);
    }

    let merged = keptLines.join('\n').trim();
    if (politeSuffix && keptLines.length > 1) {
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
    // Skip particle removal for auto/full to let semanticDedup handle grouping,
    // but ALLOW greeting/polite word removal (those that don't look like trailing particles)
    const isParticle = pattern.source.includes('ครับ') || pattern.source.includes('ค่ะ');
    const isGreeting = pattern.source.includes('สวัสดี') || pattern.source.includes('ขอบคุณ');
    
    if (isParticle && !isGreeting && level !== 'ultra' && (level === 'auto' || level === 'full')) {
      continue;
    }
    const before = out;
    out = out.replace(pattern, repl);
  }
  // Avoid removing space before punctuation if it looks like a path or special technical notation
  out = out.replace(/[ \t]+([,;:!?])/g, '$1').replace(/[ \t]+\n/g, '\n');
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
      .replace(/ควรทำอย่างไร/g, 'ทำอย่างไร')
      .replace(/(นะครับ|ครับ|ค่ะ|คะ|นะ)(?=[ \t]+)/g, ''); // Handle middle particles (only followed by space/tab)
  }
  
  if (level === 'ultra') {
    // Aggressive Thai particle removal (exhaustive)
    out = out
      .replace(/(นะครับ|นะครับ|นะค่ะ|นะคะ|ครับ|ค่ะ|คะ|นะ)/g, '')
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

  // ALWAYS apply semanticDedup for auto/full/ultra to handle ALD
  if (options.semanticDedup !== false && (level === 'auto' || level === 'full' || level === 'ultra')) {
    normalized = semanticDedup(normalized, level);
  }

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
  aggressiveLogDedup,
  collapseRepeatedPhrases,
  selectiveWindowCompress,
  normalizeSemanticKey,
  STRUCTURE_SENSITIVE_RE
};
