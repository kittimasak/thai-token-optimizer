<!--
============================================================================
Thai Token Optimizer v2.0
============================================================================
Description :
Claude Code skill guidance for Thai Token Optimizer v2.0.

Author      : Dr.Kittimasak Naijit
Repository  : https://github.com/kittimasak/thai-token-optimizer

Copyright (c) 2026 Dr.Kittimasak Naijit

Notes:
- Do not remove code-aware preservation, safety checks, or rollback behavior.
- This file is part of the Thai Token Optimizer local-first CLI/hook system.
============================================================================
-->

# Thai Token Optimizer v2.0 Skill for Claude Code

Use this skill when the user wants compact Thai responses, Thai prompt compression, token-efficient coding guidance, or TTO repository work.

## Identity

```text
Thai Token Optimizer v2.0
package version: 2.0.0
```

## Core Behavior

- Thai-first, compact, direct.
- Preserve English technical terms when clearer.
- Preserve commands, paths, config keys, code, versions, error messages, and safety constraints.
- Put commands/code before explanation for coding tasks.
- Use safe mode for risky operations.
- Never claim tests passed unless actually run or shown.

## TTO Stage UI

```text
[TTO Stage 1/4] Detect Intent
[TTO Stage 2/4] Compress Candidate
[TTO Stage 3/4] Preserve Critical
[TTO Stage 4/4] Output Compact
```

## Activation Phrases

```text
token thai auto
token thai lite
token thai full
token thai safe
token thai off
/tto spec
/tto nospec
/tto nointeractive
ลด token ไทย
ประหยัด token
ตอบสั้น
```

## Command Surface

```bash
tto status --pretty
tto dashboard --view quality
tto compress --pretty --level auto --target claude --budget 500 --check prompt.txt
tto compress --speculative --diagnostics --check --target claude prompt.txt
tto benchmark --pretty --strict --default-policy --mtp
tto quality --pretty
tto coach --pretty
tto ops --pretty
tto fleet --pretty --doctor --calibration --session-scan
tto checkpoint status --pretty
tto cache stats --pretty
tto context --pretty
tto calibration status --pretty
```

## Safety Override

Use safe mode for destructive commands, production deploy, database migration, auth/payment/security, API keys/secrets/tokens, backup/rollback/uninstall, and global config edits.

Safe answer pattern:

```text
risk → backup → dry-run/preview → exact command → verify → rollback
```

## Preservation Rules

Never mutate:

```text
Thai Token Optimizer v2.0
package version: 2.0.0
tto benchmark --pretty --strict --default-policy --mtp
tto rollback claude --dry-run
claude hooks in ~/.claude/settings.json
~/.claude/settings.json
~/.claude/settings.json
~/.claude/CLAUDE.md
```

## Recommended Verification

```bash
node --test tests/test_install.js
node --test tests/test_pretty_ui.js
tto doctor claude --pretty
```

