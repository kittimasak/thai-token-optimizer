#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'tests', 'fixtures', 'session_logs');
const CASES_PER_AGENT = Number(process.argv[2] || 30);

function ensure(p) { fs.mkdirSync(p, { recursive: true }); }
function write(file, data) { ensure(path.dirname(file)); fs.writeFileSync(file, data); }
function iso(i) { return new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString(); }

function genCodex(base, n) {
  for (let i = 1; i <= n; i++) {
    const lines = [
      JSON.stringify({ type: 'user', timestamp: iso(i), message: { content: 'start' } }),
      JSON.stringify({ type: 'assistant', message: { model: 'gpt-5.5', usage: { input_tokens: 4000 + i * 20, output_tokens: 300 + (i % 7) * 10, cache_read_input_tokens: 500, cache_creation_input_tokens: 100 } } })
    ].join('\n') + '\n';
    write(path.join(base, `case-${String(i).padStart(2, '0')}.jsonl`), lines);
  }
}
function genClaude(base, n) {
  for (let i = 1; i <= n; i++) {
    const lines = [
      JSON.stringify({ type: 'user', timestamp: iso(i), message: { content: 'start' } }),
      JSON.stringify({ type: 'assistant', message: { model: 'claude-sonnet', usage: { input_tokens: 3500 + i * 25, output_tokens: 280 + (i % 5) * 12, cache_read_input_tokens: 300, cache_creation_input_tokens: 80 } } })
    ].join('\n') + '\n';
    write(path.join(base, `case-${String(i).padStart(2, '0')}.jsonl`), lines);
  }
}
function genOpenClaw(base, n) {
  for (let i = 1; i <= n; i++) {
    const lines = [
      JSON.stringify({ timestamp: iso(i), role: 'user', usage: { inputTokens: 2000 + i * 40, outputTokens: 180 + (i % 6) * 9 }, model: 'openclaw-core' }),
      JSON.stringify({ timestamp: iso(i + 1), role: 'assistant', usage: { inputTokens: 0, outputTokens: 120 }, toolCalls: i % 3 })
    ].join('\n') + '\n';
    write(path.join(base, `case-${String(i).padStart(2, '0')}.jsonl`), lines);
  }
}
function genHermes(base, n) {
  for (let i = 1; i <= n; i++) {
    const lines = [
      JSON.stringify({ timestamp: iso(i), type: 'turn', usage: { inputTokens: 1800 + i * 30, outputTokens: 140 + (i % 4) * 11 }, model: 'hermes-core', toolCalls: i % 2 })
    ].join('\n') + '\n';
    write(path.join(base, `case-${String(i).padStart(2, '0')}.jsonl`), lines);
  }
}
function genOpenCode(base, n) {
  for (let i = 1; i <= n; i++) {
    const arr = [
      { timestamp: iso(i), model: 'opencode-model', usage: { input: 2200 + i * 35, output: 160 + (i % 5) * 10 }, cacheRead: 100, cacheWrite: 20, toolCalls: i % 2 },
      { timestamp: iso(i + 1), model: 'opencode-model', usage: { input: 100, output: 80 }, cacheRead: 0, cacheWrite: 0, toolCalls: 0 }
    ];
    write(path.join(base, `case-${String(i).padStart(2, '0')}.json`), JSON.stringify({ messages: arr }, null, 2) + '\n');
  }
}

const codexDir = path.join(OUT, 'codex', '.codex');
const claudeDir = path.join(OUT, 'claude', '.claude');
const openclawDir = path.join(OUT, 'openclaw', '.openclaw');
const hermesDir = path.join(OUT, 'hermes', '.hermes');
const opencodeDir = path.join(OUT, 'opencode', '.config', 'opencode');

genCodex(codexDir, CASES_PER_AGENT);
genClaude(claudeDir, CASES_PER_AGENT);
genOpenClaw(openclawDir, CASES_PER_AGENT);
genHermes(hermesDir, CASES_PER_AGENT);
genOpenCode(opencodeDir, CASES_PER_AGENT);

console.log(JSON.stringify({
  ok: true,
  outDir: OUT,
  casesPerAgent: CASES_PER_AGENT,
  agents: ['codex', 'claude', 'openclaw', 'hermes', 'opencode']
}, null, 2));

