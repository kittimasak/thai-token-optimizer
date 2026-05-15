/**
 * ============================================================================
 * Thai Token Optimizer v2.0
 * ============================================================================
 * Description : 
 * A Thai token optimization tool for AI coding agents that keeps commands, code, and technical details accurate.
 *
 * Author      : Dr.Kittimasak Naijit
 * Repository  : https://github.com/kittimasak/thai-token-optimizer
 *
 * Copyright (c) 2026 Dr.Kittimasak Naijit
 *
 * Notes:
 * - Do not remove code-aware preservation, safety checks, or rollback behavior.
 * - This file is part of the Thai Token Optimizer local-first CLI/hook system.
 * ============================================================================
 */

const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const ROOT = path.resolve(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'thai-token-optimizer.js');
function tmpHome() { return fs.mkdtempSync(path.join(os.tmpdir(), 'tto-ui-')); }
function run(args, env = {}) {
  return spawnSync(process.execPath, [BIN, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

test('pretty status and dashboard render terminal boxes', () => {
  const home = tmpHome();
  const env = { TTO_HOME: path.join(home, '.tto'), HOME: home };
  run(['auto'], env);
  const status = run(['status', '--pretty'], env);
  assert.equal(status.status, 0);
  assert.match(status.stdout, /╭/);
  assert.match(status.stdout, /Thai Token Optimizer v2\.0/);
  assert.match(status.stdout, /Token Saving/);

  const ui = run(['ui'], env);
  assert.equal(ui.status, 0);
  assert.match(ui.stdout, /Codex/);
  assert.match(ui.stdout, /OpenCode/);
});

test('pretty compress, classify, doctor, and benchmark render visual UI', () => {
  const home = tmpHome();
  const env = { TTO_HOME: path.join(home, '.tto'), HOME: home, CODEX_HOME: path.join(home, '.codex'), CLAUDE_HOME: path.join(home, '.claude'), GEMINI_HOME: path.join(home, '.gemini'), OPENCODE_CONFIG_DIR: path.join(home, '.config', 'opencode') };
  const compress = run(['compress', '--pretty', '--level', 'auto', '--budget', '80', '--target', 'codex', '--check', 'ช่วยอธิบายรายละเอียด Thai Token Optimizer v2.0 โดยห้ามเปลี่ยน package version 2.0.0'], env);
  assert.equal(compress.status, 0);
  assert.match(compress.stdout, /Prompt Compression Result/);
  assert.match(compress.stdout, /█|░/);

  const classify = run(['classify', '--pretty', 'DROP TABLE users production secret token'], env);
  assert.equal(classify.status, 0);
  assert.match(classify.stdout, /Safety Classifier/);
  assert.match(classify.stdout, /HIGH/);

  const doctor = run(['doctor', '--pretty', '--ci'], env);
  assert.equal(doctor.status, 0);
  assert.match(doctor.stdout, /Thai Token Optimizer Doctor/);
  assert.match(doctor.stdout, /PASS/);

  const benchmark = run(['benchmark', '--pretty', '--strict', '--default-policy'], env);
  assert.equal(benchmark.status, 0);
  assert.match(benchmark.stdout, /Thai Token Optimizer.*Benchmark/);
  assert.match(benchmark.stdout, /Strict Gate/);

  const mtpBenchmark = run(['benchmark', '--pretty', '--strict', '--default-policy', '--mtp'], env);
  assert.ok(mtpBenchmark.status === 0 || mtpBenchmark.status === 1, mtpBenchmark.stdout + mtpBenchmark.stderr);
  assert.match(mtpBenchmark.stdout, /MTP Compare/);
  assert.match(mtpBenchmark.stdout, /Spec Hits/);
});

test('dashboard views and quality pretty render terminal output', () => {
  const home = tmpHome();
  const env = {
    TTO_HOME: path.join(home, '.tto'),
    HOME: home,
    CODEX_HOME: path.join(home, '.codex'),
    CLAUDE_HOME: path.join(home, '.claude'),
    GEMINI_HOME: path.join(home, '.gemini'),
    OPENCODE_CONFIG_DIR: path.join(home, '.config', 'opencode')
  };
  const bench = run(['benchmark', '--strict', '--default-policy', '--mtp'], env);
  assert.ok(bench.status === 0 || bench.status === 1, bench.stdout + bench.stderr);

  const quality = run(['quality', '--pretty'], env);
  assert.equal(quality.status, 0, quality.stdout + quality.stderr);
  assert.match(quality.stdout, /TTO Quality Score/);
  assert.match(quality.stdout, /Weak Signals/);
  assert.match(quality.stdout, /Stage 1 Signals/);
  assert.match(quality.stdout, /Stage 2 Signals/);
  assert.match(quality.stdout, /Distortion Bounds/);

  const views = ['overview', 'quality', 'waste', 'trend', 'agents', 'doctor'];
  for (const v of views) {
    const out = run(['dashboard', '--view', v], env);
    assert.equal(out.status, 0, `view=${v}\n${out.stdout}\n${out.stderr}`);
    assert.match(out.stdout, /╭/);
  }
});

test('checkpoint and cache commands render pretty terminal output', () => {
  const home = tmpHome();
  const env = { TTO_HOME: path.join(home, '.tto'), HOME: home };

  const cpCapture = run(['checkpoint', 'capture', 'first-snapshot'], env);
  assert.equal(cpCapture.status, 0, cpCapture.stdout + cpCapture.stderr);

  const preCompact = run(['checkpoint', 'precompact', 'before-compact'], env);
  assert.equal(preCompact.status, 0, preCompact.stdout + preCompact.stderr);
  const postCompact = run(['checkpoint', 'postcompact', 'after-compact'], env);
  assert.equal(postCompact.status, 0, postCompact.stdout + postCompact.stderr);

  const cpStatus = run(['checkpoint', 'status', '--pretty'], env);
  assert.equal(cpStatus.status, 0, cpStatus.stdout + cpStatus.stderr);
  assert.match(cpStatus.stdout, /Checkpoint \/ Continuity Lite/);
  assert.match(cpStatus.stdout, /Fill bands/);

  const cpList = run(['checkpoint', 'list', '--pretty'], env);
  assert.equal(cpList.status, 0, cpList.stdout + cpList.stderr);
  assert.match(cpList.stdout, /first-s/);

  const sample = path.join(home, 'prompt.txt');
  fs.writeFileSync(sample, 'ทดสอบ cache reads');
  const compress = run(['compress', sample], env);
  assert.equal(compress.status, 0, compress.stdout + compress.stderr);

  const cacheStats = run(['cache', 'stats', '--pretty'], env);
  assert.equal(cacheStats.status, 0, cacheStats.stdout + cacheStats.stderr);
  assert.match(cacheStats.stdout, /Read-cache Analytics/);

  const cacheClear = run(['cache', 'clear'], env);
  assert.equal(cacheClear.status, 0, cacheClear.stdout + cacheClear.stderr);
});

test('read-cache supports warn decisions and .contextignore block', () => {
  const home = tmpHome();
  const env = { TTO_HOME: path.join(home, '.tto'), HOME: home };

  const sample = path.join(home, 'readme.txt');
  fs.writeFileSync(sample, 'cache subsystem test');

  const setWarn = run(['config', 'set', 'readCache.mode', 'warn'], env);
  assert.equal(setWarn.status, 0, setWarn.stdout + setWarn.stderr);

  const first = run(['compress', sample], env);
  assert.equal(first.status, 0, first.stdout + first.stderr);
  const second = run(['compress', sample], env);
  assert.equal(second.status, 0, second.stdout + second.stderr);

  const stats = run(['cache', 'stats'], env);
  assert.equal(stats.status, 0, stats.stdout + stats.stderr);
  const parsed = JSON.parse(stats.stdout);
  assert.equal(parsed.mode, 'warn');
  assert.ok((parsed.decisionCounts?.miss || 0) >= 1);
  assert.ok((parsed.decisionCounts?.hit_warn || 0) >= 1);

  fs.writeFileSync(path.join(ROOT, '.contextignore'), path.basename(sample) + '\n');
  try {
    const blocked = run(['compress', sample], env);
    assert.notEqual(blocked.status, 0);
    assert.match(blocked.stderr + blocked.stdout, /Blocked by \.contextignore/);
    const stats2 = JSON.parse(run(['cache', 'stats'], env).stdout);
    assert.ok((stats2.decisionCounts?.contextignore_block || 0) >= 1);
  } finally {
    fs.rmSync(path.join(ROOT, '.contextignore'), { force: true });
  }
});

test('context audit reports component breakdown in json and pretty', () => {
  const home = tmpHome();
  const env = {
    TTO_HOME: path.join(home, '.tto'),
    HOME: home,
    CODEX_HOME: path.join(home, '.codex')
  };
  fs.mkdirSync(path.join(home, '.codex'), { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'skills', 'demo'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'skills', 'demo', 'SKILL.md'), '# demo skill\ncontent');
  fs.writeFileSync(path.join(ROOT, 'MEMORY.md'), '# memory\ncontent');
  fs.writeFileSync(path.join(env.CODEX_HOME, 'AGENTS.md'), '# agents\ncontent');
  fs.writeFileSync(path.join(env.CODEX_HOME, 'config.toml'), '[features]\ncodex_hooks=true\n');

  try {
    const jsonOut = run(['context'], env);
    assert.equal(jsonOut.status, 0, jsonOut.stdout + jsonOut.stderr);
    const parsed = JSON.parse(jsonOut.stdout);
    assert.ok(Array.isArray(parsed.components));
    const names = parsed.components.map(c => c.name);
    assert.ok(names.includes('skills'));
    assert.ok(names.includes('config'));
    assert.ok(names.includes('agents'));

    const prettyOut = run(['context', '--pretty'], env);
    assert.equal(prettyOut.status, 0, prettyOut.stdout + prettyOut.stderr);
    assert.match(prettyOut.stdout, /Context Audit/);
    assert.match(prettyOut.stdout, /Components/);
  } finally {
    fs.rmSync(path.join(ROOT, 'skills', 'demo'), { recursive: true, force: true });
    fs.rmSync(path.join(ROOT, 'MEMORY.md'), { force: true });
  }
});

test('coach mode renders guided remediation and can apply quick fixes', () => {
  const home = tmpHome();
  const env = { TTO_HOME: path.join(home, '.tto'), HOME: home };

  const pretty = run(['coach', '--pretty'], env);
  assert.equal(pretty.status, 0, pretty.stdout + pretty.stderr);
  assert.match(pretty.stdout, /Coach Mode/);
  assert.match(pretty.stdout, /Anti-patterns/);
  assert.match(pretty.stdout, /Fix Plan/);
  assert.match(pretty.stdout, /output_waste|tool_cascade|low_saving_cluster|No major anti-pattern/);

  const applyQuick = run(['coach', '--apply', 'quick'], env);
  assert.equal(applyQuick.status, 0, applyQuick.stdout + applyQuick.stderr);
  const parsed = JSON.parse(applyQuick.stdout);
  assert.equal(parsed.remediation.mode, 'quick');
  assert.ok(Array.isArray(parsed.remediation.actions));
  assert.ok(parsed.antiPatterns.every(a => a.id !== 'none') || parsed.antiPatterns.length === 1);
});

test('fleet view summarizes multiple project roots', () => {
  const home = tmpHome();
  const env = { TTO_HOME: path.join(home, '.tto'), HOME: home };
  const p1 = path.join(home, 'repo-a');
  const p2 = path.join(home, 'repo-b');
  fs.mkdirSync(path.join(p1, 'benchmarks'), { recursive: true });
  fs.mkdirSync(path.join(p2, 'benchmarks'), { recursive: true });
  fs.mkdirSync(path.join(p1, '.tto'), { recursive: true });
  fs.mkdirSync(path.join(p2, '.tto'), { recursive: true });
  fs.mkdirSync(path.join(p1, '.codex-plugin'), { recursive: true });
  fs.mkdirSync(path.join(p1, '.codex', 'sessions'), { recursive: true });
  fs.mkdirSync(path.join(p2, '.claude-plugin'), { recursive: true });
  fs.mkdirSync(path.join(p2, '.claude', 'projects'), { recursive: true });
  fs.writeFileSync(path.join(p1, 'package.json'), JSON.stringify({ name: 'repo-a', version: '2.0.0' }));
  fs.writeFileSync(path.join(p2, 'package.json'), JSON.stringify({ name: 'repo-b', version: '2.0.0' }));
  fs.writeFileSync(path.join(p1, 'benchmarks', 'regression_report.json'), JSON.stringify({
    strictResult: { ok: true, avgSaving: 50 },
    mtpResult: { gateOk: true },
    actionRouting: { gateOk: true },
    wasteSignals: []
  }));
  fs.writeFileSync(path.join(p1, '.tto', 'calibration.jsonl'), JSON.stringify({ ts: new Date().toISOString(), gapPct: 8.2 }) + '\n');
  fs.writeFileSync(path.join(p2, '.tto', 'calibration.jsonl'), JSON.stringify({ ts: new Date().toISOString(), gapPct: 22.5 }) + '\n');
  fs.writeFileSync(path.join(p1, '.codex', 'sessions', 'run1.jsonl'), [
    JSON.stringify({ type: 'user', timestamp: new Date().toISOString(), message: { content: 'start' } }),
    JSON.stringify({ type: 'assistant', message: { model: 'gpt-5.5', usage: { input_tokens: 7000, output_tokens: 20 } } })
  ].join('\n') + '\n');
  fs.writeFileSync(path.join(p1, '.codex', 'sessions', 'run2.jsonl'), [
    JSON.stringify({ type: 'user', timestamp: new Date().toISOString(), message: { content: 'start' } }),
    JSON.stringify({ type: 'assistant', message: { model: 'gpt-5.5', usage: { input_tokens: 8000, output_tokens: 30 } } })
  ].join('\n') + '\n');

  const fleet = run(['fleet', '--pretty', '--roots', `${p1},${p2}`], env);
  assert.equal(fleet.status, 0, fleet.stdout + fleet.stderr);
  assert.match(fleet.stdout, /Fleet \/ Organization View/);
  assert.match(fleet.stdout, /repo-a@2.0.0/);

  const fleetDoctor = run(['fleet', '--pretty', '--roots', `${p1},${p2}`, '--doctor', '--doctor-target', 'codex'], env);
  assert.equal(fleetDoctor.status, 0, fleetDoctor.stdout + fleetDoctor.stderr);
  assert.match(fleetDoctor.stdout, /Doctor\s+ON/);
  const fleetCal = run(['fleet', '--pretty', '--roots', `${p1},${p2}`, '--calibration'], env);
  assert.equal(fleetCal.status, 0, fleetCal.stdout + fleetCal.stderr);
  assert.match(fleetCal.stdout, /Calibration\s+ON/);
  assert.match(fleetCal.stdout, /SessionScan\s+ON/);
  assert.match(fleetCal.stdout, /Detectors/);

  const dashboardFleet = run(['dashboard', '--view', 'fleet', '--roots', `${p1},${p2}`, '--pretty'], env);
  assert.equal(dashboardFleet.status, 0, dashboardFleet.stdout + dashboardFleet.stderr);
  assert.match(dashboardFleet.stdout, /Fleet \/ Organization View/);
});

test('real session calibration commands work and feed quality weak signal', () => {
  const home = tmpHome();
  const env = { TTO_HOME: path.join(home, '.tto'), HOME: home };

  const rec = run(['calibration', 'record', '--estimated', '1000', '--real', '1600', '--target', 'codex'], env);
  assert.equal(rec.status, 0, rec.stdout + rec.stderr);
  const recObj = JSON.parse(rec.stdout);
  assert.equal(recObj.target, 'codex');

  const statusPretty = run(['calibration', 'status', '--pretty'], env);
  assert.equal(statusPretty.status, 0, statusPretty.stdout + statusPretty.stderr);
  assert.match(statusPretty.stdout, /Real Session Calibration/);

  const quality = run(['quality'], env);
  assert.equal(quality.status, 0, quality.stdout + quality.stderr);
  const q = JSON.parse(quality.stdout);
  assert.ok(Array.isArray(q.weakSignals));
  assert.ok(q.weakSignals.includes('real_session_calibration_gap_high'));
});

test('ops analytics command family maps to analytics surfaces', () => {
  const home = tmpHome();
  const env = { TTO_HOME: path.join(home, '.tto'), HOME: home };

  const scan = run(['ops', 'scan', '--pretty'], env);
  assert.equal(scan.status, 0, scan.stdout + scan.stderr);
  assert.match(scan.stdout, /Fleet \/ Organization View/);

  const audit = run(['ops', 'audit', 'codex', '--pretty'], env);
  assert.ok(audit.status === 0 || audit.status === 1, audit.stdout + audit.stderr);
  assert.match(audit.stdout, /Thai Token Optimizer Doctor/);

  const context = run(['ops', 'context', '--pretty'], env);
  assert.equal(context.status, 0, context.stdout + context.stderr);
  assert.match(context.stdout, /Context Audit/);

  const quality = run(['ops', 'quality', '--pretty'], env);
  assert.equal(quality.status, 0, quality.stdout + quality.stderr);
  assert.match(quality.stdout, /TTO Quality Score/);

  const drift = run(['ops', 'drift', '--pretty'], env);
  assert.equal(drift.status, 0, drift.stdout + drift.stderr);
  assert.match(drift.stdout, /Trend/);

  const oneShot = run(['ops', '--pretty'], env);
  assert.equal(oneShot.status, 0, oneShot.stdout + oneShot.stderr);
  assert.match(oneShot.stdout, /Thai Token Optimizer v2\.0/);
  assert.match(oneShot.stdout, /TTO Quality Score/);
  assert.match(oneShot.stdout, /Fleet \/ Organization View/);
});
