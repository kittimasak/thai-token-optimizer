const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { buildFleetAudit } = require('../hooks/tto-fleet-audit');
const { detectFleetWaste } = require('../hooks/tto-fleet-detectors');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'bin', 'thai-token-optimizer.js');

function tmpRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'tto-fleet-audit-'));
}

test('fleet detector aggregates empty-run waste even when only wasteTokens is present', () => {
  const out = detectFleetWaste([
    { adapter: 'codex', inputTokens: 9000, outputTokens: 20, messages: 4 }
  ]);
  assert.equal(out.findings.length, 1);
  assert.equal(out.findings[0].id, 'empty_runs');
  assert.equal(out.findings[0].wasteTokens, 9000);
  assert.equal(out.findings[0].wastedTokens, 9000);
  assert.equal(out.totalWasteTokens, 9000);
});

test('fleet session scan surfaces empty-run waste in project and aggregate totals', () => {
  const root = tmpRoot();
  fs.mkdirSync(path.join(root, '.codex', 'sessions'), { recursive: true });
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'fleet-empty', version: '2.0.0' }));
  fs.writeFileSync(path.join(root, '.codex', 'sessions', 'empty.jsonl'), [
    JSON.stringify({ type: 'user', timestamp: '2026-05-13T00:00:00.000Z', message: { content: 'start' } }),
    JSON.stringify({ type: 'assistant', message: { model: 'gpt-5.5', usage: { input_tokens: 9000, output_tokens: 20 } } }),
    JSON.stringify({ type: 'user', message: { content: 'continue' } }),
    JSON.stringify({ type: 'assistant', message: { model: 'gpt-5.5', usage: { input_tokens: 0, output_tokens: 0 } } })
  ].join('\n') + '\n');

  const audit = buildFleetAudit([root], { sessionScan: true });
  assert.equal(audit.sessions.totalRuns, 1);
  assert.equal(audit.detectors.findings.length, 1);
  assert.equal(audit.detectors.findings[0].id, 'empty_runs');
  assert.equal(audit.detectors.totalWasteTokens, 9000);
  assert.equal(audit.projects[0].detectors.totalWasteTokens, 9000);
});

test('fleet doctor restores environment variables exactly after per-project audit', () => {
  const root = tmpRoot();
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'fleet-env', version: '2.0.0' }));
  const keys = ['CODEX_HOME', 'CLAUDE_HOME', 'GEMINI_HOME', 'OPENCODE_CONFIG_DIR', 'OPENCLAW_HOME', 'HERMES_HOME'];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  delete process.env.CODEX_HOME;
  process.env.CLAUDE_HOME = '/tmp/tto-existing-claude';
  try {
    buildFleetAudit([root], { doctor: true, doctorTarget: 'codex' });
    assert.equal(process.env.CODEX_HOME, undefined);
    assert.equal(process.env.CLAUDE_HOME, '/tmp/tto-existing-claude');
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});

test('fleet rejects unknown doctor target instead of reporting a false successful audit', () => {
  assert.throws(
    () => buildFleetAudit([tmpRoot()], { doctor: true, doctorTarget: 'nonsense' }),
    /Doctor target must be:/
  );

  const r = spawnSync(process.execPath, [CLI, 'fleet', '--doctor', '--doctor-target', 'nonsense'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  assert.notEqual(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stderr, /Doctor target must be:/);
});

test('fleet doctor validates installed OpenClaw project with TTO package root', () => {
  const root = tmpRoot();
  const openclawHome = path.join(root, '.openclaw');
  const ttoHome = path.join(root, '.tto');
  const install = spawnSync(process.execPath, [CLI, 'install', 'openclaw'], {
    cwd: ROOT,
    env: { ...process.env, OPENCLAW_HOME: openclawHome, TTO_HOME: ttoHome },
    encoding: 'utf8'
  });
  assert.equal(install.status, 0, install.stdout + install.stderr);

  const audit = buildFleetAudit([root], { doctor: true, doctorTarget: 'openclaw' });
  assert.equal(audit.doctor.passProjects, 1);
  assert.equal(audit.projects[0].doctor.ok, true);
});
