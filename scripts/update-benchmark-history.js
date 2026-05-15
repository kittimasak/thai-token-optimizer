#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function main() {
  const root = path.resolve(__dirname, '..');
  const currentPath = path.join(root, 'benchmarks', 'regression_report.json');
  const historyPath = path.join(root, 'benchmarks', 'regression_history.jsonl');

  if (!fs.existsSync(currentPath)) {
    console.error('Current artifact missing: benchmarks/regression_report.json');
    process.exit(1);
  }

  const current = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
  const row = {
    generatedAt: current.generatedAt || new Date().toISOString(),
    strictGate: Boolean(current.strictResult?.ok),
    mtpGate: Boolean(current.mtpResult?.gateOk),
    enhancedGate: Boolean(current.mtpResult?.enhancedCorpus?.gateOk),
    fixtureGate: Boolean(current.mtpResult?.fixtureCorpus?.gateOk),
    actionRoutingGate: Boolean(current.actionRouting?.gateOk),
    strictAvgSaving: toNum(current.strictResult?.avgSaving),
    enhancedGainPercent: toNum(current.mtpResult?.enhancedCorpus?.gainPercent),
    fixtureGainPercent: toNum(current.mtpResult?.fixtureCorpus?.gainPercent),
    slowdownMeanMs: toNum(current.mtpResult?.slowdownMeanMs)
  };

  const line = JSON.stringify(row);
  fs.mkdirSync(path.dirname(historyPath), { recursive: true });
  fs.appendFileSync(historyPath, line + '\n');
  console.log(`History updated: benchmarks/regression_history.jsonl`);
}

main();

