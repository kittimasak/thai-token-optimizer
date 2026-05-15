#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { HOME_DIR, STATS_PATH } = require('./tto-config');

const CALIBRATION_PATH = path.join(HOME_DIR, 'calibration.jsonl');

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean);
}

function appendJsonl(file, row) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(row) + '\n');
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function buildSample({ estimated, real, target = 'generic', source = 'manual' }) {
  const est = Math.max(0, Math.round(toNum(estimated)));
  const r = Math.max(0, Math.round(toNum(real)));
  const gap = r - est;
  const gapPct = r > 0 ? Math.round((Math.abs(gap) / r) * 1000) / 10 : 0;
  return {
    ts: new Date().toISOString(),
    target,
    source,
    estimated: est,
    real: r,
    gap,
    gapPct
  };
}

function recordCalibration(input = {}) {
  const row = buildSample(input);
  appendJsonl(CALIBRATION_PATH, row);
  return row;
}

function summarizeCalibration(limit = 50) {
  return summarizeCalibrationAt(CALIBRATION_PATH, limit);
}

function summarizeCalibrationAt(filePath, limit = 50) {
  const rows = readJsonl(filePath).slice(-Math.max(1, limit));
  const count = rows.length;
  const avgGapPct = count ? (rows.reduce((a, r) => a + Math.abs(toNum(r.gapPct)), 0) / count) : 0;
  const avgBias = count ? (rows.reduce((a, r) => a + toNum(r.gap), 0) / count) : 0;
  const within10Pct = count ? rows.filter((r) => Math.abs(toNum(r.gapPct)) <= 10).length : 0;
  const within20Pct = count ? rows.filter((r) => Math.abs(toNum(r.gapPct)) <= 20).length : 0;
  return {
    path: filePath,
    count,
    avgGapPct: Math.round(avgGapPct * 100) / 100,
    avgBias: Math.round(avgBias * 100) / 100,
    within10Pct,
    within20Pct,
    quality: count === 0 ? 'unknown' : (avgGapPct <= 10 ? 'good' : avgGapPct <= 20 ? 'fair' : 'poor'),
    latest: rows[count - 1] || null
  };
}

function recordFromStatsRealTotal({ realTotal, sampleSize = 20, target = 'generic' }) {
  const statsRows = readJsonl(STATS_PATH)
    .filter((r) => r.event === 'UserPromptSubmit' && Number.isFinite(Number(r.estimatedPromptTokens)))
    .slice(-Math.max(1, Number(sampleSize) || 20));
  const estimatedTotal = statsRows.reduce((a, r) => a + Number(r.estimatedPromptTokens || 0), 0);
  const row = recordCalibration({
    estimated: estimatedTotal,
    real: Number(realTotal || 0),
    target,
    source: `stats:${statsRows.length}`
  });
  return { row, estimatedTotal, sampleCount: statsRows.length, statsPath: STATS_PATH };
}

function clearCalibration() {
  fs.rmSync(CALIBRATION_PATH, { force: true });
  return { cleared: true, path: CALIBRATION_PATH };
}

module.exports = {
  CALIBRATION_PATH,
  recordCalibration,
  summarizeCalibration,
  summarizeCalibrationAt,
  recordFromStatsRealTotal,
  clearCalibration
};
