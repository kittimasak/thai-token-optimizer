const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildFleetAudit } = require('../hooks/tto-fleet-audit');

function tmpRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'tto-fleet-deep-'));
}

function createProject(base, name, options = {}) {
  const root = path.join(base, name);
  fs.mkdirSync(root, { recursive: true });
  if (!options.noPkg) {
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name, version: '2.0.0' }));
  }
  if (options.sessions) {
    const codexDir = path.join(root, '.codex', 'sessions');
    fs.mkdirSync(codexDir, { recursive: true });
    options.sessions.forEach((s, i) => {
      fs.writeFileSync(path.join(codexDir, `session_${i}.jsonl`), s);
    });
  }
  if (options.bench) {
    fs.mkdirSync(path.join(root, 'benchmarks'), { recursive: true });
    fs.writeFileSync(path.join(root, 'benchmarks', 'regression_report.json'), JSON.stringify(options.bench));
  }
  return root;
}

test('stress test: 50 projects with mixed data', () => {
  const base = tmpRoot();
  const roots = [];
  for (let i = 0; i < 50; i++) {
    const name = `proj-${i}`;
    const sessions = i % 2 === 0 ? [
      JSON.stringify({ type: 'user', timestamp: new Date().toISOString(), message: { content: 'test' } }) + '\n' +
      JSON.stringify({ type: 'assistant', message: { model: 'gpt-4', usage: { input_tokens: 10000, output_tokens: 10 } } })
    ] : [];
    roots.push(createProject(base, name, {
      sessions,
      bench: { strictResult: { ok: i % 3 === 0, avgSavingPercent: 15 } }
    }));
  }

  const audit = buildFleetAudit(roots, { sessionScan: true });
  assert.equal(audit.totalProjects, 50);
  assert.equal(audit.withBenchmark, 50);
  // 50/2 = 25 projects have sessions
  assert.equal(audit.sessions.totalRuns, 25);
  // empty_runs detector should catch all 25 runs (10000 in, 10 out)
  assert.equal(audit.detectors.totalWasteTokens, 25 * 10000);
  assert.ok(audit.avgQuality > 0);
});

test('robustness: malformed JSON and missing files', () => {
  const base = tmpRoot();
  const root1 = createProject(base, 'malformed-pkg', { noPkg: true });
  fs.writeFileSync(path.join(root1, 'package.json'), 'invalid json {');
  
  const root2 = createProject(base, 'malformed-session', { sessions: ['{ broken line\n{"valid":"json"}'] });
  
  const audit = buildFleetAudit([root1, root2], { sessionScan: true });
  assert.equal(audit.totalProjects, 2);
  assert.equal(audit.projects[0].packageName, 'malformed-pkg'); // fallback to folder name
  assert.equal(audit.projects[1].sessions.totalRuns, 0); // valid json but not Claude-like/AgentRun
});

test('detector boundary check: loop_runs', () => {
  const base = tmpRoot();
  // detectLoopRuns: messages >= 10 && inputTokens > outputTokens * 20
  const session = Array(12).fill(0).map((_, i) => 
    JSON.stringify({ 
        type: i % 2 === 0 ? 'user' : 'assistant', 
        message: { usage: { input_tokens: 10000, output_tokens: 100 } } 
    })
  ).join('\n');
  
  const root = createProject(base, 'loop-proj', { sessions: [session] });
  const audit = buildFleetAudit([root], { sessionScan: true });
  
  const loopFinding = audit.detectors.findings.find(f => f.id === 'loop_runs');
  assert.ok(loopFinding, 'Should detect loop runs');
  assert.equal(loopFinding.count, 1);
});

test('quality score calculation logic', () => {
    const base = tmpRoot();
    const root = createProject(base, 'quality-test', {
        bench: {
            strictResult: { ok: false }, // -20
            mtpResult: { gateOk: false }, // -20
            actionRouting: { gateOk: false }, // -15
            wasteSignals: Array(10).fill({}) // -30 (max)
        }
    });
    // Expected quality: 100 - 20 - 20 - 15 - 30 = 15
    const audit = buildFleetAudit([root]);
    assert.equal(audit.projects[0].qualityScore, 15);
});

test('feature: detect tool cascade', () => {
    const base = tmpRoot();
    const session = [
        JSON.stringify({ type: 'user', message: { content: 'run tool' } }),
        JSON.stringify({ type: 'assistant', message: { 
            content: [
                { type: 'tool_use', name: 'read_file' },
                { type: 'tool_use', name: 'read_file' },
                { type: 'tool_use', name: 'read_file' }
            ],
            usage: { input_tokens: 1000, output_tokens: 500 }
        } })
    ].join('\n');
    
    const root = createProject(base, 'cascade-proj', { sessions: [session] });
    const audit = buildFleetAudit([root], { sessionScan: true });
    
    const cascadeFinding = audit.detectors.findings.find(f => f.id === 'tool_cascade');
    assert.ok(cascadeFinding, 'Should detect tool cascade');
    assert.equal(cascadeFinding.count, 3);
});

