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

# Codex Plugin — Thai Token Optimizer v1.0

> Codex plugin metadata, hook mapping, command templates, and agent guidance for **Thai Token Optimizer v1.0**

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

## Purpose

This `.codex-plugin` directory provides a complete Codex plugin package for Thai Token Optimizer.

Thai Token Optimizer helps Codex respond in compact Thai while preserving technical accuracy, commands, code, paths, versions, errors, safety constraints, and rollback behavior.

## Directory structure

```text
.codex-plugin/
├── plugin.json
├── README.md
├── INSTALL_TH.md
├── VALIDATION.md
├── hooks/
│   └── hooks.json
├── commands/
│   ├── tto-auto.md
│   ├── tto-lite.md
│   ├── tto-full.md
│   ├── tto-safe.md
│   ├── tto-off.md
│   ├── tto-status.md
│   ├── tto-doctor.md
│   └── tto-dashboard.md
└── skills/
    └── thai-token-optimizer/
        ├── SKILL.md
        └── AGENT_GUIDE.md
```

## Files

| File | Purpose |
|---|---|
| `plugin.json` | Codex plugin metadata and interface information |
| `hooks/hooks.json` | Lifecycle hook mapping |
| `README.md` | English usage and maintenance guide |
| `INSTALL_TH.md` | Thai installation guide |
| `commands/*.md` | Command templates for users and agents |
| `skills/thai-token-optimizer/SKILL.md` | Skill-style behavior guide |
| `skills/thai-token-optimizer/AGENT_GUIDE.md` | Agent-specific operational guidance |
| `VALIDATION.md` | JSON validation and checklist |

## Hook events

| Event | Script | Purpose |
|---|---|---|
| `SessionStart` | `hooks/tto-activate.js` | Inject compact Thai rules at session start |
| `UserPromptSubmit` | `hooks/tto-mode-tracker.js` | Detect mode controls and classify safety |
| `PreToolUse` | `hooks/tto-pretool-guard.js` | Add safety guidance before risky tools |
| `PostToolUse` | `hooks/tto-posttool-summary.js` | Encourage compact Thai tool summaries |
| `Stop` | `hooks/tto-stop-summary.js` | Encourage compact final answer |

The plugin hook manifest references scripts through:

```text
${CODEX_PLUGIN_ROOT:-.}/hooks/<script>.js
```

When used from this repository, the actual runtime hook scripts live in the repository root `hooks/` directory.

## Install from GitHub

```bash
git clone https://github.com/kittimasak/thai-token-optimizer.git
cd thai-token-optimizer

npm install
npm test
npm run ci
npm link
```

## Install Codex integration

```bash
tto backup codex
tto install codex
tto install-agents
tto doctor --pretty
```

## Install all integrations

```bash
tto backup all
tto install all
tto install-agents
tto doctor --pretty
```

## Codex chat controls

Inside Codex, use:

```text
token thai auto
token thai lite
token thai full
token thai safe
token thai off
```

Recommended default:

```text
token thai auto
```

## CLI verification

```bash
node -e "JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('plugin.json OK')"
node -e "JSON.parse(require('fs').readFileSync('.codex-plugin/hooks/hooks.json','utf8')); console.log('hooks.json OK')"
npm test
npm run ci
tto doctor --pretty
```

## Safety behavior

Thai Token Optimizer must use safe behavior for:

- destructive shell commands
- database migration
- production deploy
- auth/security/payment work
- secrets/API keys/tokens
- backup/rollback/uninstall
- global config edits

Safe answer pattern:

```text
risk → backup → dry-run/preview → exact command → verify → rollback
```

## Version lock

Do not change:

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

Do not introduce `v1.1`, `1.1.0`, or unrelated branding.

## Author

```text
Author: Dr.Kittimasak Naijit
GitHub: https://github.com/kittimasak
Repository: https://github.com/kittimasak/thai-token-optimizer
```
