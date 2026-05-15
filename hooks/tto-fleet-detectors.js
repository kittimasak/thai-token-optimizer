#!/usr/bin/env node

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function findingWasteTokens(finding) {
  return toNum(finding?.wasteTokens ?? finding?.wastedTokens);
}

function normalizeFinding(finding) {
  const wasteTokens = Math.round(findingWasteTokens(finding));
  return {
    ...finding,
    wasteTokens,
    // Backward-compatible alias for older callers/tests that used wastedTokens.
    wastedTokens: wasteTokens
  };
}

const PRICING_PER_1K = {
  default: { input: 0.004, output: 0.012 },
  claude: { input: 0.003, output: 0.015 },
  codex: { input: 0.005, output: 0.015 },
  openclaw: { input: 0.004, output: 0.012 },
  hermes: { input: 0.004, output: 0.012 },
  opencode: { input: 0.004, output: 0.012 }
};

function estimateRunCostUsd(run) {
  const p = PRICING_PER_1K[run.adapter] || PRICING_PER_1K.default;
  return ((toNum(run.inputTokens) / 1000) * p.input) + ((toNum(run.outputTokens) / 1000) * p.output);
}

function detectEmptyRuns(input) {
  if (!input) return null;
  const runs = Array.isArray(input) ? input : [input];
  const hits = runs.filter((r) => r && toNum(r.inputTokens) > 5000 && toNum(r.outputTokens) < 100 && toNum(r.messages) <= 4);
  if (hits.length < 1 && Array.isArray(input)) return null;
  if (hits.length === 0) return null;
  const wasted = hits.reduce((a, r) => a + toNum(r.inputTokens), 0);
  const cost = hits.reduce((a, r) => a + estimateRunCostUsd(r), 0);
  return {
    id: 'empty_runs',
    severity: cost > 10 ? 'critical' : cost > 2 ? 'high' : 'medium',
    confidence: 0.85,
    count: hits.length,
    wasteTokens: Math.round(wasted),
    estimatedMonthlyUsd: Math.round(cost * 100) / 100,
    message: `${hits.length} empty-like runs (high input, near-zero output)`
  };
}

function detectLoopRuns(input) {
  if (!input) return null;
  const runs = Array.isArray(input) ? input : [input];
  const hits = runs.filter((r) => r && toNum(r.messages) >= 10 && toNum(r.inputTokens) > Math.max(1, toNum(r.outputTokens)) * 20);
  if (hits.length < 1 && Array.isArray(input)) return null;
  if (hits.length === 0) return null;
  const excess = hits.reduce((a, r) => a + Math.max(0, toNum(r.inputTokens) - toNum(r.outputTokens) * 10), 0);
  const cost = hits.reduce((a, r) => a + estimateRunCostUsd(r), 0);
  return {
    id: 'loop_runs',
    severity: cost > 10 ? 'critical' : cost > 2 ? 'high' : 'medium',
    confidence: 0.55,
    count: hits.length,
    wastedTokens: Math.round(excess),
    estimatedMonthlyUsd: Math.round(cost * 100) / 100,
    message: `${hits.length} loop-like runs (input:output > 20:1)`
  };
}

function detectBloatRuns(input) {
  if (!input) return null;
  const runs = Array.isArray(input) ? input : [input];
  const hits = runs.filter((r) => r && toNum(r.messages) >= 30 && toNum(r.inputTokens) >= 500000);
  if (!hits.length) return null;
  const waste = hits.reduce((a, r) => a + Math.round(toNum(r.inputTokens) * 0.4), 0);
  const cost = hits.reduce((a, r) => a + estimateRunCostUsd(r) * 0.4, 0);
  return {
    id: 'history_bloat',
    severity: cost > 10 ? 'critical' : cost > 2 ? 'high' : 'medium',
    confidence: 0.6,
    count: hits.length,
    wastedTokens: Math.round(waste),
    estimatedMonthlyUsd: Math.round(cost * 100) / 100,
    message: `${hits.length} long sessions likely need compaction`
  };
}

function detectAbandonedRuns(input) {
  if (!input) return null;
  const runs = Array.isArray(input) ? input : [input];
  const hits = runs.filter((r) => r && toNum(r.messages) <= 2 && toNum(r.inputTokens) > 3000 && toNum(r.outputTokens) < 200);
  if (hits.length < 1 && Array.isArray(input)) return null;
  if (hits.length === 0) return null;
  const waste = hits.reduce((a, r) => a + toNum(r.inputTokens), 0);
  const cost = hits.reduce((a, r) => a + estimateRunCostUsd(r), 0);
  return {
    id: 'abandoned_runs',
    severity: cost > 10 ? 'critical' : cost > 2 ? 'high' : 'medium',
    confidence: 0.7,
    count: hits.length,
    wastedTokens: Math.round(waste),
    estimatedMonthlyUsd: Math.round(cost * 100) / 100,
    message: `${hits.length} short abandoned runs`
  };
}

function detectFleetWaste(runs = [], options = {}) {
  const minConfidence = Number(options.minConfidence || 0.4);
  const detectors = [detectToolCascade, detectEmptyRuns, detectLoopRuns, detectBloatRuns, detectAbandonedRuns];
  
  const hitsByDetector = {};
  
  for (const run of runs) {
    if (!run) continue;
    const findings = detectors
      .map(fn => fn(run))
      .filter(Boolean)
      .filter(f => f.confidence >= minConfidence)
      .sort((a, b) => (b.confidence * (b.severity === 'critical' ? 2 : 1)) - (a.confidence * (a.severity === 'critical' ? 2 : 1)));
    
    if (findings.length > 0) {
      const best = findings[0];
      const normalized = normalizeFinding(best);
      if (!hitsByDetector[best.id]) {
        hitsByDetector[best.id] = { ...normalized, count: 0, wasteTokens: 0, wastedTokens: 0, estimatedMonthlyUsd: 0, runs: [] };
      }
      hitsByDetector[best.id].count += toNum(normalized.count);
      hitsByDetector[best.id].wasteTokens += normalized.wasteTokens;
      hitsByDetector[best.id].wastedTokens += normalized.wastedTokens;
      hitsByDetector[best.id].estimatedMonthlyUsd += best.estimatedMonthlyUsd;
      hitsByDetector[best.id].runs.push(run);
    }
  }

  const findings = Object.values(hitsByDetector).map(f => {
    const { runs: _, ...rest } = f;
    return rest;
  });

  const totalWasteTokens = findings.reduce((a, f) => a + findingWasteTokens(f), 0);
  const totalCostUsd = findings.reduce((a, f) => a + toNum(f.estimatedMonthlyUsd), 0);
  return {
    findings,
    totalWasteTokens: Math.round(totalWasteTokens),
    totalEstimatedMonthlyUsd: Math.round(totalCostUsd * 100) / 100
  };
}

function detectToolCascade(run) {
  if (!run) return null;
  const tools = Array.isArray(run.tools) ? run.tools : [];
  if (tools.length < 3) return null;
  
  let maxStreak = 0;
  let currentStreak = 1;
  let lastTool = null;
  
  for (const t of tools) {
    if (lastTool && t.name === lastTool) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }
    maxStreak = Math.max(maxStreak, currentStreak);
    lastTool = t.name;
  }

  if (maxStreak >= 3) {
    const waste = (maxStreak - 1) * 200; // สมมติ 200 tokens ต่อการรัน tool
    return {
      id: 'tool_cascade',
      severity: maxStreak > 5 ? 'high' : 'medium',
      confidence: 0.9,
      count: maxStreak,
      wasteTokens: waste,
      message: `Detect ${maxStreak} consecutive calls to same tool: ${lastTool}`
    };
  }
  return null;
}

function runDetectors(run) {
  const detectors = [detectToolCascade, detectLoopRuns, detectEmptyRuns, detectBloatRuns, detectAbandonedRuns];
  return detectors.map(fn => fn(run)).filter(Boolean);
}

module.exports = {
  detectFleetWaste,
  estimateRunCostUsd,
  runDetectors,
  detectToolCascade
};
