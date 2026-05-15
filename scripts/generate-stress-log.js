/**
 * Ultimate Stress Test Payload - Structural Waste Simulation
 * Generates a massive log with repetitive patterns, progress bars, and multiple stack traces.
 */
const fs = require('fs');

const logLines = [];
logLines.push('Starting Global Build Process v2.0.0...');
logLines.push('2026-05-13 16:00:00 [INFO] Initializing subsystems...');

// Progress Bar Bloat
for (let i = 0; i <= 100; i += 5) {
  const hashes = '#'.repeat(i / 5);
  const dashes = '-'.repeat(20 - (i / 5));
  logLines.push(`[${hashes}${dashes}] ${i}% | Processing module ${i}...`);
}

// Repetitive Logs
for (let i = 1; i <= 50; i++) {
  logLines.push(`2026-05-13 16:01:${i.toString().padStart(2, '0')} [DEBUG] Heartbeat signal detected from node ${i}`);
}

// Multiple Stack Traces
const generateStack = (errorMsg) => {
  logLines.push(`Error: ${errorMsg}`);
  logLines.push('    at internal/main/run_main_module:17:47');
  logLines.push('    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)');
  logLines.push('    at Function.Module._load (node:internal/modules/loader:822:12)');
  logLines.push('    at Module.load (node:internal/modules/loader:981:32)');
  logLines.push('    at Object.Module._extensions..js (node:internal/modules/loader:1153:10)');
  logLines.push('    at Module._compile (node:internal/modules/cjs/loader:1101:14)');
  logLines.push('    at Object.<anonymous> (/app/core/logic.js:123:45)');
};

generateStack('Connection timeout at node 25');
generateStack('Database deadlock detected at transaction 999');
generateStack('Memory leak warning at buffer 0xDEADBEEF');

logLines.push('2026-05-13 16:10:00 [FATAL] Build failed due to multiple errors.');
logLines.push('Please check the logs and contact Dr.Kittimasak at support@tto.v2');

fs.writeFileSync('ultimate_stress_test.log', logLines.join('\n'));
console.log('Generated ultimate_stress_test.log with ' + logLines.length + ' lines.');
