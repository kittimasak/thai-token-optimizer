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
function runDoctor(options = {}) {
  const ci = Boolean(options.ci);
  const root = path.resolve(__dirname, '..');
  const pkg = readJson(path.join(root, 'package.json')) || {};
  const checks = packageChecks(root, pkg);
  if (ci) {
    const ok = checks.every(c => c.ok || !c.required);
    return { name: 'Thai Token Optimizer', versionLabel: 'v1.0', packageVersion: pkg.version, ok, mode: 'ci', checks };
  }

  const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
  const claudeHome = process.env.CLAUDE_HOME || path.join(os.homedir(), '.claude');
  const geminiHome = process.env.GEMINI_HOME || path.join(os.homedir(), '.gemini');
  const opencodeHome = process.env.OPENCODE_CONFIG_DIR || path.join(os.homedir(), '.config', 'opencode');
  const codexHooks = path.join(codexHome, 'hooks.json');
  const codexConfig = path.join(codexHome, 'config.toml');
  const codexAgents = path.join(codexHome, 'AGENTS.md');
  const claudeSettings = path.join(claudeHome, 'settings.json');
  const geminiSettings = path.join(geminiHome, 'settings.json');
  const geminiExt = path.join(geminiHome, 'extensions', 'thai-token-optimizer', 'gemini-extension.json');
  const geminiCtx = path.join(geminiHome, 'extensions', 'thai-token-optimizer', 'GEMINI.md');
  const opencodePlugin = path.join(opencodeHome, 'plugins', 'thai-token-optimizer.js');
  const opencodeConfig = path.join(opencodeHome, 'opencode.json');
  const hooks = readJson(codexHooks);
  const settings = readJson(claudeSettings);
  const geminiSettingsJson = readJson(geminiSettings);
  const opencodeConfigJson = readJson(opencodeConfig);
  const configText = fs.existsSync(codexConfig) ? fs.readFileSync(codexConfig, 'utf8') : '';
  const agentsText = fs.existsSync(codexAgents) ? fs.readFileSync(codexAgents, 'utf8') : '';
  checks.push(
    { name: 'State directory writable', ok: checkWritable(HOME_DIR), detail: HOME_DIR, required: true },
    { name: 'State readable', ok: !!getState(), detail: STATE_PATH, required: true },
    { name: 'Codex hooks installed', ok: !!hooks && hasTto(JSON.stringify(hooks)), detail: codexHooks, required: true },
    { name: 'Codex hooks feature flag', ok: /^\s*codex_hooks\s*=\s*true\s*$/m.test(configText), detail: codexConfig, required: true },
    { name: 'Codex AGENTS block (optional)', ok: agentsText.includes('Thai Token Optimizer START') || agentsText.includes('Thai Token Optimizer v1.0'), detail: `${codexAgents} — run tto install-agents to enable`, required: false },
    { name: 'Claude hooks installed', ok: !!settings && hasTto(JSON.stringify(settings)), detail: claudeSettings, required: true },
    { name: 'Gemini CLI extension installed', ok: fs.existsSync(geminiExt) && fs.existsSync(geminiCtx), detail: geminiExt, required: true },
    { name: 'Gemini CLI hooks installed', ok: !!geminiSettingsJson && hasTto(JSON.stringify(geminiSettingsJson)), detail: geminiSettings, required: true },
    { name: 'OpenCode plugin installed', ok: fs.existsSync(opencodePlugin) && String(fs.readFileSync(opencodePlugin, 'utf8')).includes('Thai Token Optimizer v1.0'), detail: opencodePlugin, required: true },
    { name: 'OpenCode config present', ok: !!opencodeConfigJson || fs.existsSync(opencodeConfig), detail: opencodeConfig, required: true },
    { name: 'Backup directory writable', ok: checkWritable(path.join(HOME_DIR, 'backups')), detail: path.join(HOME_DIR, 'backups'), required: true }
  );
  const ok = checks.every(c => c.ok || !c.required);
  return { name: 'Thai Token Optimizer', versionLabel: 'v1.0', packageVersion: pkg.version, ok, mode: 'installed', checks };
}
function formatDoctor(result) {
  const lines = [`Thai Token Optimizer v1.0 Doctor`, `Mode: ${result.mode || 'installed'}`, `Status: ${result.ok ? 'OK' : 'WARN'}`, ''];
  for (const c of result.checks) {
    const mark = c.ok ? '✓' : (c.required === false ? '!' : '✗');
    lines.push(`${mark} ${c.name} — ${c.detail}`);
  }
  return lines.join('\n');
}
if (require.main === module) {
  const result = runDoctor({ ci: process.argv.includes('--ci') });
  console.log(formatDoctor(result));
  process.exitCode = result.ok ? 0 : 1;
}
module.exports = { runDoctor, formatDoctor };
