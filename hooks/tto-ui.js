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



const WIDTH = 72;

function stripAnsi(s) { return String(s ?? '').replace(/\x1b\[[0-9;]*m/g, ''); }
function visibleLen(s) { return Array.from(stripAnsi(s)).length; }
function truncate(s, max) {
  s = String(s ?? '');
  if (visibleLen(s) <= max) return s;
  const chars = Array.from(s);
  return chars.slice(0, Math.max(0, max - 1)).join('') + '…';
}
function padRight(s, width) {
  s = String(s ?? '');
  const len = visibleLen(s);
  return len >= width ? truncate(s, width) : s + ' '.repeat(width - len);
}
function padLeft(s, width) {
  s = String(s ?? '');
  const len = visibleLen(s);
  return len >= width ? truncate(s, width) : ' '.repeat(width - len) + s;
}
function line(left = '├', fill = '─', right = '┤', width = WIDTH) {
  return left + fill.repeat(width - 2) + right;
}
function row(content = '', width = WIDTH) {
  return '│ ' + padRight(content, width - 4) + ' │';
}
function box(title, bodyLines = [], options = {}) {
  const width = options.width || WIDTH;
  const lines = [line('╭', '─', '╮', width)];
  if (title) {
    lines.push(row(title, width));
    lines.push(line('├', '─', '┤', width));
  }
  for (const bodyLine of bodyLines) lines.push(row(bodyLine, width));
  lines.push(line('╰', '─', '╯', width));
  return lines.join('\n');
}
function bar(percent, width = 18) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  const filled = Math.round((p / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}
function boolMark(ok, optional = false) {
  if (ok) return '✓';
  return optional ? '!' : '✗';
}
function renderStatus(state = {}) {
  const enabled = state.enabled ? '● ACTIVE' : '○ OFF';
  const saving = typeof state.lastEstimatedSaving === 'number' ? state.lastEstimatedSaving : 63;
  return box('⚡ Thai Token Optimizer v1.0', [
    'Compact Thai responses for AI coding agents',
    '',
    `Status        ${enabled}`,
    `Mode          ${state.level || 'auto'}`,
    `Profile       ${state.profile || 'coding'}`,
    `Safety        ${state.safetyMode || 'strict'}`,
    `Version       1.0.0`,
    '',
    `Token Saving  ${bar(saving, 20)} ${padLeft(`${saving}%`, 5)}`,
    '',
    'Quick Commands',
    'tto auto       tto compress --pretty --budget 500 prompt.txt',
    'tto doctor     tto benchmark --pretty --strict --default-policy'
  ]);
}
function renderDashboard(state = {}, doctor = null) {
  const checks = doctor?.checks || [];
  const okCount = checks.filter(c => c.ok).length;
  const total = checks.length || 6;
  const status = state.enabled ? '● ACTIVE' : '○ OFF';
  const doctorStatus = doctor ? (doctor.ok ? 'PASS' : 'WARN') : 'N/A';
  return box('⚡ Thai Token Optimizer v1.0                              ' + status, [
    'Token-efficient Thai workflow for Codex / Claude / Gemini / OpenCode / OpenClaw / Hermes',
    '',
    `Mode          ${padRight(state.level || 'auto', 15)} Profile   ${state.profile || 'coding'}`,
    `Safety        ${padRight(state.safetyMode || 'strict', 15)} Version   1.0.0`,
    '',
    `Doctor        ${padRight(doctorStatus, 15)} Checks    ${okCount}/${total}`,
    `Saving        ${bar(typeof state.lastEstimatedSaving === 'number' ? state.lastEstimatedSaving : 63, 16)} ${typeof state.lastEstimatedSaving === 'number' ? state.lastEstimatedSaving : 63}%`,
    '',
    'Agents',
    '✓ Codex         hooks + AGENTS.md',
    '✓ Claude Code   settings hooks',
    '✓ Gemini CLI    extension',
    '✓ OpenCode      native plugin',
    '✓ OpenClaw      managed hook',
    '✓ Hermes Agent  shell + plugin hooks',
    '✓ Cursor/Aider/Cline/Roo rules',
    '',
    'Quick Commands',
    'tto ui          tto doctor --pretty',
    'tto compress --pretty --budget 500 prompt.txt',
    'tto rollback latest --dry-run'
  ], { width: 78 });
}
function renderDoctor(result = {}) {
  const body = [
    `Mode          ${result.mode || 'installed'}`,
    `Target        ${result.target || 'all'}`,
    `Status        ${result.ok ? 'PASS' : 'WARN'}`,
    `Package       ${result.packageVersion || '1.0.0'}`,
    ''
  ];
  for (const c of result.checks || []) {
    body.push(`${boolMark(c.ok, c.required === false)} ${padRight(c.name, 30)} ${truncate(c.detail || '', 28)}`);
  }
  return box('🩺 Thai Token Optimizer Doctor', body, { width: 82 });
}
function renderCompress({ target = 'generic', level = 'auto', budget = 0, stats = {}, preservation = {}, optimized = '', speculative = false } = {}) {
  const before = stats.before?.estimatedTokens ?? 0;
  const after = stats.after?.estimatedTokens ?? 0;
  const saved = stats.savedTokens ?? Math.max(0, before - after);
  const pct = stats.savingPercent ?? 0;
  const pPct = preservation.preservationPercent ?? 100;
  const risk = preservation.risk || 'low';
  const body = [
    `Target        ${target}`,
    `Mode          ${level}${speculative ? ' (SPECULATIVE)' : ''}`,
    `Budget        ${budget > 0 ? `${budget} tokens` : 'not set'}`,
    '',
    `Before        ${before} tokens`,
    `After         ${after} tokens`,
    `Saved         ${saved} tokens`,
    `Ratio         ${bar(pct, 20)} ${padLeft(`${pct}%`, 6)}`,
    '',
    `Preservation  ${bar(pPct, 20)} ${padLeft(`${pPct}%`, 6)}`,
    `Risk          ${risk}`,
    `Missing       ${preservation.missingCount ?? 0}`,
    '',
    'Optimized',
    ...String(optimized || '').split('\n').slice(0, 6).map(x => `  ${x}`)
  ];
  return box('✂️  Prompt Compression Result', body, { width: 82 });
}
function renderBenchmark(result = {}) {
  const rows = result.rows || [];
  const strict = result.strict || null;
  const mtp = result.mtp || null;
  const avg = strict?.avgSaving ?? average(rows.map(r => r.savingPercent));
  const minPres = strict?.minPreservation ?? min(rows.map(r => r.preservation?.preservationPercent ?? 100), 100);
  const body = [
    `Samples       ${rows.length}`,
    `Average Save  ${bar(avg, 20)} ${padLeft(`${round1(avg)}%`, 6)}`,
    `Preservation  ${bar(minPres, 20)} ${padLeft(`${round1(minPres)}%`, 6)}`,
    `Strict Gate   ${strict ? (strict.ok ? 'PASS' : 'FAIL') : 'N/A'}`,
    ...(mtp ? [
      '',
      `MTP Compare  ON`,
      `Normal ms    ${mtp.normal?.elapsedMs ?? 0}`,
      `Spec ms      ${mtp.speculative?.elapsedMs ?? 0}`,
      `Delta ms     ${mtp.delta?.elapsedMs ?? 0}`,
      `Spec Hits    ${mtp.speculative?.specModeCount ?? 0}/${rows.length || 0}`
    ] : []),
    '',
    'Cases',
    ...rows.slice(0, 10).map(r => `${padRight(r.id, 24)} ${padLeft(r.savingPercent + '%', 7)}  preserve ${r.preservation?.preservationPercent ?? 100}%`)
  ];
  return box('📊 Thai Token Optimizer Benchmark', body, { width: 82 });
}
function renderSafety(classification = {}) {
  const cats = classification.categories || [];
  const body = [
    `Risk Level     ${classification.safeCritical ? 'HIGH' : 'LOW'}`,
    `Compression    ${classification.shouldRelaxCompression ? 'relaxed / safe' : 'normal'}`,
    `Score          ${classification.score ?? 0}`,
    '',
    'Categories',
    ...(cats.length ? cats.map(c => `• ${c}`) : ['• none']),
    '',
    'Recommended Action',
    classification.safeCritical ? '1. backup  2. dry-run  3. verify  4. rollback ready' : 'Proceed with normal compression'
  ];
  return box('🛡️  Safety Classifier', body, { width: 82 });
}
function average(values) { const xs = values.filter(v => Number.isFinite(Number(v))).map(Number); return xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : 0; }
function min(values, fallback=0) { const xs = values.filter(v => Number.isFinite(Number(v))).map(Number); return xs.length ? Math.min(...xs) : fallback; }
function round1(n) { return Math.round((Number(n) || 0) * 10) / 10; }

module.exports = {
  WIDTH,
  bar,
  box,
  renderStatus,
  renderDashboard,
  renderDoctor,
  renderCompress,
  renderBenchmark,
  renderSafety
};
