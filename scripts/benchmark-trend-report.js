#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function pct(n) {
  return Math.round(n * 100) / 100;
}

function parseJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); } catch (_) { return null; }
    })
    .filter(Boolean);
}

function stats(values = []) {
  const xs = values.map((v) => toNum(v)).filter((v) => Number.isFinite(v));
  if (!xs.length) return { mean: 0, min: 0, max: 0 };
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  return { mean: pct(mean), min: Math.min(...xs), max: Math.max(...xs) };
}

function main() {
  const root = path.resolve(__dirname, '..');
  const historyPath = path.join(root, 'benchmarks', 'regression_history.jsonl');
  const outPath = path.join(root, 'benchmarks', 'regression_trend.md');
  const all = parseJsonl(historyPath);
  const windowSize = Math.max(3, Number(process.argv[2] || 10));
  const rows = all.slice(-windowSize);

  if (!rows.length) {
    const empty = '# Benchmark Trend Report\n\nNo history entries found in `benchmarks/regression_history.jsonl`.\n';
    fs.writeFileSync(outPath, empty);
    console.log(empty);
    return;
  }

  const slowdown = rows.map((r) => toNum(r.slowdownMeanMs));
  const enhancedGain = rows.map((r) => toNum(r.enhancedGainPercent));
  const strictSaving = rows.map((r) => toNum(r.strictAvgSaving));
  const sStats = stats(slowdown);
  const gStats = stats(enhancedGain);
  const qStats = stats(strictSaving);

  const first = rows[0];
  const last = rows[rows.length - 1];

  const md = [
    '# Benchmark Trend Report',
    '',
    `Window size: ${rows.length} run(s)`,
    `Source: \`benchmarks/regression_history.jsonl\``,
    '',
    '## Rolling Summary',
    '',
    '| Metric | Mean | Min | Max | First | Last | Drift (Last-First) |',
    '|---|---:|---:|---:|---:|---:|---:|',
    `| Slowdown mean (ms) | ${sStats.mean} | ${sStats.min} | ${sStats.max} | ${toNum(first.slowdownMeanMs)} | ${toNum(last.slowdownMeanMs)} | ${pct(toNum(last.slowdownMeanMs) - toNum(first.slowdownMeanMs))} |`,
    `| Enhanced gain (%) | ${gStats.mean} | ${gStats.min} | ${gStats.max} | ${toNum(first.enhancedGainPercent)} | ${toNum(last.enhancedGainPercent)} | ${pct(toNum(last.enhancedGainPercent) - toNum(first.enhancedGainPercent))} |`,
    `| Strict avg saving (%) | ${qStats.mean} | ${qStats.min} | ${qStats.max} | ${toNum(first.strictAvgSaving)} | ${toNum(last.strictAvgSaving)} | ${pct(toNum(last.strictAvgSaving) - toNum(first.strictAvgSaving))} |`,
    '',
    '## Gate Stability',
    '',
    '| Gate | PASS Count | FAIL Count |',
    '|---|---:|---:|',
    `| strictGate | ${rows.filter(r => r.strictGate).length} | ${rows.filter(r => !r.strictGate).length} |`,
    `| mtpGate | ${rows.filter(r => r.mtpGate).length} | ${rows.filter(r => !r.mtpGate).length} |`,
    `| enhancedGate | ${rows.filter(r => r.enhancedGate).length} | ${rows.filter(r => !r.enhancedGate).length} |`,
    `| fixtureGate | ${rows.filter(r => r.fixtureGate).length} | ${rows.filter(r => !r.fixtureGate).length} |`,
    `| actionRoutingGate | ${rows.filter(r => r.actionRoutingGate).length} | ${rows.filter(r => !r.actionRoutingGate).length} |`,
    '',
    '## Recent Runs',
    '',
    '| generatedAt | strictSaving% | enhancedGain% | slowdownMs | mtpGate |',
    '|---|---:|---:|---:|---|',
    ...rows.map(r => `| ${r.generatedAt} | ${toNum(r.strictAvgSaving)} | ${toNum(r.enhancedGainPercent)} | ${toNum(r.slowdownMeanMs)} | ${r.mtpGate ? 'PASS' : 'FAIL'} |`)
  ].join('\n') + '\n';

  fs.writeFileSync(outPath, md);
  console.log(md);
  console.error('Report written: benchmarks/regression_trend.md');
}

main();

