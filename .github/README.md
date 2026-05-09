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

# .github — Thai Token Optimizer v1.0

> GitHub community health files, issue templates, pull request template, Dependabot config, and CI workflows for **Thai Token Optimizer v1.0**

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

## Directory structure

```text
.github/
├── README.md
├── ISSUE_TEMPLATE/
│   ├── bug_report.yml
│   ├── feature_request.yml
│   ├── documentation.yml
│   └── config.yml
├── PULL_REQUEST_TEMPLATE.md
├── dependabot.yml
└── workflows/
    ├── test.yml
    ├── validate.yml
    ├── docs-check.yml
    ├── security-scan.yml
    └── release.yml
```

## Workflows

| Workflow | Purpose |
|---|---|
| `test.yml` | Run tests on Node.js 18, 20, and 22 |
| `validate.yml` | Validate JS syntax, JSON, JSONL, plugin metadata, and version lock |
| `docs-check.yml` | Check required docs and important commands |
| `security-scan.yml` | Scan for obvious secrets and risky examples |
| `release.yml` | Validate release tags `v1.0*` and build dry-run source artifact |

## Required project identity

Do not change:

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

## Recommended local checks

```bash
npm install
npm test
npm run ci
node bin/thai-token-optimizer.js benchmark --strict --default-policy
node bin/thai-token-optimizer.js doctor --ci
```

## Safety notes

- Do not add API keys, tokens, secrets, passwords, or private credentials.
- Do not remove backup/rollback behavior.
- Do not remove code-aware preservation.
- Do not remove safety classifier checks.
- Do not introduce `v1.1` or `1.1.0`.
