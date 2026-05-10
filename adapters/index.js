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
const { HOME_DIR, setState, getState } = require('../hooks/tto-config');
const { setPolicy, getPolicy } = require('../hooks/tto-policy');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'bin', 'thai-token-optimizer.js');
const NODE = process.execPath || 'node';

const AGENT_TEXT = `# Thai Token Optimizer v1.0

Use compact Thai responses while preserving technical accuracy.

Rules:
- ตอบไทยกระชับ ตัดคำสุภาพ/filler/hedging ที่ไม่จำเป็น
- คง technical terms, file paths, commands, flags, URLs, versions, errors, identifiers exact
- โค้ด/คำสั่งก่อน คำอธิบายหลัง เมื่อเป็นงาน coding/DevOps
- ห้ามบีบงานเสี่ยงเกินไป: destructive commands, database, production, auth, security, secrets, payment
- คง constraint สำคัญ เช่น ต้อง/ห้าม/เด็ดขาด/version/v1.0/1.0.0
- ถ้าเป็น Gemini CLI หรือ OpenCode ให้ใช้กฎเดียวกันนี้ตลอด session

Controls:
- Terminal: \`tto auto|lite|full|safe|off|status\`
- In chat: \`token thai auto|lite|full|safe|off\`
`;

const GEMINI_EXTENSION_CONTEXT = `${AGENT_TEXT}

## Gemini CLI integration
Thai Token Optimizer v1.0 is active as a Gemini CLI extension context.
Prefer concise Thai. Preserve commands, paths, filenames, versions, JSON/YAML/TOML, errors, and constraints exactly.
For risky tool use, keep warnings, backup, rollback, and verification steps.
Custom commands available after extension install:
- /tto:auto
- /tto:lite
- /tto:full
- /tto:safe
- /tto:off
- /tto:status
- /tto:compress <text>
- /tto:estimate <text>
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
    version: '1.0.0',
    contextFileName: 'GEMINI.md',
    excludeTools: [
      'run_shell_command(rm -rf)',
      'run_shell_command(git push --force)',
      'run_shell_command(DROP TABLE)'
    ]
  };
  writeJson(path.join(extensionDir, 'gemini-extension.json'), metadata);
  writeWithBackup(path.join(extensionDir, 'GEMINI.md'), GEMINI_EXTENSION_CONTEXT);

  const cli = `${q(NODE)} ${q(CLI)}`;
  writeGeminiCommand(extensionDir, 'tto/auto.toml', 'Enable Thai Token Optimizer auto mode.', `!{${cli} auto}\n\nThai Token Optimizer v1.0 auto mode is now enabled. Reply compact Thai and preserve technical accuracy.`);
  writeGeminiCommand(extensionDir, 'tto/lite.toml', 'Enable Thai Token Optimizer lite mode.', `!{${cli} lite}\n\nThai Token Optimizer v1.0 lite mode is now enabled.`);
  writeGeminiCommand(extensionDir, 'tto/full.toml', 'Enable Thai Token Optimizer full mode.', `!{${cli} full}\n\nThai Token Optimizer v1.0 full mode is now enabled.`);
  writeGeminiCommand(extensionDir, 'tto/safe.toml', 'Enable Thai Token Optimizer safe mode.', `!{${cli} safe}\n\nThai Token Optimizer v1.0 safe mode is now enabled. Keep safety steps explicit.`);
  writeGeminiCommand(extensionDir, 'tto/off.toml', 'Disable Thai Token Optimizer.', `!{${cli} off}\n\nThai Token Optimizer v1.0 is now disabled.`);
  writeGeminiCommand(extensionDir, 'tto/status.toml', 'Show Thai Token Optimizer status.', `Current Thai Token Optimizer v1.0 status:\n\n\`\`\`json\n!{${cli} status}\n\`\`\``);
  writeGeminiCommand(extensionDir, 'tto/compress.toml', 'Compress Thai prompt text with Thai Token Optimizer.', `Compress this text with Thai Token Optimizer v1.0 and preserve code/paths/constraints:\n\n{{args}}\n\nLocal estimator output:\n\`\`\`\n!{${cli} compress --level auto "{{args}}"}\n\`\`\``);
  writeGeminiCommand(extensionDir, 'tto/estimate.toml', 'Estimate tokens for Thai text.', `Estimate token usage for this text:\n\n{{args}}\n\n\`\`\`json\n!{${cli} estimate --target gemini "{{args}}"}\n\`\`\``);

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
  const context = JSON.stringify(AGENT_TEXT + '\nOpenCode plugin: compact Thai output, strict safety for risky tools, preserve exact code/path/version/error.');
  return `// Thai Token Optimizer v1.0 — OpenCode native plugin.\n// Generated by thai-token-optimizer installer. Version intentionally remains 1.0.0.\nconst node = ${node};\nconst root = ${root};\nconst cli = ${cli};\nconst contextText = ${context};\n\nasync function run($, args) {\n  try {\n    const out = await $\`${'${node}'} ${'${args}'}\`;\n    return String(out.stdout || out || '').trim();\n  } catch (e) {\n    return '';\n  }\n}\nfunction textOf(v) {\n  try { return typeof v === 'string' ? v : JSON.stringify(v); } catch { return String(v || ''); }\n}\nfunction isRisky(text) {\n  return /(rm\\s+-rf|DROP\\s+TABLE|git\\s+push\\s+--force|production|prod|secret|api[_-]?key|password|migration|auth|payment)/i.test(textOf(text));\n}\nexport const ThaiTokenOptimizer = async ({ client, $ }) => {\n  await client?.app?.log?.({ body: { service: 'thai-token-optimizer', level: 'info', message: 'Thai Token Optimizer v1.0 OpenCode plugin loaded' } }).catch?.(()=>{});\n  return {\n    'shell.env': async (input, output) => {\n      output.env.THAI_TOKEN_OPTIMIZER = '1';\n      output.env.THAI_TOKEN_OPTIMIZER_ROOT = root;\n    },\n    'tool.execute.before': async (input, output) => {\n      const payload = textOf({ input, output });\n      if (isRisky(payload)) {\n        output.args = output.args || {};\n        output.args.__thaiTokenOptimizerSafety = 'Thai Token Optimizer v1.0: risky operation detected. Preserve exact command, explain risk, include backup/rollback/verification. Do not over-compress.';\n      }\n    },\n    'tool.execute.after': async (input, output) => {\n      await client?.app?.log?.({ body: { service: 'thai-token-optimizer', level: 'info', message: 'Post-tool compact Thai summary recommended' } }).catch?.(()=>{});\n    },\n    'experimental.session.compacting': async (input, output) => {\n      output.context = output.context || [];\n      output.context.push(contextText + '\\nDuring compaction: keep current task, changed files, commands, errors, constraints, and next action. Summarize compactly in Thai.');\n    },\n    event: async ({ event }) => {\n      if (event?.type === 'session.created') {\n        await client?.app?.log?.({ body: { service: 'thai-token-optimizer', level: 'info', message: 'Use token thai auto|lite|full|safe|off or tto auto|lite|full|safe|off' } }).catch?.(()=>{});\n      }\n    }\n  };\n};\n`;
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
  writeWithBackup(path.join(commandsDir, 'tto-auto.md'), 'Run `tto auto` then respond in compact Thai with Thai Token Optimizer v1.0 rules.');
  writeWithBackup(path.join(commandsDir, 'tto-safe.md'), 'Run `tto safe` then keep safety-critical details explicit while reducing filler.');
  const config = readJson(configPath, { '$schema': 'https://opencode.ai/config.json' });
  config.$schema ||= 'https://opencode.ai/config.json';
  config.plugin ||= [];
  // Local plugin directory is auto-loaded by OpenCode, but adding an explicit note in config helps users audit it.
  config.experimental ||= {};
  config.experimental.thaiTokenOptimizer = { enabled: true, version: '1.0.0', plugin: pluginPath };
  writeJson(configPath, config);
  setPolicy({ adapters: { ...getPolicy().adapters, opencode: true } });
  return [
    { adapter: 'opencode', file: pluginPath },
    { adapter: 'opencode', file: configPath },
    { adapter: 'opencode', file: agentPath },
    { adapter: 'opencode', file: skillPath }
  ];
}

const ADAPTERS = {
  cursor: { file: path.join(os.homedir(), '.cursor', 'rules', 'thai-token-optimizer.mdc'), body: `---\ndescription: Thai Token Optimizer v1.0 compact Thai coding responses\nalwaysApply: true\n---\n\n${AGENT_TEXT}` },
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
  const targets = target === 'all' ? ['cursor', 'aider', 'gemini', 'opencode', 'cline', 'roo'] : [target];
  const installed = [];
  for (const name of targets) {
    if (name === 'gemini') installed.push(...installGemini());
    else if (name === 'opencode') installed.push(...installOpenCode());
    else installed.push(...installGuidanceAdapter(name));
  }
  if (!installed.length) throw new Error(`Unsupported adapter: ${target}`);
  console.log(JSON.stringify({ installed, note: 'Gemini/OpenCode use native extension/plugin integration; other adapters use portable guidance files.' }, null, 2));
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
function uninstallGuidanceAdapter(name) {
  const spec = ADAPTERS[name];
  if (!spec) throw new Error(`Unsupported guidance adapter: ${name}`);
  removeFileIfExists(spec.file);
  removeEmptyParents(spec.file, os.homedir());
  setPolicy({ adapters: { ...getPolicy().adapters, [name]: false } });
  return [{ adapter: name, removed: spec.file }];
}
function uninstallAdapter(target) {
  const targets = target === 'all' ? ['cursor', 'aider', 'gemini', 'opencode', 'cline', 'roo'] : [target];
  const removed = [];
  for (const name of targets) {
    if (name === 'gemini') removed.push(...uninstallGemini());
    else if (name === 'opencode') removed.push(...uninstallOpenCode());
    else removed.push(...uninstallGuidanceAdapter(name));
  }
  if (!removed.length) throw new Error(`Unsupported adapter: ${target}`);
  console.log(JSON.stringify({ removed }, null, 2));
  return removed;
}

module.exports = { ADAPTERS, installAdapter, uninstallAdapter, AGENT_TEXT, installGemini, installOpenCode, uninstallGemini, uninstallOpenCode, GEMINI_EXTENSION_CONTEXT, opencodePluginSource };
