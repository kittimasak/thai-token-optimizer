#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function stats(xs) {
  const arr = xs.map(num).sort((a, b) => a - b);
  if (!arr.length) return { min: 0, max: 0, mean: 0, p50: 0, p95: 0 };
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const pick = (p) => arr[Math.min(arr.length - 1, Math.max(0, Math.ceil((p / 100) * arr.length) - 1))];
  return {
    min: arr[0],
    max: arr[arr.length - 1],
    mean: Math.round(mean * 100) / 100,
    p50: pick(50),
    p95: pick(95)
  };
}

function main() {
  const root = path.resolve(__dirname, '..');
  const runs = Math.max(5, Number(process.argv[2] || 12));
  const samples = [];
  for (let i = 0; i < runs; i++) {
    const r = spawnSync(process.execPath, ['bin/thai-token-optimizer.js', 'benchmark', '--strict', '--default-policy', '--mtp'], {
      cwd: root,
      encoding: 'utf8'
    });
    if (r.status !== 0) {
      console.error(`benchmark run failed at iteration ${i}: status=${r.status}`);
      process.exit(r.status || 1);
    }
    const artifact = JSON.parse(fs.readFileSync(path.join(root, 'benchmarks', 'regression_report.json'), 'utf8'));
    const by = Object.fromEntries((artifact.wasteSignals || []).map(s => [s.id, s]));
    samples.push({
      outputWasteCount: num(by.output_waste?.count),
      toolCascadeStreak: num(by.tool_cascade?.streak),
      badDecompositionCount: num(by.bad_decomposition?.count)
    });
  }

  const outputStats = stats(samples.map(s => s.outputWasteCount));
  const toolStats = stats(samples.map(s => s.toolCascadeStreak));
  const badStats = stats(samples.map(s => s.badDecompositionCount));

  // Conservative suggestion: baseline p95 + 1 for high severity gates.
  const suggested = {
    mtpHighOutputWasteMinCount: Math.max(2, outputStats.p95 + 1),
    mtpHighToolCascadeMinStreak: Math.max(2, toolStats.p95 + 1),
    mtpHighBadDecompositionMinCount: Math.max(2, badStats.p95 + 1)
  };

  const md = [
    '# Detector Threshold Tuning Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Runs: ${runs}`,
    '',
    '## Baseline Signal Distribution',
    '',
    '| Signal | min | p50 | p95 | max | mean |',
    '|---|---:|---:|---:|---:|---:|',
    `| output_waste.count | ${outputStats.min} | ${outputStats.p50} | ${outputStats.p95} | ${outputStats.max} | ${outputStats.mean} |`,
    `| tool_cascade.streak | ${toolStats.min} | ${toolStats.p50} | ${toolStats.p95} | ${toolStats.max} | ${toolStats.mean} |`,
    `| bad_decomposition.count | ${badStats.min} | ${badStats.p50} | ${badStats.p95} | ${badStats.max} | ${badStats.mean} |`,
    '',
    '## Suggested High-Severity Thresholds',
    '',
    '| Key | Suggested value | Rule |',
    '|---|---:|---|',
    `| benchmarkStrict.mtpHighOutputWasteMinCount | ${suggested.mtpHighOutputWasteMinCount} | p95 + 1 |`,
    `| benchmarkStrict.mtpHighToolCascadeMinStreak | ${suggested.mtpHighToolCascadeMinStreak} | p95 + 1 |`,
    `| benchmarkStrict.mtpHighBadDecompositionMinCount | ${suggested.mtpHighBadDecompositionMinCount} | p95 + 1 |`,
    '',
    '## Notes',
    '',
    '- This report calibrates thresholds from repeated strict benchmark runs.',
    '- Tune again after corpus/policy/detector logic changes.'
  ].join('\n') + '\n';

  const outPath = path.join(root, 'benchmarks', 'threshold_tuning_report.md');
  fs.writeFileSync(outPath, md);
  console.log(md);
  console.error(`Report written: benchmarks/threshold_tuning_report.md`);
}

main();

