#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { runDoctor } = require('./tto-doctor');
const { summarizeCalibrationAt } = require('./tto-calibration');
const { collectAgentRuns } = require('./tto-session-parsers');
const { detectFleetWaste, estimateRunCostUsd } = require('./tto-fleet-detectors');

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function exists(file) {
  try {
    fs.accessSync(file, fs.constants.R_OK);
    return true;
  } catch (_) {
    return false;
  }
}

function toPercent(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

function inferAgents(root) {
  return {
    codex: exists(path.join(root, '.codex-plugin')),
    claude: exists(path.join(root, '.claude-plugin')),
    github: exists(path.join(root, '.github', 'workflows'))
  };
}

function resolveCalibrationPath(root) {
  const candidates = [
    path.join(root, '.tto', 'calibration.jsonl'),
    path.join(root, '.thai-token-optimizer', 'calibration.jsonl')
  ];
  for (const p of candidates) if (exists(p)) return p;
  return candidates[0];
}

const FLEET_DOCTOR_TARGETS = Object.freeze(['all', 'codex', 'claude', 'gemini', 'opencode', 'openclaw', 'hermes']);

function normalizeFleetDoctorTarget(target = 'all') {
  const value = String(target || 'all').toLowerCase();
  if (FLEET_DOCTOR_TARGETS.includes(value)) return value;
  throw new Error(`Doctor target must be: ${FLEET_DOCTOR_TARGETS.join(', ')}`);
}

function runProjectDoctor(root, target = 'all') {
  const packageRoot = path.resolve(__dirname, '..');
  const prev = {
    CODEX_HOME: process.env.CODEX_HOME,
    CLAUDE_HOME: process.env.CLAUDE_HOME,
    GEMINI_HOME: process.env.GEMINI_HOME,
    OPENCODE_CONFIG_DIR: process.env.OPENCODE_CONFIG_DIR,
    OPENCLAW_HOME: process.env.OPENCLAW_HOME,
    HERMES_HOME: process.env.HERMES_HOME
  };
  try {
    process.env.CODEX_HOME = path.join(root, '.codex');
    process.env.CLAUDE_HOME = path.join(root, '.claude');
    process.env.GEMINI_HOME = path.join(root, '.gemini');
    process.env.OPENCODE_CONFIG_DIR = path.join(root, '.config', 'opencode');
    process.env.OPENCLAW_HOME = path.join(root, '.openclaw');
    process.env.HERMES_HOME = path.join(root, '.hermes');
    return runDoctor({ ci: false, target, rootDir: packageRoot });
  } catch (e) {
    return { ok: false, target, checks: [{ name: 'doctor_execution', ok: false, detail: e.message, required: true }] };
  } finally {
    for (const [key, value] of Object.entries(prev)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function scanProject(root, options = {}) {
  const doctorEnabled = Boolean(options.doctor);
  const doctorTarget = normalizeFleetDoctorTarget(options.doctorTarget || 'all');
  const calibrationEnabled = Boolean(options.calibration);
  const calibrationLimit = Number(options.calibrationLimit || 50);
  const sessionScanEnabled = Boolean(options.sessionScan);
  const reportPath = path.join(root, 'benchmarks', 'regression_report.json');
  const pkgPath = path.join(root, 'package.json');
  const report = readJson(reportPath, null);
  const pkg = readJson(pkgPath, {});
  const agents = inferAgents(root);
  const hasBench = !!report;
  const strictGate = hasBench ? Boolean(report?.strictResult?.ok) : false;
  const mtpGate = hasBench ? Boolean(report?.mtpResult?.gateOk) : false;
  const actionRoutingGate = hasBench ? Boolean(report?.actionRouting?.gateOk) : false;
  const avgSaving = toPercent(report?.strictResult?.avgSaving ?? report?.aggregate?.avgSavingPercent ?? 0);
  const wasteCount = Array.isArray(report?.wasteSignals) ? report.wasteSignals.length : 0;
  const qualityScore = hasBench
    ? Math.max(0, Math.min(100, 100 - (strictGate ? 0 : 20) - (mtpGate ? 0 : 20) - (actionRoutingGate ? 0 : 15) - Math.min(30, wasteCount * 5)))
    : 0;
  const doctor = doctorEnabled ? runProjectDoctor(root, doctorTarget) : null;
  const calibrationPath = resolveCalibrationPath(root);
  const calibration = calibrationEnabled ? summarizeCalibrationAt(calibrationPath, calibrationLimit) : null;
  const runs = sessionScanEnabled ? collectAgentRuns(root, { maxRuns: Number(options.maxRuns || 80) }) : [];
  const waste = sessionScanEnabled ? detectFleetWaste(runs, { minConfidence: Number(options.minConfidence || 0.4) }) : null;
  const runCost = runs.reduce((a, r) => a + estimateRunCostUsd(r), 0);
  const doctorRequired = doctor ? (doctor.checks || []).filter((c) => c.required !== false).length : 0;
  const doctorPass = doctor ? (doctor.checks || []).filter((c) => (c.required !== false) && c.ok).length : 0;
  return {
    root,
    packageName: pkg?.name || path.basename(root),
    packageVersion: pkg?.version || 'unknown',
    benchmarkFound: hasBench,
    strictGate,
    mtpGate,
    actionRoutingGate,
    avgSaving,
    wasteCount,
    qualityScore: toPercent(qualityScore),
    agents,
    doctor: doctor ? {
      ok: Boolean(doctor.ok),
      target: doctor.target || doctorTarget,
      requiredChecks: doctorRequired,
      passChecks: doctorPass
    } : null,
    calibration: calibration ? {
      path: calibration.path,
      count: calibration.count,
      avgGapPct: calibration.avgGapPct,
      quality: calibration.quality
    } : null,
    sessions: sessionScanEnabled ? {
      totalRuns: runs.length,
      totalInputTokens: runs.reduce((a, r) => a + Number(r.inputTokens || 0), 0),
      totalOutputTokens: runs.reduce((a, r) => a + Number(r.outputTokens || 0), 0),
      estimatedCostUsd: Math.round(runCost * 100) / 100
    } : null,
    detectors: waste
  };
}

function buildFleetAudit(roots = [], options = {}) {
  const normalizedOptions = {
    ...options,
    doctorTarget: normalizeFleetDoctorTarget(options.doctorTarget || 'all')
  };
  const list = roots.length ? roots : [process.cwd()];
  const projects = list.map((r) => scanProject(path.resolve(r), normalizedOptions));
  const total = projects.length;
  const withBenchmark = projects.filter((p) => p.benchmarkFound).length;
  const strictPass = projects.filter((p) => p.strictGate).length;
  const mtpPass = projects.filter((p) => p.mtpGate).length;
  const routePass = projects.filter((p) => p.actionRoutingGate).length;
  const avgQuality = toPercent(projects.reduce((a, p) => a + Number(p.qualityScore || 0), 0) / Math.max(1, total));
  const avgSaving = toPercent(projects.reduce((a, p) => a + Number(p.avgSaving || 0), 0) / Math.max(1, total));
  const totalWaste = projects.reduce((a, p) => a + Number(p.wasteCount || 0), 0);
  const coverage = {
    codex: projects.filter((p) => p.agents.codex).length,
    claude: projects.filter((p) => p.agents.claude).length,
    github: projects.filter((p) => p.agents.github).length
  };
  const doctorRuns = projects.filter((p) => p.doctor).length;
  const doctorPassProjects = projects.filter((p) => p.doctor && p.doctor.ok).length;
  const doctorTotalChecks = projects.reduce((a, p) => a + Number(p.doctor?.requiredChecks || 0), 0);
  const doctorPassChecks = projects.reduce((a, p) => a + Number(p.doctor?.passChecks || 0), 0);
  const calibrationRuns = projects.filter((p) => p.calibration).length;
  const calibrationProjectsWithData = projects.filter((p) => Number(p.calibration?.count || 0) > 0).length;
  const calibrationAvgGapPct = toPercent(
    projects.reduce((a, p) => a + Number(p.calibration?.avgGapPct || 0), 0) / Math.max(1, calibrationRuns || 1)
  );
  const sessionRuns = projects.reduce((a, p) => a + Number(p.sessions?.totalRuns || 0), 0);
  const sessionInputTokens = projects.reduce((a, p) => a + Number(p.sessions?.totalInputTokens || 0), 0);
  const sessionOutputTokens = projects.reduce((a, p) => a + Number(p.sessions?.totalOutputTokens || 0), 0);
  const sessionCostUsd = toPercent(projects.reduce((a, p) => a + Number(p.sessions?.estimatedCostUsd || 0), 0));
  const detectorFindings = projects.flatMap((p) => (p.detectors?.findings || []).map((f) => ({ ...f, project: p.packageName })));
  const detectorWasteTokens = projects.reduce((a, p) => a + Number(p.detectors?.totalWasteTokens || 0), 0);
  const detectorCostUsd = toPercent(projects.reduce((a, p) => a + Number(p.detectors?.totalEstimatedMonthlyUsd || 0), 0));
  return {
    generatedAt: new Date().toISOString(),
    totalProjects: total,
    withBenchmark,
    strictPass,
    mtpPass,
    routePass,
    avgQuality,
    avgSaving,
    totalWaste,
    coverage,
    doctor: {
      enabled: Boolean(normalizedOptions.doctor),
      target: normalizedOptions.doctorTarget || 'all',
      projectsChecked: doctorRuns,
      passProjects: doctorPassProjects,
      requiredChecks: doctorTotalChecks,
      passChecks: doctorPassChecks
    },
    calibration: {
      enabled: Boolean(normalizedOptions.calibration),
      limit: Number(normalizedOptions.calibrationLimit || 50),
      projectsChecked: calibrationRuns,
      projectsWithData: calibrationProjectsWithData,
      avgGapPct: calibrationAvgGapPct
    },
    sessions: {
      enabled: Boolean(normalizedOptions.sessionScan),
      totalRuns: sessionRuns,
      totalInputTokens: sessionInputTokens,
      totalOutputTokens: sessionOutputTokens,
      estimatedCostUsd: sessionCostUsd
    },
    detectors: {
      enabled: Boolean(normalizedOptions.sessionScan),
      findings: detectorFindings,
      totalWasteTokens: detectorWasteTokens,
      totalEstimatedMonthlyUsd: detectorCostUsd
    },
    projects
  };
}

module.exports = {
  buildFleetAudit
};
