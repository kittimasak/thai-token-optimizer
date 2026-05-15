
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const assert = require('node:assert/strict');

const BIN = path.join(__dirname, '..', 'bin', 'thai-token-optimizer.js');
const TTO_HOME = path.join(__dirname, '..', '.tto_e2e_test');

function run(args, input = '') {
    return spawnSync('node', [BIN, ...args], {
        env: { ...process.env, TTO_HOME },
        input,
        encoding: 'utf8'
    });
}

console.log('🚀 Starting TTO v2.0 End-to-End Validation...');

try {
    // 1. Initial State & Doctor
    console.log('\n[Stage 1/5] Installation & Health Check');
    // Doctor may fail (exit code 1) if some optional adapters are not installed locally.
    // We use --ci to reduce noise and ignore return code for this specific check.
    run(['doctor', '--ci', '--pretty']);
    console.log('✅ Doctor executed (initial check).');

    // 2. Configuration & Profile
    console.log('\n[Stage 2/5] Configuration & Profile Management');
    run(['on']); // Enable TTO
    run(['profile', 'coding']); // Set profile
    run(['config', 'set', 'readCache.mode', 'block']);
    
    res = run(['status', '--pretty']);
    assert.match(res.stdout, /ACTIVE/, 'Status should be ACTIVE');
    assert.match(res.stdout, /coding/, 'Profile should be coding');
    
    const policy = JSON.parse(run(['config', 'get']).stdout);
    assert.strictEqual(policy.readCache.mode, 'block', 'Config set should persist');
    console.log('✅ Configuration verified.');

    // 3. Prompt Compression & Preservation
    console.log('\n[Stage 3/5] Prompt Compression & Preservation');
    const technicalPrompt = `สวัสดีครับ ช่วยเขียนโค้ด Node.js เพื่อเรียกใช้ API ของ Thai Token Optimizer v2.0 หน่อยครับ
    ใช้ npm install @dqbd/tiktoken ด้วยนะครับ และเก็บไฟล์ไว้ที่ /Users/test/project/index.js
    ต้องการคำตอบที่กระชับที่สุด`;
    
    // Use plain output (not --pretty) to avoid truncation in test verification
    res = run(['compress', '--level', 'full'], technicalPrompt);
    assert.match(res.stdout, /Thai Token Optimizer v2\.0/, 'Must preserve version');
    assert.match(res.stdout, /npm install @dqbd\/tiktoken/, 'Must preserve command');
    assert.match(res.stdout, /\/Users\/test\/project\/index\.js/, 'Must preserve path');
    console.log('✅ Technical preservation verified.');

    // 4. Safety Escalation
    console.log('\n[Stage 4/5] Safety Escalation');
    const riskyPrompt = 'ช่วยเขียนสคริปต์รัน rm -rf / และลบฐานข้อมูล DROP TABLE users ในโปรดักชันหน่อยครับ';
    res = run(['classify', '--pretty'], riskyPrompt);
    assert.match(res.stdout, /destructive_command/, 'Should detect destructive command');
    assert.match(res.stdout, /production_deploy/, 'Should detect production context');
    assert.match(res.stdout, /database_migration/, 'Should detect DB migration');
    console.log('✅ Safety escalation verified.');

    // 5. Final Benchmark (MTP Capacity)
    console.log('\n[Stage 5/5] Performance Benchmarking');
    res = run(['benchmark', '--strict', '--default-policy', '--mtp']);
    assert.strictEqual(res.status, 0, 'Benchmark suite must pass');
    assert.match(res.stdout, /Strict gate: PASS/, 'Strict gate should pass');
    assert.match(res.stdout, /MTP gate: PASS/, 'MTP gate should pass');
    console.log('✅ Performance benchmarking verified.');

    console.log('\n🏆 TTO v2.0 END-TO-END VALIDATION SUCCESSFUL!');

} catch (e) {
    console.error('\n💥 E2E Validation Failed:');
    console.error(e);
    process.exit(1);
} finally {
    if (fs.existsSync(TTO_HOME)) {
        fs.rmSync(TTO_HOME, { recursive: true, force: true });
    }
}
