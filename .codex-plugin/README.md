<!--
============================================================================
Thai Token Optimizer v2.0
============================================================================
Description :
Codex plugin package documentation for Thai Token Optimizer v2.0.

Author      : Dr.Kittimasak Naijit
Repository  : https://github.com/kittimasak/thai-token-optimizer

Copyright (c) 2026 Dr.Kittimasak Naijit

Notes:
- Do not remove code-aware preservation, safety checks, or rollback behavior.
- This file is part of the Thai Token Optimizer local-first CLI/hook system.
============================================================================
-->

# Codex Plugin — Thai Token Optimizer v2.0

Codex plugin metadata, lifecycle hooks, command templates, and skill guidance for **Thai Token Optimizer v2.0**.

```text
Thai Token Optimizer v2.0
package version: 2.0.0
```

## Purpose

The `.codex-plugin` directory packages TTO behavior for Codex:

- compact Thai responses
- code-aware preservation
- safety-aware tool guidance
- mode/profile tracking
- MTP/speculative compression guidance
- quality/coach/ops/fleet command templates
- checkpoint/cache/context operational visibility
- rollback-first installation discipline

## Directory Structure

```text
.codex-plugin/
├── plugin.json
├── README.md
├── INSTALL_TH.md
├── VALIDATION.md
├── hooks/
│   ├── hooks.json
│   └── tto-*.js
├── commands/
│   ├── tto-auto.md
│   ├── tto-lite.md
│   ├── tto-full.md
│   ├── tto-safe.md
│   ├── tto-off.md
│   ├── tto-status.md
│   ├── tto-dashboard.md
│   ├── tto-doctor.md
│   ├── tto-benchmark.md
│   ├── tto-quality.md
│   ├── tto-coach.md
│   ├── tto-ops.md
│   ├── tto-fleet.md
│   ├── tto-compress.md
│   └── tto-context.md
└── skills/
    └── thai-token-optimizer/
        ├── SKILL.md
        └── AGENT_GUIDE.md
```

## Hook Events

| Event | Script | Stage | Purpose |
|---|---|---|---|
| `SessionStart` | `hooks/tto-activate.js` | `[TTO Stage 1/4]` | Load compact Thai context |
| `UserPromptSubmit` | `hooks/tto-mode-tracker.js` | `[TTO Stage 1/4]` | Track mode/profile/safety |
| `PreToolUse` | `hooks/tto-pretool-guard.js` | `[TTO Stage 3/4]` | Preserve critical safety details |
| `PostToolUse` | `hooks/tto-posttool-summary.js` | `[TTO Stage 4/4]` | Encourage compact tool summary |
| `Stop` | `hooks/tto-stop-summary.js` | `[TTO Stage 4/4]` | Return valid minimal stop JSON |

Hooks must preserve valid JSON output when Codex expects structured hook output. Debug text must not leak into stdout.

## Install Codex Integration

```bash
tto backup codex
tto install codex
tto install-agents
tto doctor codex --pretty
```

## Install All Integrations

```bash
tto backup all
tto install all
tto install-agents
tto doctor --pretty
```

## Codex Chat Controls

```text
token thai auto
token thai lite
token thai full
token thai safe
token thai off
/tto spec
/tto nospec
/tto nointeractive
```

## Core v2 Commands

```bash
# status/dashboard
tto status --pretty
tto dashboard --view overview
tto dashboard --view quality
tto dashboard --view waste
tto dashboard --view trend

# compression/MTP
tto compress --pretty --level auto --target codex --budget 500 --check prompt.txt
tto compress --speculative --diagnostics --check --target codex prompt.txt
tto benchmark --pretty --strict --default-policy --mtp

# quality/ops/fleet
tto quality --pretty
tto coach --pretty
tto ops --pretty
tto fleet --pretty --doctor --calibration --session-scan

# continuity/cache/context
tto checkpoint status --pretty
tto cache stats --pretty
tto context --pretty
tto calibration status --pretty
```

## Supported Targets

| Target | Integration | Command |
|---|---|---|
| Codex | hooks + `AGENTS.md` | `tto install codex` |
| Claude Code | settings hooks | `tto install claude` |
| Gemini CLI | extension + hooks | `tto install gemini` |
| OpenCode | native plugin + config | `tto install opencode` |
| OpenClaw | managed hook + config | `tto install openclaw` |
| Hermes Agent | shell hooks + plugin hooks | `tto install hermes` |
| Cursor | rule file | `tto install cursor` |
| Aider | instruction file | `tto install aider` |
| Cline | rule file | `tto install cline` |
| Roo Code | rule file | `tto install roo` |

## Validation

```bash
node -e "JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('plugin.json OK')"
node -e "JSON.parse(require('fs').readFileSync('.codex-plugin/hooks/hooks.json','utf8')); console.log('hooks.json OK')"
find .codex-plugin/hooks -name '*.js' -print0 | xargs -0 -n1 node --check
node --test tests/test_pretty_ui.js
node --test tests/test_codex_triggers.js
```

## Safety Behavior

Use safe behavior for destructive shell commands, database migration, production deploy, auth/security/payment work, secrets/API keys/tokens, backup/rollback/uninstall, and global config edits.

Safe answer pattern:

```text
risk → backup → dry-run/preview → exact command → verify → rollback
```

## Version Lock

Keep exact:

```text
Thai Token Optimizer v2.0
package version: 2.0.0
```

Do not introduce older version labels or unrelated branding.

