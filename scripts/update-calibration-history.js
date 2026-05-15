#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { summarizeCalibration } = require('../hooks/tto-calibration');

const outPath = process.argv[2] || path.join(process.cwd(), 'benchmarks', 'calibration_history.jsonl');
const summary = summarizeCalibration(200);
const row = {
  generatedAt: new Date().toISOString(),
  avgGapPct: Number(summary.avgGapPct || 0),
  quality: summary.quality || 'unknown',
  sampleCount: Number(summary.count || 0),
  within10Pct: Number(summary.within10Pct || 0),
  within20Pct: Number(summary.within20Pct || 0)
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.appendFileSync(outPath, JSON.stringify(row) + '\n');
console.log(JSON.stringify({ ok: true, outPath, row }, null, 2));

