#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readJsonSafe(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return null;
  }
}

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function fmtDelta(cur, base) {
  const d = num(cur) - num(base);
  const sign = d > 0 ? '+' : '';
  return `${sign}${Math.round(d * 10) / 10}`;
}

function main() {
  const root = path.resolve(__dirname, '..');
  const currentPath = path.join(root, 'benchmarks', 'regression_report.json');
  const baselinePath = path.join(root, 'benchmarks', 'regression_baseline.json');
  const outPath = path.join(root, 'benchmarks', 'regression_diff.md');

  const current = readJsonSafe(currentPath);
  if (!current) {
    const msg = '# Benchmark Artifact Diff\n\nNo current artifact found: `benchmarks/regression_report.json`.\n';
    fs.writeFileSync(outPath, msg);
    console.log(msg);
    return;
  }
  const baseline = readJsonSafe(baselinePath);

  const curStrict = current.strictResult || {};
  const curMtp = current.mtpResult || {};
  const curEnhanced = curMtp.enhancedCorpus || {};
  const curFixture = curMtp.fixtureCorpus || {};

  const lines = [];
  lines.push('# Benchmark Artifact Diff');
  lines.push('');
  lines.push(`Current artifact: \`benchmarks/regression_report.json\``);
  lines.push(`Baseline artifact: \`benchmarks/regression_baseline.json\`${baseline ? '' : ' (missing)'}`);
  lines.push('');

  lines.push('## Current Snapshot');
  lines.push('');
  lines.push(`- Strict gate: ${curStrict.ok ? 'PASS' : 'FAIL'}`);
  lines.push(`- MTP gate: ${curMtp.gateOk ? 'PASS' : 'FAIL'}`);
  lines.push(`- Enhanced corpus gate: ${curEnhanced.gateOk ? 'PASS' : 'FAIL'}`);
  lines.push(`- Fixture corpus guard: ${curFixture.gateOk ? 'PASS' : 'FAIL'}`);
  lines.push(`- Strict avg saving: ${num(curStrict.avgSaving)}%`);
  lines.push(`- Enhanced gain: ${num(curEnhanced.gainPercent)}%`);
  lines.push(`- Slowdown mean: ${num(curMtp.slowdownMeanMs)} ms`);
  lines.push('');

  if (!baseline) {
    lines.push('## Diff');
    lines.push('');
    lines.push('Baseline not available. Add `benchmarks/regression_baseline.json` to enable numeric diffs.');
  } else {
    const baseStrict = baseline.strictResult || {};
    const baseMtp = baseline.mtpResult || {};
    const baseEnhanced = baseMtp.enhancedCorpus || {};
    const baseFixture = baseMtp.fixtureCorpus || {};

    lines.push('## Diff vs Baseline');
    lines.push('');
    lines.push('| Metric | Current | Baseline | Delta |');
    lines.push('|---|---:|---:|---:|');
    lines.push(`| Strict avg saving % | ${num(curStrict.avgSaving)} | ${num(baseStrict.avgSaving)} | ${fmtDelta(curStrict.avgSaving, baseStrict.avgSaving)} |`);
    lines.push(`| Enhanced gain % | ${num(curEnhanced.gainPercent)} | ${num(baseEnhanced.gainPercent)} | ${fmtDelta(curEnhanced.gainPercent, baseEnhanced.gainPercent)} |`);
    lines.push(`| MTP slowdown mean ms | ${num(curMtp.slowdownMeanMs)} | ${num(baseMtp.slowdownMeanMs)} | ${fmtDelta(curMtp.slowdownMeanMs, baseMtp.slowdownMeanMs)} |`);
    lines.push(`| Fixture gain % | ${num(curFixture.gainPercent)} | ${num(baseFixture.gainPercent)} | ${fmtDelta(curFixture.gainPercent, baseFixture.gainPercent)} |`);
    lines.push('');
    lines.push('- Gate drift:');
    lines.push(`  - Strict: ${baseStrict.ok ? 'PASS' : 'FAIL'} -> ${curStrict.ok ? 'PASS' : 'FAIL'}`);
    lines.push(`  - MTP: ${baseMtp.gateOk ? 'PASS' : 'FAIL'} -> ${curMtp.gateOk ? 'PASS' : 'FAIL'}`);
    lines.push(`  - Enhanced: ${baseEnhanced.gateOk ? 'PASS' : 'FAIL'} -> ${curEnhanced.gateOk ? 'PASS' : 'FAIL'}`);
    lines.push(`  - Fixture: ${baseFixture.gateOk ? 'PASS' : 'FAIL'} -> ${curFixture.gateOk ? 'PASS' : 'FAIL'}`);
  }

  lines.push('');
  lines.push('## Waste Signals');
  lines.push('');
  const signals = Array.isArray(current.wasteSignals) ? current.wasteSignals : [];
  if (!signals.length) {
    lines.push('No waste signals.');
  } else {
    lines.push('| ID | Severity | Message |');
    lines.push('|---|---|---|');
    for (const s of signals) {
      lines.push(`| ${s.id} | ${s.severity} | ${String(s.message || '').replace(/\|/g, '\\|')} |`);
    }
  }
  lines.push('');

  const output = lines.join('\n') + '\n';
  fs.writeFileSync(outPath, output);
  console.log(output);
}

main();

