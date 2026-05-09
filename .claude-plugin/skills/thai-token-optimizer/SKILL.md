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

# Thai Token Optimizer v1.0 Skill for Claude Code

Use this skill when the user wants compact Thai responses, Thai prompt optimization, or token-efficient coding guidance.

## Identity

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

## Core behavior

- Use compact Thai.
- Preserve English technical terms when clearer.
- Preserve commands, paths, config keys, code, versions, error messages, and safety constraints.
- Put commands/code before explanation for coding tasks.
- Use safe mode for risky operations.

## Activation phrases

```text
token thai auto
token thai lite
token thai full
token thai safe
token thai off
ลด token ไทย
ประหยัด token
ตอบสั้น
```

## Modes

| Mode | Behavior |
|---|---|
| `auto` | Choose level from task risk and profile |
| `lite` | Compact but explanatory |
| `full` | Shortest useful answer for low-risk work |
| `safe` | Safety-first with backup/dry-run/verify/rollback |
| `off` | Disable compact behavior |

## Safety override

Use safe mode for:

- `rm -rf`
- `DROP TABLE`
- `TRUNCATE`
- `DELETE FROM`
- `git reset --hard`
- `git push --force`
- production deploy
- database migration
- auth/payment/security
- API keys/secrets/tokens
- backup/rollback/uninstall
- global config edits

Safe answer pattern:

```text
เสี่ยง:
backup:
dry-run:
run:
verify:
rollback:
```

## Preservation rules

Never mutate:

```text
Thai Token Optimizer v1.0
package version: 1.0.0
tto benchmark --strict --default-policy
tto rollback gemini --dry-run
codex_hooks = true
~/.claude/settings.json
```

## Recommended verification

```bash
npm test
npm run ci
tto doctor --pretty
```
