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

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const bin = path.join(root, 'bin', 'thai-token-optimizer.js');

function run(args, tmp) {
  return execFileSync('node', [bin, ...args], {
    cwd: root,
    env: { ...process.env, HOME: tmp, TTO_HOME: path.join(tmp, '.tto'), GEMINI_HOME: path.join(tmp, '.gemini'), OPENCODE_CONFIG_DIR: path.join(tmp, '.config', 'opencode') },
    encoding: 'utf8'
  });
}

test('Gemini adapter installs extension, commands, and hooks', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-gemini-'));
  const out = run(['install', 'gemini'], tmp);
  assert.match(out, /gemini/);
  const ext = path.join(tmp, '.gemini', 'extensions', 'thai-token-optimizer');
  assert.ok(fs.existsSync(path.join(ext, 'gemini-extension.json')));
  assert.ok(fs.existsSync(path.join(ext, 'GEMINI.md')));
  assert.ok(fs.existsSync(path.join(ext, 'commands', 'tto', 'auto.toml')));
  assert.ok(fs.existsSync(path.join(ext, 'commands', 'tto', 'compress.toml')));
  const meta = JSON.parse(fs.readFileSync(path.join(ext, 'gemini-extension.json'), 'utf8'));
  assert.equal(meta.version, '1.0.0');
  assert.equal(meta.contextFileName, 'GEMINI.md');
  const settings = JSON.parse(fs.readFileSync(path.join(tmp, '.gemini', 'settings.json'), 'utf8'));
  assert.ok(settings.hooks.SessionStart);
  assert.ok(settings.hooks.BeforeTool);
  assert.ok(settings.hooks.AfterTool);
  assert.ok(settings.hooks.PreCompress);
});

test('OpenCode adapter installs native plugin, config, agent, and skill', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-opencode-'));
  const out = run(['install', 'opencode'], tmp);
  assert.match(out, /opencode/);
  const cfg = path.join(tmp, '.config', 'opencode');
  const plugin = path.join(cfg, 'plugins', 'thai-token-optimizer.js');
  assert.ok(fs.existsSync(plugin));
  assert.match(fs.readFileSync(plugin, 'utf8'), /export const ThaiTokenOptimizer/);
  assert.match(fs.readFileSync(plugin, 'utf8'), /tool\.execute\.before/);
  assert.ok(fs.existsSync(path.join(cfg, 'opencode.json')));
  assert.ok(fs.existsSync(path.join(cfg, 'agents', 'thai-token-optimizer.md')));
  assert.ok(fs.existsSync(path.join(cfg, 'skills', 'thai-token-optimizer.md')));
});

test('Gemini hook wrappers emit compact context when enabled', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-gemini-hooks-'));
  run(['auto'], tmp);
  const session = execFileSync('node', [path.join(root, 'hooks', 'tto-gemini-session.js')], {
    env: { ...process.env, HOME: tmp, TTO_HOME: path.join(tmp, '.tto'), GEMINI_HOME: path.join(tmp, '.gemini'), OPENCODE_CONFIG_DIR: path.join(tmp, '.config', 'opencode') },
    input: JSON.stringify({ event: 'SessionStart' }),
    encoding: 'utf8'
  });
  assert.match(session, /Gemini CLI/);
  const before = execFileSync('node', [path.join(root, 'hooks', 'tto-gemini-beforetool.js')], {
    env: { ...process.env, HOME: tmp, TTO_HOME: path.join(tmp, '.tto'), GEMINI_HOME: path.join(tmp, '.gemini'), OPENCODE_CONFIG_DIR: path.join(tmp, '.config', 'opencode') },
    input: JSON.stringify({ tool: 'run_shell_command', command: 'rm -rf /tmp/x' }),
    encoding: 'utf8'
  });
  assert.match(before, /SAFETY/);
});
