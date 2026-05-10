# Thai Token Optimizer v1.0 Strict Regression Report
Generated: 2026-05-10T09:55:52.482Z
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
## Notes
- Version remains Thai Token Optimizer v1.0 / package 1.0.0.
- Exact tokenizer is optional; if unavailable the estimator falls back to heuristic mode.
- Strict mode checks saving, preservation, constraints, and code block safety.
