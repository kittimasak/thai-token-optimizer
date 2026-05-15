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
const { HOME_DIR, setState, getState } = require('../hooks/tto-config');
const { setPolicy, getPolicy } = require('../hooks/tto-policy');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'bin', 'thai-token-optimizer.js');
const NODE = process.execPath || 'node';

const AGENT_TEXT = `# TTO v2.0 [⚓]
[S]=Detail [A]=Mirror [T]=Senior+Compact [P]=[S]>[A]>Save
- **Acts:** Res TH? [T]+Thai : [T]+Eng. Mirror [A]. If [S], apply [S]-Mode.
- **[Lazy_Load]:** Read MANUAL.md for Cmd help/flags. NEVER guess.
`;

const GEMINI_EXTENSION_CONTEXT = `${AGENT_TEXT}
## Gemini CLI [⚓]
- **Acts:** Mirror [A] 100%. [P] applies. [Lazy_Load] MANUAL.md for Cmd details.
`;

function q(s) { return JSON.stringify(String(s)); }
function stamp() { return new Date().toISOString().replace(/[:.]/g, '-'); }
function uniqueAdapterBackupPath(file) {
  const backupDir = path.join(HOME_DIR, 'adapter-backups');
  fs.mkdirSync(backupDir, { recursive: true });
  let i = 0;
  while (true) {
    const suffix = i === 0 ? '' : `-${i}`;
    const candidate = path.join(backupDir, `${path.basename(file)}.${stamp()}.${process.pid}${suffix}.bak`);
    if (!fs.existsSync(candidate)) return candidate;
    i += 1;
  }
}
function writeWithBackup(file, body) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) fs.copyFileSync(file, uniqueAdapterBackupPath(file));
  fs.writeFileSync(file, String(body).trimEnd() + '\n');
  return file;
}
function readJson(file, fallback = {}) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) fs.copyFileSync(file, uniqueAdapterBackupPath(file));
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n');
  return file;
}
function command(file) { return `${q(NODE)} ${q(path.join(ROOT, 'hooks', file))}`; }
function commandHook(name, file, timeout = 5000) {
  return { name, type: 'command', command: command(file), timeout };
}
function isTtoHook(h) {
  return JSON.stringify(h || {}).includes('thai-token-optimizer') || JSON.stringify(h || {}).includes('tto-');
}
function addGeminiHook(settings, event, matcher, hook) {
  settings.hooks ||= {};
  settings.hooks[event] ||= [];
  settings.hooks[event] = settings.hooks[event].filter(g => !isTtoHook(g));
  settings.hooks[event].push({ matcher, hooks: [hook] });
}
function writeGeminiCommand(dir, rel, description, prompt) {
  const file = path.join(dir, 'commands', ...rel.split('/'));
  writeWithBackup(file, `description = ${q(description)}\nprompt = """\n${prompt.trim()}\n"""`);
  return file;
}
function installGemini() {
  const geminiHome = process.env.GEMINI_HOME || path.join(os.homedir(), '.gemini');
  const extensionDir = path.join(geminiHome, 'extensions', 'thai-token-optimizer');
  const settingsPath = path.join(geminiHome, 'settings.json');
  fs.mkdirSync(extensionDir, { recursive: true });

  const metadata = {
    name: 'thai-token-optimizer',
    version: '2.0.0',
    contextFileName: 'GEMINI.md',
    excludeTools: ['run_shell_command(rm -rf)', 'run_shell_command(git push --force)', 'run_shell_command(DROP TABLE)']
  };
  writeJson(path.join(extensionDir, 'gemini-extension.json'), metadata);
  writeWithBackup(path.join(extensionDir, 'GEMINI.md'), GEMINI_EXTENSION_CONTEXT);

  const cli = `${q(NODE)} ${q(CLI)}`;
  writeGeminiCommand(extensionDir, 'tto/mode.toml', 'Set TTO mode (auto|lite|full|safe|off).', `!{${cli} {{args}}}\n\nTTO v2.0 mode set to {{args}}. Reply compact Thai, keep technicals exact.`);
  writeGeminiCommand(extensionDir, 'tto/status.toml', 'Show TTO status.', `TTO v2.0 Status:\n\`\`\`json\n!{${cli} status}\n\`\`\``);
  writeGeminiCommand(extensionDir, 'tto/compress.toml', 'Compress Thai text.', `Optimize text with TTO v2.0:\n\n{{args}}\n\nOutput:\n\`\`\`\n!{${cli} compress --level auto "{{args}}"}\n\`\`\``);
  writeGeminiCommand(extensionDir, 'tto/estimate.toml', 'Estimate tokens.', `Token estimation:\n\n{{args}}\n\n\`\`\`json\n!{${cli} estimate --target gemini "{{args}}"}\n\`\`\``);

  const settings = readJson(settingsPath, {});
  addGeminiHook(settings, 'SessionStart', 'startup|resume|clear', commandHook('thai-token-optimizer-session', 'tto-gemini-session.js'));
  addGeminiHook(settings, 'BeforeTool', '*', commandHook('thai-token-optimizer-before-tool', 'tto-gemini-beforetool.js'));
  addGeminiHook(settings, 'AfterTool', '*', commandHook('thai-token-optimizer-after-tool', 'tto-gemini-aftertool.js'));
  addGeminiHook(settings, 'PreCompress', '*', commandHook('thai-token-optimizer-precompress', 'tto-gemini-precompress.js'));
  writeJson(settingsPath, settings);
  setPolicy({ adapters: { ...getPolicy().adapters, gemini: true } });
  return [
    { adapter: 'gemini', file: path.join(extensionDir, 'gemini-extension.json') },
    { adapter: 'gemini', file: path.join(extensionDir, 'GEMINI.md') },
    { adapter: 'gemini', file: settingsPath }
  ];
}

function opencodePluginSource() {
  const node = q(NODE);
  const root = q(ROOT);
  const cli = q(CLI);
  const statePath = q(path.join(HOME_DIR, 'state.json'));
  const context = JSON.stringify(AGENT_TEXT + '\nOpenCode plugin: compact Thai output, strict safety for risky tools, preserve exact code/path/version/error.');
  return `// Thai Token Optimizer v2.0 — OpenCode native plugin.\n// Generated by thai-token-optimizer installer. Version intentionally remains 2.0.0.\nimport fs from 'node:fs';\nconst node = ${node};\nconst root = ${root};\nconst cli = ${cli};\nconst statePath = ${statePath};\nconst contextText = ${context};\n\nasync function run($, args) {\n  try {\n    const out = await $\`${'${node}'} ${'${args}'}\`;\n    return String(out.stdout || out || '').trim();\n  } catch (e) {\n    return '';\n  }\n}\nfunction getState() {\n  try { if (fs.existsSync(statePath)) return JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch (_) {}\n  return { enabled: true, level: 'auto' };\n}\nfunction textOf(v) {\n  try { return typeof v === 'string' ? v : JSON.stringify(v); } catch { return String(v || ''); }\n}\nfunction isRisky(text) {\n  return /(rm\\s+-rf|DROP\\s+TABLE|git\\s+push\\s+--force|production|prod|secret|api[_-]?key|password|migration|auth|payment|พุชฟอร์ซ|ลบไฟล์ทั้งหมด|ฟอร์แมต|ฐานข้อมูล|ตาราง|ลบข้อมูล|ย้ายข้อมูล|ดรอปเทเบิ้ล|ดรอปดาต้าเบส|ขึ้นระบบจริง|โปรดักชัน|ปล่อยระบบ|ดีพลอย|ดันขึ้นโปรดักชัน|รหัสผ่าน|คีย์ลับ|โทเคนลับ|ความปลอดภัย|สิทธิ์|ยืนยันตัวตน|ชำระเงิน|จ่ายเงิน)/i.test(textOf(text));\n}\nexport const ThaiTokenOptimizer = async ({ client, $ }) => {\n  await client?.app?.log?.({ body: { service: 'thai-token-optimizer', level: 'info', message: 'Thai Token Optimizer v2.0 OpenCode plugin loaded' } }).catch?.(()=>{});\n  return {\n    'shell.env': async (input, output) => {\n      const state = getState();\n      output.env.THAI_TOKEN_OPTIMIZER = state.enabled === false ? '0' : '1';\n      output.env.THAI_TOKEN_OPTIMIZER_LEVEL = state.level || 'auto';\n      output.env.THAI_TOKEN_OPTIMIZER_ROOT = root;\n    },\n    'tool.execute.before': async (input, output) => {\n      const payload = textOf({ input, output });\n      if (isRisky(payload)) {\n        output.args = output.args || {};\n        output.args.__thaiTokenOptimizerSafety = 'Thai Token Optimizer v2.0: risky operation detected. Preserve exact command, explain risk, include backup/rollback/verification. Do not over-compress.';\n      }\n    },\n    'tool.execute.after': async (input, output) => {\n      await client?.app?.log?.({ body: { service: 'thai-token-optimizer', level: 'info', message: 'Post-tool compact Thai summary recommended' } }).catch?.(()=>{});\n    },\n    'experimental.session.compacting': async (input, output) => {\n      const state = getState();\n      output.context = output.context || [];\n      if (state.enabled === false) {\n        output.context.push('Thai Token Optimizer DISABLED. Preserve normal OpenCode behavior.');\n        return;\n      }\n      output.context.push(\`TTO v2.0.0 [\${state.level || 'auto'}]: Compact Thai. \` + contextText + '\\nDuring compaction: keep current task, changed files, commands, errors, constraints, and next action. Summarize compactly in Thai.');\n    },\n    event: async ({ event }) => {\n      if (event?.type === 'session.created') {\n        await client?.app?.log?.({ body: { service: 'thai-token-optimizer', level: 'info', message: 'Use token thai auto|lite|full|safe|off or tto auto|lite|full|safe|off' } }).catch?.(()=>{});\n      }\n    }\n  };\n};\n`;
}
function installOpenCode() {
  const configDir = process.env.OPENCODE_CONFIG_DIR || path.join(os.homedir(), '.config', 'opencode');
  const pluginDir = path.join(configDir, 'plugins');
  const commandsDir = path.join(configDir, 'commands');
  const agentsDir = path.join(configDir, 'agents');
  const skillsDir = path.join(configDir, 'skills');
  const configPath = path.join(configDir, 'opencode.json');
  fs.mkdirSync(pluginDir, { recursive: true });
  const pluginPath = writeWithBackup(path.join(pluginDir, 'thai-token-optimizer.js'), opencodePluginSource());
  const agentPath = writeWithBackup(path.join(agentsDir, 'thai-token-optimizer.md'), AGENT_TEXT + '\nOpenCode agent profile for compact Thai coding responses.');
  const skillPath = writeWithBackup(path.join(skillsDir, 'thai-token-optimizer.md'), AGENT_TEXT + '\nUse this skill when Thai token efficiency matters.');
  writeWithBackup(path.join(commandsDir, 'tto-auto.md'), 'Run `tto auto` then respond in compact Thai with Thai Token Optimizer v2.0 rules.');
  writeWithBackup(path.join(commandsDir, 'tto-safe.md'), 'Run `tto safe` then keep safety-critical details explicit while reducing filler.');
  const config = readJson(configPath, { '$schema': 'https://opencode.ai/config.json' });
  config.$schema ||= 'https://opencode.ai/config.json';
  config.plugin ||= [];
  // Local plugin directory is auto-loaded by OpenCode, but adding an explicit note in config helps users audit it.
  config.experimental ||= {};
  config.experimental.thaiTokenOptimizer = { enabled: true, version: '2.0.0', plugin: pluginPath };
  writeJson(configPath, config);
  setPolicy({ adapters: { ...getPolicy().adapters, opencode: true } });
  return [
    { adapter: 'opencode', file: pluginPath },
    { adapter: 'opencode', file: configPath },
    { adapter: 'opencode', file: agentPath },
    { adapter: 'opencode', file: skillPath }
  ];
}

function openClawHome() {
  return process.env.OPENCLAW_HOME || path.join(os.homedir(), '.openclaw');
}
function openClawHookDir() {
  return path.join(openClawHome(), 'hooks', 'thai-token-optimizer');
}
function openClawConfigPath() {
  return path.join(openClawHome(), 'openclaw.json');
}
function openClawHookMarkdown() {
  return `---
name: thai-token-optimizer
description: "Compact Thai responses with safety-aware technical preservation"
homepage: https://github.com/kittimasak/thai-token-optimizer
metadata:
  { "openclaw": { "emoji": "⚡", "events": ["gateway:startup", "agent:bootstrap", "command:new", "command:reset", "command"], "requires": { "bins": ["node"] } } }
---

# Thai Token Optimizer v2.0

OpenClaw hook for compact Thai agent behavior.

## What It Does

- Emits Thai Token Optimizer v2.0 guidance when OpenClaw starts or bootstraps an agent.
- Adds compact Thai, code-aware preservation, and safety reminders for command events.
- Keeps commands, paths, versions, errors, JSON/YAML/TOML, and constraints exact.
- Treats destructive, production, auth, secret, payment, and migration requests as safety-sensitive.

## Events

- \`gateway:startup\`
- \`agent:bootstrap\`
- \`command:new\`
- \`command:reset\`
- \`command\`
`;
}
function openClawHandlerSource() {
  const root = q(ROOT);
  const cli = q(CLI);
  const statePath = q(path.join(HOME_DIR, 'state.json'));
  const contextBase = JSON.stringify(AGENT_TEXT + '\nOpenClaw hook: compact Thai output, strict safety for risky commands, preserve exact code/path/version/error.');
  return `// Thai Token Optimizer v2.0 — OpenClaw managed hook.\n// Generated by thai-token-optimizer installer. Version intentionally remains 2.0.0.\nimport fs from 'node:fs';\nconst root = ${root};\nconst cli = ${cli};\nconst statePath = ${statePath};\nconst contextBase = ${contextBase};\n\nfunction textOf(value: any): string {\n  try { return typeof value === 'string' ? value : JSON.stringify(value); } catch { return String(value || ''); }\n}\nfunction isRisky(value: any): boolean {\n  return /(rm\\s+-rf|DROP\\s+TABLE|git\\s+push\\s+--force|production|prod|secret|api[_-]?key|password|migration|auth|payment|พุชฟอร์ซ|ลบไฟล์ทั้งหมด|ฟอร์แมต|ฐานข้อมูล|ตาราง|ลบข้อมูล|ย้ายข้อมูล|ดรอปเทเบิ้ล|ดรอปดาต้าเบส|ขึ้นระบบจริง|โปรดักชัน|ปล่อยระบบ|ดีพลอย|ดันขึ้นโปรดักชัน|รหัสผ่าน|คีย์ลับ|โทเคนลับ|ความปลอดภัย|สิทธิ์|ยืนยันตัวตน|ชำระเงิน|จ่ายเงิน)/i.test(textOf(value));\n}\nfunction guidance(event: any) {\n  const eventName = [event?.type, event?.action].filter(Boolean).join(':') || 'openclaw';\n  let state = { enabled: true, level: 'auto' };\n  try { if (fs.existsSync(statePath)) state = JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch (_) {}\n  \n  const context = state.enabled \n    ? \`TTO v2.0.0 [\${state.level}]: Compact Thai. \` + contextBase\n    : 'Thai Token Optimizer is currently DISABLED. Proceed with normal responses.';\n\n  return {\n    service: 'thai-token-optimizer',\n    version: '2.0.0',\n    root,\n    cli,\n    enabled: !!state.enabled,\n    level: state.level,\n    event: eventName,\n    instruction: context,\n    safety: isRisky(event) ? 'safe mode required: preserve exact command, explain risk, include backup, verification, and rollback.' : 'compact Thai mode recommended.'\n  };\n}\n\nconst handler = async (event: any = {}) => {\n  const info = guidance(event);\n  if (event?.type === 'gateway' || event?.type === 'agent' || event?.type === 'command') {\n    console.log('[thai-token-optimizer]', JSON.stringify(info));\n  }\n  return info;\n};\n\nexport { guidance };\nexport default handler;\n`;
}
function openClawSimulatorSource() {
  const root = q(ROOT);
  const cli = q(CLI);
  const statePath = q(path.join(HOME_DIR, 'state.json'));
  const contextBase = JSON.stringify(AGENT_TEXT + '\nOpenClaw hook: compact Thai output, strict safety for risky commands, preserve exact code/path/version/error.');
  return `#!/usr/bin/env node\n// Thai Token Optimizer v2.0 — local OpenClaw hook simulator.\nconst fs = require('fs');\nconst root = ${root};\nconst cli = ${cli};\nconst statePath = ${statePath};\nconst contextBase = ${contextBase};\nfunction textOf(value) { try { return typeof value === 'string' ? value : JSON.stringify(value); } catch { return String(value || ''); } }\nfunction isRisky(value) { return /(rm\\s+-rf|DROP\\s+TABLE|git\\s+push\\s+--force|production|prod|secret|api[_-]?key|password|migration|auth|payment|พุชฟอร์ซ|ลบไฟล์ทั้งหมด|ฟอร์แมต|ฐานข้อมูล|ตาราง|ลบข้อมูล|ย้ายข้อมูล|ดรอปเทเบิ้ล|ดรอปดาต้าเบส|ขึ้นระบบจริง|โปรดักชัน|ปล่อยระบบ|ดีพลอย|ดันขึ้นโปรดักชัน|รหัสผ่าน|คีย์ลับ|โทเคนลับ|ความปลอดภัย|สิทธิ์|ยืนยันตัวตน|ชำระเงิน|จ่ายเงิน)/i.test(textOf(value)); }\nfunction guidance(event = {}) {\n  const eventName = [event && event.type, event && event.action].filter(Boolean).join(':') || 'openclaw';\n  let state = { enabled: true, level: 'auto' };\n  try { if (fs.existsSync(statePath)) state = JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch (_) {}\n  const context = state.enabled ? \`TTO v2.0.0 [\${state.level}]: Compact Thai. \` + contextBase : 'Thai Token Optimizer DISABLED.';\n  return { service: 'thai-token-optimizer', version: '2.0.0', root, cli, enabled: !!state.enabled, level: state.level, event: eventName, instruction: context, safety: isRisky(event) ? 'safe mode required: preserve exact command, explain risk, include backup, verification, and rollback.' : 'compact Thai mode recommended.' };\n}\nif (require.main === module) {\n  let input = '';\n  process.stdin.on('data', chunk => { input += chunk; });\n  process.stdin.on('end', () => {\n    let event = {};\n    try { event = input.trim() ? JSON.parse(input) : {}; } catch { event = { type: 'invalid' }; }\n    console.log(JSON.stringify(guidance(event), null, 2));\n  });\n}\nmodule.exports = { guidance };\n`;
}
function enableOpenClawConfig(configPath, hookDir) {
  const config = readJson(configPath, {});
  config.hooks ||= {};
  config.hooks.internal ||= {};
  config.hooks.internal.entries ||= {};
  config.hooks.internal.entries['thai-token-optimizer'] = {
    enabled: true,
    path: hookDir,
    events: ['gateway:startup', 'agent:bootstrap', 'command:new', 'command:reset', 'command']
  };
  writeJson(configPath, config);
  return configPath;
}
function installOpenClaw() {
  const hookDir = openClawHookDir();
  const configPath = openClawConfigPath();
  const hookMd = writeWithBackup(path.join(hookDir, 'HOOK.md'), openClawHookMarkdown());
  const handler = writeWithBackup(path.join(hookDir, 'handler.ts'), openClawHandlerSource());
  const simulator = writeWithBackup(path.join(hookDir, 'simulate.cjs'), openClawSimulatorSource());
  enableOpenClawConfig(configPath, hookDir);
  setPolicy({ adapters: { ...getPolicy().adapters, openclaw: true } });
  return [
    { adapter: 'openclaw', file: hookMd },
    { adapter: 'openclaw', file: handler },
    { adapter: 'openclaw', file: simulator },
    { adapter: 'openclaw', file: configPath }
  ];
}

function hermesHome() {
  return process.env.HERMES_HOME || path.join(os.homedir(), '.hermes');
}
function hermesConfigPath() {
  return path.join(hermesHome(), 'config.yaml');
}
function hermesPluginDir() {
  return path.join(hermesHome(), 'plugins', 'thai-token-optimizer');
}
function hermesShellDir() {
  return path.join(hermesHome(), 'agent-hooks');
}
function hermesContextText() {
  return AGENT_TEXT + '\nHermes Agent integration: shell hooks + plugin hooks inject compact Thai guidance, guard risky tools, and preserve exact code/path/version/error.';
}
function hermesPluginYaml() {
  return `name: thai-token-optimizer
version: "2.0.0"
description: Thai Token Optimizer v2.0 shell and plugin hooks for Hermes Agent
`;
}
function hermesPluginSource() {
  const statePath = q(path.join(HOME_DIR, 'state.json'));
  const contextBase = JSON.stringify(hermesContextText());
  return `"""Thai Token Optimizer v2.0 — Hermes Agent plugin hooks."""
import json
import re
import os

STATE_PATH = ${statePath}
CONTEXT_BASE = ${contextBase}
RISKY = re.compile(r"(rm\\s+-rf|DROP\\s+TABLE|git\\s+push\\s+--force|production|prod|secret|api[_-]?key|password|migration|auth|payment|พุชฟอร์ซ|ลบไฟล์ทั้งหมด|ฟอร์แมต|ฐานข้อมูล|ตาราง|ลบข้อมูล|ย้ายข้อมูล|ดรอปเทเบิ้ล|ดรอปดาต้าเบส|ขึ้นระบบจริง|โปรดักชัน|ปล่อยระบบ|ดีพลอย|ดันขึ้นโปรดักชัน|รหัสผ่าน|คีย์ลับ|โทเคนลับ|ความปลอดภัย|สิทธิ์|ยืนยันตัวตน|ชำระเงิน|จ่ายเงิน)", re.I)

def _get_state():
    try:
        if os.path.exists(STATE_PATH):
            with open(STATE_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception:
        pass
    return {"enabled": True, "level": "auto"}

def _text(value):
    try:
        return value if isinstance(value, str) else json.dumps(value, ensure_ascii=False)
    except Exception:
        return str(value or "")

def _is_risky(*values):
    return any(RISKY.search(_text(value)) for value in values)

def _pre_llm_call(**kwargs):
    state = _get_state()
    if not state.get("enabled", True):
        return {"context": "Thai Token Optimizer is currently DISABLED. Proceed with normal responses."}
    
    ctx = f"TTO v2.0.0 [{state.get('level', 'auto')}]: Compact Thai. " + CONTEXT_BASE
    return {"context": ctx + "\\nDuring this Hermes turn: answer compactly in Thai, keep commands/paths/versions/errors exact, and do not over-compress safety-critical work."}

def _pre_tool_call(tool_name=None, args=None, params=None, **kwargs):
    payload = {"tool_name": tool_name, "args": args, "params": params, "extra": kwargs}
    if _is_risky(payload):
        return {
            "action": "block",
            "message": "Thai Token Optimizer v2.0: risky tool call detected. Confirm exact command, backup, verification, and rollback before proceeding."
        }
    return None

def _post_tool_call(**kwargs):
    return None

def _post_llm_call(**kwargs):
    return None

def _session_event(**kwargs):
    return None

def _transform_terminal_output(command="", output="", exit_code=0, cwd="", task_id=None, **kwargs):
    text = _text(output)
    if len(text) <= 50000:
        return None
    head = "\\n".join(text.splitlines()[:80])
    return f"{head}\\n\\n[thai-token-optimizer summary: terminal output truncated safely; preserve command={command!r}, exit_code={exit_code}, cwd={cwd!r}]"

def _transform_llm_output(response_text="", **kwargs):
    return response_text

def register(ctx):
    ctx.register_hook("pre_llm_call", _pre_llm_call)
    ctx.register_hook("pre_tool_call", _pre_tool_call)
    ctx.register_hook("post_tool_call", _post_tool_call)
    ctx.register_hook("post_llm_call", _post_llm_call)
    ctx.register_hook("on_session_start", _session_event)
    ctx.register_hook("on_session_end", _session_event)
    ctx.register_hook("on_session_finalize", _session_event)
    ctx.register_hook("on_session_reset", _session_event)
    ctx.register_hook("subagent_stop", _session_event)
    ctx.register_hook("transform_terminal_output", _transform_terminal_output)
    ctx.register_hook("transform_llm_output", _transform_llm_output)
`;
}
function hermesShellHookSource(eventName) {
  const statePath = q(path.join(HOME_DIR, 'state.json'));
  const contextBase = JSON.stringify(hermesContextText());
  return `#!/usr/bin/env node
// Thai Token Optimizer v2.0 — Hermes shell hook: ${eventName}
const fs = require('fs');
const statePath = ${statePath};
const contextBase = ${contextBase};
function textOf(value) { try { return typeof value === 'string' ? value : JSON.stringify(value); } catch { return String(value || ''); } }
function isRisky(text) {\n  return /(rm\\s+-rf|DROP\\s+TABLE|git\\s+push\\s+--force|production|prod|secret|api[_-]?key|password|migration|auth|payment|พุชฟอร์ซ|ลบไฟล์ทั้งหมด|ฟอร์แมต|ฐานข้อมูล|ตาราง|ลบข้อมูล|ย้ายข้อมูล|ดรอปเทเบิ้ล|ดรอปดาต้าเบส|ขึ้นระบบจริง|โปรดักชัน|ปล่อยระบบ|ดีพลอย|ดันขึ้นโปรดักชัน|รหัสผ่าน|คีย์ลับ|โทเคนลับ|ความปลอดภัย|สิทธิ์|ยืนยันตัวตน|ชำระเงิน|จ่ายเงิน)/i.test(textOf(text));\n}
function response(payload) {
  const event = payload.hook_event_name || ${JSON.stringify(eventName)};
  let state = { enabled: true, level: 'auto' };
  try { if (fs.existsSync(statePath)) state = JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch (_) {}

  if (event === 'pre_llm_call') {
    const context = state.enabled 
      ? \`TTO v2.0.0 [\${state.level}]: Compact Thai. \` + contextBase
      : 'Thai Token Optimizer DISABLED.';
    if (!state.enabled) return { context };
    return { context: context + '\\nHermes shell hook active: compact Thai, preserve exact technical details, and keep safety steps explicit.' };
  }
  if (event === 'pre_tool_call' && isRisky(payload)) {
    return { action: 'block', message: 'Thai Token Optimizer v2.0: risky Hermes tool call detected. Confirm exact command, backup, verification, and rollback before proceeding.' };
  }
  return {};
}
let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  let payload = {};
  try { payload = input.trim() ? JSON.parse(input) : {}; } catch { payload = { hook_event_name: ${JSON.stringify(eventName)}, parse_error: true }; }
  console.log(JSON.stringify(response(payload)));
});
`;
}
const HERMES_SHELL_EVENTS = Object.freeze(['pre_llm_call', 'pre_tool_call', 'post_tool_call', 'on_session_start', 'on_session_reset', 'on_session_finalize', 'subagent_stop']);
function hermesShellScriptPath(eventName) {
  return path.join(hermesShellDir(), `thai-token-optimizer-${eventName}.cjs`);
}
function hermesManagedConfigBlock() {
  const hookLines = HERMES_SHELL_EVENTS.map(eventName => {
    const matcher = eventName === 'pre_tool_call' || eventName === 'post_tool_call' ? '\n    - matcher: ".*"' : '\n    -';
    return `  ${eventName}:${matcher}\n      command: ${q(`${NODE} ${hermesShellScriptPath(eventName)}`)}\n      timeout: 10`;
  }).join('\n');
  return `# Thai Token Optimizer START
hooks_auto_accept: true
plugins:
  enabled:
    - thai-token-optimizer
hooks:
${hookLines}
# Thai Token Optimizer END`;
}
function writeHermesConfig() {
  const file = hermesConfigPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const block = hermesManagedConfigBlock();
  const start = '# Thai Token Optimizer START';
  const end = '# Thai Token Optimizer END';
  let current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (fs.existsSync(file)) fs.copyFileSync(file, uniqueAdapterBackupPath(file));
  const re = new RegExp(`${start}[\\s\\S]*?${end}`, 'm');
  const next = re.test(current) ? current.replace(re, block) : `${current.trimEnd()}\n\n${block}\n`;
  fs.writeFileSync(file, next.replace(/^\n+/, ''));
  return file;
}
function installHermes() {
  const pluginDir = hermesPluginDir();
  const shellDir = hermesShellDir();
  const files = [];
  files.push(writeWithBackup(path.join(pluginDir, 'plugin.yaml'), hermesPluginYaml()));
  files.push(writeWithBackup(path.join(pluginDir, '__init__.py'), hermesPluginSource()));
  for (const eventName of HERMES_SHELL_EVENTS) {
    const file = writeWithBackup(path.join(shellDir, `thai-token-optimizer-${eventName}.cjs`), hermesShellHookSource(eventName));
    try { fs.chmodSync(file, 0o755); } catch (_) {}
    files.push(file);
  }
  files.push(writeHermesConfig());
  setPolicy({ adapters: { ...getPolicy().adapters, hermes: true } });
  return files.map(file => ({ adapter: 'hermes', file }));
}

const ADAPTERS = {
  cursor: { file: path.join(os.homedir(), '.cursor', 'rules', 'thai-token-optimizer.mdc'), body: `---\ndescription: Thai Token Optimizer v2.0 compact Thai coding responses\nalwaysApply: true\n---\n\n${AGENT_TEXT}` },
  aider: { file: path.join(os.homedir(), '.aider', 'thai-token-optimizer.md'), body: AGENT_TEXT },
  cline: { file: path.join(os.homedir(), '.cline', 'rules', 'thai-token-optimizer.md'), body: AGENT_TEXT },
  roo: { file: path.join(os.homedir(), '.roo', 'rules', 'thai-token-optimizer.md'), body: AGENT_TEXT }
};

function installGuidanceAdapter(name) {
  const spec = ADAPTERS[name];
  if (!spec) throw new Error(`Unsupported guidance adapter: ${name}`);
  return [{ adapter: name, file: writeWithBackup(spec.file, spec.body) }];
}
function installAdapter(target) {
  const targets = target === 'all' ? ['cursor', 'aider', 'gemini', 'opencode', 'openclaw', 'hermes', 'cline', 'roo'] : [target];
  const installed = [];
  for (const name of targets) {
    if (name === 'gemini') installed.push(...installGemini());
    else if (name === 'opencode') installed.push(...installOpenCode());
    else if (name === 'openclaw') installed.push(...installOpenClaw());
    else if (name === 'hermes') installed.push(...installHermes());
    else installed.push(...installGuidanceAdapter(name));
  }
  if (!installed.length) throw new Error(`Unsupported adapter: ${target}`);
  console.log(JSON.stringify({ installed, note: 'Gemini/OpenCode/OpenClaw/Hermes use native extension/plugin/hook integration; other adapters use portable guidance files.' }, null, 2));
  return installed;
}

function removeFileIfExists(file) {
  try { if (fs.existsSync(file)) fs.rmSync(file, { force: true }); return file; } catch { return file; }
}
function removeEmptyParents(file, stopDir) {
  let dir = path.dirname(file);
  const stop = path.resolve(stopDir || os.homedir());
  while (dir.startsWith(stop) && dir !== stop) {
    try { fs.rmdirSync(dir); } catch { break; }
    dir = path.dirname(dir);
  }
}
function uninstallGemini() {
  const geminiHome = process.env.GEMINI_HOME || path.join(os.homedir(), '.gemini');
  const settingsPath = path.join(geminiHome, 'settings.json');
  const settings = readJson(settingsPath, {});
  if (settings.hooks) {
    for (const ev of Object.keys(settings.hooks)) {
      if (Array.isArray(settings.hooks[ev])) settings.hooks[ev] = settings.hooks[ev].filter(g => !isTtoHook(g));
      if (Array.isArray(settings.hooks[ev]) && settings.hooks[ev].length === 0) delete settings.hooks[ev];
    }
    if (Object.keys(settings.hooks).length === 0) delete settings.hooks;
    writeJson(settingsPath, settings);
  }
  const extensionDir = path.join(geminiHome, 'extensions', 'thai-token-optimizer');
  if (fs.existsSync(extensionDir)) fs.rmSync(extensionDir, { recursive: true, force: true });
  setPolicy({ adapters: { ...getPolicy().adapters, gemini: false } });
  return [{ adapter: 'gemini', removed: extensionDir }, { adapter: 'gemini', updated: settingsPath }];
}
function uninstallOpenCode() {
  const configDir = process.env.OPENCODE_CONFIG_DIR || path.join(os.homedir(), '.config', 'opencode');
  const files = [
    path.join(configDir, 'plugins', 'thai-token-optimizer.js'),
    path.join(configDir, 'agents', 'thai-token-optimizer.md'),
    path.join(configDir, 'skills', 'thai-token-optimizer.md'),
    path.join(configDir, 'commands', 'tto-auto.md'),
    path.join(configDir, 'commands', 'tto-safe.md')
  ];
  for (const file of files) { removeFileIfExists(file); removeEmptyParents(file, configDir); }
  const configPath = path.join(configDir, 'opencode.json');
  const config = readJson(configPath, null);
  if (config) {
    if (config.experimental) delete config.experimental.thaiTokenOptimizer;
    writeJson(configPath, config);
  }
  setPolicy({ adapters: { ...getPolicy().adapters, opencode: false } });
  return files.map(file => ({ adapter: 'opencode', removed: file })).concat({ adapter: 'opencode', updated: configPath });
}
function uninstallOpenClaw() {
  const hookDir = openClawHookDir();
  const configPath = openClawConfigPath();
  if (fs.existsSync(hookDir)) fs.rmSync(hookDir, { recursive: true, force: true });
  removeEmptyParents(path.join(hookDir, 'handler.ts'), openClawHome());
  const config = readJson(configPath, null);
  if (config?.hooks?.internal?.entries) {
    delete config.hooks.internal.entries['thai-token-optimizer'];
    writeJson(configPath, config);
  }
  setPolicy({ adapters: { ...getPolicy().adapters, openclaw: false } });
  return [{ adapter: 'openclaw', removed: hookDir }, { adapter: 'openclaw', updated: configPath }];
}
function uninstallHermes() {
  const pluginDir = hermesPluginDir();
  if (fs.existsSync(pluginDir)) fs.rmSync(pluginDir, { recursive: true, force: true });
  const files = HERMES_SHELL_EVENTS.map(hermesShellScriptPath);
  for (const file of files) removeFileIfExists(file);
  const configPath = hermesConfigPath();
  if (fs.existsSync(configPath)) {
    const current = fs.readFileSync(configPath, 'utf8');
    const next = current.replace(/# Thai Token Optimizer START[\s\S]*?# Thai Token Optimizer END\n?/m, '').replace(/\n{3,}/g, '\n\n');
    writeWithBackup(configPath, next.trimEnd());
  }
  setPolicy({ adapters: { ...getPolicy().adapters, hermes: false } });
  return [{ adapter: 'hermes', removed: pluginDir }, ...files.map(file => ({ adapter: 'hermes', removed: file })), { adapter: 'hermes', updated: configPath }];
}
function uninstallGuidanceAdapter(name) {
  const spec = ADAPTERS[name];
  if (!spec) throw new Error(`Unsupported guidance adapter: ${name}`);
  removeFileIfExists(spec.file);
  removeEmptyParents(spec.file, os.homedir());
  setPolicy({ adapters: { ...getPolicy().adapters, [name]: false } });
  return [{ adapter: name, removed: spec.file }];
}
function uninstallAdapter(target) {
  const targets = target === 'all' ? ['cursor', 'aider', 'gemini', 'opencode', 'openclaw', 'hermes', 'cline', 'roo'] : [target];
  const removed = [];
  for (const name of targets) {
    if (name === 'gemini') removed.push(...uninstallGemini());
    else if (name === 'opencode') removed.push(...uninstallOpenCode());
    else if (name === 'openclaw') removed.push(...uninstallOpenClaw());
    else if (name === 'hermes') removed.push(...uninstallHermes());
    else removed.push(...uninstallGuidanceAdapter(name));
  }
  if (!removed.length) throw new Error(`Unsupported adapter: ${target}`);
  console.log(JSON.stringify({ removed }, null, 2));
  return removed;
}

module.exports = { ADAPTERS, installAdapter, uninstallAdapter, AGENT_TEXT, installGemini, installOpenCode, installOpenClaw, installHermes, uninstallGemini, uninstallOpenCode, uninstallOpenClaw, uninstallHermes, GEMINI_EXTENSION_CONTEXT, opencodePluginSource, openClawHandlerSource, hermesPluginSource };
