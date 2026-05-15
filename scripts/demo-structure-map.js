/**
 * Demo: Structure Map (Semantic Muting)
 * จำลองการบีบอัดที่ระบบรับรู้ "โครงสร้างโค้ด" และตัดภาษาไทยที่อธิบายซ้ำออก
 */
const { pruneRedundantThai, extractSymbols } = require('../hooks/tto-semantic-analyzer');

const code = `
function calculateTax(income, rate) {
  return income * rate;
}
`;

const thaiDescription = "นี่คือฟังก์ชัน calculateTax นะครับ ซึ่งรับค่า income และ rate มาคูณกันเพื่อหาค่าภาษีครับ";

console.log('--- [2/2] สาธิต Structure Map (Semantic Muting) ---');
console.log('ข้อมูลนำเข้า:');
console.log('โค้ด:', code.trim());
console.log('คำอธิบายไทย:', thaiDescription);

// 1. วิเคราะห์โครงสร้าง (Extract Symbols)
const symbols = extractSymbols(code);
console.log('\n🔍 ระบบตรวจพบโครงสร้าง (Symbols):', symbols);

// 2. ทำ Semantic Muting (ตัดส่วนซ้ำซ้อน)
const pruned = pruneRedundantThai(thaiDescription, symbols);

console.log('\n✨ ผลลัพธ์หลังบีบอัด (Structure-Aware):');
console.log(`[${pruned}]`);
console.log('\nวิเคราะห์: ระบบเห็นว่าในโค้ดมีชื่อฟังก์ชันและตัวแปรชัดเจนอยู่แล้ว จึงตัดการอธิบายซ้ำออกเพื่อให้ AI โฟกัสที่เนื้องาน');
