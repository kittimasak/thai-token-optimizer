# Detector Threshold Tuning Report

Generated: 2026-05-12T11:14:29.537Z
Runs: 12

## Baseline Signal Distribution

| Signal | min | p50 | p95 | max | mean |
|---|---:|---:|---:|---:|---:|
| output_waste.count | 3 | 3 | 3 | 3 | 3 |
| tool_cascade.streak | 3 | 3 | 3 | 3 | 3 |
| bad_decomposition.count | 0 | 0 | 0 | 0 | 0 |

## Suggested High-Severity Thresholds

| Key | Suggested value | Rule |
|---|---:|---|
| benchmarkStrict.mtpHighOutputWasteMinCount | 4 | p95 + 1 |
| benchmarkStrict.mtpHighToolCascadeMinStreak | 4 | p95 + 1 |
| benchmarkStrict.mtpHighBadDecompositionMinCount | 2 | p95 + 1 |

## Notes

- This report calibrates thresholds from repeated strict benchmark runs.
- Tune again after corpus/policy/detector logic changes.
