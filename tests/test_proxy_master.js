const assert = require('assert');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'thai-token-optimizer.js');

function runProxy(scriptContent, budget = 500) {
  const scriptPath = path.join(ROOT, 'temp_test_script.js');
  fs.writeFileSync(scriptPath, scriptContent);
  
  try {
    const cmd = `node ${BIN} proxy --level full --budget ${budget} --silent node ${scriptPath}`;
    const stdout = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    return stdout;
  } finally {
    if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
  }
}

// ============================================================================
// SCENARIO 1: Pure Thai (Filler & Summary)
// ============================================================================
console.log('Testing Scenario 1: Pure Thai...');
const thaiScript = `
for (let i = 0; i < 30; i++) {
  console.log("รบกวนช่วยตรวจสอบข้อมูลในส่วนนี้ให้หน่อยครับว่าถูกต้องหรือไม่");
}
console.log("สรุปผลการทำงาน: ตรวจสอบเรียบร้อยแล้ว พบว่าข้อมูลถูกต้องตามมาตรฐานครับ");
`;
const outThai = runProxy(thaiScript, 200);
assert.match(outThai, /รันซ้ำ 30 ครั้ง/);
assert.match(outThai, /สรุปผลการทำงาน/);
assert.match(outThai, /ดูเรียบร้อยแล้ว|ตรวจสอบเรียบร้อยแล้ว/);
console.log('✅ Pure Thai Passed');

// ============================================================================
// SCENARIO 2: Pure English (Logs & Stack Trace)
// ============================================================================
console.log('Testing Scenario 2: Pure English...');
const englishScript = `
for (let i = 0; i < 50; i++) {
  console.log("[INFO] 2026-05-16T10:00:00Z Connection established to node #" + i);
}
console.log("Error: Connection timeout");
console.log("    at socket.connect (/app/node_modules/net/sockets.js:45:10)");
console.log("    at main (/app/index.js:12:5)");
console.log("Mission failed: exceeded retry limit");
`;
const outEnglish = runProxy(englishScript, 400);
// ALD or SMT should catch the logs
assert.match(outEnglish, /รันซ้ำ 50 ครั้ง|ย่อรายละเอียด/);
// Technical preservation
assert.match(outEnglish, /socket\.connect/);
assert.match(outEnglish, /sockets\.js:45:10/);
assert.match(outEnglish, /Mission failed/);
console.log('✅ Pure English Passed');

// ============================================================================
// SCENARIO 3: Mixed Thai/English (DevOps Workflow)
// ============================================================================
console.log('Testing Scenario 3: Mixed Language...');
const mixedScript = `
console.log("กำลังเริ่มรันคำสั่ง npm test...");
for (let i = 0; i < 20; i++) {
  console.log("Test Case #" + i + ": PASS");
}
console.log("รันเสร็จแล้วครับ ต่อไปให้รัน git push origin production");
console.log("[WARNING] ห้ามรัน rm -rf / ในระบบจริงเด็ดขาด");
`;
const outMixed = runProxy(mixedScript, 150);
assert.match(outMixed, /npm test/);
assert.match(outMixed, /Test Case/);
assert.match(outMixed, /git push origin prod/);
assert.match(outMixed, /rm -rf \//);
assert.match(outMixed, /เด็ดขาด/);
console.log('✅ Mixed Language Passed');

console.log('\n🏆 ALL MASTER PROXY TESTS PASSED (Full Capacity Verified)');
