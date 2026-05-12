#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const TEST_DIR = path.join(ROOT, 'tests');
const TIMEOUT_MS = 5 * 60 * 1000;

const files = fs.readdirSync(TEST_DIR)
  .filter((name) => /^test_.*\.js$/.test(name))
  .sort()
  .map((name) => path.join(TEST_DIR, name));

for (const file of files) {
  const rel = path.relative(ROOT, file);
  console.log(`==> ${rel}`);
  const run = spawnSync(process.execPath, ['--test', '--test-concurrency=1', file], {
    cwd: ROOT,
    stdio: 'inherit',
    timeout: TIMEOUT_MS
  });

  if (run.error && run.error.code === 'ETIMEDOUT') {
    console.error(`Timed out: ${rel} after ${TIMEOUT_MS}ms`);
    process.exit(124);
  }
  if (run.status !== 0) {
    process.exit(run.status || 1);
  }
}

