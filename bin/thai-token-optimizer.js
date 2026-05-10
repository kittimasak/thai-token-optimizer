#!/usr/bin/env node
/**
 * ============================================================================
 * Thai Token Optimizer v1.0
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
const { renderStatus, renderDashboard, renderDoctor, renderCompress, renderBenchmark, renderSafety } = require('../hooks/tto-ui');

const NAME = 'Thai Token Optimizer';
const VERSION_LABEL = 'v1.0';

function usage() {
  console.log(`thai-token-optimizer ${VERSION_LABEL} <command> [target]

Commands:
  on|auto                 Enable auto mode
  lite                    Enable lite mode
  full                    Enable full mode
  safe                    Enable safe mode
  off|stop                Disable optimizer
  status [--pretty]       Show state
  ui|dashboard            Show pretty terminal dashboard
  doctor [target] [--pretty] Health check target: all|codex|claude|gemini|opencode
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
  compress [--pretty] [--level auto|lite|full|safe] [--budget N] [--target codex|claude] [--check] [text|file]
  rewrite                 Alias of compress
  preserve <originalFile> <optimizedFile> Check semantic preservation
  classify [--pretty] <text> Run safety classifier
  benchmark [--pretty] [--strict] [--default-policy] Run benchmark

Pretty UI:
  tto ui
  tto status --pretty
  tto doctor --pretty
  tto doctor codex --pretty
  tto compress --pretty --budget 500 prompt.txt
  tto classify --pretty "DROP TABLE users production"
  tto benchmark --pretty --strict --default-policy

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
  addHookEvent(hooks.hooks, 'SessionStart', { matcher: 'startup|resume|clear', hooks: [commandHook('tto-activate.js', 5, 'Loading Thai Token Optimizer v1.0')] });
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
  addHookEvent(settings.hooks, 'SessionStart', { hooks: [commandHook('tto-activate.js', 5, 'Loading Thai Token Optimizer v1.0')] });
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
function normalizeTarget(arg) { const target = (arg || 'codex').toLowerCase(); const valid = VALID_TARGETS || ['codex', 'claude', 'cursor', 'aider', 'opencode', 'gemini', 'cline', 'roo', 'all']; if (valid.includes(target)) return target; console.error('Target must be: ' + valid.join(', ')); process.exit(1); }
function installAdapter(target) { const { installAdapter } = require('../adapters'); return installAdapter(target); }
function uninstallAdapter(target) { const { uninstallAdapter } = require('../adapters'); return uninstallAdapter(target); }
function install(target) {
  const mf = makeBackup(target);
  console.log(`Backup created: ${mf.id}`);
  if (target === 'codex' || target === 'all') installCodex();
  if (target === 'claude' || target === 'all') installClaude();
  // Adapter installation must run exactly once.
  // Previous v1.0 pack called installAdapter('all') twice for `tto install all`,
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
function textFromArgsOrFile(args) { const stdin = readStdinSyncIfPiped(); if (stdin.trim()) return stdin; const joined = args.join(' '); if (args.length === 1 && fs.existsSync(args[0]) && fs.statSync(args[0]).isFile()) return fs.readFileSync(args[0], 'utf8'); return joined; }
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
  validateKnownOptions(args, { valueOptions: ['--level', '--target', '--budget'], flags: ['--check', '--exact', '--pretty'] });
  const level = parseOption(args, '--level', 'auto');
  const target = parseOption(args, '--target', 'generic');
  const budgetRaw = parseOption(args, '--budget', '0');
  const exact = hasFlag(args, '--exact') || getPolicy().exactTokenizer;
  const pretty = hasFlag(args, '--pretty');
  const budget = Number(budgetRaw || 0);
  let cleanArgs = argsWithoutOption(args, '--level');
  cleanArgs = argsWithoutOption(cleanArgs, '--target');
  cleanArgs = argsWithoutOption(cleanArgs, '--budget');
  cleanArgs = argsWithoutFlags(cleanArgs, ['--exact', '--pretty']);
  const check = hasFlag(cleanArgs, '--check');
  cleanArgs = argsWithoutFlags(cleanArgs, ['--check']);
  const text = textFromArgsOrFile(cleanArgs);
  const result = budget > 0 ? compressToBudget(text, { level, target, budget }) : { optimized: compressPrompt(text, { level }), savings: null, preservation: null };
  const optimized = result.optimized;
  const stats = result.savings || estimateSavings(text, optimized, target, { exact });
  const preservation = result.preservation || checkPreservation(text, optimized);
  if (pretty) {
    console.log(renderCompress({ target, level, budget, stats, preservation, optimized }));
  } else {
    console.log(optimized);
    console.error(`\n${NAME} ${VERSION_LABEL}: saved ~${stats.savedTokens} tokens (${stats.savingPercent}%)`);
    if (budget > 0) console.error(`Budget: ${budget}; after: ${stats.after.estimatedTokens}; target: ${target}`);
    if (check) console.error(`Preservation: ${preservation.preservationPercent}% (${preservation.risk}); missing: ${preservation.missingCount}`);
  }
}
function runPreserve(args) {
  const [a, b] = args;
  if (!a || !b) { console.error('Usage: tto preserve original.txt optimized.txt'); process.exit(1); }
  console.log(JSON.stringify(checkPreservation(fs.readFileSync(a, 'utf8'), fs.readFileSync(b, 'utf8')), null, 2));
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
  validateKnownOptions(args, { flags: ['--strict', '--default-policy', '--pretty'] });
  const root = path.resolve(__dirname, '..');
  const benchScript = path.join(root, 'benchmarks', 'run_benchmark.js');
  const r = require(benchScript).runBenchmark({ strict: hasFlag(args, '--strict'), defaultPolicy: hasFlag(args, '--default-policy'), silent: hasFlag(args, '--pretty') });
  if (hasFlag(args, '--pretty')) console.log(renderBenchmark(r));
  if (r && r.strict && !r.strict.ok) process.exitCode = 1;
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
  if (!dict.keep.includes(word)) {
    dict.keep.push(word);
    setDictionary(dict);
  }
  console.log(JSON.stringify({ added: word, dictionary: dict }, null, 2));
}
function runForget(args) {
  const word = args.join(' ').trim();
  if (!word) { console.error('Usage: tto forget <word>'); process.exit(1); }
  const dict = getDictionary();
  const index = dict.keep.indexOf(word);
  if (index >= 0) {
    dict.keep.splice(index, 1);
    setDictionary(dict);
  }
  console.log(JSON.stringify({ removed: word, dictionary: dict }, null, 2));
}
function runConfig(args) { const sub = (args[0] || 'get').toLowerCase(); if (sub === 'path') return console.log(POLICY_PATH); if (sub === 'init') return console.log(ensurePolicy()); if (sub === 'get') return console.log(JSON.stringify(getPolicy(), null, 2)); if (sub === 'set') { if (!args[1] || args[2] === undefined) { console.error('Usage: tto config set <key> <value>'); process.exit(1); } return console.log(JSON.stringify(setPolicyPathValue(args[1], args[2]), null, 2)); } console.error('Usage: tto config get|set <key> <value>|path|init'); process.exit(1); }

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
  else if (cmd === 'ui' || cmd === 'dashboard') { const result = runDoctor({ ci: false }); console.log(renderDashboard(getState(), result)); }
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
