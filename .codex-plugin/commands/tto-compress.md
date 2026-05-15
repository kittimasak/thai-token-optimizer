<!--
============================================================================
Thai Token Optimizer v2.0
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

# /tto-compress

Compress prompt text with preservation checks.

```bash
tto compress --pretty --level auto --target codex --budget 500 --check prompt.txt
tto compress --speculative --diagnostics --check --target codex prompt.txt
tto compress --no-speculative --check --target codex prompt.txt
```

Speculative precedence: `--no-speculative` > `--speculative` > `state.speculative`.

