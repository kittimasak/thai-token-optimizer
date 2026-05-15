const { compressPrompt } = require('../hooks/tto-compressor');
const assert = require('node:assert');

const stressCases = [
  {
    name: 'High-Volume Repetition (100 lines)',
    input: Array(100).fill('กำลังตรวจสอบความพร้อมของระบบ...').join('\n'),
    check: (out) => {
      assert.match(out, /รันซ้ำ 100 ครั้ง/);
      assert.ok(out.split('\n').length < 5);
    }
  },
  {
    name: 'Gradual Linguistic Drift (Levenshtein)',
    input: [
      'ตรวจพบความผิดปกติในไฟล์ระบบ',
      'พบความผิดปกติในไฟล์ของระบบ',
      'เจอความผิดปกติในไฟล์ระบบงาน',
      'ตรวจเจอความผิดปกติในระบบ',
      'พบเห็นความผิดปกติในระบบไฟล์'
    ].join('\n'),
    check: (out) => {
      // Should be grouped due to 0.5 threshold (rolling similarity)
      assert.match(out, /พบซ้ำ 5 ครั้งในบรรทัดใกล้เคียงกัน|รันซ้ำ 5 ครั้ง|\(พบซ้ำ 5 ครั้ง\)/);
    }
  },
  {
    name: 'Interleaved Repetitive Blocks',
    input: [
      'กำลังอ่านไฟล์ A', 'กำลังอ่านไฟล์ A', 'กำลังอ่านไฟล์ A',
      'รันคำสั่ง B', 'รันคำสั่ง B', 'รันคำสั่ง B',
      'กำลังอ่านไฟล์ A', 'กำลังอ่านไฟล์ A', 'กำลังอ่านไฟล์ A'
    ].join('\n'),
    check: (out) => {
      const lines = out.split('\n');
      assert.match(lines[0], /อ่านไฟล์ A.*รันซ้ำ 3 ครั้ง/);
      assert.match(lines[1], /รันคำสั่ง B.*รันซ้ำ 3 ครั้ง/);
      assert.match(lines[2], /อ่านไฟล์ A.*รันซ้ำ 3 ครั้ง/);
    }
  },
  {
    name: 'Protected Structure vs Repetition',
    input: [
      'git push --force origin main',
      'git push --force origin dev',
      'git push --force origin feature',
      'rm -rf /tmp/cache1',
      'rm -rf /tmp/cache2',
      'rm -rf /tmp/cache3'
    ].join('\n'),
    check: (out) => {
      // git push --force and rm -rf should remain separate because of STRUCTURE_SENSITIVE_RE
      // which flushes the queue.
      assert.match(out, /git push --force origin main/);
      assert.match(out, /git push --force origin dev/);
      assert.match(out, /rm -rf \/tmp\/cache1/);
    }
  },
  {
    name: 'Mixed Polite Particle Blocks',
    input: [
      'แก้ไขส่วนหัวเสร็จเรียบร้อยแล้วครับ',
      'ปรับปรุงเนื้อหาเสร็จเรียบร้อยแล้วครับ',
      'เพิ่มรูปภาพเสร็จเรียบร้อยแล้วครับ',
      'ตรวจสอบ SEO เรียบร้อยแล้วค่ะ',
      'ส่งงานเรียบร้อยแล้วค่ะ'
    ].join('\n'),
    check: (out) => {
      assert.match(out, /เรียบร้อยแล้วครับ/);
      assert.match(out, /เรียบร้อยแล้วค่ะ/);
    }
  },
  {
    name: 'Edge Case: Only Symbols',
    input: '!!!\n!!!\n!!!\n???\n???\n???',
    check: (out) => {
      assert.match(out, /\[!!!\] รันซ้ำ 3 ครั้ง/);
      assert.match(out, /\[\?\?\?\] รันซ้ำ 3 ครั้ง/);
    }
  }
];

console.log('🚀 Starting Aggressive Log Deduplication Stress Test...\n');

let passed = 0;
stressCases.forEach(tc => {
  try {
    console.log(`Testing: ${tc.name}`);
    const start = Date.now();
    const output = compressPrompt(tc.input, { level: 'full', semanticDedup: true });
    const duration = Date.now() - start;
    
    tc.check(output);
    console.log(`✅ Passed (${duration}ms)`);
    console.log('Output Snippet:', output.slice(0, 100).replace(/\n/g, ' \\n ') + (output.length > 100 ? '...' : ''));
    passed++;
  } catch (e) {
    console.error(`❌ Failed: ${tc.name}`);
    console.error(e.message);
    console.error(e.stack);
  }
  console.log('---');
});

console.log(`\nFinal Result: ${passed}/${stressCases.length} tests passed.`);
if (passed !== stressCases.length) process.exit(1);
