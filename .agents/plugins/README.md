<!--
============================================================================
Thai Token Optimizer v2.0
============================================================================
Description :
Local plugin marketplace manifest notes for Thai Token Optimizer v2.0.

Author      : Dr.Kittimasak Naijit
Repository  : https://github.com/kittimasak/thai-token-optimizer

Copyright (c) 2026 Dr.Kittimasak Naijit

Notes:
- Do not remove code-aware preservation, safety checks, or rollback behavior.
- This directory is part of the Thai Token Optimizer local-first CLI/hook system.
============================================================================
-->

# Thai Token Optimizer v2.0 Local Plugin Marketplace

This directory contains the local plugin marketplace manifest for **Thai Token Optimizer v2.0**.

```text
Thai Token Optimizer v2.0
package version: 2.0.0
```

## File

```text
marketplace.json
```

## Plugin Entry

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
node -e "JSON.parse(require('fs').readFileSync('.agents/plugins/marketplace.json','utf8')); console.log('marketplace.json OK')"
```

## Related TTO v2 Checks

```bash
tto status --pretty
tto doctor --pretty
tto benchmark --pretty --strict --default-policy --mtp
tto quality --pretty
tto ops --pretty
tto fleet --pretty --doctor --calibration --session-scan
```

## Notes

- Keep `marketplace.json` intentionally minimal to avoid incompatibility with strict plugin marketplace parsers.
- Keep extra documentation in Markdown files instead of adding unknown fields into `marketplace.json`.
- Keep `Thai Token Optimizer v2.0` and `package version: 2.0.0` exact.
- Do not put secrets, tokens, API keys, credentials, or personal data in this directory.
- Do not remove backup, rollback, preservation, or safety behavior from TTO.
