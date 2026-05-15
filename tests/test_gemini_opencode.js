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
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');

const root = path.resolve(__dirname, '..');
const bin = path.join(root, 'bin', 'thai-token-optimizer.js');

function run(args, tmp) {
  return execFileSync('node', [bin, ...args], {
    cwd: root,
    env: { ...process.env, HOME: tmp, TTO_HOME: path.join(tmp, '.tto'), GEMINI_HOME: path.join(tmp, '.gemini'), OPENCODE_CONFIG_DIR: path.join(tmp, '.config', 'opencode'), OPENCLAW_HOME: path.join(tmp, '.openclaw'), HERMES_HOME: path.join(tmp, '.hermes') },
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
  assert.ok(fs.existsSync(path.join(ext, 'commands', 'tto', 'mode.toml')));
  assert.ok(fs.existsSync(path.join(ext, 'commands', 'tto', 'compress.toml')));
  const meta = JSON.parse(fs.readFileSync(path.join(ext, 'gemini-extension.json'), 'utf8'));
  assert.equal(meta.version, '2.0.0');
  assert.equal(meta.contextFileName, 'GEMINI.md');
  const settings = JSON.parse(fs.readFileSync(path.join(tmp, '.gemini', 'settings.json'), 'utf8'));
  assert.ok(settings.hooks.SessionStart);
  assert.ok(settings.hooks.BeforeTool);
  assert.ok(settings.hooks.AfterTool);
  assert.ok(settings.hooks.PreCompress);
});

test('OpenCode adapter installs native plugin, config, agent, skill, and safety behavior', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-opencode-'));
  const out = run(['install', 'opencode'], tmp);
  assert.match(out, /opencode/);
  const cfg = path.join(tmp, '.config', 'opencode');
  const plugin = path.join(cfg, 'plugins', 'thai-token-optimizer.js');
  assert.ok(fs.existsSync(plugin));
  assert.match(fs.readFileSync(plugin, 'utf8'), /exports\.ThaiTokenOptimizer/);
  assert.match(fs.readFileSync(plugin, 'utf8'), /tool\.execute\.before/);
  assert.ok(fs.existsSync(path.join(cfg, 'opencode.json')));
  assert.ok(fs.existsSync(path.join(cfg, 'agents', 'thai-token-optimizer.md')));
  assert.ok(fs.existsSync(path.join(cfg, 'skills', 'thai-token-optimizer.md')));
  const mod = await import(pathToFileURL(plugin));
  const instance = await mod.ThaiTokenOptimizer({
    client: { app: { log: async () => {} } },
    $: async () => ({ stdout: '' })
  });
  const statePath = path.join(tmp, '.tto', 'state.json');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify({ enabled: true, level: 'lite' }));
  const envOut = { env: {} };
  await instance['shell.env']({}, envOut);
  assert.equal(envOut.env.THAI_TOKEN_OPTIMIZER, '1');
  assert.equal(envOut.env.THAI_TOKEN_OPTIMIZER_LEVEL, 'lite');
  const riskyCommands = ['rm -rf /tmp/cache', 'DROP TABLE users', 'git push --force origin main'];
  for (const command of riskyCommands) {
    const output = { args: { command } };
    await instance['tool.execute.before']({ tool: 'shell', command }, output);
    assert.match(output.args.__thaiTokenOptimizerSafety, /risky operation detected/, command);
  }
  const normal = { args: { command: 'list files' } };
  await instance['tool.execute.before']({ tool: 'shell', command: 'list files' }, normal);
  assert.equal(normal.args.__thaiTokenOptimizerSafety, undefined);
  const compact = { context: [] };
  await instance['experimental.session.compacting']({}, compact);
  assert.match(compact.context[0], /TTO v2\.0\.0 \[lite\]/);
  assert.match(compact.context[0], /During compaction/);
  fs.writeFileSync(statePath, JSON.stringify({ enabled: false, level: 'lite' }));
  const disabledEnv = { env: {} };
  await instance['shell.env']({}, disabledEnv);
  assert.equal(disabledEnv.env.THAI_TOKEN_OPTIMIZER, '0');
  const disabledCompact = { context: [] };
  await instance['experimental.session.compacting']({}, disabledCompact);
  assert.match(disabledCompact.context[0], /DISABLED/);
  assert.doesNotMatch(disabledCompact.context[0], /During compaction/);
});

test('OpenClaw adapter installs managed hook, config entry, and simulator', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-openclaw-'));
  const out = run(['install', 'openclaw'], tmp);
  assert.match(out, /openclaw/);
  const home = path.join(tmp, '.openclaw');
  const hookDir = path.join(home, 'hooks', 'thai-token-optimizer');
  const hookMd = path.join(hookDir, 'HOOK.md');
  const handler = path.join(hookDir, 'handler.ts');
  const simulator = path.join(hookDir, 'simulate.cjs');
  assert.ok(fs.existsSync(hookMd));
  assert.ok(fs.existsSync(handler));
  assert.ok(fs.existsSync(simulator));
  assert.match(fs.readFileSync(hookMd, 'utf8'), /gateway:startup/);
  assert.match(fs.readFileSync(handler, 'utf8'), /export default handler/);
  const config = JSON.parse(fs.readFileSync(path.join(home, 'openclaw.json'), 'utf8'));
  assert.equal(config.hooks.internal.entries['thai-token-optimizer'].enabled, true);
  assert.ok(config.hooks.internal.entries['thai-token-optimizer'].events.includes('command:new'));
  const sim = execFileSync('node', [simulator], {
    env: { ...process.env, HOME: tmp, TTO_HOME: path.join(tmp, '.tto'), OPENCLAW_HOME: home },
    input: JSON.stringify({ type: 'command', action: 'new', text: 'DROP TABLE users production secret' }),
    encoding: 'utf8'
  });
  assert.match(sim, /safe mode required/);
  assert.match(sim, /backup/);
});

test('Hermes adapter installs shell hooks, plugin hooks, config, and simulator behavior', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-hermes-'));
  const out = run(['install', 'hermes'], tmp);
  assert.match(out, /hermes/);
  const home = path.join(tmp, '.hermes');
  const config = fs.readFileSync(path.join(home, 'config.yaml'), 'utf8');
  const plugin = path.join(home, 'plugins', 'thai-token-optimizer');
  const preTool = path.join(home, 'agent-hooks', 'thai-token-optimizer-pre_tool_call.cjs');
  const preLlm = path.join(home, 'agent-hooks', 'thai-token-optimizer-pre_llm_call.cjs');
  assert.match(config, /hooks_auto_accept: true/);
  assert.match(config, /pre_tool_call/);
  assert.match(config, /- thai-token-optimizer/);
  assert.ok(fs.existsSync(path.join(plugin, 'plugin.yaml')));
  assert.match(fs.readFileSync(path.join(plugin, '__init__.py'), 'utf8'), /ctx\.register_hook\("pre_llm_call"/);
  assert.ok(fs.existsSync(preTool));
  assert.ok(fs.existsSync(preLlm));
  const blocked = execFileSync('node', [preTool], {
    env: { ...process.env, HOME: tmp, TTO_HOME: path.join(tmp, '.tto'), HERMES_HOME: home },
    input: JSON.stringify({ hook_event_name: 'pre_tool_call', tool_name: 'terminal', tool_input: { command: 'rm -rf /tmp/x production secret' } }),
    encoding: 'utf8'
  });
  assert.match(blocked, /"action":"block"/);
  assert.match(blocked, /backup/);
  const context = execFileSync('node', [preLlm], {
    env: { ...process.env, HOME: tmp, TTO_HOME: path.join(tmp, '.tto'), HERMES_HOME: home },
    input: JSON.stringify({ hook_event_name: 'pre_llm_call', extra: { user_message: 'token thai auto' } }),
    encoding: 'utf8'
  });
  assert.match(context, /"context"/);
  assert.match(context, /Hermes shell hook active/);
});

test('Gemini hook wrappers emit compact context when enabled', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-gemini-hooks-'));
  run(['auto'], tmp);
  const session = execFileSync('node', [path.join(root, 'hooks', 'tto-gemini-session.js')], {
    env: { ...process.env, HOME: tmp, TTO_HOME: path.join(tmp, '.tto'), GEMINI_HOME: path.join(tmp, '.gemini'), OPENCODE_CONFIG_DIR: path.join(tmp, '.config', 'opencode') },
    input: JSON.stringify({ event: 'SessionStart' }),
    encoding: 'utf8'
  });
  assert.match(session, /TTO v2\.0\.0/);
  const before = execFileSync('node', [path.join(root, 'hooks', 'tto-gemini-beforetool.js')], {
    env: { ...process.env, HOME: tmp, TTO_HOME: path.join(tmp, '.tto'), GEMINI_HOME: path.join(tmp, '.gemini'), OPENCODE_CONFIG_DIR: path.join(tmp, '.config', 'opencode') },
    input: JSON.stringify({ tool: 'run_shell_command', command: 'rm -rf /tmp/x' }),
    encoding: 'utf8'
  });
  assert.match(before, /\[TTO Stage 3\/4\] Preserve Critical/);
});
