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


const fs = require('fs');
const path = require('path');
const { compressPrompt } = require('../hooks/tto-compressor');
const { estimateSavings } = require('../hooks/tto-token-estimator');
const { classifyText } = require('../hooks/tto-safety-classifier');
const { checkPreservation } = require('../hooks/tto-preservation-checker');
const { getPolicy, DEFAULT_POLICY } = require('../hooks/tto-policy');
const { compressToBudget } = require('../hooks/tto-budget-compressor');

function loadJsonl(file) {
  return fs.readFileSync(file, 'utf8').split(/\n+/).filter(Boolean).map(line => JSON.parse(line));
}
function pct(n) { return Math.round(n * 10) / 10; }
function statsOf(values = []) {
  const xs = values.filter(v => Number.isFinite(Number(v))).map(Number).sort((a, b) => a - b);
  if (!xs.length) return { mean: 0, p50: 0, p95: 0, stddev: 0 };
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const p = q => xs[Math.min(xs.length - 1, Math.max(0, Math.ceil((q / 100) * xs.length) - 1))];
  const variance = xs.reduce((a, x) => a + ((x - mean) ** 2), 0) / xs.length;
  return { mean: pct(mean), p50: pct(p(50)), p95: pct(p(95)), stddev: pct(Math.sqrt(variance)) };
}
function hasCodeBlockLoss(original, optimized) {
  const fences = (original.match(/```/g) || []).length;
  if (!fences) return false;
  return (optimized.match(/```/g) || []).length !== fences;
}

function measureSpeculative(cases, policy) {
  const budget = 80;
  const target = 'codex';
  const repeats = Math.max(1, Number(policy.benchmarkStrict?.mtpRepeats || 10));
  const warmup = Math.max(0, Number(policy.benchmarkStrict?.mtpWarmupRuns || 2));

  function runOnce(speculative) {
    const rows = [];
    const started = process.hrtime.bigint();
    for (const item of cases) {
      const result = compressToBudget(item.text, { level: 'auto', target, budget, speculative });
      rows.push({
        id: item.id,
        mode: result.speculative ? `spec:${result.level}` : 'normal',
        saved: result.savings.savedTokens,
        after: result.savings.after.estimatedTokens,
        preserve: result.preservation.preservationPercent,
        overBudget: Boolean(result.overBudget)
      });
    }
    const ended = process.hrtime.bigint();
    const elapsedMs = Number(ended - started) / 1e6;
    const summary = rows.reduce((acc, row) => {
      acc.saved += row.saved;
      acc.after += row.after;
      acc.preserve += row.preserve;
      if (row.overBudget) acc.overBudget += 1;
      if (String(row.mode).startsWith('spec:')) acc.specModes += 1;
      return acc;
    }, { saved: 0, after: 0, preserve: 0, overBudget: 0, specModes: 0 });
    return {
      speculative,
      elapsedMs: pct(elapsedMs),
      avgSaved: pct(summary.saved / Math.max(1, rows.length)),
      avgAfter: pct(summary.after / Math.max(1, rows.length)),
      avgPreserve: pct(summary.preserve / Math.max(1, rows.length)),
      overBudgetCount: summary.overBudget,
      specModeCount: summary.specModes,
      rows
    };
  }

  for (let i = 0; i < warmup; i++) {
    runOnce(false);
    runOnce(true);
  }

  const normalRuns = [];
  const speculativeRuns = [];
  for (let i = 0; i < repeats; i++) {
    normalRuns.push(runOnce(false));
    speculativeRuns.push(runOnce(true));
  }
  const normal = normalRuns[normalRuns.length - 1];
  const spec = speculativeRuns[speculativeRuns.length - 1];
  const normalLatency = statsOf(normalRuns.map(r => r.elapsedMs));
  const specLatency = statsOf(speculativeRuns.map(r => r.elapsedMs));
  const specHitRatePercent = pct((spec.specModeCount / Math.max(1, cases.length)) * 100);

  const gate = {
    mtpMinAveragePreservationPercent: Number(policy.benchmarkStrict?.mtpMinAveragePreservationPercent ?? 100),
    mtpMinSpecHitRatePercent: Number(policy.benchmarkStrict?.mtpMinSpecHitRatePercent ?? 60),
    mtpMaxAverageSlowdownMs: Number(policy.benchmarkStrict?.mtpMaxAverageSlowdownMs ?? 20)
  };
  const qualityOk = spec.avgPreserve >= gate.mtpMinAveragePreservationPercent;
  const hitRateOk = specHitRatePercent >= gate.mtpMinSpecHitRatePercent;
  const slowdownMeanMs = pct(specLatency.mean - normalLatency.mean);
  const performanceOk = slowdownMeanMs <= gate.mtpMaxAverageSlowdownMs;
  const gateOk = qualityOk && hitRateOk && performanceOk;

  return {
    budget,
    target,
    repeats,
    warmup,
    normal,
    speculative: spec,
    normalLatency,
    speculativeLatency: specLatency,
    specHitRatePercent,
    slowdownMeanMs,
    gate,
    gateOk,
    gateChecks: { qualityOk, hitRateOk, performanceOk },
    delta: {
      elapsedMs: pct(spec.elapsedMs - normal.elapsedMs),
      avgSaved: pct(spec.avgSaved - normal.avgSaved),
      avgAfter: pct(spec.avgAfter - normal.avgAfter),
      avgPreserve: pct(spec.avgPreserve - normal.avgPreserve)
    },
    policyExactTokenizer: Boolean(policy.exactTokenizer)
  };
}

function measureEnhancedCorpus(policy) {
  const corpusPath = path.join(__dirname, 'mtp_corpus.jsonl');
  const corpus = loadJsonl(corpusPath);
  const target = 'codex';
  const budget = 120;
  const rows = corpus.map(item => {
    const baseline = compressToBudget(item.text, { level: 'auto', target, budget, speculative: false });
    const enhanced = compressToBudget(item.text, { level: 'auto', target, budget, speculative: true });
    return {
      id: item.id,
      baselineSaved: baseline.savings.savedTokens,
      enhancedSaved: enhanced.savings.savedTokens,
      baselinePreserve: baseline.preservation.preservationPercent,
      enhancedPreserve: enhanced.preservation.preservationPercent
    };
  });
  const avg = (key) => pct(rows.reduce((sum, r) => sum + Number(r[key] || 0), 0) / Math.max(1, rows.length));
  const baselineAvgSaved = avg('baselineSaved');
  const enhancedAvgSaved = avg('enhancedSaved');
  const gainPercent = baselineAvgSaved <= 0
    ? (enhancedAvgSaved > 0 ? 100 : 0)
    : pct(((enhancedAvgSaved - baselineAvgSaved) / baselineAvgSaved) * 100);
  const minRequired = Number(policy.benchmarkStrict?.mtpEnhancedMinGainPercent ?? 5);
  const preservationParityOk = rows.every(r => r.enhancedPreserve >= r.baselinePreserve);
  const gainOk = gainPercent >= minRequired;
  return {
    corpusPath,
    samples: rows.length,
    budget,
    target,
    baselineAvgSaved,
    enhancedAvgSaved,
    gainPercent,
    minRequiredGainPercent: minRequired,
    preservationParityOk,
    gateOk: gainOk && preservationParityOk,
    gateChecks: { gainOk, preservationParityOk },
    rows
  };
}

function runBenchmark(options = {}) {
  const root = path.resolve(__dirname, '..');
  const strict = Boolean(options.strict);
  const mtp = Boolean(options.mtp);
  const dataPath = strict ? path.join(__dirname, 'golden_cases.jsonl') : path.join(__dirname, 'thai_prompts.jsonl');
  const reportPath = strict ? path.join(__dirname, 'regression_report.md') : path.join(__dirname, 'report.md');
  const policy = options.defaultPolicy ? DEFAULT_POLICY : getPolicy();
  const cases = loadJsonl(dataPath);
  const rows = cases.map(item => {
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
  const mtpResult = mtp ? measureSpeculative(cases, policy) : null;
  const enhancedCorpus = mtp ? measureEnhancedCorpus(policy) : null;
  if (mtpResult && enhancedCorpus) {
    mtpResult.gate.mtpEnhancedMinGainPercent = enhancedCorpus.minRequiredGainPercent;
    mtpResult.gateChecks.enhancedGainOk = enhancedCorpus.gateChecks.gainOk;
    mtpResult.gateChecks.enhancedPreservationParityOk = enhancedCorpus.gateChecks.preservationParityOk;
    mtpResult.gateOk = mtpResult.gateOk && enhancedCorpus.gateOk;
    mtpResult.enhancedCorpus = enhancedCorpus;
  }
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
    mtpResult ? '' : '',
    mtpResult ? '## MTP / Speculative Comparison' : '',
    mtpResult ? '' : '',
    mtpResult ? `Budget: ${mtpResult.budget} | Target: ${mtpResult.target}` : '',
    mtpResult ? `Runs: ${mtpResult.repeats} (warmup: ${mtpResult.warmup})` : '',
    mtpResult ? `Normal latency (mean/p50/p95/stddev): ${mtpResult.normalLatency.mean}/${mtpResult.normalLatency.p50}/${mtpResult.normalLatency.p95}/${mtpResult.normalLatency.stddev} ms` : '',
    mtpResult ? `Spec latency   (mean/p50/p95/stddev): ${mtpResult.speculativeLatency.mean}/${mtpResult.speculativeLatency.p50}/${mtpResult.speculativeLatency.p95}/${mtpResult.speculativeLatency.stddev} ms` : '',
    mtpResult ? `Slowdown mean (spec-normal): ${mtpResult.slowdownMeanMs} ms` : '',
    mtpResult ? `Spec hit rate: ${mtpResult.specHitRatePercent}%` : '',
    mtpResult?.enhancedCorpus ? `Enhanced gain on mtp_corpus: ${mtpResult.enhancedCorpus.gainPercent}% (required >= ${mtpResult.enhancedCorpus.minRequiredGainPercent}%)` : '',
    mtpResult ? `MTP gate: ${mtpResult.gateOk ? 'PASS' : 'FAIL'}` : '',
    mtpResult ? '' : '',
    mtpResult ? '| Mode | Avg Saved | Avg After | Avg Preserve | Over Budget | Spec Mode Hits |' : '',
    mtpResult ? '|---|---:|---:|---:|---:|---:|' : '',
    mtpResult ? `| normal | ${mtpResult.normal.avgSaved} | ${mtpResult.normal.avgAfter} | ${mtpResult.normal.avgPreserve}% | ${mtpResult.normal.overBudgetCount} | ${mtpResult.normal.specModeCount} |` : '',
    mtpResult ? `| speculative | ${mtpResult.speculative.avgSaved} | ${mtpResult.speculative.avgAfter} | ${mtpResult.speculative.avgPreserve}% | ${mtpResult.speculative.overBudgetCount} | ${mtpResult.speculative.specModeCount} |` : '',
    mtpResult ? '' : '',
    mtpResult ? '| ID | Mode | Saved | After | Preserve | Over Budget |' : '',
    mtpResult ? '|---|---|---:|---:|---:|---|' : '',
    ...(mtpResult ? mtpResult.speculative.rows.map(r => `| ${r.id} | ${r.mode} | ${r.saved} | ${r.after} | ${r.preserve}% | ${r.overBudget ? 'yes' : 'no'} |`) : []),
    mtpResult?.enhancedCorpus ? '' : '',
    mtpResult?.enhancedCorpus ? '## Enhanced Corpus Gate (long repetitive narrative + mixed technical blocks)' : '',
    mtpResult?.enhancedCorpus ? '' : '',
    mtpResult?.enhancedCorpus ? `Corpus: ${path.relative(root, mtpResult.enhancedCorpus.corpusPath)}` : '',
    mtpResult?.enhancedCorpus ? `Samples: ${mtpResult.enhancedCorpus.samples} | Budget: ${mtpResult.enhancedCorpus.budget} | Target: ${mtpResult.enhancedCorpus.target}` : '',
    mtpResult?.enhancedCorpus ? `Baseline avg saved: ${mtpResult.enhancedCorpus.baselineAvgSaved}` : '',
    mtpResult?.enhancedCorpus ? `Enhanced avg saved: ${mtpResult.enhancedCorpus.enhancedAvgSaved}` : '',
    mtpResult?.enhancedCorpus ? `Gain: ${mtpResult.enhancedCorpus.gainPercent}% (required >= ${mtpResult.enhancedCorpus.minRequiredGainPercent}%)` : '',
    mtpResult?.enhancedCorpus ? `Preservation parity: ${mtpResult.enhancedCorpus.gateChecks.preservationParityOk ? 'PASS' : 'FAIL'}` : '',
    mtpResult?.enhancedCorpus ? `Enhanced corpus gate: ${mtpResult.enhancedCorpus.gateOk ? 'PASS' : 'FAIL'}` : '',
    mtpResult?.enhancedCorpus ? '' : '',
    mtpResult?.enhancedCorpus ? '| ID | Baseline Saved | Enhanced Saved | Baseline Preserve | Enhanced Preserve |' : '',
    mtpResult?.enhancedCorpus ? '|---|---:|---:|---:|---:|' : '',
    ...(mtpResult?.enhancedCorpus ? mtpResult.enhancedCorpus.rows.map(r => `| ${r.id} | ${r.baselineSaved} | ${r.enhancedSaved} | ${r.baselinePreserve}% | ${r.enhancedPreserve}% |`) : []),
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
  return { rows, reportPath, strict: strictResult, mtp: mtpResult };
}

if (require.main === module) runBenchmark({ strict: process.argv.includes('--strict'), mtp: process.argv.includes('--mtp') });
module.exports = { runBenchmark };
