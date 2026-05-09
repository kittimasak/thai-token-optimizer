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
- This directory is part of the Thai Token Optimizer local-first CLI/hook system.
============================================================================
-->

# .agents — Thai Token Optimizer Local Marketplace

> Local agents/plugin marketplace configuration for **Thai Token Optimizer v1.0**

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

## Purpose

This `.agents` directory provides a local plugin marketplace entry for the `thai-token-optimizer` project.

It is intended for local development and local installation workflows where an AI coding agent or plugin host can discover a plugin from the current repository path.

## Directory structure

```text
.agents/
└── plugins/
    ├── marketplace.json
    └── README.md
```

## Marketplace file

Main file:

```text
.agents/plugins/marketplace.json
```

Current plugin entry:

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

## Field explanation

| Field | Meaning |
|---|---|
| `name` | Local marketplace name |
| `interface.displayName` | Human-readable marketplace name |
| `plugins[].name` | Plugin package/repository name |
| `plugins[].source.source` | Source type; this package uses `local` |
| `plugins[].source.path` | Local path to the plugin repository |
| `plugins[].policy.installation` | Installation availability policy |
| `plugins[].policy.authentication` | Authentication policy during installation |
| `plugins[].category` | Marketplace category |

## How to use

Place `.agents/` at the root of the repository:

```text
thai-token-optimizer/
├── .agents/
│   └── plugins/
│       └── marketplace.json
├── bin/
├── hooks/
├── adapters/
├── README.md
├── MANUAL.md
├── AGENTS.md
└── package.json
```

Then install and verify Thai Token Optimizer normally:

```bash
npm install
npm test
npm run ci

npm link

tto doctor --pretty
tto ui
```

Install all supported integrations:

```bash
tto backup all
tto install all
tto install-agents
tto doctor --pretty
```

## Safety notes

- Keep `package version: 1.0.0`.
- Keep plugin name as `thai-token-optimizer`.
- Keep local source path as `./` when `.agents` is stored at repository root.
- Do not add secrets, API keys, access tokens, credentials, or personal data into `marketplace.json`.
- Do not remove backup / rollback behavior from Thai Token Optimizer.
- Use `tto doctor --pretty` after installation.

## Verification checklist

```bash
test -f .agents/plugins/marketplace.json
node -e "JSON.parse(require('fs').readFileSync('.agents/plugins/marketplace.json','utf8')); console.log('marketplace.json OK')"
npm test
npm run ci
tto doctor --pretty
```

Expected:

```text
marketplace.json OK
package version: 1.0.0
doctor: PASS or actionable warnings
```

## Recommended repository workflow

```bash
git clone https://github.com/kittimasak/thai-token-optimizer.git
cd thai-token-optimizer

npm install
npm test
npm run ci
npm link

tto backup all
tto install all
tto install-agents
tto doctor --pretty
tto auto
tto ui
```

Then restart your AI coding tool and type:

```text
token thai auto
```

## Thai Token Optimizer identity

```text
Thai Token Optimizer v1.0
package version: 1.0.0
Author: Dr.Kittimasak Naijit
Repository: https://github.com/kittimasak/thai-token-optimizer
```
