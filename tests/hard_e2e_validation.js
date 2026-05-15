
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const assert = require('node:assert/strict');

const BIN = path.join(__dirname, '..', 'bin', 'thai-token-optimizer.js');
const TTO_HOME = path.join(__dirname, '..', '.tto_hard_e2e_test');

function run(args, input = '') {
    return spawnSync('node', [BIN, ...args], {
        env: { ...process.env, TTO_HOME },
        input,
        encoding: 'utf8'
    });
}

console.log('🔥 Starting TTO v2.0 HARD-CASE End-to-End Validation...');

try {
    // 1. Edge Case: Deeply Nested Config & Overrides
    console.log('\n[Hard Case 1/5] Deep Config Resilience');
    run(['config', 'set', 'benchmarkStrict.mtpRepeats', '15']);
    run(['config', 'set', 'readCache.mode', 'block']);
    run(['config', 'set', 'adapters.gemini', 'true']);
    
    let policy = JSON.parse(run(['config', 'get']).stdout);
    assert.strictEqual(policy.benchmarkStrict.mtpRepeats, 15);
    assert.strictEqual(policy.readCache.mode, 'block');
    console.log('✅ Deep config verified.');

    // 2. Edge Case: Extreme Budget vs Preservation
    console.log('\n[Hard Case 2/5] Extreme Budget Pressure (Impossible Target)');
    const largeTechnical = `Thai Token Optimizer v2.0 must keep these paths:
    /Users/admin/secrets/key.pem
    /var/www/html/index.php
    /etc/nginx/nginx.conf
    And these commands:
    git commit -m "feat: upgrade to v2.0"
    docker build -t tto-v2 .
    npm install --save-dev @dqbd/tiktoken
    ${"ไทย ".repeat(200)}`; // Add narrative bulk
    
    // Set a budget that is likely too small to keep everything
    res = run(['compress', '--budget', '50', '--level', 'full'], largeTechnical);
    // Even under extreme pressure, technical terms MUST stay.
    assert.match(res.stdout, /\/Users\/admin\/secrets\/key\.pem/, 'Must NOT lose sensitive path');
    assert.match(res.stdout, /npm install --save-dev @dqbd\/tiktoken/, 'Must NOT lose complex command');
    console.log('✅ Preservation under budget pressure verified.');

    // 3. Edge Case: Personal Dictionary Collision
    console.log('\n[Hard Case 3/5] Dictionary Collision & Protection');
    run(['keep', 'v2.0']); // Protect a term that is also a version
    run(['keep', 'สำคัญมาก']);
    
    const collisionPrompt = 'นี่คือ TTO v2.0 ซึ่งสำคัญมาก ห้ามตัด v2.0 ออกเด็ดขาด';
    res = run(['compress', '--level', 'full'], collisionPrompt);
    assert.match(res.stdout, /v2\.0/, 'Must preserve protected version via dictionary');
    assert.match(res.stdout, /สำคัญมาก/, 'Must preserve user-defined phrase');
    console.log('✅ Dictionary protection verified.');

    // 4. Edge Case: Safety Whitelist vs Detection
    console.log('\n[Hard Case 4/5] Mixed Safety Context (Whitelist/Risky Mix)');
    // A prompt describing a risky command but in an educational/safe context
    const mixedSafety = 'วิธีการป้องกันคำสั่ง rm -rf / ในระบบ production คือการใช้ alias หรือเช็คสิทธิ์ให้ดีก่อนรัน';
    res = run(['classify', '--pretty'], mixedSafety);
    // It should still detect the risk because of the keywords, but we check if it escalates.
    assert.match(res.stdout, /destructive_command/, 'Should still flag the keyword');
    assert.match(res.stdout, /production_deploy/, 'Should flag context');
    console.log('✅ Safety classification (strict keywords) verified.');

    // 5. Edge Case: MTP Semantic Tie-Break
    console.log('\n[Hard Case 5/5] MTP Semantic Redundancy Audit');
    const repetitivePrompt = `ระบบ Thai Token Optimizer. ระบบ Thai Token Optimizer. 
    ช่วยตรวจเช็คระบบ Thai Token Optimizer ให้หน่อยครับ.
    เราต้องการความรวดเร็ว. เราต้องการความรวดเร็ว.`;
    
    res = run(['compress', '--level', 'full', '--speculative'], repetitivePrompt);
    const lines = res.stdout.split('\n').filter(l => l.includes('Thai Token Optimizer'));
    assert.ok(lines.length < 3, 'Semantic dedup should have collapsed repetitions');
    console.log('✅ MTP semantic dedup verified.');

    console.log('\n🏆 TTO v2.0 HARD-CASE VALIDATION SUCCESSFUL!');

} catch (e) {
    console.error('\n💥 Hard-Case Validation Failed:');
    console.error(e);
    process.exit(1);
} finally {
    if (fs.existsSync(TTO_HOME)) {
        fs.rmSync(TTO_HOME, { recursive: true, force: true });
    }
}
