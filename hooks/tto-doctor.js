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
const { spawnSync } = require('child_process');
const { HOME_DIR, STATE_PATH, getState } = require('./tto-config');

function readJson(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } }
function hasTto(text) { return String(text || '').includes('thai-token-optimizer') || String(text || '').includes('tto-'); }
function checkWritable(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `.doctor-${Date.now()}-${process.pid}`);
    fs.writeFileSync(file, 'ok');
    fs.rmSync(file, { force: true });
    return true;
  } catch { return false; }
}
function fileOk(root, rel) { return fs.existsSync(path.join(root, rel)); }
function packageChecks(root, pkg) {
  return [
    { name: 'Package version remains 1.0.0', ok: pkg.version === '1.0.0', detail: pkg.version || 'missing', required: true },
    { name: 'Node >= 18', ok: Number(process.versions.node.split('.')[0]) >= 18, detail: process.versions.node, required: true },
    { name: 'CLI entry exists', ok: fileOk(root, 'bin/thai-token-optimizer.js'), detail: 'bin/thai-token-optimizer.js', required: true },
    { name: 'Backup module exists', ok: fileOk(root, 'hooks/tto-backup.js'), detail: 'hooks/tto-backup.js', required: true },
    { name: 'Adapter module exists', ok: fileOk(root, 'adapters/index.js'), detail: 'adapters/index.js', required: true },
    { name: 'Benchmark golden cases exist', ok: fileOk(root, 'benchmarks/golden_cases.jsonl'), detail: 'benchmarks/golden_cases.jsonl', required: true }
  ];
}
const DOCTOR_TARGETS = Object.freeze(['all', 'codex', 'claude', 'gemini', 'opencode', 'openclaw', 'hermes']);

function normalizeDoctorTarget(target = 'all') {
  const value = String(target || 'all').toLowerCase();
  if (DOCTOR_TARGETS.includes(value)) return value;
  throw new Error(`Doctor target must be: ${DOCTOR_TARGETS.join(', ')}`);
}

function hookGroups(container, eventName) {
  const groups = container?.[eventName];
  return Array.isArray(groups) ? groups : [];
}

function hookCommandsForEvent(container, eventName) {
  return hookGroups(container, eventName).flatMap(group => Array.isArray(group.hooks) ? group.hooks : []).map(h => h.command).filter(Boolean);
}

function commandUsesExpectedScript(commands, root, file) {
  const expected = path.join(root, 'hooks', file);
  return commands.some(command => String(command).includes(expected));
}

function scriptExists(root, file) {
  return fs.existsSync(path.join(root, 'hooks', file));
}

function simulateHook(root, file, input = '{}') {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-doctor-hook-'));
  try {
    const env = { ...process.env, TTO_HOME: tmpHome, THAI_TOKEN_OPTIMIZER_HOME: tmpHome };
    const script = path.join(root, 'hooks', file);
    const r = spawnSync(process.execPath, [script], { input, encoding: 'utf8', env, timeout: 5000 });
    return { ok: r.status === 0, detail: r.status === 0 ? file : `${file} exit ${r.status}: ${(r.stderr || '').trim()}` };
  } catch (e) {
    return { ok: false, detail: `${file}: ${e.message}` };
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
}

function addCommonRuntimeChecks(checks) {
  checks.push(
    { name: 'State directory writable', ok: checkWritable(HOME_DIR), detail: HOME_DIR, required: true },
    { name: 'State readable', ok: !!getState(), detail: STATE_PATH, required: true },
    { name: 'Backup directory writable', ok: checkWritable(path.join(HOME_DIR, 'backups')), detail: path.join(HOME_DIR, 'backups'), required: true }
  );
}

function addCodexChecks(checks, paths, root) {
  const hooks = readJson(paths.codexHooks);
  const configText = fs.existsSync(paths.codexConfig) ? fs.readFileSync(paths.codexConfig, 'utf8') : '';
  const agentsText = fs.existsSync(paths.codexAgents) ? fs.readFileSync(paths.codexAgents, 'utf8') : '';
  const expected = [
    ['SessionStart', 'tto-activate.js', '{}'],
    ['UserPromptSubmit', 'tto-mode-tracker.js', '{"prompt":"token thai auto"}'],
    ['PreToolUse', 'tto-pretool-guard.js', '{"command":"git push --force"}'],
    ['PostToolUse', 'tto-posttool-summary.js', '{}'],
    ['Stop', 'tto-stop-summary.js', '{}']
  ];
  checks.push(
    { name: 'Codex hooks installed', ok: !!hooks && hasTto(JSON.stringify(hooks)), detail: paths.codexHooks, required: true },
    { name: 'Codex hooks feature flag', ok: /^\s*codex_hooks\s*=\s*true\s*$/m.test(configText), detail: paths.codexConfig, required: true },
    { name: 'Codex AGENTS block (optional)', ok: agentsText.includes('Thai Token Optimizer START') || agentsText.includes('Thai Token Optimizer v1.0'), detail: `${paths.codexAgents} — run tto install-agents to enable`, required: false }
  );
  for (const [eventName, file, input] of expected) {
    const commands = hookCommandsForEvent(hooks?.hooks, eventName);
    checks.push({ name: `Codex ${eventName} hook command`, ok: commandUsesExpectedScript(commands, root, file), detail: path.join(root, 'hooks', file), required: true });
    checks.push({ name: `Codex ${eventName} hook script`, ok: scriptExists(root, file), detail: path.join(root, 'hooks', file), required: true });
    const sim = simulateHook(root, file, input);
    checks.push({ name: `Codex ${eventName} hook simulation`, ok: sim.ok, detail: sim.detail, required: true });
  }
}

function addClaudeChecks(checks, paths, root) {
  const settings = readJson(paths.claudeSettings);
  checks.push({ name: 'Claude hooks installed', ok: !!settings && hasTto(JSON.stringify(settings)), detail: paths.claudeSettings, required: true });
  for (const file of ['tto-activate.js', 'tto-mode-tracker.js', 'tto-pretool-guard.js', 'tto-posttool-summary.js', 'tto-stop-summary.js']) {
    checks.push({ name: `Claude hook script ${file}`, ok: scriptExists(root, file), detail: path.join(root, 'hooks', file), required: true });
  }
}

function addGeminiChecks(checks, paths, root) {
  const geminiSettingsJson = readJson(paths.geminiSettings);
  checks.push(
    { name: 'Gemini CLI extension installed', ok: fs.existsSync(paths.geminiExt) && fs.existsSync(paths.geminiCtx), detail: paths.geminiExt, required: true },
    { name: 'Gemini CLI hooks installed', ok: !!geminiSettingsJson && hasTto(JSON.stringify(geminiSettingsJson)), detail: paths.geminiSettings, required: true }
  );
  for (const file of ['tto-gemini-session.js', 'tto-gemini-beforetool.js', 'tto-gemini-aftertool.js', 'tto-gemini-precompress.js']) {
    checks.push({ name: `Gemini hook script ${file}`, ok: scriptExists(root, file), detail: path.join(root, 'hooks', file), required: true });
  }
}

function addOpenCodeChecks(checks, paths) {
  const opencodeConfigJson = readJson(paths.opencodeConfig);
  const pluginText = fs.existsSync(paths.opencodePlugin) ? fs.readFileSync(paths.opencodePlugin, 'utf8') : '';
  checks.push(
    { name: 'OpenCode plugin installed', ok: pluginText.includes('Thai Token Optimizer v1.0'), detail: paths.opencodePlugin, required: true },
    { name: 'OpenCode config present', ok: !!opencodeConfigJson || fs.existsSync(paths.opencodeConfig), detail: paths.opencodeConfig, required: true },
    { name: 'OpenCode plugin exposes hooks', ok: /tool\.execute\.before/.test(pluginText) && /experimental\.session\.compacting/.test(pluginText), detail: paths.opencodePlugin, required: true }
  );
}

function simulateOpenClawHook(paths, input) {
  if (!fs.existsSync(paths.openclawSimulator)) return { ok: false, detail: paths.openclawSimulator };
  const r = spawnSync(process.execPath, [paths.openclawSimulator], { input, encoding: 'utf8', timeout: 5000 });
  if (r.status !== 0) return { ok: false, detail: `simulate.cjs exit ${r.status}: ${(r.stderr || '').trim()}` };
  try {
    const parsed = JSON.parse(r.stdout);
    return { ok: parsed.service === 'thai-token-optimizer' && parsed.version === '1.0.0' && String(parsed.safety || '').includes('backup'), detail: paths.openclawSimulator };
  } catch (e) {
    return { ok: false, detail: `simulate.cjs invalid JSON: ${e.message}` };
  }
}

function addOpenClawChecks(checks, paths) {
  const config = readJson(paths.openclawConfig);
  const hookMd = fs.existsSync(paths.openclawHookMd) ? fs.readFileSync(paths.openclawHookMd, 'utf8') : '';
  const handlerText = fs.existsSync(paths.openclawHandler) ? fs.readFileSync(paths.openclawHandler, 'utf8') : '';
  const entry = config?.hooks?.internal?.entries?.['thai-token-optimizer'];
  checks.push(
    { name: 'OpenClaw hook metadata installed', ok: hookMd.includes('name: thai-token-optimizer') && hookMd.includes('gateway:startup') && hookMd.includes('agent:bootstrap'), detail: paths.openclawHookMd, required: true },
    { name: 'OpenClaw handler installed', ok: handlerText.includes('Thai Token Optimizer v1.0') && handlerText.includes('export default handler'), detail: paths.openclawHandler, required: true },
    { name: 'OpenClaw config enables hook', ok: !!entry?.enabled && String(entry.path || '').includes('thai-token-optimizer'), detail: paths.openclawConfig, required: true },
    { name: 'OpenClaw command events configured', ok: Array.isArray(entry?.events) && entry.events.includes('command:new') && entry.events.includes('command:reset') && entry.events.includes('command'), detail: paths.openclawConfig, required: true }
  );
  const sim = simulateOpenClawHook(paths, '{"type":"command","action":"new","text":"rm -rf /tmp/x production secret"}');
  checks.push({ name: 'OpenClaw hook simulation', ok: sim.ok, detail: sim.detail, required: true });
}

function simulateHermesShellHook(paths, input) {
  if (!fs.existsSync(paths.hermesPreTool)) return { ok: false, detail: paths.hermesPreTool };
  const r = spawnSync(process.execPath, [paths.hermesPreTool], { input, encoding: 'utf8', timeout: 5000 });
  if (r.status !== 0) return { ok: false, detail: `Hermes shell hook exit ${r.status}: ${(r.stderr || '').trim()}` };
  try {
    const parsed = JSON.parse(r.stdout);
    return { ok: parsed.action === 'block' && String(parsed.message || '').includes('backup'), detail: paths.hermesPreTool };
  } catch (e) {
    return { ok: false, detail: `Hermes shell hook invalid JSON: ${e.message}` };
  }
}

function addHermesChecks(checks, paths) {
  const configText = fs.existsSync(paths.hermesConfig) ? fs.readFileSync(paths.hermesConfig, 'utf8') : '';
  const pluginYaml = fs.existsSync(paths.hermesPluginYaml) ? fs.readFileSync(paths.hermesPluginYaml, 'utf8') : '';
  const pluginPy = fs.existsSync(paths.hermesPluginPy) ? fs.readFileSync(paths.hermesPluginPy, 'utf8') : '';
  const shellScripts = paths.hermesShellScripts || [];
  checks.push(
    { name: 'Hermes config enables plugin', ok: configText.includes('plugins:') && configText.includes('- thai-token-optimizer'), detail: paths.hermesConfig, required: true },
    { name: 'Hermes shell hooks configured', ok: configText.includes('pre_llm_call') && configText.includes('pre_tool_call') && configText.includes('thai-token-optimizer-pre_tool_call.cjs'), detail: paths.hermesConfig, required: true },
    { name: 'Hermes plugin manifest installed', ok: pluginYaml.includes('name: thai-token-optimizer') && pluginYaml.includes('1.0.0'), detail: paths.hermesPluginYaml, required: true },
    { name: 'Hermes plugin hooks registered', ok: pluginPy.includes('ctx.register_hook("pre_llm_call"') && pluginPy.includes('ctx.register_hook("pre_tool_call"') && pluginPy.includes('transform_terminal_output'), detail: paths.hermesPluginPy, required: true },
    { name: 'Hermes shell hook scripts installed', ok: shellScripts.every(file => fs.existsSync(file)), detail: `${shellScripts.length} scripts`, required: true }
  );
  const sim = simulateHermesShellHook(paths, '{"hook_event_name":"pre_tool_call","tool_name":"terminal","tool_input":{"command":"rm -rf /tmp/x production secret"},"session_id":"doctor","cwd":"/tmp","extra":{}}');
  checks.push({ name: 'Hermes shell hook simulation', ok: sim.ok, detail: sim.detail, required: true });
}

function runDoctor(options = {}) {
  const ci = Boolean(options.ci);
  const target = normalizeDoctorTarget(options.target || 'all');
  const root = path.resolve(__dirname, '..');
  const pkg = readJson(path.join(root, 'package.json')) || {};
  const checks = packageChecks(root, pkg);
  if (ci) {
    const ok = checks.every(c => c.ok || !c.required);
    return { name: 'Thai Token Optimizer', versionLabel: 'v1.0', packageVersion: pkg.version, ok, mode: 'ci', target, checks };
  }

  const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
  const claudeHome = process.env.CLAUDE_HOME || path.join(os.homedir(), '.claude');
  const geminiHome = process.env.GEMINI_HOME || path.join(os.homedir(), '.gemini');
  const opencodeHome = process.env.OPENCODE_CONFIG_DIR || path.join(os.homedir(), '.config', 'opencode');
  const openclawHome = process.env.OPENCLAW_HOME || path.join(os.homedir(), '.openclaw');
  const hermesHome = process.env.HERMES_HOME || path.join(os.homedir(), '.hermes');
  const codexHooks = path.join(codexHome, 'hooks.json');
  const codexConfig = path.join(codexHome, 'config.toml');
  const codexAgents = path.join(codexHome, 'AGENTS.md');
  const claudeSettings = path.join(claudeHome, 'settings.json');
  const geminiSettings = path.join(geminiHome, 'settings.json');
  const geminiExt = path.join(geminiHome, 'extensions', 'thai-token-optimizer', 'gemini-extension.json');
  const geminiCtx = path.join(geminiHome, 'extensions', 'thai-token-optimizer', 'GEMINI.md');
  const opencodePlugin = path.join(opencodeHome, 'plugins', 'thai-token-optimizer.js');
  const opencodeConfig = path.join(opencodeHome, 'opencode.json');
  const openclawConfig = path.join(openclawHome, 'openclaw.json');
  const openclawHookMd = path.join(openclawHome, 'hooks', 'thai-token-optimizer', 'HOOK.md');
  const openclawHandler = path.join(openclawHome, 'hooks', 'thai-token-optimizer', 'handler.ts');
  const openclawSimulator = path.join(openclawHome, 'hooks', 'thai-token-optimizer', 'simulate.cjs');
  const hermesConfig = path.join(hermesHome, 'config.yaml');
  const hermesPluginYaml = path.join(hermesHome, 'plugins', 'thai-token-optimizer', 'plugin.yaml');
  const hermesPluginPy = path.join(hermesHome, 'plugins', 'thai-token-optimizer', '__init__.py');
  const hermesShellScripts = ['pre_llm_call', 'pre_tool_call', 'post_tool_call', 'on_session_start', 'on_session_reset', 'on_session_finalize', 'subagent_stop'].map(eventName => path.join(hermesHome, 'agent-hooks', `thai-token-optimizer-${eventName}.cjs`));
  const hermesPreTool = path.join(hermesHome, 'agent-hooks', 'thai-token-optimizer-pre_tool_call.cjs');
  const paths = { codexHooks, codexConfig, codexAgents, claudeSettings, geminiSettings, geminiExt, geminiCtx, opencodePlugin, opencodeConfig, openclawConfig, openclawHookMd, openclawHandler, openclawSimulator, hermesConfig, hermesPluginYaml, hermesPluginPy, hermesShellScripts, hermesPreTool };
  addCommonRuntimeChecks(checks);
  if (target === 'all' || target === 'codex') addCodexChecks(checks, paths, root);
  if (target === 'all' || target === 'claude') addClaudeChecks(checks, paths, root);
  if (target === 'all' || target === 'gemini') addGeminiChecks(checks, paths, root);
  if (target === 'all' || target === 'opencode') addOpenCodeChecks(checks, paths);
  if (target === 'all' || target === 'openclaw') addOpenClawChecks(checks, paths);
  if (target === 'all' || target === 'hermes') addHermesChecks(checks, paths);
  const ok = checks.every(c => c.ok || !c.required);
  return { name: 'Thai Token Optimizer', versionLabel: 'v1.0', packageVersion: pkg.version, ok, mode: 'installed', target, checks };
}
function formatDoctor(result) {
  const lines = [`Thai Token Optimizer v1.0 Doctor`, `Mode: ${result.mode || 'installed'}`, `Target: ${result.target || 'all'}`, `Status: ${result.ok ? 'OK' : 'WARN'}`, ''];
  for (const c of result.checks) {
    const mark = c.ok ? '✓' : (c.required === false ? '!' : '✗');
    lines.push(`${mark} ${c.name} — ${c.detail}`);
  }
  return lines.join('\n');
}
if (require.main === module) {
  try {
    const target = process.argv.slice(2).find(a => !String(a).startsWith('--')) || 'all';
    const result = runDoctor({ ci: process.argv.includes('--ci'), target });
    console.log(formatDoctor(result));
    process.exitCode = result.ok ? 0 : 1;
  } catch (e) {
    console.error(`Thai Token Optimizer v1.0 Doctor error: ${e.message}`);
    process.exitCode = 1;
  }
}
module.exports = { runDoctor, formatDoctor, normalizeDoctorTarget, DOCTOR_TARGETS };
