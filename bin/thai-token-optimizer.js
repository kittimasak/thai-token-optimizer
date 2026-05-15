#!/usr/bin/env node
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


const fs = require('fs');
const path = require('path');
const os = require('os');
const { getState, setState, STATE_PATH, STATS_PATH, HOME_DIR, getDictionary, setDictionary } = require('../hooks/tto-config');
const { estimateTokens, estimateSavings } = require('../hooks/tto-token-estimator');
const { compressPrompt } = require('../hooks/tto-compressor');
const { compressToBudget } = require('../hooks/tto-budget-compressor');
const { classifyText } = require('../hooks/tto-safety-classifier');
const { checkPreservation } = require('../hooks/tto-preservation-checker');
const { makeBackup, listBackups, selectRollback, restoreFiles, VALID_TARGETS } = require('../hooks/tto-backup');
const { runDoctor, formatDoctor } = require('../hooks/tto-doctor');
const { getPolicy, setPolicy, setPolicyPathValue, ensurePolicy, POLICY_PATH } = require('../hooks/tto-policy');
const { listProfiles, setProfile, describeProfile } = require('../hooks/tto-profiles');
const { buildContextAudit } = require('../hooks/tto-context-audit');
const { buildFleetAudit } = require('../hooks/tto-fleet-audit');
const { summarizeCalibration, recordCalibration, recordFromStatsRealTotal, clearCalibration } = require('../hooks/tto-calibration');
const {
  captureCheckpoint,
  listCheckpoints,
  checkpointStatus,
  restoreCheckpoint,
  capturePreCompactCheckpoint,
  capturePostCompactCheckpoint,
  readTextWithCache,
  computeQualityEngine,
  logCacheRead,
  cacheStats,
  clearCacheReads
} = require('../hooks/tto-runtime-analytics');
const { renderStatus, renderDashboard, renderDashboardView, renderQuality, renderDoctor, renderCompress, renderBenchmark, renderSafety, renderCheckpoint, renderCacheStats, renderContextAudit, renderCoach, renderFleet, renderCalibration } = require('../hooks/tto-ui');

const NAME = 'Thai Token Optimizer';
const VERSION_LABEL = 'v2.0.0';

function usage() {
  console.log(`thai-token-optimizer ${VERSION_LABEL} <command> [target]

Commands:
  on|auto                 Enable auto mode
  lite                    Enable lite mode
  full                    Enable full mode
  safe                    Enable safe mode
  off|stop                Disable optimizer
  status [--pretty]       Show state
  ui|dashboard [--view overview|quality|waste|trend|agents|doctor|fleet] Show terminal dashboard
  ops [--pretty] | scan|audit|context|quality|drift|validate [options] Operations analytics command family
  fleet [--roots dir1,dir2] [--pretty] [--doctor] [--doctor-target all|codex|claude|gemini|opencode|openclaw|hermes] [--calibration] [--calibration-limit N] [--session-scan] Fleet/organization audit across projects
  doctor [target] [--pretty] Health check target: all|codex|claude|gemini|opencode|openclaw|hermes
  quality [--pretty]      Show quality score from benchmark artifacts
  coach [--pretty] [--apply quick|safe] Guided remediation plan (health + anti-pattern + fix plan)
  calibration status|record|from-stats|clear [--pretty]
  context [--pretty]      Deep context component audit (skills/mcp/config/memory/agents/tools)
  checkpoint status|list|capture|restore|precompact|postcompact [--pretty]
  cache stats|clear [--pretty]
  backup [target]         Create config backup
  backups                 List backups
  rollback [latest|id|target] [--dry-run] Restore backup
  install <target|all>    Install hooks/adapters with backup
  uninstall <target|all>  Remove hooks/adapters with backup
  install-agents [codex]  Merge AGENTS.md into ~/.codex/AGENTS.md with backup
  keep <word>             Add a word to personal dictionary (never compress)
  forget <word>           Remove a word from personal dictionary
  dictionary              List personal dictionary words
  estimate [--target codex|claude] [--exact] <text> Estimate tokens
  compress [--pretty] [--level auto|lite|full|safe] [--budget N] [--target codex|claude] [--check] [--speculative|--no-speculative] [--diagnostics] [text|file]
  rewrite                 Alias of compress
  preserve <originalFile> <optimizedFile> Check semantic preservation
  classify [--pretty] <text> Run safety classifier
  benchmark [--pretty] [--strict] [--default-policy] [--mtp] Run benchmark

Pretty UI:
  tto ui
  tto status --pretty
  tto doctor --pretty
  tto doctor codex --pretty
  tto compress --pretty --budget 500 prompt.txt
  tto classify --pretty "DROP TABLE users production"
  tto benchmark --pretty --strict --default-policy --mtp

Aliases:
  tto auto
  tto lite
  tto full
  tto off
`);
}

function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function writeJson(file, obj) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n'); }
function ensureCodexFeatureFlag(configPath) {
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  let text = fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf8') : '';
  const keyRe = /^\s*codex_hooks\s*=\s*(true|false)\s*$/m;
  if (keyRe.test(text)) {
    const next = text.replace(keyRe, 'codex_hooks = true');
    if (next !== text) { fs.writeFileSync(configPath, next); return true; }
    return false;
  }
  if (/^\s*\[features\]\s*$/m.test(text)) text = text.replace(/(^\s*\[features\]\s*$)/m, '$1\ncodex_hooks = true');
  else text = (text.trimEnd() + '\n\n[features]\ncodex_hooks = true\n').replace(/^\n+/, '');
  fs.writeFileSync(configPath, text);
  return true;
}
function hookCommand(file) { const root = path.resolve(__dirname, '..'); return `node ${JSON.stringify(path.join(root, 'hooks', file))}`; }
function isTtoEntry(entry) { const s = JSON.stringify(entry); return s.includes('tto-') || s.includes('thai-token-optimizer'); }
function commandHook(file, timeout = 5, statusMessage) { const hook = { type: 'command', command: hookCommand(file), timeout }; if (statusMessage) hook.statusMessage = statusMessage; return hook; }
function addHookEvent(container, eventName, entry) { container[eventName] ||= []; container[eventName] = container[eventName].filter(e => !isTtoEntry(e)).concat(entry); }

function installCodex() {
  const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
  const hooksPath = path.join(codexHome, 'hooks.json');
  const configPath = path.join(codexHome, 'config.toml');
  const hooks = readJson(hooksPath, { hooks: {} });
  hooks.hooks ||= {};
  addHookEvent(hooks.hooks, 'SessionStart', { matcher: 'startup|resume|clear', hooks: [commandHook('tto-activate.js', 5, 'Loading Thai Token Optimizer v2.0')] });
  addHookEvent(hooks.hooks, 'UserPromptSubmit', { hooks: [commandHook('tto-mode-tracker.js', 5)] });
  addHookEvent(hooks.hooks, 'PreToolUse', { hooks: [commandHook('tto-pretool-guard.js', 5)] });
  addHookEvent(hooks.hooks, 'PostToolUse', { hooks: [commandHook('tto-posttool-summary.js', 5)] });
  addHookEvent(hooks.hooks, 'Stop', { hooks: [commandHook('tto-stop-summary.js', 5)] });
  writeJson(hooksPath, hooks);
  const changed = ensureCodexFeatureFlag(configPath);
  console.log(`Installed ${NAME} ${VERSION_LABEL} for Codex:\n- ${hooksPath}\n- ${configPath}${changed ? ' (enabled codex_hooks)' : ''}`);
}
function uninstallCodex() {
  const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
  const hooksPath = path.join(codexHome, 'hooks.json');
  const hooks = readJson(hooksPath, { hooks: {} });
  for (const ev of ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'Stop']) if (Array.isArray(hooks.hooks?.[ev])) hooks.hooks[ev] = hooks.hooks[ev].filter(e => !isTtoEntry(e));
  writeJson(hooksPath, hooks);
  console.log(`Removed ${NAME} Codex entries from ${hooksPath}.`);
}
function installClaude() {
  const claudeHome = process.env.CLAUDE_HOME || path.join(os.homedir(), '.claude');
  const settingsPath = path.join(claudeHome, 'settings.json');
  const settings = readJson(settingsPath, {});
  settings.hooks ||= {};
  addHookEvent(settings.hooks, 'SessionStart', { hooks: [commandHook('tto-activate.js', 5, 'Loading Thai Token Optimizer v2.0')] });
  addHookEvent(settings.hooks, 'UserPromptSubmit', { hooks: [commandHook('tto-mode-tracker.js', 5)] });
  addHookEvent(settings.hooks, 'PreToolUse', { hooks: [commandHook('tto-pretool-guard.js', 5)] });
  addHookEvent(settings.hooks, 'PostToolUse', { hooks: [commandHook('tto-posttool-summary.js', 5)] });
  addHookEvent(settings.hooks, 'Stop', { hooks: [commandHook('tto-stop-summary.js', 5)] });
  writeJson(settingsPath, settings);
  console.log(`Installed ${NAME} ${VERSION_LABEL} for Claude Code:\n- ${settingsPath}`);
}
function uninstallClaude() {
  const claudeHome = process.env.CLAUDE_HOME || path.join(os.homedir(), '.claude');
  const settingsPath = path.join(claudeHome, 'settings.json');
  const settings = readJson(settingsPath, {});
  for (const ev of ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'Stop']) if (Array.isArray(settings.hooks?.[ev])) settings.hooks[ev] = settings.hooks[ev].filter(e => !isTtoEntry(e));
  writeJson(settingsPath, settings);
  console.log(`Removed ${NAME} Claude Code entries from ${settingsPath}.`);
}
function normalizeTarget(arg) { const target = (arg || 'codex').toLowerCase(); const valid = VALID_TARGETS || ['codex', 'claude', 'cursor', 'aider', 'opencode', 'openclaw', 'hermes', 'gemini', 'cline', 'roo', 'all']; if (valid.includes(target)) return target; console.error('Target must be: ' + valid.join(', ')); process.exit(1); }
function installAdapter(target) { const { installAdapter } = require('../adapters'); return installAdapter(target); }
function uninstallAdapter(target) { const { uninstallAdapter } = require('../adapters'); return uninstallAdapter(target); }
function install(target) {
  const mf = makeBackup(target);
  console.log(`Backup created: ${mf.id}`);
  if (target === 'codex' || target === 'all') installCodex();
  if (target === 'claude' || target === 'all') installClaude();
  // Adapter installation must run exactly once.
  // Previous v2.0 pack called installAdapter('all') twice for `tto install all`,
  // causing duplicate backups/writes for Gemini/OpenCode and other adapters.
  if (target === 'all') installAdapter('all');
  else if (!['codex', 'claude'].includes(target)) installAdapter(target);
  console.log('\nRestart the target CLI, then type: token thai auto');
}
function uninstall(target) {
  const mf = makeBackup(target);
  console.log(`Backup created: ${mf.id}`);
  if (target === 'codex' || target === 'all') uninstallCodex();
  if (target === 'claude' || target === 'all') uninstallClaude();
  if (target === 'all') uninstallAdapter('all');
  else if (!['codex', 'claude'].includes(target)) uninstallAdapter(target);
}
function readStdinSyncIfPiped() { try { if (!process.stdin.isTTY) return fs.readFileSync(0, 'utf8'); } catch (_) {} return ''; }
function parseOption(args, name, fallback) { const i = args.indexOf(name); if (i >= 0 && args[i + 1]) return args[i + 1]; return fallback; }
function hasFlag(args, name) { return args.includes(name); }
function argsWithoutOption(args, name) { const out = []; for (let i = 0; i < args.length; i++) { if (args[i] === name) { i++; continue; } out.push(args[i]); } return out; }
function argsWithoutFlags(args, flags) { return args.filter(x => !flags.includes(x)); }
function textFromArgsOrFile(args) {
  const stdin = readStdinSyncIfPiped();
  if (stdin.trim()) return stdin;
  const joined = args.join(' ');
  if (args.length === 1 && fs.existsSync(args[0]) && fs.statSync(args[0]).isFile()) {
    return readTextWithCache(args[0], { command: 'textFromArgsOrFile', cwd: process.cwd() }).content;
  }
  return joined;
}
function installAgents() {
  const mf = makeBackup('codex');
  const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
  const agentsPath = path.join(codexHome, 'AGENTS.md');
  const root = path.resolve(__dirname, '..');
  const sourcePath = path.join(root, 'AGENTS.md');
  const blockStart = '<!-- Thai Token Optimizer START -->';
  const blockEnd = '<!-- Thai Token Optimizer END -->';
  const source = fs.readFileSync(sourcePath, 'utf8').trim();
  const block = `${blockStart}\n${source}\n${blockEnd}`;
  fs.mkdirSync(path.dirname(agentsPath), { recursive: true });
  let current = fs.existsSync(agentsPath) ? fs.readFileSync(agentsPath, 'utf8') : '';
  const re = new RegExp(`${blockStart}[\\s\\S]*?${blockEnd}`, 'm');
  current = re.test(current) ? current.replace(re, block) : `${current.trimEnd()}\n\n${block}\n`;
  fs.writeFileSync(agentsPath, current.replace(/^\n+/, ''));
  console.log(`Backup created: ${mf.id}`);
  console.log(`Installed ${NAME} ${VERSION_LABEL} AGENTS block to ${agentsPath}`);
}
function runEstimate(args) {
  validateKnownOptions(args, { valueOptions: ['--target'], flags: ['--exact'] });
  const target = parseOption(args, '--target', 'generic');
  const exact = hasFlag(args, '--exact') || getPolicy().exactTokenizer;
  let cleanArgs = argsWithoutOption(args, '--target');
  cleanArgs = argsWithoutFlags(cleanArgs, ['--exact', '--pretty']);
  const text = textFromArgsOrFile(cleanArgs);
  console.log(JSON.stringify(estimateTokens(text, target, { exact }), null, 2));
}

function validateKnownOptions(args, spec) {
  const valueOptions = new Set(spec.valueOptions || []);
  const flags = new Set(spec.flags || []);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!String(a).startsWith('--')) continue;
    if (valueOptions.has(a)) {
      if (i + 1 >= args.length || String(args[i + 1]).startsWith('--')) throw new Error(`Missing value for ${a}`);
      i += 1;
      continue;
    }
    if (flags.has(a)) continue;
    throw new Error(`Unknown option: ${a}`);
  }
}
function runCompress(args) {
  validateKnownOptions(args, { valueOptions: ['--level', '--target', '--budget'], flags: ['--check', '--exact', '--pretty', '--speculative', '--no-speculative', '--diagnostics'] });
  const level = parseOption(args, '--level', 'auto');
  const target = parseOption(args, '--target', 'generic');
  const budgetRaw = parseOption(args, '--budget', '0');
  const exact = hasFlag(args, '--exact') || getPolicy().exactTokenizer;
  const pretty = hasFlag(args, '--pretty');
  const diagnostics = hasFlag(args, '--diagnostics');
  const stateSpeculative = Boolean(getState().speculative);
  const forceSpec = hasFlag(args, '--speculative');
  const forceNoSpec = hasFlag(args, '--no-speculative');
  const speculative = forceNoSpec ? false : (forceSpec || stateSpeculative);
  const budget = Number(budgetRaw || 0);
  let cleanArgs = argsWithoutOption(args, '--level');
  cleanArgs = argsWithoutOption(cleanArgs, '--target');
  cleanArgs = argsWithoutOption(cleanArgs, '--budget');
  cleanArgs = argsWithoutFlags(cleanArgs, ['--exact', '--pretty', '--speculative', '--no-speculative', '--diagnostics']);
  const check = hasFlag(cleanArgs, '--check');
  cleanArgs = argsWithoutFlags(cleanArgs, ['--check']);
  const text = textFromArgsOrFile(cleanArgs);
  const result = budget > 0 || speculative
    ? compressToBudget(text, { level, target, budget, speculative, diagnostics })
    : { optimized: compressPrompt(text, { level }), savings: null, preservation: null };
  const optimized = result.optimized;
  const stats = result.savings || estimateSavings(text, optimized, target, { exact });
  const preservation = result.preservation || checkPreservation(text, optimized);
  if (pretty) {
    console.log(renderCompress({ target, level: result.level || level, budget, stats, preservation, optimized, speculative: result.speculative }));
    if (diagnostics && result.diagnostics) console.log('\n' + JSON.stringify(result.diagnostics, null, 2));
  } else {
    console.log(optimized);
    console.error(`\n${NAME} ${VERSION_LABEL}: saved ~${stats.savedTokens} tokens (${stats.savingPercent}%)`);
    if (budget > 0) console.error(`Budget: ${budget}; after: ${stats.after.estimatedTokens}; target: ${target}`);
    if (result.speculative) console.error(`Mode: Speculative (Candidate: ${result.level})`);
    if (forceNoSpec) console.error('Mode: Forced non-speculative (--no-speculative)');
    if (diagnostics && result.diagnostics) console.error('Diagnostics:\n' + JSON.stringify(result.diagnostics, null, 2));
    if (check) console.error(`Preservation: ${preservation.preservationPercent}% (${preservation.risk}); missing: ${preservation.missingCount}`);
  }
}
function runPreserve(args) {
  const [a, b] = args;
  if (!a || !b) { console.error('Usage: tto preserve original.txt optimized.txt'); process.exit(1); }
  const original = readTextWithCache(a, { command: 'preserve.original', cwd: process.cwd() }).content;
  const optimized = readTextWithCache(b, { command: 'preserve.optimized', cwd: process.cwd() }).content;
  console.log(JSON.stringify(checkPreservation(original, optimized), null, 2));
}
function runClassify(args) {
  validateKnownOptions(args, { flags: ['--pretty'] });
  const pretty = hasFlag(args, '--pretty');
  const cleanArgs = argsWithoutFlags(args, ['--pretty']);
  const text = textFromArgsOrFile(cleanArgs);
  const result = classifyText(text);
  console.log(pretty ? renderSafety(result) : JSON.stringify(result, null, 2));
}
function runDoctorCommand(args = []) {
  validateKnownOptions(args, { flags: ['--ci', '--pretty'] });
  const target = args.find(a => !String(a).startsWith('--')) || 'all';
  const result = runDoctor({ ci: hasFlag(args, '--ci'), target });
  console.log(hasFlag(args, '--pretty') ? renderDoctor(result) : formatDoctor(result));
  process.exitCode = result.ok ? 0 : 1;
}
function runBenchmark(args=[]) {
  validateKnownOptions(args, { flags: ['--strict', '--default-policy', '--pretty', '--mtp'] });
  const root = path.resolve(__dirname, '..');
  const benchScript = path.join(root, 'benchmarks', 'run_benchmark.js');
  const r = require(benchScript).runBenchmark({
    strict: hasFlag(args, '--strict'),
    defaultPolicy: hasFlag(args, '--default-policy'),
    mtp: hasFlag(args, '--mtp'),
    silent: hasFlag(args, '--pretty')
  });
  if (hasFlag(args, '--pretty')) console.log(renderBenchmark(r));
  if (r && r.strict && !r.strict.ok) process.exitCode = 1;
  if (hasFlag(args, '--mtp') && r && r.mtp && !r.mtp.gateOk) process.exitCode = 1;
}
function gradeFromScore(score) {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}
function readBenchmarkArtifact() {
  const local = path.join(process.cwd(), 'benchmarks', 'regression_report.json');
  if (fs.existsSync(local)) return readJson(local, null);
  const root = path.resolve(__dirname, '..');
  const p = path.join(root, 'benchmarks', 'regression_report.json');
  return readJson(p, null);
}
function readTrendHistory(limit = 8) {
  const local = path.join(process.cwd(), 'benchmarks', 'regression_history.jsonl');
  const p = fs.existsSync(local) ? local : path.join(path.resolve(__dirname, '..'), 'benchmarks', 'regression_history.jsonl');
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, 'utf8')
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean)
    .slice(-Math.max(1, limit))
    .reverse();
}
function buildQualityPayload(artifact) {
  const strictGate = Boolean(artifact?.strictResult?.ok);
  const mtpGate = Boolean(artifact?.mtpResult?.gateOk);
  const actionRoutingGate = Boolean(artifact?.actionRouting?.gateOk);
  const weakSignals = [];
  if (!strictGate) weakSignals.push('strict_gate_fail');
  if (!mtpGate) weakSignals.push('mtp_gate_fail');
  if (!actionRoutingGate) weakSignals.push('action_routing_fail');
  const ws = Array.isArray(artifact?.wasteSignals) ? artifact.wasteSignals : [];
  for (const s of ws) weakSignals.push(s.id || 'unknown_signal');
  const actions = Array.isArray(artifact?.actionSuggestions) ? artifact.actionSuggestions : [];
  const suggestedActions = actions
    .map(a => `${a.id || 'signal'}: ${a.action || a.message || a.suggestion || ''}`.trim())
    .filter(Boolean);
  let score = 100;
  if (!strictGate) score -= 20;
  if (!mtpGate) score -= 20;
  if (!actionRoutingGate) score -= 15;
  score -= Math.min(30, ws.length * 5);
  score = Math.max(0, Math.min(100, score));
  return {
    score,
    grade: gradeFromScore(score),
    strictGate,
    mtpGate,
    actionRoutingGate,
    weakSignals: [...new Set(weakSignals)],
    suggestedActions
  };
}
function runQualityCommand(args = []) {
  validateKnownOptions(args, { flags: ['--pretty'] });
  const artifact = readBenchmarkArtifact();
  const lifecycle = checkpointStatus().lifecycle;
  const cache = cacheStats(20);
  const quality2 = computeQualityEngine({ artifact, lifecycle, cache });
  const quality1 = artifact ? buildQualityPayload(artifact) : {
    score: 0, grade: 'F', strictGate: false, mtpGate: false, actionRoutingGate: false, weakSignals: ['missing_benchmark_artifact'], suggestedActions: ['run: tto benchmark --strict --default-policy --mtp']
  };
  const quality = {
    ...quality1,
    score: quality2.score,
    grade: quality2.grade,
    weakSignals: [...new Set([...(quality1.weakSignals || []), ...(quality2.weakSignals || [])])],
    suggestedActions: [...new Set([...(quality1.suggestedActions || []), ...(quality2.recommendations || [])])],
    stage1: quality2.stage1,
    stage2: quality2.stage2,
    distortion: quality2.distortion
  };
  const calibration = summarizeCalibration(50);
  quality.calibration = calibration;
  if (calibration.count > 0 && Number(calibration.avgGapPct || 0) > 20) {
    quality.weakSignals = [...new Set([...(quality.weakSignals || []), 'real_session_calibration_gap_high'])];
    quality.suggestedActions = [...new Set([...(quality.suggestedActions || []), 'Run `tto calibration from-stats --real-total <provider_tokens>` to re-calibrate estimator'])];
  }
  if (hasFlag(args, '--pretty')) console.log(renderQuality(quality));
  else console.log(JSON.stringify(quality, null, 2));
}
function buildCoachPayload() {
  const artifact = readBenchmarkArtifact();
  const lifecycle = checkpointStatus().lifecycle;
  const cache = cacheStats(20);
  const quality2 = computeQualityEngine({ artifact, lifecycle, cache });
  const quality1 = artifact ? buildQualityPayload(artifact) : {
    score: 0, grade: 'F', strictGate: false, mtpGate: false, actionRoutingGate: false, weakSignals: ['missing_benchmark_artifact'], suggestedActions: ['run: tto benchmark --strict --default-policy --mtp']
  };
  const quality = {
    ...quality1,
    score: quality2.score,
    grade: quality2.grade,
    weakSignals: [...new Set([...(quality1.weakSignals || []), ...(quality2.weakSignals || [])])],
    suggestedActions: [...new Set([...(quality1.suggestedActions || []), ...(quality2.recommendations || [])])],
    stage1: quality2.stage1,
    stage2: quality2.stage2,
    distortion: quality2.distortion
  };
  const weak = new Set(quality.weakSignals || []);
  const antiPatterns = [];
  if (weak.has('context_fill_high')) antiPatterns.push({ id: 'context_saturation', severity: 'high', owner: 'workflow-owner', detail: 'Context window fill risk is high' });
  if (weak.has('message_efficiency_low')) antiPatterns.push({ id: 'repeated_reads', severity: 'medium', owner: 'developer', detail: 'Repeated file reads reduce efficiency' });
  if (weak.has('compression_opportunity_high')) antiPatterns.push({ id: 'cache_policy_too_soft', severity: 'medium', owner: 'developer', detail: 'Read-cache warn hits indicate easy token savings remain' });
  if (weak.has('output_waste')) antiPatterns.push({ id: 'output_waste', severity: 'medium', owner: 'prompt-quality-owner', detail: 'Verbose outputs remain compressible' });
  if (weak.has('tool_cascade')) antiPatterns.push({ id: 'tool_cascade', severity: 'medium', owner: 'agent-runtime-owner', detail: 'Repeated tool cycles may add avoidable context' });
  if (weak.has('bad_decomposition')) antiPatterns.push({ id: 'bad_decomposition', severity: 'medium', owner: 'prompt-author', detail: 'Large prompts should be split into scoped tasks' });
  if (weak.has('low_saving_cluster')) antiPatterns.push({ id: 'low_saving_cluster', severity: 'medium', owner: 'compression-engine-owner', detail: 'Low-value narrative lines need stronger selective compression' });
  if (weak.has('routing_risk') || weak.has('action_routing_fail')) antiPatterns.push({ id: 'action_routing_risk', severity: 'high', owner: 'qa-owner', detail: 'Required actions are unresolved in benchmark routing' });
  if (weak.has('strict_gate_fail') || weak.has('mtp_gate_fail')) antiPatterns.push({ id: 'quality_gate_fail', severity: 'high', owner: 'maintainer', detail: 'One or more quality gates are failing' });
  if (!antiPatterns.length) antiPatterns.push({ id: 'none', severity: 'info', owner: 'system', detail: 'No major anti-pattern detected' });

  const fixPlan = [
    { id: 'step-1', action: 'Run `tto quality --pretty` and `tto dashboard --view quality` to inspect weak signals', severity: 'medium', owner: 'developer' },
    { id: 'step-2', action: 'Capture checkpoint before optimization: `tto checkpoint precompact`', severity: 'medium', owner: 'developer' }
  ];
  if (weak.has('message_efficiency_low') || weak.has('compression_opportunity_high')) {
    fixPlan.push({ id: 'step-3', action: 'Tighten cache policy and verify: `tto config set readCache.mode block` then `tto cache stats --pretty`', severity: 'high', owner: 'developer' });
  }
  if (weak.has('output_waste')) {
    fixPlan.push({ id: 'step-3a', action: 'Cap verbose answers and prefer compact templates for repeated explanations', severity: 'medium', owner: 'prompt-quality-owner' });
  }
  if (weak.has('tool_cascade')) {
    fixPlan.push({ id: 'step-3b', action: 'After repeated tool cycles, stop and summarize before continuing', severity: 'medium', owner: 'agent-runtime-owner' });
  }
  if (weak.has('bad_decomposition')) {
    fixPlan.push({ id: 'step-3c', action: 'Split monolithic prompts into 2-4 scoped tasks with explicit outputs', severity: 'medium', owner: 'prompt-author' });
  }
  if (weak.has('low_saving_cluster')) {
    fixPlan.push({ id: 'step-3d', action: 'Tune selective compression for low-value narrative blocks', severity: 'medium', owner: 'compression-engine-owner' });
  }
  if (weak.has('context_fill_high')) {
    fixPlan.push({ id: 'step-4', action: 'Compact session and capture continuity: `tto checkpoint postcompact`', severity: 'high', owner: 'developer' });
  }
  if (weak.has('strict_gate_fail') || weak.has('mtp_gate_fail') || weak.has('routing_risk') || weak.has('action_routing_fail')) {
    fixPlan.push({ id: 'step-5', action: 'Re-run benchmark gate: `tto benchmark --pretty --strict --default-policy --mtp`', severity: 'high', owner: 'qa-owner' });
  }

  return {
    healthScore: quality.score,
    healthGrade: quality.grade,
    quality,
    antiPatterns,
    fixPlan,
    summary: `grade=${quality.grade}; weak=${(quality.weakSignals || []).length}; antiPatterns=${antiPatterns.length}`
  };
}
function applyCoachFixes(mode, payload) {
  const actions = [];
  if (!mode) return { applied: false, mode: null, actions };
  if (mode === 'quick' || mode === 'safe') {
    const current = getPolicy();
    if ((current.readCache || {}).mode !== 'block') {
      setPolicyPathValue('readCache.mode', 'block');
      actions.push('set readCache.mode=block');
    }
    capturePreCompactCheckpoint({ note: `coach:${mode}` });
    actions.push('capture checkpoint precompact');
    if (mode === 'quick') {
      capturePostCompactCheckpoint({ note: 'coach:quick' });
      actions.push('capture checkpoint postcompact');
    }
  }
  return { applied: actions.length > 0, mode, actions };
}
function runCoachCommand(args = []) {
  validateKnownOptions(args, { valueOptions: ['--apply'], flags: ['--pretty'] });
  const mode = parseOption(args, '--apply', '');
  if (mode && !['quick', 'safe'].includes(mode)) throw new Error('Invalid --apply mode. Use quick|safe');
  const payload = buildCoachPayload();
  const remediation = applyCoachFixes(mode, payload);
  const out = { ...payload, remediation };
  if (hasFlag(args, '--pretty')) console.log(renderCoach(out));
  else console.log(JSON.stringify(out, null, 2));
}
function runDashboardCommand(args = []) {
  validateKnownOptions(args, { valueOptions: ['--view', '--roots', '--doctor-target', '--calibration-limit'], flags: ['--pretty', '--doctor', '--calibration', '--session-scan'] });
  const view = parseOption(args, '--view', 'overview');
  const rootsRaw = parseOption(args, '--roots', '');
  const roots = rootsRaw ? rootsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const fleet = buildFleetAudit(roots, {
    doctor: hasFlag(args, '--doctor'),
    doctorTarget: parseOption(args, '--doctor-target', 'all'),
    calibration: hasFlag(args, '--calibration'),
    calibrationLimit: Number(parseOption(args, '--calibration-limit', '50')),
    sessionScan: hasFlag(args, '--session-scan')
  });
  const state = getState();
  const doctor = runDoctor({ ci: false });
  const artifact = readBenchmarkArtifact();
  const historyRows = readTrendHistory(8);
  const qualityBase = artifact ? buildQualityPayload(artifact) : {
    score: 0, grade: 'F', strictGate: false, mtpGate: false, actionRoutingGate: false, weakSignals: ['missing_benchmark_artifact'], suggestedActions: ['run: tto benchmark --strict --default-policy --mtp']
  };
  const quality2 = computeQualityEngine({ artifact, lifecycle: checkpointStatus().lifecycle, cache: cacheStats(20) });
  const quality = {
    ...qualityBase,
    score: quality2.score,
    grade: quality2.grade,
    weakSignals: [...new Set([...(qualityBase.weakSignals || []), ...(quality2.weakSignals || [])])],
    suggestedActions: [...new Set([...(qualityBase.suggestedActions || []), ...(quality2.recommendations || [])])],
    stage1: quality2.stage1,
    stage2: quality2.stage2,
    distortion: quality2.distortion
  };
  const wasteSignals = Array.isArray(artifact?.wasteSignals) ? artifact.wasteSignals : [];
  const actionSuggestions = Array.isArray(artifact?.actionSuggestions) ? artifact.actionSuggestions : [];
  const agents = {
    rows: (doctor.checks || []).filter(c => /Codex|Claude|Gemini|OpenCode|OpenClaw|Hermes/i.test(String(c.name || ''))).map(c => ({ name: c.name, ok: !!c.ok, detail: c.detail || '' }))
  };
  const trend = {
    windowSize: historyRows.length,
    slowdown: historyRows.length ? `${historyRows[0].slowdownMeanMs} (latest)` : 'n/a',
    gain: historyRows.length ? `${historyRows[0].enhancedGainPercent} (latest)` : 'n/a',
    saving: historyRows.length ? `${historyRows[0].strictAvgSaving} (latest)` : 'n/a',
    rows: historyRows
  };
  const cpStatus = checkpointStatus();
  const cache = cacheStats(5);
  console.log(renderDashboardView(view, {
    state,
    doctor,
    quality,
    waste: {
      signals: wasteSignals,
      actions: actionSuggestions.map(a => `${a.id || 'signal'}: ${a.action || a.message || a.suggestion || ''}`.trim())
    },
    trend,
    agents,
    fleet,
    extras: {
      checkpointTotal: cpStatus.total,
      checkpointLatest: cpStatus.latest?.id || null,
      cacheRepeated: cache.repeatedFiles,
      cacheReads: cache.totalReads
    }
  }));
}
function runFleetCommand(args = []) {
  validateKnownOptions(args, { valueOptions: ['--roots', '--doctor-target', '--calibration-limit'], flags: ['--pretty', '--doctor', '--calibration', '--session-scan'] });
  const rootsRaw = parseOption(args, '--roots', '');
  const roots = rootsRaw ? rootsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const calibrationOn = hasFlag(args, '--calibration');
  const sessionScanOn = hasFlag(args, '--session-scan') || calibrationOn;
  const out = buildFleetAudit(roots, {
    doctor: hasFlag(args, '--doctor'),
    doctorTarget: parseOption(args, '--doctor-target', 'all'),
    calibration: calibrationOn,
    calibrationLimit: Number(parseOption(args, '--calibration-limit', '50')),
    sessionScan: sessionScanOn
  });
  if (hasFlag(args, '--pretty')) console.log(renderFleet(out));
  else console.log(JSON.stringify(out, null, 2));
}
function runCalibrationCommand(args = []) {
  validateKnownOptions(args, {
    valueOptions: ['--estimated', '--real', '--target', '--real-total', '--samples'],
    flags: ['--pretty']
  });
  const pretty = hasFlag(args, '--pretty');
  const positional = args.filter(a => !String(a).startsWith('--'));
  const sub = (positional[0] || 'status').toLowerCase();
  if (sub === 'status') {
    const out = summarizeCalibration(100);
    console.log(pretty ? renderCalibration(out) : JSON.stringify(out, null, 2));
    return;
  }
  if (sub === 'record') {
    const estimated = Number(parseOption(args, '--estimated', '0'));
    const real = Number(parseOption(args, '--real', '0'));
    if (!Number.isFinite(estimated) || !Number.isFinite(real) || real <= 0) throw new Error('Usage: tto calibration record --estimated N --real N [--target codex|claude|gemini|opencode]');
    const out = recordCalibration({ estimated, real, target: parseOption(args, '--target', 'generic'), source: 'manual' });
    console.log(JSON.stringify(out, null, 2));
    return;
  }
  if (sub === 'from-stats') {
    const realTotal = Number(parseOption(args, '--real-total', '0'));
    if (!Number.isFinite(realTotal) || realTotal <= 0) throw new Error('Usage: tto calibration from-stats --real-total N [--samples N] [--target codex|claude|gemini|opencode]');
    const sampleSize = Number(parseOption(args, '--samples', '20'));
    const out = recordFromStatsRealTotal({ realTotal, sampleSize, target: parseOption(args, '--target', 'generic') });
    console.log(JSON.stringify(out, null, 2));
    return;
  }
  if (sub === 'clear') {
    const out = clearCalibration();
    console.log(JSON.stringify(out, null, 2));
    return;
  }
  throw new Error('Usage: tto calibration status|record|from-stats|clear [--pretty]');
}
function runCheckpointCommand(args = []) {
  validateKnownOptions(args, { flags: ['--pretty'] });
  const pretty = hasFlag(args, '--pretty');
  const positional = args.filter(a => !String(a).startsWith('--'));
  const sub = (positional[0] || 'status').toLowerCase();
  const trailing = positional.slice(1);
  if (sub === 'status') {
    const st = checkpointStatus();
    const payload = {
      total: st.total,
      latestId: st.latest?.id || null,
      latestTs: st.latest?.ts || null,
      rows: st.latest ? [st.latest] : [],
      lifecycle: st.lifecycle
    };
    console.log(pretty ? renderCheckpoint(payload) : JSON.stringify(payload, null, 2));
    return;
  }
  if (sub === 'list') {
    const st = checkpointStatus();
    const rows = listCheckpoints(20);
    const payload = { total: rows.length, latestId: rows[0]?.id || null, rows, lifecycle: st.lifecycle };
    console.log(pretty ? renderCheckpoint(payload) : JSON.stringify(payload, null, 2));
    return;
  }
  if (sub === 'capture') {
    const note = trailing.join(' ');
    const row = captureCheckpoint(note, 'cli');
    console.log(pretty ? renderCheckpoint({ total: checkpointStatus().total, latestId: row.id, rows: [row] }) : JSON.stringify(row, null, 2));
    return;
  }
  if (sub === 'restore') {
    const target = trailing[0] || 'latest';
    const out = restoreCheckpoint(target);
    if (!out) throw new Error(`Checkpoint not found: ${target}`);
    console.log(pretty ? renderCheckpoint({ total: checkpointStatus().total, latestId: out.checkpoint.id, rows: [out.checkpoint] }) : JSON.stringify(out, null, 2));
    return;
  }
  if (sub === 'precompact') {
    const note = trailing.join(' ');
    const row = capturePreCompactCheckpoint({ note: note || undefined });
    console.log(pretty ? renderCheckpoint({ total: checkpointStatus().total, latestId: row.id, rows: [row] }) : JSON.stringify(row, null, 2));
    return;
  }
  if (sub === 'postcompact') {
    const note = trailing.join(' ');
    const row = capturePostCompactCheckpoint({ note: note || undefined });
    console.log(pretty ? renderCheckpoint({ total: checkpointStatus().total, latestId: row.id, rows: [row] }) : JSON.stringify(row, null, 2));
    return;
  }
  throw new Error('Usage: tto checkpoint status|list|capture|restore|precompact|postcompact [--pretty]');
}
function runCacheCommand(args = []) {
  validateKnownOptions(args, { flags: ['--pretty'] });
  const pretty = hasFlag(args, '--pretty');
  const sub = (args.find(a => !String(a).startsWith('--')) || 'stats').toLowerCase();
  if (sub === 'stats') {
    const out = cacheStats(10);
    console.log(pretty ? renderCacheStats(out) : JSON.stringify(out, null, 2));
    return;
  }
  if (sub === 'clear') {
    const out = clearCacheReads();
    console.log(pretty ? renderCacheStats(cacheStats(10)) : JSON.stringify(out, null, 2));
    return;
  }
  throw new Error('Usage: tto cache stats|clear [--pretty]');
}
function runContextCommand(args = []) {
  validateKnownOptions(args, { flags: ['--pretty'] });
  const audit = buildContextAudit({ cwd: process.cwd() });
  if (hasFlag(args, '--pretty')) console.log(renderContextAudit(audit));
  else console.log(JSON.stringify(audit, null, 2));
}
function runOpsCommand(args = []) {
  const looksLikeFlagOnly = args.length === 0 || String(args[0] || '').startsWith('--');
  const sub = looksLikeFlagOnly ? 'overview' : String(args[0] || 'scan').toLowerCase();
  const rest = looksLikeFlagOnly ? args : args.slice(1);
  if (sub === 'overview') {
    const pretty = rest.includes('--pretty');
    if (pretty) {
      runDashboardCommand(['--view', 'overview', '--doctor', '--calibration']);
      console.log('');
      runDashboardCommand(['--view', 'quality']);
      console.log('');
      runDashboardCommand(['--view', 'trend']);
      console.log('');
      runFleetCommand(['--pretty', '--doctor', '--calibration']);
      return;
    }
    const rootsRaw = parseOption(rest, '--roots', '');
    const roots = rootsRaw ? rootsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    const out = buildFleetAudit(roots, { doctor: true, doctorTarget: 'all', calibration: true, calibrationLimit: 50 });
    console.log(JSON.stringify(out, null, 2));
    return;
  }
  if (sub === 'scan') {
    const mapped = [...rest];
    if (!mapped.includes('--doctor')) mapped.push('--doctor');
    if (!mapped.includes('--calibration')) mapped.push('--calibration');
    if (!mapped.includes('--session-scan')) mapped.push('--session-scan');
    if (!mapped.includes('--pretty')) mapped.push('--pretty');
    return runFleetCommand(mapped);
  }
  if (sub === 'audit') {
    return runDoctorCommand(rest);
  }
  if (sub === 'context') {
    return runContextCommand(rest);
  }
  if (sub === 'quality') {
    return runQualityCommand(rest);
  }
  if (sub === 'drift') {
    const pretty = rest.includes('--pretty');
    const rows = readTrendHistory(12);
    const trend = {
      windowSize: rows.length,
      slowdown: rows.length ? `${rows[0].slowdownMeanMs} (latest)` : 'n/a',
      gain: rows.length ? `${rows[0].enhancedGainPercent} (latest)` : 'n/a',
      saving: rows.length ? `${rows[0].strictAvgSaving} (latest)` : 'n/a',
      rows
    };
    if (pretty) {
      console.log(renderDashboardView('trend', { trend }));
    } else {
      console.log(JSON.stringify(trend, null, 2));
    }
    return;
  }
  if (sub === 'validate') {
    const mapped = [...rest];
    if (!mapped.includes('--strict')) mapped.push('--strict');
    if (!mapped.includes('--default-policy')) mapped.push('--default-policy');
    if (!mapped.includes('--mtp')) mapped.push('--mtp');
    return runBenchmark(mapped);
  }
  throw new Error('Usage: tto ops [--pretty] | scan|audit|context|quality|drift|validate [options]');
}
function runBackup(args) { const target = normalizeTarget(args[0] || 'all'); const mf = makeBackup(target); console.log(JSON.stringify({ backup: mf.id, target: mf.target, files: mf.files.length, root: path.join(HOME_DIR, 'backups') }, null, 2)); }
function runBackups() { console.log(JSON.stringify(listBackups().map(b => ({ id: b.id, target: b.target, createdAt: b.createdAt, files: b.files.length })), null, 2)); }
function runRollback(args) {
  validateKnownOptions(args, { flags: ['--dry-run', '--yes', '--no-prebackup'] });
  const dryRun = hasFlag(args, '--dry-run');
  const noPrebackup = hasFlag(args, '--no-prebackup');
  const key = args.find(a => !String(a).startsWith('--')) || 'latest';
  const result = selectRollback(key);
  if (dryRun) {
    console.log(JSON.stringify({ dryRun: true, backup: result.manifest.id, backupTarget: result.manifest.target, target: result.requestedTarget || result.manifest.target, filtered: result.filtered, files: result.files.map(f => f.path) }, null, 2));
    return;
  }
  let pre = null;
  if (!noPrebackup) {
    const preTarget = result.requestedTarget || result.manifest.target || 'all';
    pre = makeBackup(preTarget);
  }
  restoreFiles(result.files);
  if (pre) console.log(`Pre-rollback backup created: ${pre.id}`);
  console.log(`Rolled back from backup: ${result.manifest.id}`);
  if (result.filtered) console.log(`Restored target scope: ${result.requestedTarget}`);
}

function runProfile(args) { const name = (args[0] || '').toLowerCase(); if (!name || name === 'show') return console.log(JSON.stringify(describeProfile(), null, 2)); if (name === 'list') return console.log(JSON.stringify(listProfiles(), null, 2)); const st = setProfile(name); console.log(JSON.stringify({ profile: st.profile, statePath: STATE_PATH, rules: describeProfile(name) }, null, 2)); }
function runDictionary() { console.log(JSON.stringify(getDictionary(), null, 2)); }
function runKeep(args) {
  const word = args.join(' ').trim();
  if (!word) { console.error('Usage: tto keep <word>'); process.exit(1); }
  const dict = getDictionary();
  const lower = word.toLowerCase();
  if (dict.keep.some(w => w.toLowerCase() === lower)) {
    console.log(JSON.stringify({ note: 'word already exists', dictionary: dict }, null, 2));
  } else {
    dict.keep.push(word);
    setDictionary(dict);
    console.log(JSON.stringify({ added: word, dictionary: dict }, null, 2));
  }
}
function runForget(args) {
  const word = args.join(' ').trim();
  if (!word) { console.error('Usage: tto forget <word>'); process.exit(1); }
  const dict = getDictionary();
  const lower = word.toLowerCase();
  const index = dict.keep.findIndex(w => w.toLowerCase() === lower);
  if (index >= 0) {
    const removed = dict.keep.splice(index, 1);
    setDictionary(dict);
    console.log(JSON.stringify({ removed: removed[0], dictionary: dict }, null, 2));
  } else {
    console.log(JSON.stringify({ note: 'word not found', dictionary: dict }, null, 2));
  }
}
function runConfig(args) {
  const sub = (args[0] || 'get').toLowerCase();
  if (sub === 'path') return console.log(POLICY_PATH);
  if (sub === 'init') return console.log(ensurePolicy());
  if (sub === 'get') {
    const policy = getPolicy();
    const key = args[1];
    if (key) {
      let cur = policy;
      for (const p of key.split('.')) {
        if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
        else { cur = undefined; break; }
      }
      if (cur === undefined) { console.error(`Key not found: ${key}`); process.exit(1); }
      return console.log(typeof cur === 'string' ? cur : JSON.stringify(cur, null, 2));
    }
    return console.log(JSON.stringify(policy, null, 2));
  }
  if (sub === 'set') {
    if (!args[1] || args[2] === undefined) { console.error('Usage: tto config set <key> <value>'); process.exit(1); }
    return console.log(JSON.stringify(setPolicyPathValue(args[1], args[2]), null, 2));
  }
  console.error('Usage: tto config get|set <key> <value>|path|init');
  process.exit(1);
}

const cmd = (process.argv[2] || 'status').toLowerCase();
const rest = process.argv.slice(3);
try {
  if (cmd === 'on' || cmd === 'auto') { setState({ enabled: true, level: 'auto' }); console.log(`${NAME} ${VERSION_LABEL}: ON auto`); }
  else if (cmd === 'lite') { setState({ enabled: true, level: 'lite' }); console.log(`${NAME} ${VERSION_LABEL}: ON lite`); }
  else if (cmd === 'full') { setState({ enabled: true, level: 'full' }); console.log(`${NAME} ${VERSION_LABEL}: ON full`); }
  else if (cmd === 'safe') { setState({ enabled: true, level: 'safe' }); console.log(`${NAME} ${VERSION_LABEL}: ON safe`); }
  else if (cmd === 'profile') runProfile(rest);
  else if (cmd === 'keep') runKeep(rest);
  else if (cmd === 'forget') runForget(rest);
  else if (cmd === 'dictionary') runDictionary();
  else if (cmd === 'config') runConfig(rest);
  else if (cmd === 'off' || cmd === 'stop') { setState({ enabled: false }); console.log(`${NAME} ${VERSION_LABEL}: OFF`); }
  else if (cmd === 'status') {
    const state = { name: NAME, versionLabel: VERSION_LABEL, statePath: STATE_PATH, statsPath: STATS_PATH, ...getState() };
    console.log(hasFlag(rest, '--pretty') ? renderStatus(state) : JSON.stringify(state, null, 2));
  }
  else if (cmd === 'ui' || cmd === 'dashboard') runDashboardCommand(rest);
  else if (cmd === 'quality') runQualityCommand(rest);
  else if (cmd === 'coach') runCoachCommand(rest);
  else if (cmd === 'ops') runOpsCommand(rest);
  else if (cmd === 'fleet') runFleetCommand(rest);
  else if (cmd === 'calibration') runCalibrationCommand(rest);
  else if (cmd === 'context') runContextCommand(rest);
  else if (cmd === 'checkpoint') runCheckpointCommand(rest);
  else if (cmd === 'cache') runCacheCommand(rest);
  else if (cmd === 'doctor') runDoctorCommand(rest);
  else if (cmd === 'backup') runBackup(rest);
  else if (cmd === 'backups') runBackups();
  else if (cmd === 'rollback') runRollback(rest);
  else if (cmd === 'install') install(normalizeTarget(rest[0]));
  else if (cmd === 'uninstall') uninstall(normalizeTarget(rest[0]));
  else if (cmd === 'install-agents') installAgents();
  else if (cmd === 'estimate') runEstimate(rest);
  else if (cmd === 'compress' || cmd === 'rewrite') runCompress(rest);
  else if (cmd === 'preserve') runPreserve(rest);
  else if (cmd === 'classify') runClassify(rest);
  else if (cmd === 'benchmark') runBenchmark(rest);
  else { usage(); process.exitCode = 1; }
} catch (e) {
  console.error(`${NAME} ${VERSION_LABEL} error: ${e.message}`);
  process.exitCode = 1;
}
