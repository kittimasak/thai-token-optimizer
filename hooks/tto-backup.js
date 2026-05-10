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
const { HOME_DIR, DICTIONARY_PATH } = require('./tto-config');

const VALID_TARGETS = Object.freeze(['codex', 'claude', 'gemini', 'opencode', 'openclaw', 'hermes', 'cursor', 'aider', 'cline', 'roo', 'all']);

function timestamp() {
  // Include milliseconds to avoid collisions when backups happen within one second.
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\./g, '');
}
function backupRoot() {
  return path.join(HOME_DIR, 'backups');
}
function uniqueBackupDir(target) {
  fs.mkdirSync(backupRoot(), { recursive: true });
  let i = 0;
  while (true) {
    const suffix = i === 0 ? '' : `-${i}`;
    const id = `${timestamp()}-${process.pid}-${target}${suffix}`;
    const dir = path.join(backupRoot(), id);
    if (!fs.existsSync(dir)) return { id, dir };
    i += 1;
  }
}
function adapterPaths(target) {
  const home = os.homedir();
  const geminiHome = process.env.GEMINI_HOME || path.join(home, '.gemini');
  const opencodeHome = process.env.OPENCODE_CONFIG_DIR || path.join(home, '.config', 'opencode');
  const openclawHome = process.env.OPENCLAW_HOME || path.join(home, '.openclaw');
  const hermesHome = process.env.HERMES_HOME || path.join(home, '.hermes');
  const paths = {
    gemini: [
      path.join(geminiHome, 'settings.json'),
      path.join(geminiHome, 'GEMINI.md'),
      path.join(geminiHome, 'extensions', 'thai-token-optimizer', 'gemini-extension.json'),
      path.join(geminiHome, 'extensions', 'thai-token-optimizer', 'GEMINI.md'),
      path.join(geminiHome, 'extensions', 'thai-token-optimizer', 'commands', 'tto', 'auto.toml'),
      path.join(geminiHome, 'extensions', 'thai-token-optimizer', 'commands', 'tto', 'lite.toml'),
      path.join(geminiHome, 'extensions', 'thai-token-optimizer', 'commands', 'tto', 'full.toml'),
      path.join(geminiHome, 'extensions', 'thai-token-optimizer', 'commands', 'tto', 'safe.toml'),
      path.join(geminiHome, 'extensions', 'thai-token-optimizer', 'commands', 'tto', 'off.toml'),
      path.join(geminiHome, 'extensions', 'thai-token-optimizer', 'commands', 'tto', 'status.toml'),
      path.join(geminiHome, 'extensions', 'thai-token-optimizer', 'commands', 'tto', 'compress.toml'),
      path.join(geminiHome, 'extensions', 'thai-token-optimizer', 'commands', 'tto', 'estimate.toml')
    ],
    opencode: [
      path.join(opencodeHome, 'opencode.json'),
      path.join(opencodeHome, 'plugins', 'thai-token-optimizer.js'),
      path.join(opencodeHome, 'agents', 'thai-token-optimizer.md'),
      path.join(opencodeHome, 'skills', 'thai-token-optimizer.md'),
      path.join(opencodeHome, 'commands', 'tto-auto.md'),
      path.join(opencodeHome, 'commands', 'tto-safe.md')
    ],
    openclaw: [
      path.join(openclawHome, 'openclaw.json'),
      path.join(openclawHome, 'hooks', 'thai-token-optimizer', 'HOOK.md'),
      path.join(openclawHome, 'hooks', 'thai-token-optimizer', 'handler.ts'),
      path.join(openclawHome, 'hooks', 'thai-token-optimizer', 'simulate.cjs')
    ],
    hermes: [
      path.join(hermesHome, 'config.yaml'),
      path.join(hermesHome, 'plugins', 'thai-token-optimizer', 'plugin.yaml'),
      path.join(hermesHome, 'plugins', 'thai-token-optimizer', '__init__.py'),
      path.join(hermesHome, 'agent-hooks', 'thai-token-optimizer-pre_llm_call.cjs'),
      path.join(hermesHome, 'agent-hooks', 'thai-token-optimizer-pre_tool_call.cjs'),
      path.join(hermesHome, 'agent-hooks', 'thai-token-optimizer-post_tool_call.cjs'),
      path.join(hermesHome, 'agent-hooks', 'thai-token-optimizer-on_session_start.cjs'),
      path.join(hermesHome, 'agent-hooks', 'thai-token-optimizer-on_session_reset.cjs'),
      path.join(hermesHome, 'agent-hooks', 'thai-token-optimizer-on_session_finalize.cjs'),
      path.join(hermesHome, 'agent-hooks', 'thai-token-optimizer-subagent_stop.cjs')
    ],
    cursor: [path.join(home, '.cursor', 'rules', 'thai-token-optimizer.mdc')],
    aider: [path.join(home, '.aider', 'thai-token-optimizer.md')],
    cline: [path.join(home, '.cline', 'rules', 'thai-token-optimizer.md')],
    roo: [path.join(home, '.roo', 'rules', 'thai-token-optimizer.md')]
  };
  if (target === 'all') return ['gemini', 'opencode', 'openclaw', 'hermes', 'cursor', 'aider', 'cline', 'roo'].flatMap(k => paths[k]);
  return paths[target] || [];
}
function targetFiles(target) {
  const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
  const claudeHome = process.env.CLAUDE_HOME || path.join(os.homedir(), '.claude');
  const files = [];
  if (target === 'codex' || target === 'all') {
    files.push(path.join(codexHome, 'hooks.json'), path.join(codexHome, 'config.toml'), path.join(codexHome, 'AGENTS.md'));
  }
  if (target === 'claude' || target === 'all') {
    files.push(path.join(claudeHome, 'settings.json'));
  }
  files.push(...adapterPaths(target));
  files.push(path.join(HOME_DIR, 'state.json'));
  files.push(DICTIONARY_PATH);
  return [...new Set(files)];
}
function makeBackup(target = 'all') {
  if (!VALID_TARGETS.includes(target)) throw new Error(`Unsupported backup target: ${target}`);
  const { id, dir } = uniqueBackupDir(target);
  fs.mkdirSync(dir, { recursive: true });
  const manifest = { id, target, createdAt: new Date().toISOString(), files: [] };
  for (const file of targetFiles(target)) {
    const rel = file.replace(/^\//, '').replace(/[\\/]/g, '__');
    const dest = path.join(dir, rel);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      fs.copyFileSync(file, dest);
      manifest.files.push({ path: file, backup: dest, existed: true });
    } else {
      manifest.files.push({ path: file, backup: dest, existed: false });
    }
  }
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return manifest;
}
function listBackups() {
  const root = backupRoot();
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root).map(id => {
    const mf = path.join(root, id, 'manifest.json');
    try { return JSON.parse(fs.readFileSync(mf, 'utf8')); } catch { return null; }
  }).filter(Boolean).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)) || String(b.id).localeCompare(String(a.id)));
}
function selectRollback(targetOrId = 'latest') {
  const backups = listBackups();
  if (backups.length === 0) throw new Error('No backups found.');
  let manifest = null;
  let requestedTarget = null;
  let filtered = false;
  if (targetOrId === 'latest') manifest = backups[0];
  else manifest = backups.find(b => b.id === targetOrId);
  if (!manifest && VALID_TARGETS.includes(targetOrId)) {
    requestedTarget = targetOrId;
    manifest = backups.find(b => b.target === targetOrId || b.target === 'all');
    if (!manifest) throw new Error(`No matching backup for target: ${targetOrId}`);
  }
  if (!manifest) throw new Error(`No matching backup for ${targetOrId}.`);
  let files = manifest.files;
  if (requestedTarget && manifest.target === 'all' && requestedTarget !== 'all') {
    const allowed = new Set(targetFiles(requestedTarget));
    files = manifest.files.filter(f => allowed.has(f.path));
    filtered = true;
  }
  return { manifest, files, requestedTarget, filtered };
}
function restoreFiles(files) {
  for (const f of files) {
    fs.mkdirSync(path.dirname(f.path), { recursive: true });
    if (f.existed && fs.existsSync(f.backup)) fs.copyFileSync(f.backup, f.path);
    if (!f.existed && fs.existsSync(f.path)) fs.rmSync(f.path, { force: true });
  }
}
function rollback(targetOrId = 'latest', options = {}) {
  const selected = selectRollback(targetOrId);
  if (!options.dryRun) restoreFiles(selected.files);
  return selected;
}

module.exports = { VALID_TARGETS, backupRoot, targetFiles, adapterPaths, makeBackup, listBackups, selectRollback, restoreFiles, rollback };
