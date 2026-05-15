
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BIN = path.join(__dirname, '..', 'bin', 'thai-token-optimizer.js');

function run(args, input = '') {
    const res = spawnSync('node', [BIN, ...args], { input, encoding: 'utf8' });
    return res.stdout || '';
}

function estimate(text) {
    const out = run(['estimate', '--target', 'gemini'], text);
    try {
        return JSON.parse(out).estimatedTokens;
    } catch (e) {
        return text.length / 2; // Rough fallback
    }
}

function compress(text, level = 'full') {
    return run(['compress', '--level', level], text);
}

function report(name, original) {
    const origTokens = estimate(original);
    const optimized = compress(original);
    const optTokens = estimate(optimized);
    const saved = origTokens - optTokens;
    const pct = ((saved / origTokens) * 100).toFixed(2);

    console.log(`\n================================================================`);
    console.log(`🎯 CASE: ${name}`);
    console.log(`----------------------------------------------------------------`);
    console.log(`Original Tokens:  ${origTokens}`);
    console.log(`Optimized Tokens: ${optTokens}`);
    console.log(`Tokens Saved:     ${saved}`);
    console.log(`Reduction Pct:    ${pct}%`);
    console.log(`----------------------------------------------------------------`);
    console.log(`[Optimized Preview]:\n${optimized.trim().substring(0, 300)}${optimized.length > 300 ? '...' : ''}`);
    console.log(`================================================================`);
    
    // Integrity Check
    if (optimized.length === 0 && original.length > 0) {
        console.error('❌ BUG DETECTED: Compression returned empty string!');
    }
}

console.log('🚀 TTO v2.0 HARD-CASE TOKEN REDUCTION AUDIT REPORT');

// CASE 1: Extreme Narrative Bloat
const case1 = `ช่วยหน่อยครับ พอดีผมมีปัญหาเรื่องโค้ด คือผมต้องการที่จะให้คุณช่วยตรวจสอบฟังก์ชันที่ชื่อว่า calculateFinalTotal ในไฟล์ที่อยู่ที่ path src/utils/pricing.js ครับ ซึ่งไฟล์นี้เป็นไฟล์ที่สำคัญมากๆ ในระบบโปรดักชันของเรา (production) ตอนนี้ระบบรันอยู่ที่เวอร์ชัน v2.4.5 ครับ ผมอยากให้คุณช่วยดูว่าทำไมเวลามีการคำนวณภาษี (tax) แล้วมันถึงได้ค่าที่ผิดพลาดออกมา รบกวนช่วยตรวจสอบอย่างละเอียดและเขียนโค้ดแก้ไขให้ผมด้วยนะครับ ขอบคุณมากๆ ครับคุณเอไอ`;

// CASE 2: Repetitive Checklist with Technical Items
const case2 = `ขั้นตอนการติดตั้งระบบ TTO v2.0 มีดังนี้ครับ:
1. ขั้นตอนแรกคือคุณต้องทำการรันคำสั่ง npm install ก่อนครับ เพื่อติดตั้ง library ที่จำเป็น
2. ขั้นตอนที่สองคือคุณต้องทำการรันคำสั่ง npm run build ครับ เพื่อทำการ build project
3. ขั้นตอนที่สามคือคุณต้องทำการรันคำสั่ง tto doctor --pretty ครับ เพื่อตรวจสอบความเรียบร้อย
4. ขั้นตอนที่สี่คือคุณต้องทำการรันคำสั่ง tto status ครับ เพื่อดูสถานะการทำงาน
หวังว่าขั้นตอนทั้งสี่ที่ผมบอกไปจะช่วยให้คุณติดตั้ง TTO v2.0 ได้สำเร็จนะครับ`;

// CASE 3: Mixed Code & Flowery Thai
const case3 = `ผมมีไฟล์ config ที่อยากให้คุณช่วยดูหน่อยครับ ไฟล์ชื่อ .env.production ครับ ในนั้นมีข้อมูลดังนี้:
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/db
SECRET_KEY=supersecretkey
รบกวนช่วยเปลี่ยน PORT เป็น 8080 และช่วยเช็คความปลอดภัยของ SECRET_KEY ให้ผมหน่อยนะครับ ว่ามันปลอดภัยพอหรือเปล่าสำหรับระบบใหญ่ๆ ขอบคุณครับ`;

// CASE 4: The "Wall of Repetition" (Semantic Stress Test)
const case4 = "สวัสดีครับ ".repeat(10) + "รบกวนช่วยเช็คไฟล์ package.json ให้หน่อยครับ ".repeat(5) + "ย้ำนะครับว่าไฟล์ package.json ".repeat(3) + "ขอบคุณครับ ".repeat(10);

report('Extreme Narrative Bloat', case1);
report('Repetitive Checklist', case2);
report('Mixed Code & Flowery Thai', case3);
report('Wall of Repetition', case4);
