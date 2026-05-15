const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const TRACKER = path.join(ROOT, 'hooks', 'tto-mode-tracker.js');

function tmpDir() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tto-autocomp-'));
    return dir;
}

function runTracker(input, env = {}) {
    return spawnSync('node', [TRACKER], {
        input: JSON.stringify(input),
        env: { ...process.env, ...env },
        encoding: 'utf8'
    });
}

function readStats(ttoHome) {
    const statsPath = path.join(ttoHome, 'stats.jsonl');
    if (!fs.existsSync(statsPath)) return [];
    return fs.readFileSync(statsPath, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line));
}

test('feature: /tto nointeractive trigger', () => {
    const home = tmpDir();
    const env = { TTO_HOME: home };
    
    // Initial state check
    const statePath = path.join(home, 'state.json');
    
    // Run command to enable zero friction
    runTracker({ prompt: '/tto nointeractive' }, env);
    
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    assert.equal(state.autoCompressInput, true);
    
    // Run command to disable zero friction
    runTracker({ prompt: '/tto interactive' }, env);
    const state2 = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    assert.equal(state2.autoCompressInput, false);
});

test('logic: auto-compression when enabled', () => {
    const home = tmpDir();
    const env = { TTO_HOME: home };
    
    // 1. Enable TTO and Auto-Compression
    fs.writeFileSync(path.join(home, 'state.json'), JSON.stringify({
        enabled: true,
        level: 'full',
        autoCompressInput: true
    }));
    
    // 2. Send a large prompt (>= 300 tokens approx)
    // "ช่วย" is ~2 chars per token heuristic, so 600 chars of Thai should trigger it.
    const largePrompt = 'รบกวนช่วยสรุปรายละเอียดข้อมูลทั้งหมดนี้ให้หน่อยครับ '.repeat(50);
    runTracker({ prompt: largePrompt }, env);
    
    const stats = readStats(home);
    const lastEvent = stats.find(s => s.event === 'UserPromptSubmit');
    assert.ok(lastEvent);
    
    // Since auto-compression is ON, the token count in stats should be the COMPRESSED count.
    // Original prompt is ~400-500 tokens. Compressed should be significantly less.
    assert.ok(lastEvent.estimatedPromptTokens < 300, `Expected tokens < 300, got ${lastEvent.estimatedPromptTokens}`);
});

test('logic: skip auto-compression when disabled (non-TTY rejection)', () => {
    const home = tmpDir();
    const env = { TTO_HOME: home, TTO_NON_INTERACTIVE: 'true' };
    
    // 1. Enable TTO but Disable Auto-Compression
    fs.writeFileSync(path.join(home, 'state.json'), JSON.stringify({
        enabled: true,
        level: 'full',
        autoCompressInput: false
    }));
    
    // 2. Send the same large prompt
    const largePrompt = 'รบกวนช่วยสรุปรายละเอียดข้อมูลทั้งหมดนี้ให้หน่อยครับ '.repeat(50);
    runTracker({ prompt: largePrompt }, env);
    
    const stats = readStats(home);
    const lastEvent = stats.find(s => s.event === 'UserPromptSubmit');
    assert.ok(lastEvent);
    
    // Since auto-compression is OFF and we are non-interactive, it should REJECT compression
    // and use the ORIGINAL token count.
    assert.ok(lastEvent.estimatedPromptTokens >= 300, `Expected tokens >= 300, got ${lastEvent.estimatedPromptTokens}`);
});

test('boundary: small prompt should not trigger auto-compression', () => {
    const home = tmpDir();
    const env = { TTO_HOME: home };
    
    fs.writeFileSync(path.join(home, 'state.json'), JSON.stringify({
        enabled: true,
        level: 'full',
        autoCompressInput: true
    }));
    
    const smallPrompt = 'สวัสดีครับ สั้นๆ';
    runTracker({ prompt: smallPrompt }, env);
    
    const stats = readStats(home);
    const lastEvent = stats.find(s => s.event === 'UserPromptSubmit');
    assert.ok(lastEvent);
    assert.ok(lastEvent.estimatedPromptTokens < 50);
});

test('safety: auto-compression should respect safety mode escalation', () => {
    const home = tmpDir();
    const env = { TTO_HOME: home };
    
    fs.writeFileSync(path.join(home, 'state.json'), JSON.stringify({
        enabled: true,
        level: 'auto',
        autoCompressInput: true,
        safetyMode: 'strict'
    }));
    
    // Safety critical prompt: "DROP TABLE"
    const largeSafetyPrompt = 'ช่วยเขียนโค้ดสำหรับ DROP TABLE ใน production ให้หน่อยครับ โดยอธิบายให้ละเอียด ' + 'A'.repeat(500);
    runTracker({ prompt: largeSafetyPrompt }, env);
    
    const stats = readStats(home);
    const lastEvent = stats.find(s => s.event === 'UserPromptSubmit');
    assert.ok(lastEvent);
    // effectiveLevel should be 'safe' because it's safety critical
    assert.equal(lastEvent.effectiveLevel, 'safe');
});
