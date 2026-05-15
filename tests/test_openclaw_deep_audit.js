const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'thai-token-optimizer.js');

function runTto(args, env) {
    return execFileSync(process.execPath, [BIN, ...args], {
        env: { ...process.env, ...env },
        encoding: 'utf8'
    });
}

function tmpHome() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'tto-openclaw-deep-'));
}

test('OpenClaw: Full Lifecycle (Install -> Use -> Uninstall)', () => {
    const base = tmpHome();
    const openclawHome = path.join(base, '.openclaw');
    const ttoHome = path.join(base, '.tto');
    const env = { 
        OPENCLAW_HOME: openclawHome,
        TTO_HOME: ttoHome,
        PATH: process.env.PATH // Explicitly preserve PATH
    };

    // 1. Install
    runTto(['install', 'openclaw'], env);
    
    const hookDir = path.join(openclawHome, 'hooks', 'thai-token-optimizer');
    assert.ok(fs.existsSync(path.join(hookDir, 'handler.ts')));
    assert.ok(fs.existsSync(path.join(hookDir, 'simulate.cjs')));
    
    const config = JSON.parse(fs.readFileSync(path.join(openclawHome, 'openclaw.json'), 'utf8'));
    assert.ok(config.hooks.internal.entries['thai-token-optimizer']);
    assert.equal(config.hooks.internal.entries['thai-token-optimizer'].enabled, true);

    // 2. Simulate Normal Event
    const simulator = path.join(hookDir, 'simulate.cjs');
    const normalOut = execFileSync(process.execPath, [simulator], {
        input: JSON.stringify({ type: 'agent', action: 'bootstrap', name: 'coder' }),
        env,
        encoding: 'utf8'
    });
    const normalRes = JSON.parse(normalOut);
    assert.equal(normalRes.service, 'thai-token-optimizer');
    assert.match(normalRes.safety, /compact Thai mode recommended/);

    // 3. Simulate Risky Event
    const riskyOut = execFileSync(process.execPath, [simulator], {
        input: JSON.stringify({ type: 'command', action: 'new', text: 'rm -rf /production/data' }),
        env,
        encoding: 'utf8'
    });
    const riskyRes = JSON.parse(riskyOut);
    assert.match(riskyRes.safety, /safe mode required/);
    assert.match(riskyRes.safety, /backup/);

    // 4. Interaction with TTO State
    // Test: Disabled state
    fs.writeFileSync(path.join(ttoHome, 'state.json'), JSON.stringify({ enabled: false }));
    const disabledOut = execFileSync(process.execPath, [simulator], {
        input: JSON.stringify({ type: 'agent', action: 'bootstrap' }),
        env,
        encoding: 'utf8'
    });
    const disabledRes = JSON.parse(disabledOut);
    assert.equal(disabledRes.enabled, false);
    assert.match(disabledRes.instruction, /DISABLED/);

    // Test: Lite mode
    fs.writeFileSync(path.join(ttoHome, 'state.json'), JSON.stringify({ enabled: true, level: 'lite' }));
    const liteOut = execFileSync(process.execPath, [simulator], {
        input: JSON.stringify({ type: 'agent', action: 'bootstrap' }),
        env,
        encoding: 'utf8'
    });
    const liteRes = JSON.parse(liteOut);
    assert.equal(liteRes.enabled, true);
    assert.equal(liteRes.level, 'lite');
    assert.match(liteRes.instruction, /\[lite\]/);

    // 5. Uninstall
    runTto(['uninstall', 'openclaw'], env);
    assert.ok(!fs.existsSync(path.join(hookDir, 'handler.ts')));
    
    const configPost = JSON.parse(fs.readFileSync(path.join(openclawHome, 'openclaw.json'), 'utf8'));
    assert.ok(!configPost.hooks.internal.entries['thai-token-optimizer']);
});

test('OpenClaw: Config robustness', () => {
    const base = tmpHome();
    const openclawHome = path.join(base, '.openclaw');
    fs.mkdirSync(openclawHome, { recursive: true });
    
    // Create an existing config with some data
    const initialConfig = {
        version: '2.0.0',
        hooks: { internal: { entries: { 'other-hook': { enabled: true } } } }
    };
    fs.writeFileSync(path.join(openclawHome, 'openclaw.json'), JSON.stringify(initialConfig));

    const env = { OPENCLAW_HOME: openclawHome, TTO_HOME: path.join(base, '.tto') };
    runTto(['install', 'openclaw'], env);

    const config = JSON.parse(fs.readFileSync(path.join(openclawHome, 'openclaw.json'), 'utf8'));
    assert.ok(config.hooks.internal.entries['other-hook'], 'Should preserve existing hooks');
    assert.ok(config.hooks.internal.entries['thai-token-optimizer'], 'Should add TTO hook');
});

test('OpenClaw: Risky patterns coverage', () => {
    // Test the isRisky regex in the simulator logic
    const base = tmpHome();
    const openclawHome = path.join(base, '.openclaw');
    runTto(['install', 'openclaw'], { OPENCLAW_HOME: openclawHome, TTO_HOME: path.join(base, '.tto') });
    
    const simulator = path.join(openclawHome, 'hooks', 'thai-token-optimizer', 'simulate.cjs');
    
    const testCases = [
        { text: 'rm -rf /tmp/cache', risky: true },
        { text: 'DROP TABLE users', risky: true },
        { text: 'git push --force origin main', risky: true },
        { text: 'ลบไฟล์ทั้งหมด', risky: true },
        { text: 'ขึ้นระบบจริง', risky: true },
        { text: 'ดรอปเทเบิ้ล', risky: true },
        { text: 'ปกติครับ', risky: false }
    ];

    for (const tc of testCases) {
        const out = execFileSync('node', [simulator], {
            input: JSON.stringify({ text: tc.text }),
            encoding: 'utf8'
        });
        const res = JSON.parse(out);
        if (tc.risky) {
            assert.match(res.safety, /safe mode required/, `Should be risky: ${tc.text}`);
        } else {
            assert.match(res.safety, /compact Thai mode recommended/, `Should not be risky: ${tc.text}`);
        }
    }
});
