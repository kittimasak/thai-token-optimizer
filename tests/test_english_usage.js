/**
 * ============================================================================
 * Thai Token Optimizer v2.0 - English Usage Regression Tests
 * ============================================================================
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { compressPrompt } = require('../hooks/tto-compressor');
const { compressToBudget } = require('../hooks/tto-budget-compressor');
const { extractSemanticBlocks } = require('../hooks/tto-constraint-locker');
const { checkPreservation } = require('../hooks/tto-preservation-checker');

test('English constraints preserve file names, commands, env keys, and paths as one semantic block', () => {
  const input = 'You must keep API_URL exactly. Do not rename README_EN.md. Never change `npm test`. Preserve /tmp/demo.log.';
  const runs = Array.from({ length: 8 }, () => extractSemanticBlocks(input));
  for (const blocks of runs) {
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].isHard, true);
    assert.match(blocks[0].raw, /README_EN\.md/);
    assert.match(blocks[0].raw, /\/tmp\/demo\.log/);
    assert.ok(blocks[0].targets.includes('API_URL'));
    assert.ok(blocks[0].targets.includes('README_EN.md'));
    assert.ok(blocks[0].targets.includes('demo.log'));
  }
});

test('English inline code keeps spacing after compression', () => {
  const out = compressPrompt('Run `node app.js --port 3000` after fixing.', { level: 'lite' });
  assert.equal(out, 'Run `node app.js --port 3000` after fixing.');
});

test('English log and stack trace keep line structure and command preservation under budget pressure', () => {
  const input = [
    'Please summarize this log but preserve exact errors:',
    "2026-05-14T10:15:22Z ERROR Cannot find module './config.js'",
    '    at loadConfig (/app/src/config.js:42:11)',
    '    at main (/app/src/index.js:10:3)',
    'Run `node app.js --port 3000` after fixing.'
  ].join('\n');
  const result = compressToBudget(input, { budget: 80, target: 'codex' });
  assert.match(result.optimized, /Cannot find module '\.\/config\.js'/);
  assert.match(result.optimized, /at loadConfig \(\/app\/src\/config\.js:42:11\)/);
  assert.match(result.optimized, /at main \(\/app\/src\/index\.js:10:3\)/);
  assert.match(result.optimized, /Run `node app\.js --port 3000` after fixing\./);
  assert.doesNotMatch(result.optimized, /Run`node app\.js --port 3000`after/);
  assert.doesNotMatch(result.optimized, /รายการเทคนิคคงเดิม:[\s\S]*`node app\.js --port 3000`/);
  const preservation = checkPreservation(input, result.optimized);
  assert.equal(preservation.preservationPercent, 100);
  assert.equal(preservation.risk, 'low');
});

test('Plain English prose is not misclassified as a technical constraint', () => {
  const input = 'Please summarize this paragraph and preserve the overall tone, but make it shorter.';
  const blocks = extractSemanticBlocks(input);
  assert.equal(blocks.length, 0);
});

test('deterministic English fuzz keeps technical items across compression families', () => {
  const envKeys = ['API_URL', 'DATABASE_URL', 'TTO_HOME', 'CODEX_HOME'];
  const files = ['README_EN.md', 'package.json', 'config.toml', 'server.js'];
  const paths = ['/tmp/demo.log', '~/.codex/config.toml', './src/index.js', '/app/src/config.js'];
  const commands = ['`npm test`', '`node app.js --port 3000`', '`tto doctor --pretty`', '`git status --short`'];

  let count = 0;
  for (const envKey of envKeys) {
    for (const file of files) {
      for (const command of commands) {
        const path = paths[count % paths.length];
        const input = `Please keep ${envKey} exactly. Do not rename ${file}. Preserve ${path}. Run ${command} after fixing.`;
        const plain = compressPrompt(input, { level: count % 2 ? 'lite' : 'full' });
        const budgeted = compressToBudget(input, { budget: 70, target: 'codex', speculative: count % 3 === 0 });
        for (const out of [plain, budgeted.optimized]) {
          assert.match(out, new RegExp(envKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
          assert.match(out, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
          assert.match(out, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
          assert.match(out, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
          assert.equal(checkPreservation(input, out).preservationPercent, 100);
        }
        count++;
      }
    }
  }
  assert.equal(count, 64);
});

test('English markdown tables keep pipe structure under speculative budget compression', () => {
  const input = [
    '| File | Command | Status |',
    '|---|---|---|',
    '| README_EN.md | `npm test` | PASS |',
    '| package.json | `npm run ci` | PASS |'
  ].join('\n');
  const result = compressToBudget(input, { budget: 60, target: 'codex', speculative: true });
  assert.equal(result.optimized, input);
  assert.equal(checkPreservation(input, result.optimized).preservationPercent, 100);
});

test('English JSON and YAML config indentation survives speculative compression', () => {
  const json = [
    '{',
    '  "API_URL": "https://api.example.com/v1",',
    '  "codex_hooks": true,',
    '  "version": "2.0.0"',
    '}'
  ].join('\n');
  const yaml = [
    'env:',
    '  NODE_ENV: production',
    '  DATABASE_URL: postgres://user:pass@localhost:5432/app',
    'command: `npm run test:ci`'
  ].join('\n');
  const jsonOut = compressToBudget(json, { budget: 60, target: 'codex', speculative: true }).optimized;
  const yamlOut = compressToBudget(yaml, { budget: 60, target: 'codex', speculative: true }).optimized;
  assert.match(jsonOut, /^  "API_URL"/m);
  assert.match(jsonOut, /^  "codex_hooks"/m);
  assert.match(yamlOut, /^  NODE_ENV/m);
  assert.match(yamlOut, /^  DATABASE_URL/m);
  assert.doesNotMatch(yamlOut, /รายการเทคนิคคงเดิม/);
});

test('English Windows paths and error lines are preserved in place', () => {
  const win = 'Please preserve C:\\Users\\dev\\AppData\\Local\\tto\\config.json and run `npm test` after fixing ERROR EADDRINUSE: address already in use :::3000.';
  const stack = [
    'TypeError: Cannot read properties of undefined (reading status)',
    '    at handleResponse (/app/src/client.js:88:17)',
    '    at async main (/app/src/index.js:12:5)',
    'Run `node src/index.js`.'
  ].join('\n');
  const winOut = compressToBudget(win, { budget: 60, target: 'codex', speculative: true }).optimized;
  const stackOut = compressToBudget(stack, { budget: 60, target: 'codex', speculative: true }).optimized;
  assert.match(winOut, /C:\\Users\\dev\\AppData\\Local\\tto\\config\.json/);
  assert.doesNotMatch(winOut, /config\.json and run and run/);
  assert.ok(stackOut.startsWith('TypeError: Cannot read properties of undefined'));
  assert.match(stackOut, /^    at handleResponse/m);
  assert.doesNotMatch(stackOut, /รายการเทคนิคคงเดิม:[\s\S]*TypeError/);
});
