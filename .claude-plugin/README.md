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

# Claude Code Plugin — Thai Token Optimizer v1.0

> Claude Code plugin metadata, hook configuration, commands, and usage notes for **Thai Token Optimizer v1.0**

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

## Purpose

This `.claude-plugin` directory makes Thai Token Optimizer discoverable and installable as a Claude Code plugin.

Thai Token Optimizer helps Claude Code respond in compact Thai while preserving technical accuracy, commands, code, paths, versions, errors, safety constraints, and rollback behavior.

## Directory structure

```text
.claude-plugin/
├── marketplace.json
├── plugin.json
├── README.md
├── INSTALL_TH.md
├── commands/
│   ├── tto-auto.md
│   ├── tto-lite.md
│   ├── tto-full.md
│   ├── tto-safe.md
│   ├── tto-off.md
│   ├── tto-status.md
│   └── tto-doctor.md
└── skills/
    └── thai-token-optimizer/
        └── SKILL.md
```

## Files

| File | Purpose |
|---|---|
| `marketplace.json` | Local/marketplace plugin listing |
| `plugin.json` | Claude Code plugin metadata and hook bindings |
| `README.md` | English usage and maintenance notes |
| `INSTALL_TH.md` | Thai installation guide |
| `commands/*.md` | Command prompt templates for Claude Code users |
| `skills/thai-token-optimizer/SKILL.md` | Claude skill-style behavior guide |

## Hook events

`plugin.json` registers these hooks:

| Event | Script | Purpose |
|---|---|---|
| `SessionStart` | `hooks/tto-activate.js` | Inject compact Thai behavior at session start |
| `UserPromptSubmit` | `hooks/tto-mode-tracker.js` | Detect mode commands and safety categories |
| `PreToolUse` | `hooks/tto-pretool-guard.js` | Add safety guard before risky tools |
| `PostToolUse` | `hooks/tto-posttool-summary.js` | Encourage compact Thai tool summaries |
| `Stop` | `hooks/tto-stop-summary.js` | Encourage compact final answer |

The scripts are referenced using:

```text
${CLAUDE_PLUGIN_ROOT}/hooks/<script>.js
```

When this plugin is used from the repository root, the `hooks/` directory must exist at the repository root.

## Install from repository

```bash
git clone https://github.com/kittimasak/thai-token-optimizer.git
cd thai-token-optimizer

npm install
npm test
npm run ci

npm link

tto backup claude
tto install claude
tto doctor --pretty
```

## Install all integrations

```bash
tto backup all
tto install all
tto install-agents
tto doctor --pretty
```

## Claude Code chat commands

Inside Claude Code, use:

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
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); console.log('plugin.json OK')"
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); console.log('marketplace.json OK')"
npm test
npm run ci
tto doctor --pretty
```

## Safety behavior

Thai Token Optimizer should switch to safety-first behavior for:

- destructive commands
- database migration
- production deploy
- auth/security/payment work
- secrets/API keys/tokens
- backup/rollback/uninstall
- global config edits

Safe responses should include:

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
