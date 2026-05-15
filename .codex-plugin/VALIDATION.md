<!--
============================================================================
Thai Token Optimizer v2.0
============================================================================
Description :
Validation checklist for Thai Token Optimizer v2.0 Codex plugin package.

Author      : Dr.Kittimasak Naijit
Repository  : https://github.com/kittimasak/thai-token-optimizer

Copyright (c) 2026 Dr.Kittimasak Naijit

Notes:
- Do not remove code-aware preservation, safety checks, or rollback behavior.
- This file is part of the Thai Token Optimizer local-first CLI/hook system.
============================================================================
-->

# Validation — Codex Plugin for Thai Token Optimizer v2.0

## JSON Validation

```bash
node -e "JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('plugin.json OK')"
node -e "JSON.parse(require('fs').readFileSync('.codex-plugin/hooks/hooks.json','utf8')); console.log('hooks.json OK')"
```

## Hook Syntax

```bash
find .codex-plugin/hooks -name '*.js' -print0 | xargs -0 -n1 node --check
```

## Targeted Tests

```bash
node --test tests/test_codex_triggers.js
node --test tests/test_pretty_ui.js
```

## Optional Full Checks

```bash
npm test
npm run test:ci
npm run ci
```

## Checklist

- [ ] `plugin.json` is valid JSON
- [ ] `hooks/hooks.json` is valid JSON
- [ ] all `.codex-plugin/hooks/*.js` pass `node --check`
- [ ] `Thai Token Optimizer v2.0` remains exact
- [ ] `package version: 2.0.0` remains exact
- [ ] command templates include dashboard, compress, benchmark, quality, coach, ops, fleet, context
- [ ] hook status messages use `[TTO Stage x/4]` format
- [ ] stop hook returns valid minimal JSON
- [ ] `codex_hooks = true` is not duplicated by install flow
- [ ] no secrets/API keys/tokens are stored in `.codex-plugin`
- [ ] `tto doctor --pretty` passes or reports actionable warnings

