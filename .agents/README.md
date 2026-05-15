<!--
============================================================================
Thai Token Optimizer v2.0
============================================================================
Description :
Local `.agents` marketplace documentation for Thai Token Optimizer v2.0.

Author      : Dr.Kittimasak Naijit
Repository  : https://github.com/kittimasak/thai-token-optimizer

Copyright (c) 2026 Dr.Kittimasak Naijit

Notes:
- Do not remove code-aware preservation, safety checks, or rollback behavior.
- This directory is part of the Thai Token Optimizer local-first CLI/hook system.
============================================================================
-->

# .agents — Thai Token Optimizer v2.0 Local Marketplace

Local agents/plugin marketplace configuration for **Thai Token Optimizer v2.0**.

```text
Thai Token Optimizer v2.0
package version: 2.0.0
```

## Purpose

The `.agents` directory provides a local plugin marketplace entry for the `thai-token-optimizer` repository.

It is intended for local development and local installation workflows where an AI coding agent or plugin host can discover the plugin from the current repository path.

## Directory Structure

```text
.agents/
├── README.md
├── INSTALL_TH.md
└── plugins/
    ├── README.md
    └── marketplace.json
```

## Marketplace Manifest

Main file:

```text
.agents/plugins/marketplace.json
```

Current manifest shape:

```json
{
  "name": "thai-token-optimizer-local",
  "interface": {
    "displayName": "Thai Token Optimizer Local"
  },
  "plugins": [
    {
      "name": "thai-token-optimizer",
      "source": {
        "source": "local",
        "path": "./"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

Keep `marketplace.json` intentionally minimal. Do not add unknown metadata fields unless the marketplace parser supports them.

## TTO v2 Capabilities Exposed by This Repo

```text
compact Thai responses
prompt compression
code-aware preservation
safety classifier
personal dictionary
MTP/speculative candidate selection
quality score + coach mode
ops analytics
fleet audit
real-session calibration
checkpoint lifecycle
read-cache analytics
context audit
backup / rollback / doctor
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

## Recommended Local Workflow

```bash
npm install
node -e "JSON.parse(require('fs').readFileSync('.agents/plugins/marketplace.json','utf8')); console.log('marketplace.json OK')"
node --test tests/test_pretty_ui.js

tto backup all
tto install all
tto install-agents
tto doctor --pretty
tto auto
tto dashboard --view overview
```

Then restart the AI coding tool and type:

```text
token thai auto
```

## Useful v2 Commands

```bash
# status/dashboard
tto status --pretty
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

## Safety Notes

- Keep `Thai Token Optimizer v2.0` and `package version: 2.0.0` exact.
- Keep plugin name as `thai-token-optimizer`.
- Keep local source path as `./` when `.agents` is stored at repository root.
- Do not put API keys, tokens, credentials, passwords, or personal data in `.agents`.
- Do not remove backup, rollback, preservation, or safety behavior.
- Use `tto doctor --pretty` after installation.
- `doctor --pretty` can be `WARN` if optional local adapter footprints are absent.

## Verification Checklist

```bash
test -f .agents/plugins/marketplace.json
node -e "JSON.parse(require('fs').readFileSync('.agents/plugins/marketplace.json','utf8')); console.log('marketplace.json OK')"
node --test tests/test_pretty_ui.js
tto benchmark --pretty --strict --default-policy --mtp
tto doctor --pretty
```

Expected:

```text
marketplace.json OK
package version: 2.0.0
benchmark strict/MTP gate: PASS or actionable failure
doctor: PASS/WARN with actionable checks
```

## Identity

```text
Thai Token Optimizer v2.0
package version: 2.0.0
Author: Dr.Kittimasak Naijit
Repository: https://github.com/kittimasak/thai-token-optimizer
```
