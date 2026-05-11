# Thai Token Optimizer v1.0 Strict Regression Report
Generated: 2026-05-11T12:59:08.762Z
Samples: 8
Average estimated saving: 10.8%
Minimum preservation: 100%
Strict gate: PASS
| ID | Before | After | Saved | Preservation | Safety categories |
|---|---:|---:|---:|---:|---|
| constraint-version | 46 | 46 | 0% | 100% | - |
| code-command | 41 | 41 | 0% | 100% | - |
| db-safety | 32 | 32 | 0% | 100% | database_migration, production_deploy |
| research | 41 | 39 | 4.9% | 100% | - |
| thai-filler-debug | 76 | 53 | 30.3% | 100% | - |
| thai-filler-install | 68 | 54 | 20.6% | 100% | - |
| thai-filler-research | 67 | 53 | 20.9% | 100% | - |
| thai-filler-report | 62 | 56 | 9.7% | 100% | - |
## MTP / Speculative Comparison
Budget: 80 | Target: codex
Runs: 10 (warmup: 2)
Normal latency (mean/p50/p95/stddev): 1.9/1.8/2.4/0.2 ms
Spec latency   (mean/p50/p95/stddev): 18.3/18/20.4/0.8 ms
Slowdown mean (spec-normal): 16.4 ms
Spec hit rate: 87.5%
Enhanced gain on mtp_corpus: 30.4% (required >= 5%)
MTP gate: PASS
| Mode | Avg Saved | Avg After | Avg Preserve | Over Budget | Spec Mode Hits |
|---|---:|---:|---:|---:|---:|
| normal | 6.1 | 49.3 | 100% | 0 | 0 |
| speculative | 7.1 | 48.3 | 100% | 0 | 7 |
| ID | Mode | Saved | After | Preserve | Over Budget |
|---|---|---:|---:|---:|---|
| constraint-version | spec:lite | 0 | 47 | 100% | no |
| code-command | spec:lite | 0 | 41 | 100% | no |
| db-safety | normal | 0 | 33 | 100% | no |
| research | spec:lite | 0 | 43 | 100% | no |
| thai-filler-debug | spec:auto | 24 | 54 | 100% | no |
| thai-filler-install | spec:auto | 14 | 56 | 100% | no |
| thai-filler-research | spec:auto | 14 | 54 | 100% | no |
| thai-filler-report | spec:lite | 5 | 58 | 100% | no |
## Enhanced Corpus Gate (long repetitive narrative + mixed technical blocks)
Corpus: benchmarks/mtp_corpus.jsonl
Samples: 6 | Budget: 120 | Target: codex
Baseline avg saved: 14.8
Enhanced avg saved: 19.3
Gain: 30.4% (required >= 5%)
Preservation parity: PASS
Enhanced corpus gate: PASS
| ID | Baseline Saved | Enhanced Saved | Baseline Preserve | Enhanced Preserve |
|---|---:|---:|---:|---:|
| mtp-long-repeat-install | 19 | 19 | 100% | 100% |
| mtp-mixed-technical-blocks | 0 | 0 | 100% | 100% |
| mtp-repetitive-reporting | 0 | 12 | 100% | 100% |
| mtp-long-narrative-with-code | 68 | 83 | 100% | 100% |
| mtp-repetitive-mixed-fence | 0 | 0 | 100% | 100% |
| mtp-repetitive-ops-playbook | 2 | 2 | 100% | 100% |
## Notes
- Version remains Thai Token Optimizer v1.0 / package 1.0.0.
- Exact tokenizer is optional; if unavailable the estimator falls back to heuristic mode.
- Strict mode checks saving, preservation, constraints, and code block safety.
