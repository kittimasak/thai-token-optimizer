#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}
function readJsonl(file, limit = 2000) {
  if (!fs.existsSync(file)) return [];
  const out = [];
  const lines = fs.readFileSync(file, 'utf8').split(/\n+/);
  for (const line of lines) {
    if (!line) continue;
    try { out.push(JSON.parse(line)); } catch {}
    if (out.length >= limit) break;
  }
  return out;
}
function listFiles(dir, exts = ['.jsonl', '.json'], maxFiles = 200) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const stack = [dir];
  while (stack.length && out.length < maxFiles) {
    const d = stack.pop();
    let entries = [];
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (exts.includes(path.extname(e.name))) out.push(p);
      if (out.length >= maxFiles) break;
    }
  }
  return out;
}
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function makeRun(adapter, source, meta = {}) {
  return {
    schema: 'AgentRun.v1',
    adapter,
    source,
    timestamp: meta.timestamp || new Date().toISOString(),
    sessionId: meta.sessionId || path.basename(source),
    model: meta.model || 'unknown',
    inputTokens: toNum(meta.inputTokens),
    outputTokens: toNum(meta.outputTokens),
    cacheReadTokens: toNum(meta.cacheReadTokens),
    cacheWriteTokens: toNum(meta.cacheWriteTokens),
    messages: toNum(meta.messages),
    toolCalls: toNum(meta.toolCalls),
    tools: meta.tools || [],
    runType: meta.runType || 'unknown',
    outcome: meta.outcome || 'unknown'
  };
}

function parseClaudeLikeJsonl(file, adapter) {
  const rows = readJsonl(file, 3000);
  if (!rows.length) return null;
  let inTok = 0; let outTok = 0; let cRead = 0; let cWrite = 0;
  let messages = 0; let toolCalls = 0; let model = 'unknown'; let ts = null;
  const tools = [];
  for (const r of rows) {
    if (!ts && r.timestamp) ts = r.timestamp;
    const msg = r.message || {};
    const usage = msg.usage || r.usage || {};
    inTok += toNum(usage.input_tokens || usage.input || usage.inputTokens);
    outTok += toNum(usage.output_tokens || usage.output || usage.outputTokens);
    cRead += toNum(usage.cache_read_input_tokens || usage.cacheRead || r.cacheRead);
    cWrite += toNum(usage.cache_creation_input_tokens || usage.cacheWrite || r.cacheWrite);
    if (msg.model && model === 'unknown') model = msg.model;
    if (r.type === 'user' || r.type === 'assistant') messages += 1;
    const content = Array.isArray(msg.content) ? msg.content : [];
    for (const c of content) {
      if (c && (c.type === 'tool_use' || c.type === 'tool-call')) {
        toolCalls += 1;
        tools.push({ name: c.name || c.id || 'unknown' });
      }
    }
  }
  if (messages === 0 && inTok === 0 && outTok === 0) return null;
  return makeRun(adapter, file, {
    timestamp: ts || new Date().toISOString(),
    model,
    inputTokens: inTok,
    outputTokens: outTok,
    cacheReadTokens: cRead,
    cacheWriteTokens: cWrite,
    messages,
    toolCalls,
    tools,
    outcome: outTok < 50 ? 'empty' : 'normal'
  });
}

function parseOpenClawJsonl(file) {
  const rows = readJsonl(file, 3000);
  if (!rows.length) return null;
  let inTok = 0; let outTok = 0; let messages = 0; let toolCalls = 0; let ts = null; let model = 'unknown';
  for (const r of rows) {
    if (!ts && r.timestamp) ts = r.timestamp;
    const u = r.usage || {};
    inTok += toNum(u.inputTokens || u.input_tokens || r.inputTokens);
    outTok += toNum(u.outputTokens || u.output_tokens || r.outputTokens);
    if (r.model && model === 'unknown') model = r.model;
    if (r.role || r.type) messages += 1;
    toolCalls += toNum(r.toolCalls || 0);
  }
  return makeRun('openclaw', file, {
    timestamp: ts || new Date().toISOString(),
    model,
    inputTokens: inTok,
    outputTokens: outTok,
    messages,
    toolCalls,
    outcome: outTok < 50 ? 'empty' : 'normal'
  });
}

function parseOpenCodeJson(file) {
  const obj = readJson(file);
  if (!obj) return null;
  const arr = Array.isArray(obj) ? obj : (Array.isArray(obj.messages) ? obj.messages : []);
  if (!arr.length) return null;
  let inTok = 0; let outTok = 0; let cRead = 0; let cWrite = 0; let toolCalls = 0; let model = 'unknown'; let ts = null;
  for (const m of arr) {
    if (!ts && m.timestamp) ts = m.timestamp;
    const u = m.usage || {};
    inTok += toNum(u.input || u.input_tokens || u.inputTokens);
    outTok += toNum(u.output || u.output_tokens || u.outputTokens);
    cRead += toNum(m.cacheRead || u.cacheRead);
    cWrite += toNum(m.cacheWrite || u.cacheWrite);
    if (m.model && model === 'unknown') model = m.model;
    toolCalls += toNum(m.toolCalls || 0);
  }
  return makeRun('opencode', file, {
    timestamp: ts || new Date().toISOString(),
    model,
    inputTokens: inTok,
    outputTokens: outTok,
    cacheReadTokens: cRead,
    cacheWriteTokens: cWrite,
    messages: arr.length,
    toolCalls,
    outcome: outTok < 50 ? 'empty' : 'normal'
  });
}

function parseCodex(root, maxRuns = 80) {
  const dir = path.join(root, '.codex');
  const files = listFiles(dir, ['.jsonl'], maxRuns);
  return files.map((f) => parseClaudeLikeJsonl(f, 'codex')).filter(Boolean);
}
function parseClaude(root, maxRuns = 80) {
  const dir = path.join(root, '.claude');
  const files = listFiles(dir, ['.jsonl'], maxRuns);
  return files.map((f) => parseClaudeLikeJsonl(f, 'claude')).filter(Boolean);
}
function parseOpenClaw(root, maxRuns = 80) {
  const dir = path.join(root, '.openclaw');
  const files = listFiles(dir, ['.jsonl'], maxRuns);
  return files.map((f) => parseOpenClawJsonl(f)).filter(Boolean);
}
function parseHermes(root, maxRuns = 80) {
  const dir = path.join(root, '.hermes');
  const files = listFiles(dir, ['.jsonl'], maxRuns);
  return files.map((f) => parseOpenClawJsonl(f)).filter(Boolean).map((r) => ({ ...r, adapter: 'hermes' }));
}
function parseOpenCode(root, maxRuns = 80) {
  const dir = path.join(root, '.config', 'opencode');
  const files = listFiles(dir, ['.json'], maxRuns);
  return files.map((f) => parseOpenCodeJson(f)).filter(Boolean);
}

function collectAgentRuns(root, options = {}) {
  const maxRuns = Number(options.maxRuns || 80);
  const runs = [
    ...parseCodex(root, maxRuns),
    ...parseClaude(root, maxRuns),
    ...parseOpenClaw(root, maxRuns),
    ...parseHermes(root, maxRuns),
    ...parseOpenCode(root, maxRuns)
  ];
  return runs.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, maxRuns * 2);
}

module.exports = {
  collectAgentRuns
};

