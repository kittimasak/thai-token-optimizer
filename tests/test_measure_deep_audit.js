const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function tmpDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'tto-measure-deep-'));
}

const TTO_HOME = tmpDir();
process.env.TTO_HOME = TTO_HOME;

const { 
    computeQualityEngine, 
    computeDistortionBounds, 
    beginTransaction,
    recoverTransactions,
    TRANSACTION_JOURNAL_PATH,
    maybeCaptureLifecycleCheckpoint
} = require('../hooks/tto-runtime-analytics');

test('Quality Engine: boundary conditions', () => {
    // Test with 100% risk everywhere
    const lifecycle = { cumulativePromptTokens: 1000000 };
    const contextWindowTokens = 100000; // 1000% fill
    const artifact = { 
        actionRouting: { gateOk: false },
        strictResult: { ok: false }
    };
    const cache = { totalReads: 100, uniqueFiles: 1, repeatedFiles: 99, decisionCounts: { hit_warn: 100 } };
    const decisions = Array(10).fill({ decision: 'contextignore_block' });

    const res = computeQualityEngine({ 
        lifecycle, 
        contextWindowTokens, 
        artifact, 
        cache, 
        decisions 
    });

    assert.equal(res.grade, 'F');
    assert.ok(res.score < 20);
    assert.ok(res.weakSignals.includes('context_fill_high'));
    assert.ok(res.distortion.fillRatio >= 100);
});

test('Quality Engine: zero data resilience', () => {
    const res = computeQualityEngine({
        lifecycle: { cumulativePromptTokens: 0 },
        contextWindowTokens: 0,
        cache: { totalReads: 0 },
        decisions: []
    });
    assert.ok(Number.isFinite(res.score));
    assert.equal(res.grade, 'S'); // Low risk if nothing happened
});

test('Distortion Bounds: zero window safety', () => {
    const res = computeDistortionBounds({ 
        lifecycle: { cumulativePromptTokens: 500 },
        contextWindowTokens: 0 
    });
    // With 500 tokens used and 0 window, fillRatio should be 100%
    assert.equal(res.fillRatio, 100);
    assert.ok(Number.isFinite(res.theoreticalCeiling));
});

test('Transaction Recovery: missing journal safety', () => {
    const res = recoverTransactions();
    assert.equal(res.recovered, false);
});

test('Lifecycle Checkpoints: multiple bands in one jump', () => {
    const res = maybeCaptureLifecycleCheckpoint({
        promptTokens: 400000, // Jumps to 100% immediately
        policy: { 
            contextWindowTokens: 400000,
            fillBands: [20, 50, 80]
        }
    });
    // Should trigger 3 fill-band checkpoints
    assert.equal(res.decisions.filter(d => d.type === 'fill-band').length, 3);
});

test('Trend Report: robustness against missing fields', () => {
    const { spawnSync } = require('node:child_process');
    const root = path.resolve(__dirname, '..');
    const script = path.join(root, 'scripts', 'benchmark-trend-report.js');
    const historyFile = path.join(root, 'benchmarks', 'regression_history.jsonl');
    
    // Backup original
    let backup = null;
    if (fs.existsSync(historyFile)) backup = fs.readFileSync(historyFile);
    
    try {
        fs.writeFileSync(historyFile, '{"generatedAt":"now"}\n{"some":"garbage"}\n');
        const res = spawnSync('node', [script], { encoding: 'utf8' });
        assert.equal(res.status, 0);
        assert.match(res.stdout, /Benchmark Trend Report/);
    } finally {
        if (backup) fs.writeFileSync(historyFile, backup);
        else fs.unlinkSync(historyFile);
    }
});
