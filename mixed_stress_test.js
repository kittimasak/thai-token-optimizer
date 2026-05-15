const { compressPrompt } = require('./hooks/tto-compressor');
const assert = require('node:assert');

/**
 * TTO v2.0 Mixed Language Stress Test - Aggressive Log Deduplication
 * Focus: Interleaved Thai/English, Mixed Fillers, and Multilingual Drift.
 */

async function runMixedStress() {
  console.log('🔥 Initializing TTO v2.0 Mixed Language Stress Test...\n');

  const tests = [
    {
      name: 'Mixed Language Repetition: Thai Prefix + English Log',
      generate: () => {
        const lines = [];
        for (let i = 0; i < 100; i++) {
          lines.push('ตรวจสอบระบบ: Scanning for vulnerabilities... [OK]');
        }
        return lines.join('\n');
      },
      check: (out) => {
        assert.match(out, /ดูระบบ.*Scanning for vulnerabilities.*รันซ้ำ 100 ครั้ง/);
        assert.ok(out.length < 100);
      }
    },
    {
      name: 'Multilingual Linguistic Drift',
      generate: () => {
        return [
          'Detected issue in auth module. รบกวนช่วยตรวจสอบหน่อยครับ',
          'Found some issues in auth module. ช่วยดูให้หน่อยครับ',
          'An issue was detected in auth module. รบกวนช่วยดูทีครับ',
          'Auth module problem detected. ช่วยเช็คหน่อยครับ',
          'Detected a problem in the auth module. ฝากดูด้วยครับ'
        ].join('\n');
      },
      check: (out) => {
        // Should group due to similarity and common semantic keywords
        assert.match(out, /\(พบซ้ำ 5 ครั้ง\)/);
      }
    },
    {
      name: 'Interleaved Thai/English Logs',
      generate: () => {
        const lines = [];
        for (let i = 0; i < 20; i++) {
          lines.push('กำลังอ่านไฟล์... [Reading file]');
          lines.push('กำลังอ่านไฟล์... [Reading file]');
          lines.push('ERROR: File not found');
          lines.push('ERROR: File not found');
          lines.push('ERROR: File not found');
        }
        return lines.join('\n');
      },
      check: (out) => {
        assert.match(out, /กำลังอ่านไฟล์.*รันซ้ำ 2 ครั้ง/);
        assert.match(out, /ERROR: File not found.*รันซ้ำ 3 ครั้ง/);
      }
    },
    {
      name: 'Mixed Polite Filler & English Phrases',
      input: 'Please kindly check the code นะครับ เพราะว่าผมค่อนข้างจะกังวลเรื่อง Performance ครับ Thank you very much in advance!',
      check: (out) => {
        console.log('Mixed Filler Result:', JSON.stringify(out));
        // Thai fillers: นะครับ, เพราะว่าผมค่อนข้างจะ, ครับ
        // English fillers: Please kindly, Thank you very much in advance!
        assert.ok(!out.includes('Please kindly'));
        assert.ok(!out.includes('นะครับ'));
        assert.ok(!out.includes('Thank you very much'));
        assert.match(out, /check the code.*กังวลเรื่อง Performance/);
      }
    },
    {
      name: 'Thai Pattern-Based + English Elements',
      generate: () => {
        return [
          'บันทึกข้อมูลสำเร็จ: User profile updated',
          'บันทึกข้อมูลสำเร็จ: Settings saved',
          'บันทึกข้อมูลสำเร็จ: Password changed',
          'บันทึกข้อมูลสำเร็จ: Avatar uploaded'
        ].join('\n');
      },
      check: (out) => {
        // Should use Thai pattern collapsing
        assert.match(out, /บันทึกข้อมูลสำเร็จ.*\[User profile updated, Settings saved, Password changed, Avatar uploaded\] \(4 รายการ\)/);
      }
    }
  ];

  let totalPassed = 0;
  for (const t of tests) {
    try {
      console.log(`Running: ${t.name}`);
      const input = t.input || (t.generate && t.generate());
      const start = Date.now();
      const output = compressPrompt(input, { level: t.level || 'full', semanticDedup: true });
      const end = Date.now();
      
      t.check(output);
      console.log(`✅ Success | Size: ${input.length} -> ${output.length} bytes | Time: ${end - start}ms`);
      totalPassed++;
    } catch (err) {
      console.error(`❌ Failed: ${t.name}`);
      console.error(err.message);
      // console.error(err.stack);
    }
    console.log('---');
  }

  console.log(`\nFinal Result: ${totalPassed}/${tests.length} tests passed.`);
  if (totalPassed !== tests.length) process.exit(1);
}

runMixedStress().catch(console.error);
