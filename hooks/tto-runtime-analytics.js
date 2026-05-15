#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { HOME_DIR, getState, setState } = require('./tto-config');
const { getPolicy } = require('./tto-policy');

const CHECKPOINTS_PATH = path.join(HOME_DIR, 'checkpoints.jsonl');
const CACHE_READS_PATH = path.join(HOME_DIR, 'cache-reads.jsonl');
const CACHE_DECISIONS_PATH = path.join(HOME_DIR, 'cache-decisions.jsonl');
const READ_CACHE_STATE_PATH = path.join(HOME_DIR, 'read-cache-state.json');
const CHECKPOINT_STATE_PATH = path.join(HOME_DIR, 'checkpoint-state.json');
const TRANSACTION_JOURNAL_PATH = path.join(HOME_DIR, 'transaction-journal.json');

const DEFAULT_LIFECYCLE = Object.freeze({
  contextWindowTokens: 400000,
  fillBands: [20, 35, 50, 65, 80],
  qualityDropBands: [80, 70, 50, 40]
});
const QUALITY_STAGE1_WEIGHTS = Object.freeze({
  contextFillRisk: 20,
  sessionLengthRisk: 16,
  modelRoutingRisk: 16,
  emptyRunRisk: 16,
  outcomeHealthRisk: 12
});
const QUALITY_STAGE2_WEIGHTS = Object.freeze({
  messageEfficiencyRisk: 10,
  compressionOpportunityRisk: 10
});

function appendJsonl(file, row) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(row) + '\n');
}

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJson(file, obj, transaction = null) {
  if (transaction) {
    transaction.queueWrite(file, obj);
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmpPath = file + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(obj, null, 2) + '\n');
  fs.renameSync(tmpPath, file);
}

class Transaction {
  constructor() {
    this.queue = [];
    this.committed = false;
  }

  queueWrite(file, data) {
    this.queue.push({ file, data, tmp: file + '.transaction.tmp' });
  }

  commit() {
    if (this.committed || this.queue.length === 0) return;
    try {
      // 1. Write all to temp files
      for (const item of this.queue) {
        fs.mkdirSync(path.dirname(item.file), { recursive: true });
        fs.writeFileSync(item.tmp, JSON.stringify(item.data, null, 2) + '\n');
      }

      // 2. Write-Ahead Log (Journaling)
      const journal = {
        ts: nowIso(),
        state: 'pending_rename',
        files: this.queue.map(i => ({ src: i.tmp, dst: i.file }))
      };
      fs.writeFileSync(TRANSACTION_JOURNAL_PATH, JSON.stringify(journal, null, 2));

      // 3. Atomically rename all
      for (const item of this.queue) {
        fs.renameSync(item.tmp, item.file);
      }

      // 4. Cleanup journal on success
      this.committed = true;
      if (fs.existsSync(TRANSACTION_JOURNAL_PATH)) fs.unlinkSync(TRANSACTION_JOURNAL_PATH);
    } catch (e) {
      this.rollback();
      throw e;
    }
  }

  rollback() {
    for (const item of this.queue) {
      try { if (fs.existsSync(item.tmp)) fs.unlinkSync(item.tmp); } catch (_) {}
    }
    try { if (fs.existsSync(TRANSACTION_JOURNAL_PATH)) fs.unlinkSync(TRANSACTION_JOURNAL_PATH); } catch (_) {}
  }
}

function recoverTransactions() {
  if (!fs.existsSync(TRANSACTION_JOURNAL_PATH)) return { recovered: false };
  try {
    const journal = JSON.parse(fs.readFileSync(TRANSACTION_JOURNAL_PATH, 'utf8'));
    let count = 0;
    if (journal.state === 'pending_rename' && Array.isArray(journal.files)) {
      for (const f of journal.files) {
        if (fs.existsSync(f.src)) {
          fs.renameSync(f.src, f.dst);
          count++;
        }
      }
    }
    if (fs.existsSync(TRANSACTION_JOURNAL_PATH)) fs.unlinkSync(TRANSACTION_JOURNAL_PATH);
    return { recovered: true, fileCount: count };
  } catch (_) {
    return { recovered: false, error: true };
  }
}

function beginTransaction() {
  recoverTransactions(); // Auto-recover on start
  return new Transaction();
}

function nowIso() { return new Date().toISOString(); }

function deriveMilestones(text = '') {
  const t = String(text || '').toLowerCase();
  const milestones = [];
  if (/(parallel|spawn_agent|subagent|หลาย agent|หลายเอเจนต์|fanout)/i.test(t)) milestones.push('pre-fanout');
  if (/(apply_patch|patch|แก้ไฟล์|แก้โค้ด|refactor|edit-batch)/i.test(t)) milestones.push('edit-batch');
  return milestones;
}

function buildCheckpointState() {
  return {
    updatedAt: nowIso(),
    sessionId: null,
    cumulativePromptTokens: 0,
    lastQualityScore: 100,
    capturedFillBands: [],
    capturedQualityDrops: [],
    capturedMilestones: [],
    compact: {
      beforeId: null,
      afterId: null
    }
  };
}

function getCheckpointState() {
  const st = readJson(CHECKPOINT_STATE_PATH, null);
  if (!st) return buildCheckpointState();
  return {
    ...buildCheckpointState(),
    ...st,
    compact: { ...buildCheckpointState().compact, ...(st.compact || {}) }
  };
}

function setCheckpointState(patch = {}) {
  const merged = { ...getCheckpointState(), ...patch, updatedAt: nowIso() };
  if (patch.compact) merged.compact = { ...getCheckpointState().compact, ...patch.compact };
  writeJson(CHECKPOINT_STATE_PATH, merged);
  return merged;
}

function sanitizeStateForCheckpoint(state) {
  return {
    enabled: !!state.enabled,
    level: state.level,
    profile: state.profile,
    safetyMode: state.safetyMode,
    speculative: !!state.speculative
  };
}

function captureCheckpoint(note = '', source = 'manual', meta = {}) {
  const state = getState();
  const row = {
    id: `cp-${Date.now()}-${process.pid}`,
    ts: nowIso(),
    source,
    note: String(note || '').trim(),
    state: sanitizeStateForCheckpoint(state),
    meta: meta || {}
  };
  appendJsonl(CHECKPOINTS_PATH, row);
  return row;
}

function listCheckpoints(limit = 20) {
  const rows = readJsonl(CHECKPOINTS_PATH);
  return rows.slice(-Math.max(1, limit)).reverse();
}

function checkpointStatus() {
  const rows = readJsonl(CHECKPOINTS_PATH);
  const latest = rows.length ? rows[rows.length - 1] : null;
  const lifecycle = getCheckpointState();
  return {
    total: rows.length,
    latest,
    lifecycle
  };
}

function restoreCheckpoint(idOrLatest = 'latest') {
  const rows = readJsonl(CHECKPOINTS_PATH);
  if (!rows.length) return null;
  const picked = idOrLatest === 'latest'
    ? rows[rows.length - 1]
    : rows.find((r) => r.id === idOrLatest);
  if (!picked || !picked.state) return null;
  const next = setState(picked.state);
  return { checkpoint: picked, state: next };
}

function qualityScoreFromSignals(signals = {}, gates = {}) {
  let score = 100;
  if (gates.strictGate === false) score -= 20;
  if (gates.mtpGate === false) score -= 20;
  if (gates.actionRoutingGate === false) score -= 15;
  score -= Math.min(30, Number(signals.wasteCount || 0) * 5);
  return Math.max(0, Math.min(100, score));
}

function maybeCaptureLifecycleCheckpoint(payload = {}) {
  const policy = { ...DEFAULT_LIFECYCLE, ...(payload.policy || {}) };
  const promptTokens = Number(payload.promptTokens || 0);
  const sessionId = payload.sessionId || null;
  const milestones = Array.isArray(payload.milestones) ? payload.milestones : [];
  const score = Number.isFinite(Number(payload.qualityScore))
    ? Number(payload.qualityScore)
    : qualityScoreFromSignals(payload.signals, payload.gates);
  const st0 = getCheckpointState();
  const st = setCheckpointState({
    ...st0,
    sessionId: sessionId || st0.sessionId || null,
    cumulativePromptTokens: Number(st0.cumulativePromptTokens || 0) + Math.max(0, promptTokens),
    lastQualityScore: score
  });
  const decisions = [];

  const fillPct = st.cumulativePromptTokens > 0
    ? Math.min(100, (st.cumulativePromptTokens / policy.contextWindowTokens) * 100)
    : 0;
  const capturedFill = new Set(st.capturedFillBands || []);
  for (const b of policy.fillBands) {
    if (fillPct >= b && !capturedFill.has(b)) {
      const cp = captureCheckpoint(`progressive fill band ${b}%`, 'lifecycle.fill-band', {
        reason: 'fill-band',
        fillBand: b,
        fillPercent: Math.round(fillPct * 10) / 10,
        sessionId
      });
      decisions.push({ type: 'fill-band', band: b, checkpointId: cp.id });
      capturedFill.add(b);
    }
  }

  const prevScore = Number(st0.lastQualityScore ?? 100);
  const capturedDrops = new Set(st.capturedQualityDrops || []);
  for (const q of policy.qualityDropBands) {
    if (score <= q && prevScore > q && !capturedDrops.has(q)) {
      const cp = captureCheckpoint(`quality drop <= ${q}`, 'lifecycle.quality-drop', {
        reason: 'quality-drop',
        threshold: q,
        previousScore: prevScore,
        currentScore: score,
        sessionId
      });
      decisions.push({ type: 'quality-drop', threshold: q, checkpointId: cp.id });
      capturedDrops.add(q);
    }
  }

  const capturedMilestones = new Set(st.capturedMilestones || []);
  for (const m of milestones) {
    if (!capturedMilestones.has(m)) {
      const cp = captureCheckpoint(`milestone ${m}`, 'lifecycle.milestone', {
        reason: 'milestone',
        milestone: m,
        sessionId
      });
      decisions.push({ type: 'milestone', milestone: m, checkpointId: cp.id });
      capturedMilestones.add(m);
    }
  }

  setCheckpointState({
    ...getCheckpointState(),
    capturedFillBands: [...capturedFill].sort((a, b) => a - b),
    capturedQualityDrops: [...capturedDrops].sort((a, b) => b - a),
    capturedMilestones: [...capturedMilestones]
  });

  return {
    fillPercent: Math.round(fillPct * 10) / 10,
    qualityScore: score,
    decisions
  };
}

function capturePreCompactCheckpoint(meta = {}) {
  const cp = captureCheckpoint('pre-compact continuity snapshot', 'compact.before', {
    reason: 'pre-compact',
    ...meta
  });
  const st = getCheckpointState();
  setCheckpointState({ ...st, compact: { ...st.compact, beforeId: cp.id } });
  return cp;
}

function capturePostCompactCheckpoint(meta = {}) {
  const cp = captureCheckpoint('post-compact continuity checkpoint', 'compact.after', {
    reason: 'post-compact',
    ...meta
  });
  const st = getCheckpointState();
  setCheckpointState({ ...st, compact: { ...st.compact, afterId: cp.id } });
  return cp;
}

function getLatestContinuitySummary() {
  const rows = readJsonl(CHECKPOINTS_PATH);
  if (!rows.length) return null;
  const cp = rows[rows.length - 1];
  const parts = [];
  if (cp.source) parts.push(`source=${cp.source}`);
  if (cp.note) parts.push(`note=${cp.note}`);
  if (cp.meta?.reason) parts.push(`reason=${cp.meta.reason}`);
  if (cp.meta?.fillBand) parts.push(`fillBand=${cp.meta.fillBand}%`);
  if (cp.meta?.threshold) parts.push(`quality<=${cp.meta.threshold}`);
  if (cp.meta?.milestone) parts.push(`milestone=${cp.meta.milestone}`);
  return {
    id: cp.id,
    ts: cp.ts,
    summary: parts.join(', ')
  };
}

function logCacheRead(filePath, context = {}) {
  const abs = path.resolve(filePath);
  appendJsonl(CACHE_READS_PATH, {
    ts: nowIso(),
    file: abs,
    command: context.command || 'unknown',
    cwd: context.cwd || process.cwd()
  });
}

function loadReadCacheState() {
  return readJson(READ_CACHE_STATE_PATH, { files: {} }) || { files: {} };
}

function saveReadCacheState(state) {
  writeJson(READ_CACHE_STATE_PATH, state || { files: {} });
}

function compileGlobPattern(pattern) {
  const escaped = String(pattern)
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '___DOUBLESTAR___')
    .replace(/\*/g, '[^/]*')
    .replace(/___DOUBLESTAR___/g, '.*');
  return new RegExp(`^${escaped}$`);
}

function parseContextIgnoreFile(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(p => ({ raw: p, re: compileGlobPattern(p) }));
}

function loadContextIgnorePatterns(cwd) {
  const local = parseContextIgnoreFile(path.join(cwd || process.cwd(), '.contextignore'));
  const global = parseContextIgnoreFile(path.join(HOME_DIR, '.contextignore'));
  return [...local, ...global];
}

function matchesContextIgnore(absPath, cwd, patterns) {
  const rel = path.relative(cwd || process.cwd(), absPath).replace(/\\/g, '/');
  const unixAbs = absPath.replace(/\\/g, '/');
  for (const p of patterns) {
    if (p.re.test(rel) || p.re.test(unixAbs) || p.re.test(path.basename(absPath))) return p.raw;
  }
  return null;
}

function sha1(content) {
  return require('crypto').createHash('sha1').update(content).digest('hex');
}

function getReadCacheMode() {
  const envMode = String(process.env.TTO_READ_CACHE_MODE || '').toLowerCase();
  if (['off', 'warn', 'block'].includes(envMode)) return envMode;
  const policyMode = String(getPolicy()?.readCache?.mode || 'warn').toLowerCase();
  return ['off', 'warn', 'block'].includes(policyMode) ? policyMode : 'warn';
}

function logCacheDecision(row) {
  appendJsonl(CACHE_DECISIONS_PATH, { ts: nowIso(), ...row });
}

function readTextWithCache(filePath, context = {}) {
  const abs = path.resolve(filePath);
  const cwd = context.cwd || process.cwd();
  const mode = getReadCacheMode();
  const patterns = loadContextIgnorePatterns(cwd);
  const ignoredBy = matchesContextIgnore(abs, cwd, patterns);
  if (ignoredBy) {
    logCacheDecision({ file: abs, mode, decision: 'contextignore_block', reason: ignoredBy, command: context.command || 'unknown' });
    const err = new Error(`Blocked by .contextignore: ${path.basename(abs)}`);
    err.code = 'TTO_CONTEXTIGNORE_BLOCK';
    throw err;
  }

  const state = loadReadCacheState();
  const prev = state.files[abs] || null;
  const st = fs.statSync(abs);
  let content = null;
  let decision = 'miss';
  if (mode === 'off') {
    content = fs.readFileSync(abs, 'utf8');
    decision = 'mode_off';
  } else if (prev && prev.mtimeMs === st.mtimeMs && prev.size === st.size && prev.content) {
    if (mode === 'block') {
      content = prev.content;
      decision = 'hit_block';
    } else {
      content = fs.readFileSync(abs, 'utf8');
      decision = 'hit_warn';
    }
  } else {
    content = fs.readFileSync(abs, 'utf8');
    decision = 'miss';
  }

  state.files[abs] = {
    mtimeMs: st.mtimeMs,
    size: st.size,
    hash: sha1(content),
    content,
    lastReadAt: nowIso()
  };
  saveReadCacheState(state);
  logCacheRead(abs, context);
  logCacheDecision({ file: abs, mode, decision, command: context.command || 'unknown' });
  return { content, decision, mode };
}

function cacheStats(limit = 10) {
  const rows = readJsonl(CACHE_READS_PATH);
  const decisions = readJsonl(CACHE_DECISIONS_PATH);
  const byFile = new Map();
  for (const r of rows) {
    const key = String(r.file || '');
    if (!key) continue;
    const item = byFile.get(key) || { file: key, reads: 0, lastReadAt: null };
    item.reads += 1;
    item.lastReadAt = r.ts || item.lastReadAt;
    byFile.set(key, item);
  }
  const ranked = [...byFile.values()].sort((a, b) => b.reads - a.reads);
  const repeated = ranked.filter((r) => r.reads > 1);
  const byDecision = decisions.reduce((acc, d) => {
    const k = String(d.decision || 'unknown');
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  return {
    mode: getReadCacheMode(),
    totalReads: rows.length,
    uniqueFiles: byFile.size,
    repeatedFiles: repeated.length,
    topRepeated: repeated.slice(0, Math.max(1, limit)),
    decisionCounts: byDecision
  };
}

function clearCacheReads() {
  const tx = beginTransaction();
  try {
    tx.queueWrite(READ_CACHE_STATE_PATH, { files: {} });
    // สำหรับ .jsonl เราใช้การเขียนทับด้วยไฟล์ว่างเพื่อจำลอง Transaction
    fs.mkdirSync(path.dirname(CACHE_READS_PATH), { recursive: true });
    fs.writeFileSync(CACHE_READS_PATH + '.tmp', '');
    fs.writeFileSync(CACHE_DECISIONS_PATH + '.tmp', '');
    
    tx.commit();
    
    fs.renameSync(CACHE_READS_PATH + '.tmp', CACHE_READS_PATH);
    fs.renameSync(CACHE_DECISIONS_PATH + '.tmp', CACHE_DECISIONS_PATH);
  } catch (e) {
    tx.rollback();
    try { fs.unlinkSync(CACHE_READS_PATH + '.tmp'); } catch (_) {}
    try { fs.unlinkSync(CACHE_DECISIONS_PATH + '.tmp'); } catch (_) {}
    throw e;
  }
  return { cleared: true, files: [CACHE_READS_PATH, CACHE_DECISIONS_PATH, READ_CACHE_STATE_PATH] };
}

function getStaleContext(policy) {
  if (!policy || !policy.contextPruning || !policy.contextPruning.enabled) return [];
  const state = loadReadCacheState();
  const thresholdMs = policy.contextPruning.staleMinutesThreshold * 60 * 1000;
  const now = Date.now();
  const staleFiles = [];

  for (const [file, info] of Object.entries(state.files || {})) {
    if (!info.lastReadAt) continue;
    const lastRead = new Date(info.lastReadAt).getTime();
    const ageMs = now - lastRead;
    if (ageMs >= thresholdMs) {
      staleFiles.push({
        file,
        name: path.basename(file),
        ageMinutes: Math.floor(ageMs / 60000),
        lastReadAt: info.lastReadAt
      });
    }
  }
  return staleFiles;
}

function clamp01(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function pct(n) {
  return Math.round(Number(n || 0) * 100) / 100;
}

function computeDistortionBounds(input = {}) {
  const lifecycle = input.lifecycle || getCheckpointState();
  const contextWindowTokens = typeof input.contextWindowTokens === 'number' 
    ? input.contextWindowTokens 
    : Number(input.contextWindowTokens || DEFAULT_LIFECYCLE.contextWindowTokens);
  
  const used = Number(lifecycle.cumulativePromptTokens || 0);
  let fillRatio = 0;
  if (contextWindowTokens > 0) {
    fillRatio = clamp01(used / contextWindowTokens);
  } else if (used > 0) {
    fillRatio = 1;
  }

  const theoreticalCeiling = pct((1 - fillRatio * 0.35) * 100);
  const observedQuality = pct(Number(input.qualityScore || 0));
  const headroom = pct(Math.max(0, theoreticalCeiling - observedQuality));
  return { fillRatio: pct(fillRatio * 100), theoreticalCeiling, observedQuality, headroom };
}

function computeQualityEngine(input = {}) {
  const lifecycle = input.lifecycle || getCheckpointState();
  const cache = input.cache || cacheStats(10);
  const decisions = input.decisions || readJsonl(CACHE_DECISIONS_PATH);
  const artifact = input.artifact || null;

  const contextFill = Number(lifecycle.cumulativePromptTokens || 0) / Number(input.contextWindowTokens || DEFAULT_LIFECYCLE.contextWindowTokens);
  const contextFillRisk = clamp01(contextFill);
  const sessionLengthRisk = clamp01((Number(lifecycle.cumulativePromptTokens || 0) / 50000));
  const modelRoutingRisk = artifact?.actionRouting?.gateOk === false ? 1 : 0.15;
  const emptyRunRisk = decisions.length ? clamp01((decisions.filter(d => d.decision === 'contextignore_block').length / decisions.length) * 0.5) : 0;
  const outcomeHealthRisk = artifact?.strictResult?.ok === false ? 1 : 0.15;

  const repeatedRatio = cache.totalReads > 0 ? (cache.repeatedFiles / Math.max(1, cache.uniqueFiles)) : 0;
  const messageEfficiencyRisk = clamp01(repeatedRatio);
  const compressionOpportunityRisk = cache.totalReads > 0 ? clamp01((cache.decisionCounts?.hit_warn || 0) / cache.totalReads) : 0;

  const stage1 = {
    contextFillRisk: pct(contextFillRisk * 100),
    sessionLengthRisk: pct(sessionLengthRisk * 100),
    modelRoutingRisk: pct(modelRoutingRisk * 100),
    emptyRunRisk: pct(emptyRunRisk * 100),
    outcomeHealthRisk: pct(outcomeHealthRisk * 100)
  };
  const stage2 = {
    messageEfficiencyRisk: pct(messageEfficiencyRisk * 100),
    compressionOpportunityRisk: pct(compressionOpportunityRisk * 100)
  };

  const weightedRisk =
    contextFillRisk * QUALITY_STAGE1_WEIGHTS.contextFillRisk +
    sessionLengthRisk * QUALITY_STAGE1_WEIGHTS.sessionLengthRisk +
    modelRoutingRisk * QUALITY_STAGE1_WEIGHTS.modelRoutingRisk +
    emptyRunRisk * QUALITY_STAGE1_WEIGHTS.emptyRunRisk +
    outcomeHealthRisk * QUALITY_STAGE1_WEIGHTS.outcomeHealthRisk +
    messageEfficiencyRisk * QUALITY_STAGE2_WEIGHTS.messageEfficiencyRisk +
    compressionOpportunityRisk * QUALITY_STAGE2_WEIGHTS.compressionOpportunityRisk;
  const score = pct(Math.max(0, 100 - weightedRisk));
  const grade = score >= 90 ? 'S' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F';

  const weakSignals = [];
  if (contextFillRisk > 0.65) weakSignals.push('context_fill_high');
  if (sessionLengthRisk > 0.6) weakSignals.push('session_length_high');
  if (modelRoutingRisk > 0.6) weakSignals.push('routing_risk');
  if (messageEfficiencyRisk > 0.5) weakSignals.push('message_efficiency_low');
  if (compressionOpportunityRisk > 0.5) weakSignals.push('compression_opportunity_high');
  if (outcomeHealthRisk > 0.7) weakSignals.push('outcome_health_risk');

  const recommendations = [];
  if (weakSignals.includes('context_fill_high')) recommendations.push('Run `tto checkpoint precompact` then compact to reduce context pressure');
  if (weakSignals.includes('message_efficiency_low')) recommendations.push('Use `tto cache stats --pretty` and reduce repeated file reads');
  if (weakSignals.includes('compression_opportunity_high')) recommendations.push('Switch read cache mode to `block` for repetitive reads: `tto config set readCache.mode block`');
  if (weakSignals.includes('routing_risk')) recommendations.push('Review high-severity action routing and resolve required actions');

  const distortion = computeDistortionBounds({
    lifecycle,
    contextWindowTokens: input.contextWindowTokens || DEFAULT_LIFECYCLE.contextWindowTokens,
    qualityScore: score
  });

  return {
    score,
    grade,
    stage1,
    stage2,
    weakSignals,
    recommendations,
    distortion
  };
}

module.exports = {
  CHECKPOINTS_PATH,
  CACHE_READS_PATH,
  CACHE_DECISIONS_PATH,
  READ_CACHE_STATE_PATH,
  CHECKPOINT_STATE_PATH,
  captureCheckpoint,
  listCheckpoints,
  checkpointStatus,
  restoreCheckpoint,
  deriveMilestones,
  maybeCaptureLifecycleCheckpoint,
  capturePreCompactCheckpoint,
  capturePostCompactCheckpoint,
  getLatestContinuitySummary,
  readTextWithCache,
  logCacheRead,
  cacheStats,
  clearCacheReads,
  getStaleContext,
  computeQualityEngine,
  computeDistortionBounds,
  beginTransaction,
  recoverTransactions,
  TRANSACTION_JOURNAL_PATH
};
