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

# Pull Request

## Summary

Describe what changed and why.

## Type of change

- [ ] Bug fix
- [ ] Feature
- [ ] Documentation
- [ ] Test/CI
- [ ] Refactor
- [ ] Other

## Safety and preservation

- [ ] Commands, paths, config keys, versions, and code blocks are preserved
- [ ] Safety checks are not removed
- [ ] Backup/rollback behavior is not removed
- [ ] Risky operations still prefer safe mode

## Tests

Paste relevant outputs:

```bash
npm test
npm run ci
node bin/thai-token-optimizer.js benchmark --strict --default-policy
node bin/thai-token-optimizer.js doctor --ci
```

## Checklist

- [ ] I tested the change locally
- [ ] I updated docs if needed
- [ ] I did not add secrets or credentials
- [ ] I checked generated plugin/marketplace JSON if changed
