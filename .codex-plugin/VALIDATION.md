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

# Validation

## JSON validation

```text
plugin.json: OK
hooks/hooks.json: OK
```

## Commands

```bash
node -e "JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('plugin.json OK')"
node -e "JSON.parse(require('fs').readFileSync('.codex-plugin/hooks/hooks.json','utf8')); console.log('hooks.json OK')"
npm test
npm run ci
tto doctor --pretty
```

## Checklist

- [ ] `plugin.json` is valid JSON
- [ ] `hooks/hooks.json` is valid JSON
- [ ] `package version` remains `1.0.0`
- [ ] `codex_hooks = true` is not duplicated
- [ ] `tto doctor --pretty` passes or shows actionable warnings
- [ ] no secrets or API keys are stored in `.codex-plugin`
