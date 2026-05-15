const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'thai-token-optimizer.js');

function runTto(args, env) {
    return execFileSync(process.execPath, [BIN, ...args], {
        env: { ...process.env, ...env },
        encoding: 'utf8'
    });
}

function tmpHome() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'tto-hermes-deep-'));
}

test('Hermes: Full Lifecycle (Install -> Use -> Uninstall)', () => {
    const base = tmpHome();
    const hermesHome = path.join(base, '.hermes');
    const ttoHome = path.join(base, '.tto');
    const env = { 
        HERMES_HOME: hermesHome,
        TTO_HOME: ttoHome,
        PATH: process.env.PATH
    };

    // 1. Install
    runTto(['install', 'hermes'], env);
    
    const pluginDir = path.join(hermesHome, 'plugins', 'thai-token-optimizer');
    assert.ok(fs.existsSync(path.join(pluginDir, '__init__.py')));
    
    const shellDir = path.join(hermesHome, 'agent-hooks');
    assert.ok(fs.existsSync(path.join(shellDir, 'thai-token-optimizer-pre_llm_call.cjs')));

    // 2. Simulate Shell Hook: Normal
    const preLlm = path.join(shellDir, 'thai-token-optimizer-pre_llm_call.cjs');
    const normalOut = execFileSync(process.execPath, [preLlm], {
        input: JSON.stringify({ hook_event_name: 'pre_llm_call', extra: { user_message: 'hello' } }),
        env,
        encoding: 'utf8'
    });
    const normalRes = JSON.parse(normalOut);
    assert.ok(normalRes.context);
    assert.match(normalRes.context, /Hermes shell hook active/);

    // 3. Simulate Shell Hook: Risky
    const preTool = path.join(shellDir, 'thai-token-optimizer-pre_tool_call.cjs');
    const riskyCases = [
        'rm -rf /tmp/cache',
        'DROP TABLE users',
        'git push --force origin main',
        'rm -rf /production'
    ];
    for (const command of riskyCases) {
        const riskyOut = execFileSync(process.execPath, [preTool], {
            input: JSON.stringify({ hook_event_name: 'pre_tool_call', tool_name: 'terminal', tool_input: { command } }),
            env,
            encoding: 'utf8'
        });
        const riskyRes = JSON.parse(riskyOut);
        assert.equal(riskyRes.action, 'block', command);
        assert.match(riskyRes.message, /risky Hermes tool call/);
    }

    // 4. Interaction with TTO State
    // Test: Disabled state
    fs.writeFileSync(path.join(ttoHome, 'state.json'), JSON.stringify({ enabled: false }));
    const disabledOut = execFileSync(process.execPath, [preLlm], {
        input: JSON.stringify({ hook_event_name: 'pre_llm_call' }),
        env,
        encoding: 'utf8'
    });
    const disabledRes = JSON.parse(disabledOut);
    assert.match(disabledRes.context, /DISABLED/);
    assert.doesNotMatch(disabledRes.context, /Hermes shell hook active/);

    // Test: Full mode
    fs.writeFileSync(path.join(ttoHome, 'state.json'), JSON.stringify({ enabled: true, level: 'full' }));
    const fullOut = execFileSync(process.execPath, [preLlm], {
        input: JSON.stringify({ hook_event_name: 'pre_llm_call' }),
        env,
        encoding: 'utf8'
    });
    const fullRes = JSON.parse(fullOut);
    assert.match(fullRes.context, /\[full\]/);

    // 5. Uninstall
    runTto(['uninstall', 'hermes'], env);
    assert.ok(!fs.existsSync(pluginDir));
    assert.ok(!fs.existsSync(preLlm));
});

test('Hermes: Config preservation', () => {
    const base = tmpHome();
    const hermesHome = path.join(base, '.hermes');
    fs.mkdirSync(hermesHome, { recursive: true });
    
    const initialConfig = "other_config: true\n";
    fs.writeFileSync(path.join(hermesHome, 'config.yaml'), initialConfig);

    const env = { HERMES_HOME: hermesHome, TTO_HOME: path.join(base, '.tto') };
    runTto(['install', 'hermes'], env);

    const config = fs.readFileSync(path.join(hermesHome, 'config.yaml'), 'utf8');
    assert.match(config, /other_config: true/, 'Should preserve existing config');
    assert.match(config, /# Thai Token Optimizer START/, 'Should add TTO block');
});

test('Hermes: Python plugin detects exact risky commands when python3 is available', () => {
    const python = spawnSync('python3', ['--version'], { encoding: 'utf8' });
    if (python.status !== 0) return;

    const base = tmpHome();
    const hermesHome = path.join(base, '.hermes');
    const ttoHome = path.join(base, '.tto');
    const env = { HERMES_HOME: hermesHome, TTO_HOME: ttoHome };
    runTto(['install', 'hermes'], env);

    const plugin = path.join(hermesHome, 'plugins', 'thai-token-optimizer', '__init__.py');
    const script = `
import importlib.util
plugin = ${JSON.stringify(plugin)}
spec = importlib.util.spec_from_file_location("tto_hermes_plugin", plugin)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
for command in ["rm -rf /tmp/cache", "DROP TABLE users", "git push --force origin main"]:
    res = mod._pre_tool_call(tool_name="terminal", args={"command": command})
    assert res and res.get("action") == "block", command
assert mod._pre_tool_call(tool_name="terminal", args={"command": "list files"}) is None
`;
    const result = spawnSync('python3', ['-c', script], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stdout + result.stderr);
});
