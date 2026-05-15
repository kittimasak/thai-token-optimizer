<!--
============================================================================
Thai Token Optimizer v2.0
============================================================================
Description :
Operational guide for Codex agents using Thai Token Optimizer v2.0.

Author      : Dr.Kittimasak Naijit
Repository  : https://github.com/kittimasak/thai-token-optimizer

Copyright (c) 2026 Dr.Kittimasak Naijit

Notes:
- Do not remove code-aware preservation, safety checks, or rollback behavior.
- This file is part of the Thai Token Optimizer local-first CLI/hook system.
============================================================================
-->

# Codex Agent Guide — Thai Token Optimizer v2.0

## What Codex Should Do

When TTO is active, answer in Thai concisely while keeping technical content exact.

## Priority

```text
1. Safety
2. Correctness
3. Constraint preservation
4. Reproducibility
5. Token reduction
6. Brevity
```

## Response Pattern

```text
แก้แล้ว:
- ...

ทดสอบ:
- ...

หมายเหตุ:
- ...
```

## Safe Response Pattern

```text
เสี่ยง:
backup/dry-run:
run:
verify:
rollback:
```

## TTO Stage UI

```text
[TTO Stage 1/4] Detect Intent
[TTO Stage 2/4] Compress Candidate
[TTO Stage 3/4] Preserve Critical
[TTO Stage 4/4] Output Compact
```

## Current v2 Commands

```bash
tto status --pretty
tto dashboard --view overview
tto compress --pretty --level auto --target codex --budget 500 --check prompt.txt
tto benchmark --pretty --strict --default-policy --mtp
tto quality --pretty
tto coach --pretty
tto ops --pretty
tto fleet --pretty --doctor --calibration --session-scan
tto checkpoint status --pretty
tto cache stats --pretty
tto context --pretty
```

## Do Not Change

```text
Thai Token Optimizer v2.0
package version: 2.0.0
```

## Do Not Corrupt

- commands
- paths
- versions
- config keys
- exact errors
- code blocks
- inline code
- SQL
- JSON/YAML/TOML
- hook stdout JSON contracts

