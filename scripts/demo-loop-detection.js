/**
 * Demo: Loop Detection (Tool Cascade)
 * จำลองสถานการณ์ที่ AI รันเครื่องมือเดิมซ้ำๆ (เช่น ls) ซึ่งทำให้สิ้นเปลือง Token โดยไม่ได้งานเพิ่ม
 */
const { runDetectors } = require('../hooks/tto-fleet-detectors');

// 1. สร้าง Session จำลองที่มีการรันเครื่องมือซ้ำซ้อน (Loop Pattern)
const mockRun = {
  adapter: 'codex',
  tools: [
    { name: 'ls', arguments: '{ "path": "." }' },
    { name: 'ls', arguments: '{ "path": "." }' },
    { name: 'ls', arguments: '{ "path": "." }' },
    { name: 'ls', arguments: '{ "path": "." }' },
    { name: 'ls', arguments: '{ "path": "." }' }
  ],
  messages: [
    { role: 'user', content: 'ช่วยหาไฟล์ให้หน่อย' },
    { role: 'assistant', content: 'กำลังหาครับ...' }
  ],
  inputTokens: 1000,
  outputTokens: 50,
  messagesCount: 10
};

console.log('--- [1/2] สาธิต Loop Detection ---');
console.log('สถานการณ์: AI กำลังรันคำสั่ง ls ซ้ำกัน 5 ครั้งติดต่อกัน...');

// 2. รันระบบตรวจจับ
const findings = runDetectors(mockRun);

if (findings.length > 0) {
  console.log('\n🚨 ตรวจพบความผิดปกติ (Findings):');
  findings.forEach(f => {
    console.log(`- ID: ${f.id}`);
    console.log(`  Severity: ${f.severity}`);
    console.log(`  Message: ${f.message}`);
    console.log(`  Waste: ${f.wasteTokens} tokens`);
  });
  console.log('\n💡 ระบบ TTO จะแจ้งเตือนผู้ใช้หรือขัดจังหวะเพื่อหยุดความสิ้นเปลืองนี้ทันที');
} else {
  console.log('\n✅ ไม่พบ Loop (อาจต้องเพิ่มจำนวนครั้งเพื่อ trigger)');
}
