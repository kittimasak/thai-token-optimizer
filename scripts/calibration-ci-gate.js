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
const historyPath = args.history || path.join(process.cwd(), 'benchmarks', 'calibration_history.jsonl');
const maxGapPct = Number(args.maxGapPct || 20);
const consecutive = Number(args.consecutive || 3);

const rows = readJsonl(historyPath).filter((r) => Number.isFinite(Number(r.avgGapPct)));
const recent = rows.slice(-Math.max(1, consecutive));
const enoughRows = recent.length >= consecutive;
const badStreak = enoughRows && recent.every((r) => Number(r.avgGapPct) > maxGapPct);

const result = {
  historyPath,
  maxGapPct,
  consecutive,
  totalRows: rows.length,
  recentRows: recent.length,
  badStreak,
  recentAvgGapPct: recent.map((r) => Number(r.avgGapPct))
};

console.log(JSON.stringify(result, null, 2));
if (badStreak) {
  console.error(`Calibration gate FAIL: avgGapPct > ${maxGapPct}% for ${consecutive} consecutive runs`);
  process.exitCode = 1;
}

