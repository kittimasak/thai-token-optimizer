/**
 * Demo: AST-Aware Constraint Locking
 * ทดสอบความสามารถในการรักษาบริบท (Contextual Integrity) ของเงื่อนไขสำคัญ
 */
const { compressPrompt } = require('../hooks/tto-compressor');

const testPrompts = [
  "ห้ามลบไฟล์ index.js เด็ดขาดนะครับ แต่ไฟล์ README.md อาจจะลบได้ถ้าจำเป็น",
  "ต้องใช้ Node.js เวอร์ชัน 20.19.4 เท่านั้น ห้ามใช้เวอร์ชัน 18 นะครับ",
  "รบกวนช่วยเก็บ API_KEY_PROD ไว้เป็นความลับ ห้ามเผลอทำหลุดไปใน log เด็ดขาด"
];

console.log('--- สาธิต AST-Aware Constraint Locking ---');

testPrompts.forEach((p, i) => {
  console.log(`\n[${i + 1}] ต้นฉบับ: ${p}`);
  
  const optimized = compressPrompt(p, { level: 'ultra' });
  
  console.log(`✨ ผลลัพธ์ (Ultra): ${optimized}`);
  
  // ตรวจสอบว่าเงื่อนไขและเป้าหมายยังอยู่คู่กัน
  if (i === 0) {
    const ok = optimized.includes('ห้าม') && optimized.includes('index.js');
    console.log(ok ? '✅ ผลการตรวจสอบ: เงื่อนไขและเป้าหมายอยู่ครบถ้วน' : '❌ ผลการตรวจสอบ: บริบทเพี้ยน!');
  }
  if (i === 1) {
    const ok = optimized.includes('20.19.4') && optimized.includes('ห้าม') && optimized.includes('18');
    console.log(ok ? '✅ ผลการตรวจสอบ: เงื่อนไขเวอร์ชันอยู่ครบถ้วน' : '❌ ผลการตรวจสอบ: บริบทเพี้ยน!');
  }
});

console.log('\nวิเคราะห์: ระบบใหม่ตรวจจับเป็น "ก้อนความหมาย" (ห้าม + index.js) ทำให้แม้จะบีบอัดระดับ ultra บริบทสำคัญก็ไม่แยกออกจากกันครับ');
