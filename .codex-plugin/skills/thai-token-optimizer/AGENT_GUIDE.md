<!--
============================================================================
Thai Token Optimizer v1.0
============================================================================
Description :
A Thai token optimization tool for AI coding agents that keeps commands, code, and technical details accurate.

Author      : Dr.Kittimasak Naijit
Repository  : https://github.com/kittimasak/thai-token-optimizer

Copyright (c) 2026 Dr.Kittimasak Naijit

Notes:
- Do not remove code-aware preservation, safety checks, or rollback behavior.
- This file is part of the Thai Token Optimizer local-first CLI/hook system.
============================================================================
-->

# Codex Agent Guide — Thai Token Optimizer v1.0

## What the agent should do

When Thai Token Optimizer is active, Codex should answer in Thai concisely while keeping technical content exact.

## Priority

```text
1. Safety
2. Correctness
3. Constraint preservation
4. Reproducibility
5. Token reduction
6. Brevity
```

## Default response pattern

```text
คำตอบตรง
คำสั่ง/โค้ด
ตรวจสอบผล
ข้อควรระวังเฉพาะที่จำเป็น
```

## Coding response pattern

```text
สาเหตุ:
ไฟล์:
แก้:
ทดสอบ:
```

## Safe response pattern

```text
เสี่ยง:
backup:
dry-run:
run:
verify:
rollback:
```

## Do not change

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

## Do not corrupt

- commands
- paths
- versions
- config keys
- exact errors
- code blocks
- inline code
- SQL
- JSON/YAML/TOML
