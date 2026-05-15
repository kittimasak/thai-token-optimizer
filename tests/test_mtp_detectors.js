/**
 * ============================================================================
 * Thai Token Optimizer v2.0 - Detector Unit Tests
 * ============================================================================
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  detectOutputWasteSignal,
  detectToolCascadeSignal,
  detectBadDecompositionSignal,
  buildActionSuggestions,
  evaluateActionRouting
} = require('../benchmarks/run_benchmark');

test('tool_cascade triggers on consecutive low-saving technical/safety-heavy turns', () => {
  const rows = [
    { savingPercent: 0, original: 'error stack trace rollback', safety: { categories: ['production_deploy'] } },
    { savingPercent: 1, original: 'config version path ~/', safety: { categories: [] } },
    { savingPercent: 0.5, original: 'https://example.com command', safety: { categories: [] } },
    { savingPercent: 12, original: 'normal narrative', safety: { categories: [] } }
  ];
  const signal = detectToolCascadeSignal(rows);
  assert.ok(signal);
  assert.equal(signal.id, 'tool_cascade');
});

test('tool_cascade does not trigger when streak is below threshold', () => {
  const rows = [
    { savingPercent: 0, original: 'error stack trace', safety: { categories: ['production_deploy'] } },
    { savingPercent: 10, original: 'normal', safety: { categories: [] } },
    { savingPercent: 0, original: 'rollback config', safety: { categories: [] } }
  ];
  const signal = detectToolCascadeSignal(rows);
  assert.equal(signal, null);
});

test('bad_decomposition triggers on multiple long low-saving monolithic prompts', () => {
  const longText = 'A'.repeat(320);
  const rows = [
    { savingPercent: 1, before: { chars: 350 }, original: longText },
    { savingPercent: 2.5, before: { chars: 280 }, original: longText },
    { savingPercent: 15, before: { chars: 120 }, original: 'short' }
  ];
  const signal = detectBadDecompositionSignal(rows);
  assert.ok(signal);
  assert.equal(signal.id, 'bad_decomposition');
});

test('bad_decomposition does not trigger when long prompts are sufficiently compressed', () => {
  const rows = [
    { savingPercent: 8, before: { chars: 360 }, original: 'B'.repeat(360) },
    { savingPercent: 12, before: { chars: 280 }, original: 'C'.repeat(280) }
  ];
  const signal = detectBadDecompositionSignal(rows);
  assert.equal(signal, null);
});

test('bad_decomposition false-positive guard: does not trigger on safety-heavy low-saving prompts', () => {
  const rows = [
    { savingPercent: 1, before: { chars: 260 }, original: 'DROP TABLE users in production and rollback plan', safety: { categories: ['database_migration', 'production_deploy'] } },
    { savingPercent: 2, before: { chars: 220 }, original: 'Handle auth token secret rotation in production', safety: { categories: ['security_secret', 'auth_payment'] } },
    { savingPercent: 3, before: { chars: 200 }, original: 'Backup and restore with exact config keys', safety: { categories: ['production_deploy'] } }
  ];
  const signal = detectBadDecompositionSignal(rows);
  assert.equal(signal, null);
});

test('bad_decomposition false-positive guard: does not trigger on technical-dense prompts with paths/commands', () => {
  const rows = [
    { savingPercent: 1, before: { chars: 240 }, original: 'Update ~/.codex/config.toml keep codex_hooks = true and run `npm run ci`', safety: { categories: [] } },
    { savingPercent: 2, before: { chars: 210 }, original: 'Check error stack trace and rollback via `tto rollback latest --dry-run`', safety: { categories: [] } }
  ];
  const signal = detectBadDecompositionSignal(rows);
  assert.equal(signal, null);
});

test('bad_decomposition still triggers on true monolithic narrative prompts after guard', () => {
  const longNarrative = 'วิเคราะห์เชิงกลยุทธ์และสรุปแนวทางการสื่อสารองค์กรแบบยาวมาก '.repeat(8);
  const rows = [
    { savingPercent: 2, before: { chars: 320 }, original: longNarrative, safety: { categories: [] } },
    { savingPercent: 3, before: { chars: 300 }, original: longNarrative + ' เพิ่มหัวข้อและเหตุผลหลายส่วน', safety: { categories: [] } }
  ];
  const signal = detectBadDecompositionSignal(rows);
  assert.ok(signal);
  assert.equal(signal.id, 'bad_decomposition');
});

test('output_waste triggers when multiple medium/long prompts have very low savings', () => {
  const rows = [
    { savingPercent: 2, before: { estimatedTokens: 65 } },
    { savingPercent: 4, before: { estimatedTokens: 62 } },
    { savingPercent: 1, before: { estimatedTokens: 75 } },
    { savingPercent: 12, before: { estimatedTokens: 20 } }
  ];
  const signal = detectOutputWasteSignal(rows);
  assert.ok(signal);
  assert.equal(signal.id, 'output_waste');
});

test('output_waste does not trigger when savings are healthy', () => {
  const rows = [
    { savingPercent: 14, before: { estimatedTokens: 70 } },
    { savingPercent: 12, before: { estimatedTokens: 68 } },
    { savingPercent: 11, before: { estimatedTokens: 72 } }
  ];
  const signal = detectOutputWasteSignal(rows);
  assert.equal(signal, null);
});

test('buildActionSuggestions maps detector ids to actionable suggestions', () => {
  const suggestions = buildActionSuggestions([
    { id: 'output_waste' },
    { id: 'tool_cascade', streak: 5 },
    { id: 'bad_decomposition', count: 6 }
  ]);
  assert.ok(Array.isArray(suggestions));
  const byId = Object.fromEntries(suggestions.map(s => [s.id, s]));
  assert.ok(byId.reduce_output_verbosity);
  assert.ok(byId.add_tool_circuit_breaker);
  assert.ok(byId.split_monolith_prompt);
  assert.equal(byId.add_tool_circuit_breaker.severity, 'high');
  assert.equal(byId.add_tool_circuit_breaker.owner, 'Agent Runtime Owner');
  assert.equal(byId.add_tool_circuit_breaker.routing, 'required_action');
});

test('evaluateActionRouting fails gate when high/required actions exist', () => {
  const routing = evaluateActionRouting([
    { id: 'x', routing: 'required_action' },
    { id: 'y', routing: 'warning_only' }
  ]);
  assert.equal(routing.gateOk, false);
  assert.equal(routing.requiredActions.length, 1);
  assert.equal(routing.warningActions.length, 1);
});

test('evaluateActionRouting passes gate when only warning actions exist', () => {
  const routing = evaluateActionRouting([
    { id: 'x', routing: 'warning_only' },
    { id: 'y', routing: 'warning_only' }
  ]);
  assert.equal(routing.gateOk, true);
  assert.equal(routing.requiredActions.length, 0);
});
