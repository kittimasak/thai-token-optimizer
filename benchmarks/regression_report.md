# Thai Token Optimizer v2.0 Strict Regression Report
Generated: 2026-05-15T15:32:45.547Z
Samples: 8
Average estimated saving: 12%
Minimum preservation: 100%
Strict gate: PASS
| ID | Before | After | Saved | Preservation | Safety categories |
|---|---:|---:|---:|---:|---|
| constraint-version | 52 | 52 | 0% | 100% | - |
| code-command | 57 | 57 | 0% | 100% | - |
| db-safety | 39 | 36 | 7.7% | 100% | database_migration, production_deploy |
| research | 52 | 50 | 3.8% | 100% | - |
| thai-filler-debug | 77 | 57 | 26% | 100% | - |
| thai-filler-install | 68 | 57 | 16.2% | 100% | - |
| thai-filler-research | 67 | 53 | 20.9% | 100% | - |
| thai-filler-report | 62 | 49 | 21% | 100% | - |
## MTP / Speculative Comparison
Budget: 80 | Target: codex
Runs: 9 (warmup: 1, seed: 20260512)
Normal latency (mean/p50/p95/stddev): 1.2/1.2/1.6/0.1 ms
Spec latency   (mean/p50/p95/stddev): 30.2/15.3/71.2/20.4 ms
Slowdown mean (spec-normal): 29 ms
Spec hit rate: 87.5%
Enhanced gain on corpus_long_repetitive_mixed_tech_v1: 12233.3% (required >= 12%)
MTP gate: PASS
## Drift Monitor (repeated-run stability)
Normal saved   (mean/p50/p95/stddev): 9/9/9/0
Spec saved     (mean/p50/p95/stddev): 8.4/8.4/8.4/0
Slowdown (ms)  (mean/p50/p95/stddev): 28.9/13.7/69.9/20.4
| Mode | Avg Saved | Avg After | Avg Preserve | Over Budget | Spec Mode Hits |
|---|---:|---:|---:|---:|---:|
| normal | 9 | 51.6 | 93.8% | 0 | 0 |
| speculative | 8.4 | 52.3 | 100% | 0 | 7 |
| ID | Mode | Saved | After | Preserve | Over Budget |
|---|---|---:|---:|---:|---|
| constraint-version | spec:lite | 0 | 53 | 100% | no |
| code-command | spec:lite | 0 | 58 | 100% | no |
| db-safety | normal | 2 | 38 | 100% | no |
| research | spec:lite | 0 | 54 | 100% | no |
| thai-filler-debug | spec:ultra | 24 | 55 | 100% | no |
| thai-filler-install | spec:ultra | 14 | 56 | 100% | no |
| thai-filler-research | spec:auto | 14 | 54 | 100% | no |
| thai-filler-report | spec:lite | 13 | 50 | 100% | no |
## Enhanced Corpus Gate (long repetitive narrative + mixed technical blocks)
Corpus: benchmarks/corpus_long_repetitive_mixed_tech_v1.jsonl
Samples: 4 | Budget: 120 | Target: codex
Baseline avg saved: 0.3
Enhanced avg saved: 37
Gain: 12233.3% (required >= 12%)
Preservation parity: PASS
Enhanced corpus gate: PASS
| ID | Baseline Saved | Enhanced Saved | Baseline Preserve | Enhanced Preserve |
|---|---:|---:|---:|---:|
| v1-long-narrative-devops | 0 | 76 | 100% | 100% |
| v1-mixed-technical-blocks | 1 | 1 | 100% | 100% |
| v1-long-repetitive-research | 0 | 0 | 100% | 100% |
| v1-incident-response-mixed | 0 | 71 | 100% | 100% |
## Overfit Guard Corpus (non-gating monitor)
Corpus: benchmarks/corpus_overfit_guard_v1.jsonl
Samples: 3
Baseline avg saved: 0.3
Enhanced avg saved: 1.3
Gain: 333.3% (required >= 0%)
Preservation parity: PASS
Fixture corpus guard: PASS
Action routing gate: PASS
| ID | Baseline Saved | Enhanced Saved | Baseline Preserve | Enhanced Preserve |
|---|---:|---:|---:|---:|
| guard-short-technical | 0 | 3 | 100% | 100% |
| guard-mixed-narrative | 0 | 0 | 100% | 100% |
| guard-safety-critical | 1 | 1 | 100% | 100% |
## Waste Detector Signals
No significant waste signals detected.
## Detector Action Suggestions
No action suggestions.
## Notes
- Version remains Thai Token Optimizer v2.0 / package 2.0.0.
- Exact tokenizer is optional; if unavailable the estimator falls back to heuristic mode.
- Strict mode checks saving, preservation, constraints, and code block safety.
