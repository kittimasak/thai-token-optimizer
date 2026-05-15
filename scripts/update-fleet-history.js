#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { buildFleetAudit } = require('../hooks/tto-fleet-audit');

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

const args = parseArgs(process.argv);
const roots = String(args.roots || process.cwd()).split(',').map((s) => s.trim()).filter(Boolean);
const outPath = args.out || path.join(process.cwd(), 'benchmarks', 'fleet_history.jsonl');
const audit = buildFleetAudit(roots, {
  doctor: true,
  doctorTarget: 'all',
  calibration: true,
  calibrationLimit: 50,
  sessionScan: true
});

const row = {
  generatedAt: new Date().toISOString(),
  totalProjects: audit.totalProjects,
  avgCalibrationGapPct: Number(audit.calibration?.avgGapPct || 0),
  detectorWasteTokens: Number(audit.detectors?.totalWasteTokens || 0),
  detectorEstimatedMonthlyUsd: Number(audit.detectors?.totalEstimatedMonthlyUsd || 0),
  findingsCount: Array.isArray(audit.detectors?.findings) ? audit.detectors.findings.length : 0,
  avgConfidence: (() => {
    const f = Array.isArray(audit.detectors?.findings) ? audit.detectors.findings : [];
    if (!f.length) return 1.0; 
    return Math.round((f.reduce((a, x) => a + Number(x.confidence || 0), 0) / f.length) * 1000) / 1000;
  })()
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.appendFileSync(outPath, JSON.stringify(row) + '\n');
console.log(JSON.stringify({ ok: true, outPath, row }, null, 2));

