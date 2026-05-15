/**
 * Demo: Transactional Journaling (Write-Ahead Logging)
 * ทดสอบการกู้คืนสถานะเมื่อระบบล่มระหว่างการย้ายไฟล์ (Rename)
 */
const { beginTransaction, TRANSACTION_JOURNAL_PATH } = require('../hooks/tto-runtime-analytics');
const fs = require('fs');

console.log('--- สาธิต Transactional Journaling (Recovery) ---');

const testFile1 = 'journal-test-1.json';
const testFile2 = 'journal-test-2.json';

// 1. จำลองการค้างคาของ Transaction (มี Journal แต่ยังไม่ได้ย้ายไฟล์)
console.log('1. จำลองสถานะค้างคา (Creating Orphan Journal & Temp Files)...');
const journal = {
  ts: new Date().toISOString(),
  state: 'pending_rename',
  files: [
    { src: testFile1 + '.transaction.tmp', dst: testFile1 },
    { src: testFile2 + '.transaction.tmp', dst: testFile2 }
  ]
};

fs.writeFileSync(testFile1 + '.transaction.tmp', JSON.stringify({ data: 'file 1' }));
fs.writeFileSync(testFile2 + '.transaction.tmp', JSON.stringify({ data: 'file 2' }));
fs.writeFileSync(TRANSACTION_JOURNAL_PATH, JSON.stringify(journal, null, 2));

console.log(`   - พบไฟล์ Journal: ${fs.existsSync(TRANSACTION_JOURNAL_PATH)}`);
console.log(`   - พบไฟล์ชั่วคราว: ${fs.existsSync(testFile1 + '.transaction.tmp')}`);

// 2. เรียกใช้ beginTransaction ซึ่งจะรัน recoverTransactions อัตโนมัติ
console.log('\n2. เรียกใช้ beginTransaction (เพื่อกระตุ้นระบบ Auto-recovery)...');
beginTransaction();

// 3. ตรวจสอบผลลัพธ์
console.log('\n3. ตรวจสอบผลการกู้คืน (Recovery Audit):');
const recovered1 = fs.existsSync(testFile1);
const recovered2 = fs.existsSync(testFile2);
const journalCleaned = !fs.existsSync(TRANSACTION_JOURNAL_PATH);

console.log(`   - กู้คืนไฟล์ 1 สำเร็จ: ${recovered1 ? '✅' : '❌'}`);
console.log(`   - กู้คืนไฟล์ 2 สำเร็จ: ${recovered2 ? '✅' : '❌'}`);
console.log(`   - ล้าง Journal สำเร็จ: ${journalCleaned ? '✅' : '❌'}`);

if (recovered1 && recovered2 && journalCleaned) {
  console.log('\n✨ สรุปผล: ระบบ Transactional Journaling กู้คืนสถานะข้อมูลให้กลับมาสอดคล้องกันได้สำเร็จ 100%!');
}

// Cleanup
if (fs.existsSync(testFile1)) fs.unlinkSync(testFile1);
if (fs.existsSync(testFile2)) fs.unlinkSync(testFile2);
if (fs.existsSync(testFile1 + '.transaction.tmp')) fs.unlinkSync(testFile1 + '.transaction.tmp');
if (fs.existsSync(testFile2 + '.transaction.tmp')) fs.unlinkSync(testFile2 + '.transaction.tmp');
if (fs.existsSync(TRANSACTION_JOURNAL_PATH)) fs.unlinkSync(TRANSACTION_JOURNAL_PATH);
