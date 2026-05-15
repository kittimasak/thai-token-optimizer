
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const assert = require('node:assert/strict');

const BIN = path.join(__dirname, '..', 'bin', 'thai-token-optimizer.js');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-coach-test-'));
const ttoHome = path.join(tmpDir, '.tto');
const env = { ...process.env, HOME: tmpDir, TTO_HOME: ttoHome };

function run(args) {
  return spawnSync('node', [BIN, ...args], { env, encoding: 'utf8', cwd: tmpDir });
}

try {
  // Setup a project
  fs.mkdirSync(ttoHome, { recursive: true });
  run(['config', 'set', 'readCache.mode', 'warn']);

  // Test 1: Clean project
  console.log('Test 1: Clean project');
  // Create a clean local benchmark artifact to prevent fallback to source dir
  const benchDir = path.join(tmpDir, 'benchmarks');
  fs.mkdirSync(benchDir, { recursive: true });
  fs.writeFileSync(path.join(benchDir, 'regression_report.json'), JSON.stringify({
    strictResult: { ok: true },
    mtpResult: { gateOk: true },
    actionRouting: { gateOk: true },
    wasteSignals: [],
    actionSuggestions: []
  }));

  let res = run(['coach', '--pretty']);
  assert.equal(res.status, 0);
  assert.match(res.stdout, /No major anti-pattern detected/);

  // Test 2: Mock a bad state (Repeated reads)
  console.log('Test 2: Mock repeated reads');
  const cacheReadsPath = path.join(ttoHome, 'cache-reads.jsonl');
  // Add many reads for the same file to trigger message_efficiency_low
  for (let i = 0; i < 50; i++) {
    fs.appendFileSync(cacheReadsPath, JSON.stringify({ file: 'file.txt', ts: new Date().toISOString() }) + '\n');
  }
  
  res = run(['coach']);
  console.log('Coach Output (JSON):');
  console.log(res.stdout);
  const coachData = JSON.parse(res.stdout);
  console.log('Weak Signals:', coachData.quality.weakSignals);
  
  // We expect 'repeated_reads' anti-pattern or at least a lower score
  assert.ok(coachData.quality.weakSignals.includes('message_efficiency_low'), 'Should have message_efficiency_low weak signal');

  // Test 3: Apply Quick Fix
  console.log('Test 3: Apply Quick Fix');
  res = run(['coach', '--apply', 'quick', '--pretty']);
  console.log('Coach Output (Apply Quick):');
  console.log(res.stdout);
  assert.match(res.stdout, /Applied\s+YES/);
  assert.match(res.stdout, /set readCache.mode=block/);
  
  // Verify config changed
  const configRes = run(['config', 'get', 'readCache.mode']);
  assert.equal(configRes.stdout.trim(), 'block');

  // Test 4: Verify checkpoints were created
  const checkpointsFile = path.join(ttoHome, 'checkpoints.jsonl');
  if (fs.existsSync(checkpointsFile)) {
    const lines = fs.readFileSync(checkpointsFile, 'utf8').split('\n').filter(Boolean);
    console.log('Checkpoints created:', lines.length);
    assert.ok(lines.some(l => l.includes('compact.before')));
    assert.ok(lines.some(l => l.includes('compact.after')));
  } else {
    throw new Error('Checkpoints file not created');
  }

  // Test 5: Benchmark fail signals
  console.log('Test 5: Mock benchmark fail');
  // benchDir is already declared above
  fs.mkdirSync(benchDir, { recursive: true });
  fs.writeFileSync(path.join(benchDir, 'regression_report.json'), JSON.stringify({
    strictResult: { ok: false },
    mtpResult: { gateOk: false },
    actionRouting: { gateOk: false }
  }));
  
  res = run(['coach', '--pretty']);
  console.log('Coach Output (Benchmark Fail):');
  console.log(res.stdout);
  assert.match(res.stdout, /quality_gate_fail/);
  assert.match(res.stdout, /action_routing_risk/);

  console.log('🏆 Token Coach Detailed Test PASS');

} catch (e) {
  console.error('💥 Test Failed:');
  console.error(e);
  process.exit(1);
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
