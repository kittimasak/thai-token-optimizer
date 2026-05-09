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

# Thai Token Optimizer Local Plugin Marketplace

This directory contains the local plugin marketplace manifest for **Thai Token Optimizer v1.0**.

## File

```text
marketplace.json
```

## Plugin entry

| Key | Value |
|---|---|
| Marketplace name | `thai-token-optimizer-local` |
| Display name | `Thai Token Optimizer Local` |
| Plugin name | `thai-token-optimizer` |
| Source type | `local` |
| Source path | `./` |
| Installation policy | `AVAILABLE` |
| Authentication policy | `ON_INSTALL` |
| Category | `Productivity` |

## Validate

```bash
node -e "JSON.parse(require('fs').readFileSync('.agents/plugins/marketplace.json','utf8')); console.log('OK')"
```

## Notes

- This file is intentionally minimal to avoid incompatibility with strict plugin marketplace parsers.
- Keep extra documentation in Markdown files instead of adding unknown fields into `marketplace.json`.
- Keep Thai Token Optimizer version locked at `v1.0 / 1.0.0`.
