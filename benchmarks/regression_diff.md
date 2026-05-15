# Benchmark Artifact Diff

Current artifact: `benchmarks/regression_report.json`
Baseline artifact: `benchmarks/regression_baseline.json`

## Current Snapshot

- Strict gate: PASS
- MTP gate: PASS
- Enhanced corpus gate: PASS
- Fixture corpus guard: PASS
- Strict avg saving: 12%
- Enhanced gain: 12233.3%
- Slowdown mean: 8.1 ms

## Diff vs Baseline

| Metric | Current | Baseline | Delta |
|---|---:|---:|---:|
| Strict avg saving % | 12 | 10.8 | +1.2 |
| Enhanced gain % | 12233.3 | 566.7 | +11666.6 |
| MTP slowdown mean ms | 8.1 | 16.4 | -8.3 |
| Fixture gain % | 100 | 100 | 0 |

- Gate drift:
  - Strict: PASS -> PASS
  - MTP: PASS -> PASS
  - Enhanced: PASS -> PASS
  - Fixture: PASS -> PASS

## Waste Signals

| ID | Severity | Message |
|---|---|---|
| low_saving_cluster | warn | 3 samples have <=1% savings; consider prompt decomposition or selective-window tuning |
| tool_cascade | warn | 3 consecutive low-saving technical turns detected; likely retry/tool cascade waste |

