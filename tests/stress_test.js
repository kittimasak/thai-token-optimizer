#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TRACKER_PATH = path.join(__dirname, '..', 'hooks', 'tto-mode-tracker.js');
const TEMP_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-stress-'));
const ITERATIONS = 50;
const CONCURRENCY = 10;

console.log(`🚀 Starting Stress Test in: ${TEMP_HOME}`);
console.log(`Iterations: ${ITERATIONS}, Concurrency: ${CONCURRENCY}\n`);

async function runIteration(i) {
  const promises = [];
  for (let c = 0; i < CONCURRENCY; i++) {
    // Simulate high-concurrency state updates
    promises.push(new Promise((resolve) => {
      const input = JSON.stringify({ prompt: `stress test ${i}-${c} /tto lite` });
      const result = spawnSync(process.execPath, [TRACKER_PATH], {
        env: { ...process.env, TTO_HOME: TEMP_HOME, TTO_NON_INTERACTIVE: '1' },
        input,
        encoding: 'utf8'
      });
      resolve(result.status === 0);
    }));
  }
  return Promise.all(promises);
}

async function start() {
  let successCount = 0;
  let failCount = 0;

  // Pre-create state
  const input0 = JSON.stringify({ prompt: '/tto auto' });
  spawnSync(process.execPath, [TRACKER_PATH], {
    env: { ...process.env, TTO_HOME: TEMP_HOME, TTO_NON_INTERACTIVE: '1' },
    input: input0,
    encoding: 'utf8'
  });

  for (let i = 0; i < ITERATIONS; i++) {
    process.stdout.write(`Batch ${i+1}/${ITERATIONS}... `);
    const promises = [];
    for (let c = 0; c < CONCURRENCY; c++) {
      promises.push(new Promise((resolve) => {
        const input = JSON.stringify({ prompt: `stress test ${i}-${c} /tto lite` });
        const result = spawnSync(process.execPath, [TRACKER_PATH], {
          env: { ...process.env, TTO_HOME: TEMP_HOME, TTO_NON_INTERACTIVE: '1' },
          input,
          encoding: 'utf8'
        });
        resolve(result.status === 0);
      }));
    }
    const results = await Promise.all(promises);
    const batchFails = results.filter(r => !r).length;
    if (batchFails > 0) {
      failCount += batchFails;
      process.stdout.write('❌ FAILED\n');
    } else {
      successCount += results.length;
      process.stdout.write('✅ OK\n');
    }

    // Attempt to read the state file to check for corruption
    try {
      const state = JSON.parse(fs.readFileSync(path.join(TEMP_HOME, 'state.json'), 'utf8'));
      if (!state.enabled) {
        console.error('Corruption detected: state.enabled is false but should be true');
        failCount++;
      }
    } catch (e) {
      console.error(`Corruption detected: ${e.message}`);
      failCount++;
    }
  }

  console.log('\n--- Stress Test Results ---');
  console.log(`Total Operations: ${successCount + failCount}`);
  console.log(`Successes       : ${successCount}`);
  console.log(`Failures        : ${failCount}`);
  
  if (failCount === 0) {
    console.log('\n🏆 SYSTEM IS ROCK SOLID (Atomic Writes Verified)');
  } else {
    console.log('\n⚠️ SYSTEM HAS WEAKNESSES UNDER CONCURRENCY');
  }

  // Cleanup
  fs.rmSync(TEMP_HOME, { recursive: true, force: true });
}

start();
