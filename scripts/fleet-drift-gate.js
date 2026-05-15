#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const val = (i + 1 < argv.length && !argv[i + 1].startsWith('--')) ? argv[++i] : 'true';
    args[key] = val;
  }
  return args;
}
function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean);
}

const args = parseArgs(process.argv);
const historyPath = args.history || path.join(process.cwd(), 'benchmarks', 'fleet_history.jsonl');
const consecutive = Number(args.consecutive || 3);
const maxWasteTokens = Number(args.maxWasteTokens || 200000);
const maxUsd = Number(args.maxUsd || 10);
const minConfidence = Number(args.minConfidence || 0.5);

const rows = readJsonl(historyPath);
const recent = rows.slice(-Math.max(1, consecutive));
const enough = recent.length >= consecutive;
const badWaste = enough && recent.every((r) => Number(r.detectorWasteTokens || 0) > maxWasteTokens);
const badUsd = enough && recent.every((r) => Number(r.detectorEstimatedMonthlyUsd || 0) > maxUsd);
const badConfidence = enough && recent.every((r) => Number(r.avgConfidence || 0) < minConfidence);
const fail = badWaste || badUsd || badConfidence;

const result = {
  historyPath,
  consecutive,
  thresholds: { maxWasteTokens, maxUsd, minConfidence },
  totalRows: rows.length,
  recentRows: recent.length,
  badWaste,
  badUsd,
  badConfidence,
  fail
};
console.log(JSON.stringify(result, null, 2));
if (fail) {
  console.error('Fleet drift gate FAIL: threshold breach across consecutive runs');
  process.exitCode = 1;
}

