
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const assert = require('node:assert/strict');

const BIN = path.join(__dirname, '..', 'bin', 'thai-token-optimizer.js');
const TTO_HOME = path.join(__dirname, '..', '.tto_ultra_hard_test');

function run(args, input = '') {
    return spawnSync('node', [BIN, ...args], {
        env: { ...process.env, TTO_HOME },
        input,
        encoding: 'utf8'
    });
}

console.log('🚀 Starting TTO v2.0 ULTRA-HARD God-Tier Validation...');

try {
    // 1. Symbolic Collision: Text containing [S], [A], [T], [P]
    console.log('\n[Ultra Case 1/4] Symbolic Anchor Collision');
    const symbolicText = `The grade is [A]. The [S] size is large. [T] is for time. [P] is for park. 
    โปรดบีบอัดข้อความนี้แต่ห้ามทำพังนะครับ [S] [A] [T] [P]`;
    let res = run(['compress', '--level', 'full'], symbolicText);
    // It should not treat [S][A][T][P] here as commands but as text. 
    // However, since they are single-letter symbols in brackets, preservation might keep them.
    assert.match(res.stdout, /\[A\]/, 'Symbol [A] should survive as a technical identifier');
    assert.match(res.stdout, /\[S\]/, 'Symbol [S] should survive');
    console.log('✅ Symbolic collision handled.');

    // 2. Thai Preservation inside Code
    console.log('\n[Ultra Case 2/4] Thai Preservation in Code');
    const thaiInCode = `const message = "ข้อความภาษาไทยในโค้ด";
    /* หมายเหตุ: นี่คือคอมเมนต์ภาษาไทย */
    function check() { return true; }`;
    res = run(['compress', '--level', 'full'], thaiInCode);
    assert.match(res.stdout, /ข้อความภาษาไทยในโค้ด/, 'Thai string in code must be preserved');
    assert.match(res.stdout, /หมายเหตุ: นี่คือคอมเมนต์ภาษาไทย/, 'Thai comment must be preserved');
    assert.match(res.stdout, /function check/, 'Function structure must remain');
    console.log('✅ Thai in code preservation verified.');

    // 3. Instructional Pruning: "Explain in detail" vs "Compact Tone"
    console.log('\n[Ultra Case 3/4] Instructional Conflict (Detail vs Compact)');
    const conflictPrompt = `ช่วยอธิบายโค้ดนี้อย่างละเอียดที่สุดเท่าที่จะเป็นไปได้ (Very long and detailed explanation please):
    function optimize() { return 1; }`;
    // Under TTO [T] (Senior+Compact), it should stay professional and avoid excessive fluff 
    // even when the user asks for "detail", but it must NOT lose the code.
    res = run(['compress', '--level', 'full'], conflictPrompt);
    assert.match(res.stdout, /function optimize/, 'Code MUST be preserved');
    // Note: We can't easily assert "briefness" without a real LLM, but we can verify it doesn't crash.
    console.log('✅ Instructional pruning conflict handled.');

    // 4. Lazy_Load Simulation: Checking if manual is reachable
    console.log('\n[Ultra Case 4/4] Lazy_Load Target Verification');
    const manualPath = path.join(__dirname, '..', 'MANUAL.md');
    assert.ok(fs.existsSync(manualPath), 'MANUAL.md must exist for Lazy_Load to work');
    const manualContent = fs.readFileSync(manualPath, 'utf8');
    assert.match(manualContent, /tto benchmark/, 'MANUAL.md must contain command details');
    console.log('✅ Lazy_Load target verified.');

    console.log('\n🏆 TTO v2.0 ULTRA-HARD VALIDATION SUCCESSFUL!');

} catch (e) {
    console.error('\n💥 Ultra-Hard Case Validation Failed:');
    console.error(e);
    process.exit(1);
} finally {
    if (fs.existsSync(TTO_HOME)) {
        fs.rmSync(TTO_HOME, { recursive: true, force: true });
    }
}
