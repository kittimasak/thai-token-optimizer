const test = require('node:test');
const assert = require('node:assert/strict');
const { 
    detectFleetWaste, 
    detectToolCascade, 
    estimateRunCostUsd 
} = require('../hooks/tto-fleet-detectors');
const {
    detectOutputWasteSignal,
    detectToolCascadeSignal,
    detectBadDecompositionSignal
} = require('../benchmarks/run_benchmark');
const { classifyText } = require('../hooks/tto-safety-classifier');

test('detectToolCascade: various streak lengths', () => {
    const run = (tools) => detectToolCascade({ tools: tools.map(n => ({ name: n })) });

    // Streak of 2: should be null
    assert.equal(run(['ls', 'ls']), null);

    // Streak of 3: medium severity
    const res3 = run(['ls', 'ls', 'ls']);
    assert.ok(res3);
    assert.equal(res3.count, 3);
    assert.equal(res3.severity, 'medium');

    // Streak of 6: high severity
    const res6 = run(['ls', 'ls', 'ls', 'ls', 'ls', 'ls']);
    assert.ok(res6);
    assert.equal(res6.count, 6);
    assert.equal(res6.severity, 'high');
});

test('detectFleetWaste: overlap and priority', () => {
    // A run that is both "empty" and "abandoned"
    // empty: input > 5000, output < 100, messages <= 4
    // abandoned: messages <= 2, input > 3000, output < 200
    const run = {
        adapter: 'claude',
        inputTokens: 6000,
        outputTokens: 50,
        messages: 2,
        tools: []
    };

    const audit = detectFleetWaste([run]);
    // It should pick the best finding (deduplicated)
    assert.equal(audit.findings.length, 1);
    // empty_runs has confidence 0.85, abandoned_runs has 0.7.
    // So empty_runs should win.
    assert.equal(audit.findings[0].id, 'empty_runs');
});

test('detectOutputWasteSignal: boundary conditions', () => {
    // Threshold: beforeTokens >= 60 && saving <= 5
    const rows = [
        { before: { estimatedTokens: 60 }, savingPercent: 5 },
        { before: { estimatedTokens: 100 }, savingPercent: 4 },
        { before: { estimatedTokens: 61 }, savingPercent: 0 }
    ];
    const signal = detectOutputWasteSignal(rows);
    assert.ok(signal);
    assert.equal(signal.count, 3);

    // 2 samples: should be null
    assert.equal(detectOutputWasteSignal(rows.slice(0, 2)), null);
});

test('detectBadDecompositionSignal: monolithic prompts', () => {
    // Threshold: chars >= 90 && saving <= 5 && !safetyHeavy && !technicalDense
    const rows = [
        { before: { chars: 90 }, savingPercent: 5, original: 'A'.repeat(90) },
        { before: { chars: 100 }, savingPercent: 0, original: 'B'.repeat(100) }
    ];
    const signal = detectBadDecompositionSignal(rows);
    assert.ok(signal);
    assert.equal(signal.count, 2);

    // Technical dense should be ignored
    const techRows = [
        { before: { chars: 200 }, savingPercent: 1, original: 'Update config path /etc/config.json' },
        { before: { chars: 200 }, savingPercent: 1, original: '`rm -rf /`' }
    ];
    assert.equal(detectBadDecompositionSignal(techRows), null);
});

test('classifyText: whitelist and severity escalation', () => {
    // "git push --force" is a high severity match (destructive_command)
    const res1 = classifyText('git push --force');
    assert.ok(res1.categories.includes('destructive_command'));
    assert.equal(res1.safeCritical, true);

    // "ls" is whitelisted. 
    // "payment" is medium severity (auth_payment).
    // If text is "ls payment", the medium severity match should be skipped.
    const res2 = classifyText('ls payment');
    assert.ok(!res2.categories.includes('auth_payment'));

    // But "rm -rf /" is high severity, so it should NOT be skipped even if whitelisted (though it's not in WHITELIST_RE)
    // Let's test a whitelisted command that also matches a high severity category.
    // "git reset --hard" is in WHITELIST_RE and also matches destructive_command (high)
    const res3 = classifyText('git reset --hard');
    assert.ok(res3.categories.includes('destructive_command'));
    assert.equal(res3.safeCritical, true);
});

test('detectFleetWaste: cost estimation logic', () => {
    const run = {
        adapter: 'claude', // input: 0.003, output: 0.015
        inputTokens: 1000000, // 1000k * 0.003 = 3 USD
        outputTokens: 1000000, // 1000k * 0.015 = 15 USD
        messages: 20,
        tools: []
    };
    const cost = estimateRunCostUsd(run);
    assert.equal(cost, 18);
});

test('robustness: detectors with null/undefined/missing fields', () => {
    const emptyRun = {};
    const detectors = [detectToolCascade];
    for (const d of detectors) {
        assert.doesNotThrow(() => d(emptyRun));
    }
    
    assert.doesNotThrow(() => detectFleetWaste([null, undefined, {}]));
});
