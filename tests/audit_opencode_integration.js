
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const assert = require('node:assert/strict');

const configDir = path.join(os.homedir(), '.config', 'opencode');
const pluginPath = path.join(configDir, 'plugins', 'thai-token-optimizer.js');

console.log('--- OpenCode Integration Deep Audit ---');

if (!fs.existsSync(pluginPath)) {
    console.error('FAIL: OpenCode plugin not found at ' + pluginPath);
    process.exit(1);
}

// 1. Mock OpenCode environment and load the plugin
console.log('[1/4] Testing Plugin Structure...');
const pluginCode = fs.readFileSync(pluginPath, 'utf8');
assert.ok(pluginCode.includes('ThaiTokenOptimizer'), 'Plugin must export ThaiTokenOptimizer');
assert.ok(pluginCode.includes('tool.execute.before'), 'Plugin must handle tool.execute.before');
assert.ok(pluginCode.includes('experimental.session.compacting'), 'Plugin must handle session compacting');
console.log('OK: Plugin structure is valid.');

// 2. Test Safety Logic inside the plugin
console.log('[2/4] Auditing Plugin Safety Logic...');
// Extract isRisky function from the plugin source for testing
const isRiskyMatch = pluginCode.match(/function isRisky\(text\) \{([\s\S]*?)\}/);
if (!isRiskyMatch) {
    console.error('FAIL: Could not find isRisky function in plugin source');
    process.exit(1);
}

const isRiskyFn = new Function('text', `
    function textOf(v) { try { return typeof v === 'string' ? v : JSON.stringify(v); } catch { return String(v || ''); } }
    ${isRiskyMatch[0]}
    return isRisky(text);
`);

assert.strictEqual(isRiskyFn('rm -rf /'), true, 'Should detect rm -rf');
assert.strictEqual(isRiskyFn('DROP TABLE users'), true, 'Should detect DROP TABLE');
assert.strictEqual(isRiskyFn('ปกติครับ'), false, 'Should NOT detect normal Thai');
console.log('OK: Safety logic is robust.');

// 3. Environment Variable Leak Check
console.log('[3/4] Testing Environment Propagation...');
assert.ok(pluginCode.includes('THAI_TOKEN_OPTIMIZER = state.enabled === false ? \'0\' : \'1\''), 'Plugin must set THAI_TOKEN_OPTIMIZER dynamically');
assert.ok(pluginCode.includes('THAI_TOKEN_OPTIMIZER_LEVEL = state.level || \'auto\''), 'Plugin must set THAI_TOKEN_OPTIMIZER_LEVEL');
console.log('OK: Environment variables are configured.');

// 4. Agent and Skill Presence
console.log('[4/4] Verifying Agent/Skill Guidance...');
const agentPath = path.join(configDir, 'agents', 'thai-token-optimizer.md');
const skillPath = path.join(configDir, 'skills', 'thai-token-optimizer.md');
assert.ok(fs.existsSync(agentPath), 'Agent guidance missing');
assert.ok(fs.existsSync(skillPath), 'Skill guidance missing');
console.log('OK: Guidance files are present.');

console.log('\n[Status] OpenCode Integration Audit PASS');
