/**
 * Gemini CLI Hooks Validation Script
 * ตรวจสอบว่า Hooks ส่งออก JSON ที่ถูกต้องและมีเนื้อหาใหม่ตามแผนการอุดรอยรั่ว
 */
const { execSync } = require('child_process');
const path = require('path');

const hooks = [
  { name: 'session', path: 'hooks/tto-gemini-session.js', input: '' },
  { name: 'beforetool', path: 'hooks/tto-gemini-beforetool.js', input: '{ "command": "ls -R" }' },
  { name: 'aftertool', path: 'hooks/tto-gemini-aftertool.js', input: '{ "output": "long log content..." }' },
  { name: 'precompress', path: 'hooks/tto-gemini-precompress.js', input: '' }
];

console.log('--- เริ่มการตรวจสอบ Gemini CLI Hooks ---\n');

hooks.forEach(h => {
  console.log(`ตรวจสอบ Hook: ${h.name}`);
  try {
    let output;
    if (h.input) {
      output = execSync(`echo '${h.input}' | node ${h.path}`).toString();
    } else {
      output = execSync(`node ${h.path}`).toString();
    }

    // 1. ตรวจสอบว่าเป็น JSON ที่ถูกต้อง
    const parsed = JSON.parse(output);
    console.log('✅ รูปแบบ JSON: ถูกต้อง');

    // 2. ตรวจสอบเนื้อหาสำคัญ
    const context = parsed.hookSpecificOutput?.additionalContext || '';
    
    if (h.name === 'session' && context.includes('TTO v2.0.0')) console.log('✅ เนื้อหา Dense Nudge: พบเวอร์ชัน v2.0.0');
    if (h.name === 'aftertool' && context.includes('mask it in your thought process')) console.log('✅ เนื้อหา Tool Masking: พบคำสั่ง Masking');
    if (h.name === 'precompress' && context.includes('Retroactive History Compaction')) console.log('✅ เนื้อหา History Compaction: พบคำสั่งสรุปประวัติ');

  } catch (e) {
    console.log(`❌ ผิดพลาด: ${e.message}`);
  }
  console.log('-----------------------------------');
});
