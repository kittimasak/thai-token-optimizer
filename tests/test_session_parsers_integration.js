const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { collectAgentRuns } = require('../hooks/tto-session-parsers');

const ROOT = path.resolve(__dirname, '..');
const FIX = path.join(ROOT, 'tests', 'fixtures', 'session_logs');

function byAdapter(rows, name) {
  return rows.filter((r) => r.adapter === name);
}

test('session fixtures include 30+ runs per adapter and parse into AgentRun.v1', () => {
  const codex = collectAgentRuns(path.join(FIX, 'codex'), { maxRuns: 120 });
  const claude = collectAgentRuns(path.join(FIX, 'claude'), { maxRuns: 120 });
  const openclaw = collectAgentRuns(path.join(FIX, 'openclaw'), { maxRuns: 120 });
  const hermes = collectAgentRuns(path.join(FIX, 'hermes'), { maxRuns: 120 });
  const opencode = collectAgentRuns(path.join(FIX, 'opencode'), { maxRuns: 120 });

  assert.ok(byAdapter(codex, 'codex').length >= 30);
  assert.ok(byAdapter(claude, 'claude').length >= 30);
  assert.ok(byAdapter(openclaw, 'openclaw').length >= 30);
  assert.ok(byAdapter(hermes, 'hermes').length >= 30);
  assert.ok(byAdapter(opencode, 'opencode').length >= 30);

  const sample = [
    byAdapter(codex, 'codex')[0],
    byAdapter(claude, 'claude')[0],
    byAdapter(openclaw, 'openclaw')[0],
    byAdapter(hermes, 'hermes')[0],
    byAdapter(opencode, 'opencode')[0]
  ];
  for (const row of sample) {
    assert.equal(row.schema, 'AgentRun.v1');
    assert.ok(typeof row.inputTokens === 'number');
    assert.ok(typeof row.outputTokens === 'number');
    assert.ok(typeof row.messages === 'number');
    assert.ok(row.source);
  }
});

