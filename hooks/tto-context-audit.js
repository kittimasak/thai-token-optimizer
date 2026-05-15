#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const { estimateTokens } = require('./tto-token-estimator');
const { getLatestContinuitySummary } = require('./tto-runtime-analytics');

function safeRead(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
}

function compileGlobPattern(pattern) {
  const escaped = String(pattern)
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '___DOUBLESTAR___')
    .replace(/\*/g, '[^/]*')
    .replace(/___DOUBLESTAR___/g, '.*');
  return new RegExp(`^${escaped}$`);
}

function parseContextIgnore(root) {
  const file = path.join(root, '.contextignore');
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(p => compileGlobPattern(p));
}

function isIgnored(p, root, patterns) {
  const rel = path.relative(root, p).replace(/\\/g, '/');
  return patterns.some(re => re.test(rel) || re.test(p.replace(/\\/g, '/')) || re.test(path.basename(p)));
}

function walkFiles(root, matcher, options = {}) {
  const out = [];
  if (!root || !fs.existsSync(root)) return out;
  const patterns = parseContextIgnore(options.projectRoot || root);
  const stack = [root];
  const maxFiles = Number(options.maxFiles || 2000);
  while (stack.length) {
    if (out.length >= maxFiles) break;
    const p = stack.pop();
    if (isIgnored(p, options.projectRoot || root, patterns)) continue;
    
    let st;
    try { st = fs.statSync(p); } catch { continue; }
    if (st.isDirectory()) {
      let entries = [];
      try { entries = fs.readdirSync(p); } catch { continue; }
      for (const e of entries) stack.push(path.join(p, e));
      continue;
    }
    if (!st.isFile()) continue;
    if (!matcher || matcher(p)) out.push(p);
  }
  return out;
}

function summarizeFiles(name, files) {
  let bytes = 0;
  let tokens = 0;
  for (const f of files) {
    let st;
    try { st = fs.statSync(f); } catch { continue; }
    bytes += st.size;
    const text = safeRead(f);
    tokens += estimateTokens(text, 'generic').estimatedTokens;
  }
  return { name, files: files.length, bytes, estimatedTokens: tokens };
}

function buildContextAudit(opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const home = opts.home || os.homedir();
  const codexHome = process.env.CODEX_HOME || path.join(home, '.codex');
  const claudeHome = process.env.CLAUDE_HOME || path.join(home, '.claude');
  const geminiHome = process.env.GEMINI_HOME || path.join(home, '.gemini');
  const opencodeHome = process.env.OPENCODE_CONFIG_DIR || path.join(home, '.config', 'opencode');
  const openclawHome = process.env.OPENCLAW_HOME || path.join(home, '.openclaw');
  const hermesHome = process.env.HERMES_HOME || path.join(home, '.hermes');

  const skills = [
    ...walkFiles(path.join(home, '.codex', 'skills'), (p) => /SKILL\.md$/i.test(p), { maxFiles: 300, projectRoot: cwd }),
    ...walkFiles(path.join(home, '.claude', 'skills'), (p) => /SKILL\.md$/i.test(p), { maxFiles: 300, projectRoot: cwd }),
    ...walkFiles(path.join(cwd, 'skills'), (p) => /SKILL\.md$/i.test(p), { maxFiles: 500, projectRoot: cwd })
  ];
  const mcp = [
    ...walkFiles(path.join(codexHome, '.agents'), (p) => /plugins\/marketplace\.json$/i.test(p), { projectRoot: cwd }),
    ...walkFiles(path.join(claudeHome, '.claude-plugin'), (p) => /plugin\.json$/i.test(p), { projectRoot: cwd }),
    ...walkFiles(path.join(cwd, '.agents'), (p) => /marketplace\.json$/i.test(p), { maxFiles: 200, projectRoot: cwd })
  ];
  const config = [
    path.join(codexHome, 'config.toml'),
    path.join(codexHome, 'hooks.json'),
    path.join(claudeHome, 'settings.json'),
    path.join(geminiHome, 'settings.json'),
    path.join(opencodeHome, 'opencode.json'),
    path.join(openclawHome, 'openclaw.json'),
    path.join(hermesHome, 'config.yaml')
  ].filter((f) => fs.existsSync(f));
  const memory = [
    ...walkFiles(cwd, (p) => /(^|\/)(MEMORY|memory)\.md$/i.test(p), { maxFiles: 500, projectRoot: cwd }),
    ...walkFiles(path.join(home, '.codex'), (p) => /(^|\/)(MEMORY|memory)\.md$/i.test(p), { maxFiles: 200, projectRoot: cwd }),
    ...walkFiles(path.join(home, '.claude'), (p) => /(^|\/)(MEMORY|memory)\.md$/i.test(p), { maxFiles: 200, projectRoot: cwd })
  ];
  const agents = [
    path.join(codexHome, 'AGENTS.md'),
    path.join(opencodeHome, 'agents', 'thai-token-optimizer.md'),
    ...walkFiles(path.join(cwd, '.agents'), (p) => /\.md$/i.test(p), { maxFiles: 200, projectRoot: cwd })
  ].filter((f) => fs.existsSync(f));
  const tools = [
    ...walkFiles(cwd, (p) => /(^|\/)(TOOLS|tools)\.md$/i.test(p), { maxFiles: 300, projectRoot: cwd }),
    ...walkFiles(cwd, (p) => /hook(s)?\.json$/i.test(path.basename(p)), { maxFiles: 300, projectRoot: cwd })
  ];

  const components = [
    summarizeFiles('skills', Array.from(new Set(skills))),
    summarizeFiles('mcp', Array.from(new Set(mcp))),
    summarizeFiles('config', Array.from(new Set(config))),
    summarizeFiles('memory', Array.from(new Set(memory))),
    summarizeFiles('agents', Array.from(new Set(agents))),
    summarizeFiles('tools', Array.from(new Set(tools)))
  ];
  const totalTokens = components.reduce((a, c) => a + c.estimatedTokens, 0);
  const totalBytes = components.reduce((a, c) => a + c.bytes, 0);
  const rows = components
    .map((c) => ({
      ...c,
      tokenPercent: totalTokens > 0 ? Math.round((c.estimatedTokens / totalTokens) * 1000) / 10 : 0
    }))
    .sort((a, b) => b.estimatedTokens - a.estimatedTokens);

  return {
    generatedAt: new Date().toISOString(),
    cwd,
    totalEstimatedTokens: totalTokens,
    totalBytes,
    components: rows,
    recommendations: rows
      .filter((r) => r.tokenPercent >= 20)
      .map((r) => `ลด ${r.name}: ใช้งานเฉพาะไฟล์จำเป็น/แยกไฟล์ยาว`)
  };
}

module.exports = { buildContextAudit };
