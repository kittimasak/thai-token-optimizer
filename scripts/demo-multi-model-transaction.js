/**
 * Demo: Multi-Model Tokenization & Cross-file Transaction
 * ทดสอบความแม่นยำรายโมเดล และความทนทานของการบันทึกสถานะ
 */
const { estimateTokens } = require('../hooks/tto-token-estimator');
const { beginTransaction, READ_CACHE_STATE_PATH } = require('../hooks/tto-runtime-analytics');
const fs = require('fs');

console.log('--- [1/2] สาธิต Multi-Model Tokenization ---');
const text = "สวัสดีครับ TTO v2.0.0 พร้อมใช้งานแล้ว";

const models = ['gpt-4o', 'codex', 'gpt-4', 'generic'];
models.forEach(m => {
  const res = estimateTokens(text, m, { exact: true });
  console.log(`Model: ${m.padEnd(10)} | Tokens: ${String(res.estimatedTokens).padStart(3)} | Tokenizer: ${res.tokenizer}`);
});

console.log('\n--- [2/2] สาธิต Cross-file Transaction (Rollback Simulation) ---');
const tx = beginTransaction();
const testFile = 'transaction-test.json';

try {
  console.log('1. เริ่ม Transaction และ Queue การเขียนไฟล์...');
  tx.queueWrite(testFile, { status: 'success' });
  
  console.log('2. จำลองความล้มเหลวก่อน Commit...');
  throw new Error('Simulated System Crash!');
  
  tx.commit();
  console.log('✅ Commit สำเร็จ (ไม่ควรเห็นข้อความนี้)');
} catch (e) {
  console.log(`🚨 เกิดข้อผิดพลาด: ${e.message}`);
  tx.rollback();
  console.log('🧹 ทำการ Rollback เรียบร้อย (ลบไฟล์ชั่วคราว)');
  
  const exists = fs.existsSync(testFile);
  console.log(`ตรวจสอบไฟล์จริง: ${exists ? '❌ พบไฟล์ (Rollback ล้มเหลว)' : '✅ ไม่พบไฟล์ (Rollback สำเร็จ)'}`);
}

if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
if (fs.existsSync(testFile + '.transaction.tmp')) fs.unlinkSync(testFile + '.transaction.tmp');
