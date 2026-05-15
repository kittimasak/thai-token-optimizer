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

function detectWasteSignals(rows = []) {
  const findings = [];
  const lowSavingRows = rows.filter(r => Number(r.savingPercent || 0) <= 1);
  if (lowSavingRows.length >= 3) {
    findings.push({
      id: 'low_saving_cluster',
      severity: 'warn',
      message: `${lowSavingRows.length} samples have <=1% savings; consider prompt decomposition or selective-window tuning`
    });
  }
  const safetyHeavyRows = rows.filter(r => Array.isArray(r.safety?.categories) && r.safety.categories.length > 0);
  if (safetyHeavyRows.length >= 2) {
    findings.push({
      id: 'safety_heavy_mix',
      severity: 'info',
      message: `${safetyHeavyRows.length} samples are safety-heavy; aggressive compression is intentionally constrained`
    });
  }
  return findings;
}

function detectOutputWasteSignal(rows = []) {
  // Heuristic: many medium/long prompts with very low saving means verbose output remains.
  const suspects = rows.filter(r => {
    const beforeTokens = Number(r.before?.estimatedTokens || 0);
    const saving = Number(r.savingPercent || 0);
    // Increased threshold from 35 to 60 tokens for suspicion
    return beforeTokens >= 60 && saving <= 5;
  });
  if (suspects.length >= 3) {
    return {
      id: 'output_waste',
      severity: 'warn',
      count: suspects.length,
      message: `${suspects.length} prompts still have low savings; output verbosity likely disproportionate to task complexity`
    };
  }
  return null;
}

function detectToolCascadeSignal(rows = []) {
  // Heuristic: consecutive rows with 0 saving and technical/safety-heavy context
  let streak = 0;
  let maxStreak = 0;
  for (const r of rows) {
    const lowSaving = Number(r.savingPercent || 0) <= 1;
    const safetyHeavy = Array.isArray(r.safety?.categories) && r.safety.categories.length > 0;
    const technicalDense = /`|https?:\/\/|error|stack|trace|rollback|backup|version|config/i.test(String(r.original || ''));
    if (lowSaving && (safetyHeavy || technicalDense)) {
      streak += 1;
      if (streak > maxStreak) maxStreak = streak;
    } else {
      streak = 0;
    }
  }
  if (maxStreak >= 3) {
    return {
      id: 'tool_cascade',
      severity: 'warn',
      streak: maxStreak,
      message: `${maxStreak} consecutive low-saving technical turns detected; likely retry/tool cascade waste`
    };
  }
  return null;
}

function detectBadDecompositionSignal(rows = []) {
  // Heuristic: very long prompts with low savings indicate monolithic prompts
  const monolithRows = rows.filter(r => {
    const chars = Number(r.before?.chars || String(r.original || '').length || 0);
    const lowSaving = Number(r.savingPercent || 0) <= 5;
    const safetyHeavy = Array.isArray(r.safety?.categories) && r.safety.categories.length > 0;
    const technicalDense = /`|https?:\/\/|~\/|\.\/|\/|config|version|error|stack|trace|rollback|backup|drop table|delete from|production|auth|payment|secret|token/i
      .test(String(r.original || ''));
    // False-positive guard: safety/technical-heavy prompts are expected to compress less.
    if (safetyHeavy || technicalDense) return false;
    return chars >= 90 && lowSaving;
  });
  if (monolithRows.length >= 2) {
    return {
      id: 'bad_decomposition',
      severity: 'warn',
      count: monolithRows.length,
      message: `${monolithRows.length} long low-saving prompts detected; split tasks into smaller scoped prompts`
    };
  }
  return null;
}

function buildActionSuggestions(signals = [], policy = {}) {
  const bs = policy.benchmarkStrict || {};
  const highOutputWasteMinCount = Number(bs.mtpHighOutputWasteMinCount ?? 5);
  const highToolCascadeMinStreak = Number(bs.mtpHighToolCascadeMinStreak ?? 4);
  const highBadDecompositionMinCount = Number(bs.mtpHighBadDecompositionMinCount ?? 5);
  const signalMap = new Map((signals || []).map(s => [s.id, s]));
  const out = [];
  if (signalMap.has('output_waste')) {
    const signal = signalMap.get('output_waste') || {};
    const severity = Number(signal.count || 0) >= highOutputWasteMinCount ? 'high' : 'medium';
    out.push({
      id: 'reduce_output_verbosity',
      severity,
      owner: 'Prompt Quality Owner',
      routing: severity === 'high' ? 'required_action' : 'warning_only',
      suggestion: 'Switch to compact response template and cap verbose explanations unless explicitly requested.'
    });
  }
  if (signalMap.has('tool_cascade')) {
    const signal = signalMap.get('tool_cascade') || {};
    const severity = Number(signal.streak || 0) >= highToolCascadeMinStreak ? 'high' : 'medium';
    out.push({
      id: 'add_tool_circuit_breaker',
      severity,
      owner: 'Agent Runtime Owner',
      routing: severity === 'high' ? 'required_action' : 'warning_only',
      suggestion: 'After 2 consecutive tool failures, stop retries and request narrowed scope or run diagnostics first.'
    });
  }
  if (signalMap.has('bad_decomposition')) {
    const signal = signalMap.get('bad_decomposition') || {};
    const severity = Number(signal.count || 0) >= highBadDecompositionMinCount ? 'high' : 'medium';
    out.push({
      id: 'split_monolith_prompt',
      severity,
      owner: 'Prompt Author',
      routing: severity === 'high' ? 'required_action' : 'warning_only',
      suggestion: 'Split monolithic prompts into 2-4 scoped tasks with explicit output contracts.'
    });
  }
  if (signalMap.has('low_saving_cluster')) {
    out.push({
      id: 'tune_selective_window',
      severity: 'medium',
      owner: 'Compression Engine Owner',
      routing: 'warning_only',
      suggestion: 'Increase selective-window aggressiveness for low-value narrative lines while preserving technical tokens.'
    });
  }
  if (signalMap.has('safety_heavy_mix')) {
    out.push({
      id: 'safety_profile_override',
      severity: 'medium',
      owner: 'Safety Owner',
      routing: 'warning_only',
      suggestion: 'Route safety-heavy tasks to safe profile and separate risky operations from general prompts.'
    });
  }
  return out;
}

function evaluateActionRouting(actionSuggestions = []) {
  const required = actionSuggestions.filter(a => a.routing === 'required_action');
  const warnings = actionSuggestions.filter(a => a.routing !== 'required_action');
  return {
    gateOk: required.length === 0,
    requiredActions: required,
    warningActions: warnings
  };
}

function measureSpeculative(cases, policy) {
  const budget = 80;
  const target = 'codex';
  const repeats = Math.max(1, Number(policy.benchmarkStrict?.mtpRepeats || 10));
  const warmup = Math.max(0, Number(policy.benchmarkStrict?.mtpWarmupRuns || 2));
  const seed = Number(policy.benchmarkStrict?.mtpSeed || 20260512);

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
  const normalSavedSeries = normalRuns.map(r => r.avgSaved);
  const specSavedSeries = speculativeRuns.map(r => r.avgSaved);
  const slowdownSeries = speculativeRuns.map((r, i) => pct(r.elapsedMs - (normalRuns[i]?.elapsedMs ?? normalRuns[normalRuns.length - 1].elapsedMs)));
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
    drift: {
      normalSaved: statsOf(normalSavedSeries),
      speculativeSaved: statsOf(specSavedSeries),
      slowdownMs: statsOf(slowdownSeries)
    },
    policyExactTokenizer: Boolean(policy.exactTokenizer),
    seed
  };
}

function measureFixtureCorpus(policy) {
  const configuredPath = String(policy.benchmarkStrict?.mtpFixtureCorpusPath || 'benchmarks/corpus_overfit_guard_v1.jsonl');
  const corpusPath = path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(__dirname, '..', configuredPath);
  const corpus = loadJsonl(corpusPath);
  const target = 'codex';
  const rows = corpus.map(item => {
    const baselineText = compressPrompt(item.text, { level: 'lite', semanticDedup: false, selectiveWindow: false, lockConstraints: true });
    const enhancedText = compressPrompt(item.text, { level: 'auto', semanticDedup: true, selectiveWindow: true, lockConstraints: true });
    const baseline = { savings: estimateSavings(item.text, baselineText, target), preservation: checkPreservation(item.text, baselineText) };
    const enhanced = { savings: estimateSavings(item.text, enhancedText, target), preservation: checkPreservation(item.text, enhancedText) };
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
  const preservationParityOk = rows.every(r => r.enhancedPreserve >= r.baselinePreserve);
  const minRequired = Number(policy.benchmarkStrict?.mtpFixtureMinGainPercent ?? 0);
  const gainOk = gainPercent >= minRequired;
  const gateOk = gainOk && preservationParityOk;
  return {
    corpusPath,
    samples: rows.length,
    baselineAvgSaved,
    enhancedAvgSaved,
    gainPercent,
    minRequiredGainPercent: minRequired,
    preservationParityOk,
    gateOk,
    gateChecks: { gainOk, preservationParityOk },
    rows
  };
}

function measureEnhancedCorpus(policy) {
  const configuredPath = String(policy.benchmarkStrict?.mtpEnhancedCorpusPath || 'benchmarks/corpus_long_repetitive_mixed_tech_v1.jsonl');
  const corpusPath = path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(__dirname, '..', configuredPath);
  const corpus = loadJsonl(corpusPath);
  const target = 'codex';
  const budget = 120;
  const rows = corpus.map(item => {
    const baselineText = compressPrompt(item.text, {
      level: 'lite',
      semanticDedup: false,
      selectiveWindow: false,
      lockConstraints: true
    });
    const enhancedText = compressPrompt(item.text, {
      level: 'auto',
      semanticDedup: true,
      selectiveWindow: true,
      lockConstraints: true
    });
    const baseline = {
      savings: estimateSavings(item.text, baselineText, target),
      preservation: checkPreservation(item.text, baselineText)
    };
    const enhanced = {
      savings: estimateSavings(item.text, enhancedText, target),
      preservation: checkPreservation(item.text, enhancedText)
    };
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
  const minRequired = Number(policy.benchmarkStrict?.mtpEnhancedMinGainPercent ?? 12);
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
  const wasteSignals = detectWasteSignals(rows);
  const outputWaste = detectOutputWasteSignal(rows);
  const toolCascade = detectToolCascadeSignal(rows);
  const badDecomposition = detectBadDecompositionSignal(rows);
  if (outputWaste) wasteSignals.push(outputWaste);
  if (toolCascade) wasteSignals.push(toolCascade);
  if (badDecomposition) wasteSignals.push(badDecomposition);
  const actionSuggestions = buildActionSuggestions(wasteSignals, policy);
  const actionRouting = evaluateActionRouting(actionSuggestions);
  const mtpResult = mtp ? measureSpeculative(cases, policy) : null;
  const enhancedCorpus = mtp ? measureEnhancedCorpus(policy) : null;
  const fixtureCorpus = mtp ? measureFixtureCorpus(policy) : null;
  if (mtpResult && enhancedCorpus) {
    mtpResult.gate.mtpEnhancedMinGainPercent = enhancedCorpus.minRequiredGainPercent;
    mtpResult.gateChecks.enhancedGainOk = enhancedCorpus.gateChecks.gainOk;
    mtpResult.gateChecks.enhancedPreservationParityOk = enhancedCorpus.gateChecks.preservationParityOk;
    mtpResult.gateOk = mtpResult.gateOk && enhancedCorpus.gateOk;
    mtpResult.enhancedCorpus = enhancedCorpus;
    if (fixtureCorpus) {
      mtpResult.gateChecks.fixtureGainOk = fixtureCorpus.gateChecks.gainOk;
      mtpResult.gateChecks.fixturePreservationParityOk = fixtureCorpus.gateChecks.preservationParityOk;
      mtpResult.gateOk = mtpResult.gateOk && fixtureCorpus.gateOk;
    }
    mtpResult.gateChecks.actionRoutingOk = actionRouting.gateOk;
    mtpResult.gateOk = mtpResult.gateOk && actionRouting.gateOk;
    mtpResult.fixtureCorpus = fixtureCorpus;
  }
  const md = [
    strict ? '# Thai Token Optimizer v2.0 Strict Regression Report' : '# Thai Token Optimizer v2.0 Benchmark Report',
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
    mtpResult ? `Runs: ${mtpResult.repeats} (warmup: ${mtpResult.warmup}, seed: ${mtpResult.seed})` : '',
    mtpResult ? `Normal latency (mean/p50/p95/stddev): ${mtpResult.normalLatency.mean}/${mtpResult.normalLatency.p50}/${mtpResult.normalLatency.p95}/${mtpResult.normalLatency.stddev} ms` : '',
    mtpResult ? `Spec latency   (mean/p50/p95/stddev): ${mtpResult.speculativeLatency.mean}/${mtpResult.speculativeLatency.p50}/${mtpResult.speculativeLatency.p95}/${mtpResult.speculativeLatency.stddev} ms` : '',
    mtpResult ? `Slowdown mean (spec-normal): ${mtpResult.slowdownMeanMs} ms` : '',
    mtpResult ? `Spec hit rate: ${mtpResult.specHitRatePercent}%` : '',
    mtpResult?.enhancedCorpus ? `Enhanced gain on ${path.basename(mtpResult.enhancedCorpus.corpusPath, '.jsonl')}: ${mtpResult.enhancedCorpus.gainPercent}% (required >= ${mtpResult.enhancedCorpus.minRequiredGainPercent}%)` : '',
    mtpResult ? `MTP gate: ${mtpResult.gateOk ? 'PASS' : 'FAIL'}` : '',
    mtpResult ? '' : '',
    mtpResult?.drift ? '## Drift Monitor (repeated-run stability)' : '',
    mtpResult?.drift ? '' : '',
    mtpResult?.drift ? `Normal saved   (mean/p50/p95/stddev): ${mtpResult.drift.normalSaved.mean}/${mtpResult.drift.normalSaved.p50}/${mtpResult.drift.normalSaved.p95}/${mtpResult.drift.normalSaved.stddev}` : '',
    mtpResult?.drift ? `Spec saved     (mean/p50/p95/stddev): ${mtpResult.drift.speculativeSaved.mean}/${mtpResult.drift.speculativeSaved.p50}/${mtpResult.drift.speculativeSaved.p95}/${mtpResult.drift.speculativeSaved.stddev}` : '',
    mtpResult?.drift ? `Slowdown (ms)  (mean/p50/p95/stddev): ${mtpResult.drift.slowdownMs.mean}/${mtpResult.drift.slowdownMs.p50}/${mtpResult.drift.slowdownMs.p95}/${mtpResult.drift.slowdownMs.stddev}` : '',
    mtpResult?.drift ? '' : '',
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
    mtpResult?.fixtureCorpus ? '' : '',
    mtpResult?.fixtureCorpus ? '## Overfit Guard Corpus (non-gating monitor)' : '',
    mtpResult?.fixtureCorpus ? '' : '',
    mtpResult?.fixtureCorpus ? `Corpus: ${path.relative(root, mtpResult.fixtureCorpus.corpusPath)}` : '',
    mtpResult?.fixtureCorpus ? `Samples: ${mtpResult.fixtureCorpus.samples}` : '',
    mtpResult?.fixtureCorpus ? `Baseline avg saved: ${mtpResult.fixtureCorpus.baselineAvgSaved}` : '',
    mtpResult?.fixtureCorpus ? `Enhanced avg saved: ${mtpResult.fixtureCorpus.enhancedAvgSaved}` : '',
    mtpResult?.fixtureCorpus ? `Gain: ${mtpResult.fixtureCorpus.gainPercent}% (required >= ${mtpResult.fixtureCorpus.minRequiredGainPercent}%)` : '',
    mtpResult?.fixtureCorpus ? `Preservation parity: ${mtpResult.fixtureCorpus.gateChecks.preservationParityOk ? 'PASS' : 'FAIL'}` : '',
    mtpResult?.fixtureCorpus ? `Fixture corpus guard: ${mtpResult.fixtureCorpus.gateOk ? 'PASS' : 'FAIL'}` : '',
    mtpResult ? `Action routing gate: ${actionRouting.gateOk ? 'PASS' : 'FAIL'}` : '',
    mtpResult?.fixtureCorpus ? '' : '',
    mtpResult?.fixtureCorpus ? '| ID | Baseline Saved | Enhanced Saved | Baseline Preserve | Enhanced Preserve |' : '',
    mtpResult?.fixtureCorpus ? '|---|---:|---:|---:|---:|' : '',
    ...(mtpResult?.fixtureCorpus ? mtpResult.fixtureCorpus.rows.map(r => `| ${r.id} | ${r.baselineSaved} | ${r.enhancedSaved} | ${r.baselinePreserve}% | ${r.enhancedPreserve}% |`) : []),
    '',
    '## Waste Detector Signals',
    '',
    wasteSignals.length ? '| ID | Severity | Message |' : 'No significant waste signals detected.',
    wasteSignals.length ? '|---|---|---|' : '',
    ...(wasteSignals.length ? wasteSignals.map(f => `| ${f.id} | ${f.severity} | ${f.message} |`) : []),
    '',
    '## Detector Action Suggestions',
    '',
    actionSuggestions.length ? '| ID | Severity | Owner | Routing | Suggestion |' : 'No action suggestions.',
    actionSuggestions.length ? '|---|---|---|---|---|' : '',
    ...(actionSuggestions.length ? actionSuggestions.map(a => `| ${a.id} | ${a.severity} | ${a.owner} | ${a.routing} | ${String(a.suggestion).replace(/\|/g, '\\|')} |`) : []),
    '',
    '## Notes',
    '',
    '- Version remains Thai Token Optimizer v2.0 / package 2.0.0.',
    '- Exact tokenizer is optional; if unavailable the estimator falls back to heuristic mode.',
    '- Strict mode checks saving, preservation, constraints, and code block safety.'
  ].filter(x => x !== '').join('\n');
  fs.writeFileSync(reportPath, md + '\n');
  const artifactPath = strict ? path.join(__dirname, 'regression_report.json') : path.join(__dirname, 'report.json');
  const artifact = {
    generatedAt: new Date().toISOString(),
    strict,
    mtp,
    reportPath: path.relative(root, reportPath),
    strictResult,
    mtpResult,
    wasteSignals,
    actionSuggestions,
    actionRouting
  };
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2) + '\n');
  if (!options.silent) {
    console.log(md);
    console.error(`\nReport written: ${path.relative(root, reportPath)}`);
    console.error(`Diagnostics artifact written: ${path.relative(root, artifactPath)}`);
  }
  return { rows, reportPath, artifactPath, strict: strictResult, mtp: mtpResult, wasteSignals, actionSuggestions, actionRouting };
}

if (require.main === module) runBenchmark({ strict: process.argv.includes('--strict'), mtp: process.argv.includes('--mtp') });
module.exports = {
  runBenchmark,
  detectWasteSignals,
  detectOutputWasteSignal,
  detectToolCascadeSignal,
  detectBadDecompositionSignal,
  buildActionSuggestions,
  evaluateActionRouting
};
