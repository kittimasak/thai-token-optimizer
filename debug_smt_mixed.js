const { compressToBudget } = require('./hooks/tto-budget-compressor');

const input = [
    "กำลังเริ่มรันคำสั่ง npm test...",
    "Test Case #0: PASS",
    "Test Case #1: PASS",
    "Test Case #2: PASS",
    "Test Case #3: PASS",
    "Test Case #4: PASS",
    "Test Case #5: PASS",
    "Test Case #6: PASS",
    "Test Case #7: PASS",
    "Test Case #8: PASS",
    "Test Case #9: PASS",
    "Test Case #10: PASS",
    "Test Case #11: PASS",
    "Test Case #12: PASS",
    "Test Case #13: PASS",
    "Test Case #14: PASS",
    "Test Case #15: PASS",
    "Test Case #16: PASS",
    "Test Case #17: PASS",
    "Test Case #18: PASS",
    "Test Case #19: PASS",
    "รันเสร็จแล้วครับ ต่อไปให้รัน git push origin production",
    "[WARNING] ห้ามรัน rm -rf / ในระบบจริงเด็ดขาด"
].join('\n');

const res = compressToBudget(input, { budget: 100, level: 'full' });
console.log("--- OUTPUT ---");
console.log(res.optimized);
console.log("--- END ---");
