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
const fs = require('fs');
const path = require('path');
const { compressPrompt } = require('../hooks/tto-compressor');
const { estimateSavings } = require('../hooks/tto-token-estimator');
const { classifyText } = require('../hooks/tto-safety-classifier');
const { checkPreservation } = require('../hooks/tto-preservation-checker');
const { getPolicy, DEFAULT_POLICY } = require('../hooks/tto-policy');

function loadJsonl(file) {
  return fs.readFileSync(file, 'utf8').split(/\n+/).filter(Boolean).map(line => JSON.parse(line));
}
function pct(n) { return Math.round(n * 10) / 10; }
function hasCodeBlockLoss(original, optimized) {
  const fences = (original.match(/```/g) || []).length;
  if (!fences) return false;
  return (optimized.match(/```/g) || []).length !== fences;
}
function runBenchmark(options = {}) {
  const root = path.resolve(__dirname, '..');
  const strict = Boolean(options.strict);
  const dataPath = strict ? path.join(__dirname, 'golden_cases.jsonl') : path.join(__dirname, 'thai_prompts.jsonl');
  const reportPath = strict ? path.join(__dirname, 'regression_report.md') : path.join(__dirname, 'report.md');
  const policy = options.defaultPolicy ? DEFAULT_POLICY : getPolicy();
  const rows = loadJsonl(dataPath).map(item => {
    const optimized = compressPrompt(item.text, { level: 'auto' });
    const stats = estimateSavings(item.text, optimized, 'generic', { exact: policy.exactTokenizer });
    const safety = classifyText(item.text);
    const preservation = checkPreservation(item.text, optimized);
    return { id: item.id, original: item.text, optimized, ...stats, safety, preservation, codeBlockLoss: hasCodeBlockLoss(item.text, optimized) };
  });
  const avgSaving = rows.reduce((s, r) => s + r.savingPercent, 0) / Math.max(1, rows.length);
  const minPreservation = rows.reduce((m, r) => Math.min(m, r.preservation.preservationPercent), 100);
  const codeOk = rows.every(r => !r.codeBlockLoss);
  const constraintsOk = rows.every(r => r.preservation.missingCount === 0);
  const gates = policy.benchmarkStrict || {};
  const minAverageSavingPercent = Math.max(10, Number(gates.minAverageSavingPercent ?? 10));
  const strictResult = strict ? {
    ok: avgSaving >= minAverageSavingPercent && minPreservation >= 95 && codeOk && constraintsOk,
    avgSaving: pct(avgSaving),
    minPreservation,
    codeOk,
    constraintsOk,
    gates: { ...gates, minAverageSavingPercent }
  } : null;
  const md = [
    strict ? '# Thai Token Optimizer v1.0 Strict Regression Report' : '# Thai Token Optimizer v1.0 Benchmark Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Samples: ${rows.length}`,
    `Average estimated saving: ${pct(avgSaving)}%`,
    `Minimum preservation: ${minPreservation}%`,
    strict ? `Strict gate: ${strictResult.ok ? 'PASS' : 'FAIL'}` : '',
    '',
    '| ID | Before | After | Saved | Preservation | Safety categories |',
    '|---|---:|---:|---:|---:|---|',
    ...rows.map(r => `| ${r.id} | ${r.before.estimatedTokens} | ${r.after.estimatedTokens} | ${r.savingPercent}% | ${r.preservation.preservationPercent}% | ${r.safety.categories.join(', ') || '-'} |`),
    '',
    '## Notes',
    '',
    '- Version remains Thai Token Optimizer v1.0 / package 1.0.0.',
    '- Exact tokenizer is optional; if unavailable the estimator falls back to heuristic mode.',
    '- Strict mode checks saving, preservation, constraints, and code block safety.'
  ].filter(x => x !== '').join('\n');
  fs.writeFileSync(reportPath, md + '\n');
  if (!options.silent) {
    console.log(md);
    console.error(`\nReport written: ${path.relative(root, reportPath)}`);
  }
  return { rows, reportPath, strict: strictResult };
}

if (require.main === module) runBenchmark({ strict: process.argv.includes('--strict') });
module.exports = { runBenchmark };
