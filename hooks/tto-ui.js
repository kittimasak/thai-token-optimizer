#!/usr/bin/env node
/**
 * ============================================================================
 * Thai Token Optimizer v2.0.0
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
  return box('⚡ Thai Token Optimizer v2.0.0', [
    'Compact Thai responses for AI coding agents',
    '',
    `Status        ${enabled}`,
    `Mode          ${state.level || 'auto'}`,
    `Profile       ${state.profile || 'coding'}`,
    `Safety        ${state.safetyMode || 'strict'}`,
    `Version       2.0.0`,
    '',
    `Token Saving  ${bar(saving, 20)} ${padLeft(`${saving}%`, 5)}`,
    '',
    'Quick Commands',
    'tto auto       tto compress --pretty --budget 500 prompt.txt',
    'tto doctor     tto benchmark --pretty --strict --default-policy'
  ]);
}
function renderDashboard(state = {}, doctor = null, extras = {}) {
  const checks = doctor?.checks || [];
  const okCount = checks.filter(c => c.ok).length;
  const total = checks.length || 6;
  const status = state.enabled ? '● ACTIVE' : '○ OFF';
  const doctorStatus = doctor ? (doctor.ok ? 'PASS' : 'WARN') : 'N/A';
  return box('⚡ Thai Token Optimizer v2.0.0                              ' + status, [
    'Token-efficient Thai workflow for Codex / Claude / Gemini / OpenCode / OpenClaw / Hermes',
    '',
    `Mode          ${padRight(state.level || 'auto', 15)} Profile   ${state.profile || 'coding'}`,
    `Safety        ${padRight(state.safetyMode || 'strict', 15)} Version   2.0.0`,
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
    '',
    `Checkpoint    ${extras.checkpointTotal ?? 0} total${extras.checkpointLatest ? ` | latest ${truncate(extras.checkpointLatest, 24)}` : ''}`,
    `Read-cache    ${extras.cacheRepeated ?? 0} repeated files | reads ${extras.cacheReads ?? 0}`,
    '',
    'Quick Commands',
    'tto ui          tto doctor --pretty',
    'tto compress --pretty --budget 500 prompt.txt',
    'tto rollback latest --dry-run'
  ], { width: 78 });
}
function renderDashboardView(view = 'overview', payload = {}) {
  const v = String(view || 'overview').toLowerCase();
  if (v === 'overview') return renderDashboard(payload.state || {}, payload.doctor || null, payload.extras || {});
  if (v === 'doctor') return renderDoctor(payload.doctor || {});
  if (v === 'quality') return renderQuality(payload.quality || {});
  if (v === 'waste') return renderWaste(payload.waste || {});
  if (v === 'trend') return renderTrend(payload.trend || {});
  if (v === 'agents') return renderAgents(payload.agents || {});
  if (v === 'fleet') return renderFleet(payload.fleet || {});
  return box('Thai Token Optimizer Dashboard', [`Unknown view: ${v}`], { width: 82 });
}
function renderQuality(quality = {}) {
  const score = Number.isFinite(Number(quality.score)) ? Number(quality.score) : 0;
  const scoreText = `${Math.round(score * 10) / 10}/100`;
  const grade = quality.grade || 'F';
  const weak = Array.isArray(quality.weakSignals) ? quality.weakSignals : [];
  const suggestions = Array.isArray(quality.suggestedActions) ? quality.suggestedActions : [];
  const s1 = quality.stage1 || {};
  const s2 = quality.stage2 || {};
  const distortion = quality.distortion || {};
  return box('🧠 TTO Quality Score', [
    `Score         ${bar(score, 16)} ${padLeft(scoreText, 8)}`,
    `Grade         ${grade}`,
    `Strict Gate   ${quality.strictGate ? 'PASS' : 'FAIL'}`,
    `MTP Gate      ${quality.mtpGate ? 'PASS' : 'FAIL'}`,
    `Routing Gate  ${quality.actionRoutingGate ? 'PASS' : 'FAIL'}`,
    '',
    'Stage 1 Signals',
    `• contextFillRisk: ${s1.contextFillRisk ?? 0}%`,
    `• sessionLengthRisk: ${s1.sessionLengthRisk ?? 0}%`,
    `• modelRoutingRisk: ${s1.modelRoutingRisk ?? 0}%`,
    `• emptyRunRisk: ${s1.emptyRunRisk ?? 0}%`,
    `• outcomeHealthRisk: ${s1.outcomeHealthRisk ?? 0}%`,
    '',
    'Stage 2 Signals',
    `• messageEfficiencyRisk: ${s2.messageEfficiencyRisk ?? 0}%`,
    `• compressionOpportunityRisk: ${s2.compressionOpportunityRisk ?? 0}%`,
    '',
    'Distortion Bounds',
    `• fillRatio: ${distortion.fillRatio ?? 0}%`,
    `• qualityCeiling: ${distortion.theoreticalCeiling ?? 0}`,
    `• observedQuality: ${distortion.observedQuality ?? score}`,
    `• headroom: ${distortion.headroom ?? 0}`,
    '',
    'Weak Signals',
    ...(weak.length ? weak.slice(0, 8).map(s => `• ${s}`) : ['• none']),
    '',
    'Suggested Actions',
    ...(suggestions.length ? suggestions.slice(0, 8).map(s => `• ${truncate(s, 72)}`) : ['• none'])
  ], { width: 82 });
}
function renderWaste(waste = {}) {
  const items = Array.isArray(waste.signals) ? waste.signals : [];
  return box('🧩 Waste Signals', [
    `Total signals ${items.length}`,
    '',
    ...(items.length
      ? items.slice(0, 12).map((s) => `• ${s.id || 'unknown'} | ${s.severity || 'warn'} | ${truncate(s.message || '', 54)}`)
      : ['• none']),
    '',
    'Actions',
    ...((waste.actions || []).length
      ? waste.actions.slice(0, 8).map(a => `• ${truncate(a, 72)}`)
      : ['• none'])
  ], { width: 82 });
}
function renderTrend(trend = {}) {
  const rows = Array.isArray(trend.rows) ? trend.rows : [];
  return box('📈 Trend (Rolling Window)', [
    `Window size   ${trend.windowSize || rows.length || 0}`,
    `Source        benchmarks/regression_history.jsonl`,
    '',
    `Slowdown ms   ${trend.slowdown || 'n/a'}`,
    `Gain %        ${trend.gain || 'n/a'}`,
    `Saving %      ${trend.saving || 'n/a'}`,
    '',
    'Recent Runs',
    ...(rows.length
      ? rows.slice(0, 8).map(r => `• ${truncate(`${r.generatedAt} | save ${r.strictAvgSaving}% | gain ${r.enhancedGainPercent}% | slow ${r.slowdownMeanMs}ms | mtp ${r.mtpGate ? 'PASS' : 'FAIL'}`, 74)}`)
      : ['• no history'])
  ], { width: 82 });
}
function renderAgents(agents = {}) {
  const rows = Array.isArray(agents.rows) ? agents.rows : [];
  return box('🤖 Agent Integration Status', [
    ...(rows.length
      ? rows.map(r => `${r.ok ? '✓' : '✗'} ${padRight(r.name, 16)} ${truncate(r.detail || '', 56)}`)
      : ['• no doctor data'])
  ], { width: 82 });
}
function renderDoctor(result = {}) {
  const body = [
    `Mode          ${result.mode || 'installed'}`,
    `Target        ${result.target || 'all'}`,
    `Status        ${result.ok ? 'PASS' : 'WARN'}`,
    `Package       ${result.packageVersion || '2.0.0'}`,
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
      `Normal ms    ${mtp.normalLatency?.mean ?? mtp.normal?.elapsedMs ?? 0} (p95 ${mtp.normalLatency?.p95 ?? 0})`,
      `Spec ms      ${mtp.speculativeLatency?.mean ?? mtp.speculative?.elapsedMs ?? 0} (p95 ${mtp.speculativeLatency?.p95 ?? 0})`,
      `Delta ms     ${mtp.slowdownMeanMs ?? mtp.delta?.elapsedMs ?? 0}`,
      `Spec Hits    ${mtp.speculative?.specModeCount ?? 0}/${rows.length || 0} (${mtp.specHitRatePercent ?? 0}%)`,
      `MTP Gate     ${mtp.gateOk ? 'PASS' : 'FAIL'}`
    ] : []),
    '',
    'Cases',
    ...rows.slice(0, 10).map(r => `${padRight(r.id, 24)} ${padLeft(r.savingPercent + '%', 7)}  preserve ${r.preservation?.preservationPercent ?? 100}%`)
  ];
  return box('📊 Thai Token Optimizer v2.0.0 Benchmark', body, { width: 82 });
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
function renderCheckpoint(data = {}) {
  const rows = Array.isArray(data.rows) ? data.rows : [];
  const lc = data.lifecycle || {};
  const fillBands = Array.isArray(lc.capturedFillBands) ? lc.capturedFillBands.join(',') : '-';
  const qDrops = Array.isArray(lc.capturedQualityDrops) ? lc.capturedQualityDrops.join(',') : '-';
  const milestones = Array.isArray(lc.capturedMilestones) ? lc.capturedMilestones.join(',') : '-';
  return box('🧷 Checkpoint / Continuity Lite', [
    `Total         ${data.total ?? rows.length ?? 0}`,
    `Latest        ${data.latestId || 'none'}`,
    `Session       ${lc.sessionId || '-'}`,
    `Fill bands    ${fillBands || '-'}`,
    `Quality drop  ${qDrops || '-'}`,
    `Milestones    ${milestones || '-'}`,
    '',
    ...(rows.length
      ? rows.slice(0, 10).map(r => `• ${truncate(`${r.id} | ${r.ts} | ${r.state?.level || 'auto'}/${r.state?.profile || 'coding'} | ${r.note || '-'}`, 74)}`)
      : ['• no checkpoints'])
  ], { width: 82 });
}
function renderCacheStats(data = {}) {
  const rows = Array.isArray(data.topRepeated) ? data.topRepeated : [];
  const dc = data.decisionCounts || {};
  const decisions = Object.keys(dc).length
    ? Object.entries(dc).map(([k, v]) => `• ${k}: ${v}`).slice(0, 6)
    : ['• none'];
  return box('🗂️  Read-cache Analytics', [
    `Mode          ${data.mode || 'warn'}`,
    `Total reads   ${data.totalReads ?? 0}`,
    `Unique files  ${data.uniqueFiles ?? 0}`,
    `Repeated      ${data.repeatedFiles ?? 0}`,
    '',
    'Decision Counts',
    ...decisions,
    '',
    'Top Repeated Files',
    ...(rows.length
      ? rows.slice(0, 10).map(r => `• ${padLeft(String(r.reads), 4)}x ${truncate(r.file, 66)}`)
      : ['• no repeated file reads'])
  ], { width: 82 });
}
function renderContextAudit(data = {}) {
  const rows = Array.isArray(data.components) ? data.components : [];
  return box('🧭 Context Audit', [
    `Total tokens  ${data.totalEstimatedTokens ?? 0}`,
    `Total bytes   ${data.totalBytes ?? 0}`,
    '',
    'Components',
    ...(rows.length
      ? rows.slice(0, 10).map((r) => `• ${padRight(r.name, 8)} tok ${padLeft(String(r.estimatedTokens), 8)} | ${padLeft(String(r.tokenPercent), 5)}% | files ${r.files}`)
      : ['• none']),
    '',
    'Recommendations',
    ...((data.recommendations || []).length
      ? data.recommendations.slice(0, 5).map((x) => `• ${truncate(x, 72)}`)
      : ['• none'])
  ], { width: 82 });
}
function renderCoach(data = {}) {
  const score = Number.isFinite(Number(data.healthScore)) ? Number(data.healthScore) : 0;
  const scoreText = `${Math.round(score * 10) / 10}/100`;
  const grade = data.healthGrade || 'F';
  const anti = Array.isArray(data.antiPatterns) ? data.antiPatterns : [];
  const plan = Array.isArray(data.fixPlan) ? data.fixPlan : [];
  const remediation = data.remediation || {};
  return box('🧭 TTO Coach Mode (Guided Remediation)', [
    `Health Score  ${bar(score, 16)} ${padLeft(scoreText, 8)}`,
    `Health Grade  ${grade}`,
    `Summary       ${truncate(data.summary || 'n/a', 60)}`,
    '',
    'Anti-patterns',
    ...(anti.length
      ? anti.slice(0, 8).map((a) => `• ${a.id} | ${a.severity} | ${a.owner} | ${truncate(a.detail || '', 36)}`)
      : ['• none']),
    '',
    'Fix Plan',
    ...(plan.length
      ? plan.slice(0, 8).map((p) => `• ${p.id} | ${p.severity} | ${p.owner} | ${truncate(p.action || '', 36)}`)
      : ['• none']),
    '',
    `Applied       ${remediation.applied ? 'YES' : 'NO'}${remediation.mode ? ` (${remediation.mode})` : ''}`,
    ...(Array.isArray(remediation.actions) && remediation.actions.length
      ? remediation.actions.slice(0, 6).map((a) => `• ${a}`)
      : ['• no auto-remediation'])
  ], { width: 82 });
}
function renderCalibration(data = {}) {
  return box('🎯 Real Session Calibration', [
    `Samples       ${data.count ?? 0}`,
    `Quality       ${data.quality || 'unknown'}`,
    `Avg gap       ${data.avgGapPct ?? 0}%`,
    `Avg bias      ${data.avgBias ?? 0}`,
    `Within 10%    ${data.within10Pct ?? 0}`,
    `Within 20%    ${data.within20Pct ?? 0}`,
    '',
    `Latest        ${data.latest ? `${data.latest.target} | est=${data.latest.estimated} real=${data.latest.real} gap=${data.latest.gap} (${data.latest.gapPct}%)` : 'none'}`,
    `Path          ${data.path || '-'}`,
    '',
    'Commands',
    'tto calibration status --pretty',
    'tto calibration record --estimated 1000 --real 1120',
    'tto calibration from-stats --real-total 24000 --samples 20'
  ], { width: 82 });
}
function renderFleet(data = {}) {
  const rows = Array.isArray(data.projects) ? data.projects : [];
  const d = data.doctor || {};
  const c = data.calibration || {};
  const s = data.sessions || {};
  const det = data.detectors || {};
  const finds = Array.isArray(det.findings) ? det.findings : [];
  return box('🌐 Fleet / Organization View', [
    `Projects      ${data.totalProjects ?? rows.length ?? 0}`,
    `Benchmarks    ${data.withBenchmark ?? 0}`,
    `Strict PASS   ${data.strictPass ?? 0}`,
    `MTP PASS      ${data.mtpPass ?? 0}`,
    `Route PASS    ${data.routePass ?? 0}`,
    `Avg Quality   ${data.avgQuality ?? 0}`,
    `Avg Saving    ${data.avgSaving ?? 0}%`,
    `Waste total   ${data.totalWaste ?? 0}`,
    `Doctor        ${d.enabled ? `ON (${d.target || 'all'})` : 'OFF'}`,
    ...(d.enabled ? [`Doctor PASS  ${d.passProjects ?? 0}/${d.projectsChecked ?? 0} projects | checks ${d.passChecks ?? 0}/${d.requiredChecks ?? 0}`] : []),
    `Calibration   ${c.enabled ? `ON (limit ${c.limit || 50})` : 'OFF'}`,
    ...(c.enabled ? [`Calib gap    avg ${c.avgGapPct ?? 0}% | data ${c.projectsWithData ?? 0}/${c.projectsChecked ?? 0} projects`] : []),
    `SessionScan   ${s.enabled ? 'ON' : 'OFF'}`,
    ...(s.enabled ? [`Runs/Cost     ${s.totalRuns ?? 0} runs | input ${s.totalInputTokens ?? 0} | cost ~$${s.estimatedCostUsd ?? 0}`] : []),
    ...(det.enabled ? [`Detectors    ${finds.length} findings | waste ${det.totalWasteTokens ?? 0} tok | ~$${det.totalEstimatedMonthlyUsd ?? 0}/mo`] : []),
    '',
    `Coverage      Codex:${data.coverage?.codex ?? 0} Claude:${data.coverage?.claude ?? 0} CI:${data.coverage?.github ?? 0}`,
    '',
    'Projects',
    ...(rows.length
      ? rows.slice(0, 12).map((p) => `• ${truncate(`${p.packageName}@${p.packageVersion} | q=${p.qualityScore} | save=${p.avgSaving}% | strict=${p.strictGate ? 'PASS' : 'FAIL'} mtp=${p.mtpGate ? 'PASS' : 'FAIL'}${p.doctor ? ` | doctor=${p.doctor.ok ? 'PASS' : 'FAIL'}(${p.doctor.passChecks}/${p.doctor.requiredChecks})` : ''}${p.calibration ? ` | calib=${p.calibration.avgGapPct}%(${p.calibration.count})` : ''} | ${p.root}`, 76)}`)
      : ['• none'])
    ,
    ...(finds.length ? ['', 'Findings', ...finds.slice(0, 6).map((f) => `• ${truncate(`${f.project || 'project'} | ${f.id} | ${f.severity} | conf ${f.confidence} | ~$${f.estimatedMonthlyUsd}/mo`, 76)}`)] : [])
  ], { width: 82 });
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
  renderDashboardView,
  renderQuality,
  renderDoctor,
  renderCompress,
  renderBenchmark,
  renderSafety,
  renderCheckpoint,
  renderCacheStats,
  renderContextAudit,
  renderCoach,
  renderFleet,
  renderCalibration
};
