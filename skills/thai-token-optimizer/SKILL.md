---
name: thai-token-optimizer
description: "Advanced Thai token optimization for coding agents with code-aware preservation."
version: "2.0.0"
---

<!--
============================================================================
Thai Token Optimizer v2.0
============================================================================
Description :
A Thai token optimization skill for AI coding agents that keeps commands, code,
and technical details accurate while reducing Thai token usage.

Author      : Dr.Kittimasak Naijit
Repository  : https://github.com/kittimasak/thai-token-optimizer

Copyright (c) 2026 Dr.Kittimasak Naijit

Notes:
- Do not remove code-aware preservation, safety checks, or rollback behavior.
- This file is part of the Thai Token Optimizer local-first CLI/hook system.
============================================================================
-->

# Thai Token Optimizer v2.0 Skill

Use this skill when the user wants compact Thai output, Thai prompt compression, token-efficient AI coding workflows, or work inside the Thai Token Optimizer repository.

Canonical identity:

```text
Thai Token Optimizer v2.0
package version: 2.0.0
```

Do not rename the project, change `2.0.0`, remove safety behavior, or weaken preservation rules unless the maintainer explicitly asks.

---

## 1. Skill Goal

Make Thai interaction more compact while preserving:

```text
safety
correctness
constraints
reproducibility
technical precision
```

Priority order:

```text
1. Safety
2. Correctness
3. Constraint preservation
4. Reproducibility
5. Token reduction
6. Brevity
```

Core rule:

```text
ลด token ได้ แต่ห้ามลดความถูกต้อง ความปลอดภัย หรือเงื่อนไขสำคัญ
```

---

## 2. Activate This Skill When

Use TTO behavior when any condition is true:

- User asks to reduce Thai tokens.
- User asks for compact Thai responses.
- User asks for prompt compression.
- User says `ลด token ไทย`, `ประหยัด token`, `ตอบสั้น`, `thai compact`, or `token thai`.
- Hook context says `THAI TOKEN OPTIMIZER v2.0 ACTIVE`.
- The current repo is `thai-token-optimizer`.
- User edits or audits these files: `README.md`, `MANUAL.md`, `AGENTS.md`, `SKILL.md`, `hooks/*`, `adapters/*`, `benchmarks/*`, `tests/*`, `.codex-plugin/*`, `.claude-plugin/*`.
- User asks about Codex/Claude/Gemini/OpenCode/OpenClaw/Hermes integration.

Do not over-compress if the user asks for deep teaching, full audit, safety-critical steps, legal/medical/financial guidance, or long-form documentation.

---

## 3. Response Style

Default output when active:

- Thai-first, compact, direct.
- Keep English technical terms if clearer.
- Use code/commands before explanation for implementation/debug tasks.
- Use short sections and flat bullets.
- Avoid long intros, repeated framing, filler, hedging, and unnecessary politeness.
- State what was run/tested only if actually run.
- If uncertain, say it briefly.
- If safety risk exists, use `safe` style even if the user asks for short output.

Recommended report shape:

```text
แก้แล้ว:
- ...

ทดสอบ:
- ...

หมายเหตุ:
- ...
```

---

## 4. Modes

| Mode | Use For | Behavior |
|---|---|---|
| `auto` | default mixed work | choose full/lite/safe by task risk |
| `lite` | teaching, research, design, documentation | compact but explanatory |
| `full` | low-risk direct answers, commands, small fixes | shortest usable output |
| `safe` | production, DB, auth, payment, secrets, rollback, destructive work | preserve risk/backup/dry-run/verify/rollback |
| `off` | user disables TTO | normal assistant behavior |

Never use `full` for risky operations.

---

## 5. Profiles

| Profile | Bias | Behavior |
|---|---|---|
| `coding` | concise implementation | code/patch first, short cause, test command |
| `command` | terminal-first | exact command, expected result, verify command |
| `research` | methodology | keep assumptions, variables, metrics, citation intent |
| `teaching` | learner-friendly | concise steps with useful examples |
| `paper` | formal/safe | preserve academic structure, numbers, constraints |
| `ultra` | maximum compression | low-risk only, minimal prose |

---

## 6. Preservation Rules

Never mutate these unless explicitly editing them:

- fenced code blocks
- inline code
- shell commands
- command flags
- file paths
- URLs
- identifiers
- function/class names
- package names
- API names
- exact error messages
- stack traces
- regex
- SQL
- JSON/YAML/TOML keys
- `.env` variables
- version numbers
- branch names
- commit hashes
- ports/IPs
- model names
- tool names
- words protected by `tto keep`
- spaces between technical terms and versions, e.g. `Optimizer v2.0`

Examples that must remain exact:

```bash
node bin/thai-token-optimizer.js install all
npm test
npm run ci
tto benchmark --strict --default-policy --mtp
tto rollback gemini --dry-run
tto compress --pretty --level auto --target codex --budget 500 --check prompt.txt
```

```toml
codex_hooks = true
```

```json
"version": "2.0.0"
```

---

## 7. Safety Override

Switch to safe behavior if the prompt includes or implies:

```text
rm -rf
DROP TABLE
TRUNCATE
DELETE FROM
git reset --hard
git push --force
production
deploy
release
database migration
auth
authorization
payment
secret
API key
token
credential
rollback
backup
uninstall
global config
CI/CD publish
```

Safe response must include:

```text
risk
backup or dry-run
exact command
verification
rollback when relevant
```

Do not compress away safety details.

---

## 8. TTO Stage UI

When explaining hook behavior to users, use the unified stage format:

```text
[TTO Stage 1/4] Detect Intent
[TTO Stage 2/4] Compress Candidate
[TTO Stage 3/4] Preserve Critical
[TTO Stage 4/4] Output Compact
```

Meaning:

| Stage | Meaning |
|---|---|
| `1/4 Detect Intent` | mode/profile/risk/trigger detection |
| `2/4 Compress Candidate` | build compact candidate without dropping critical details |
| `3/4 Preserve Critical` | lock commands, paths, versions, errors, config, safety constraints |
| `4/4 Output Compact` | return concise final output with essential next action |

For Codex hooks that must return JSON, stdout must be valid JSON only. Debug logs must go to stderr or be disabled.

---

## 9. Command Surface v2.0

Use exact commands below when guiding users.

### Mode and Status

```bash
tto auto
tto lite
tto full
tto safe
tto off
tto status
tto status --pretty
tto ui
tto dashboard --view overview
tto dashboard --view quality
tto dashboard --view waste
tto dashboard --view trend
tto dashboard --view agents
tto dashboard --view doctor
tto dashboard --view fleet
```

### Compression and Preservation

```bash
tto compress --pretty --level auto --target codex --budget 500 --check prompt.txt
tto compress --speculative --diagnostics --check --target codex prompt.txt
tto compress --no-speculative --check --target codex prompt.txt
tto rewrite --pretty --budget 300 prompt.txt
tto estimate --target codex "ข้อความภาษาไทย"
tto estimate --exact --target codex "ข้อความภาษาไทย"
tto preserve original.txt optimized.txt
tto classify --pretty "DROP TABLE users production secret"
```

Speculative precedence:

```text
1. --no-speculative
2. --speculative
3. state.speculative
```

### Personalization

```bash
tto keep "คำเฉพาะ"
tto forget "คำเฉพาะ"
tto dictionary
```

Dictionary words are hard-protected.

### Quality, Coach, Benchmark

```bash
tto benchmark --pretty --strict --default-policy --mtp
tto quality --pretty
tto coach --pretty
tto coach --apply safe --pretty
tto coach --apply quick --pretty
```

### Operations Analytics

```bash
tto ops --pretty
tto ops scan --pretty
tto ops audit codex --pretty
tto ops context --pretty
tto ops quality --pretty
tto ops drift --pretty
tto ops validate --pretty
```

### Fleet and Calibration

```bash
tto fleet --pretty
tto fleet --pretty --roots /path/repoA,/path/repoB
tto fleet --pretty --doctor --doctor-target codex
tto fleet --pretty --calibration --session-scan
tto fleet --pretty --calibration --calibration-limit 50 --session-scan
tto calibration status --pretty
tto calibration record --estimated 1200 --real 1350 --target codex
tto calibration from-stats --real-total 25000 --samples 20 --target codex
tto calibration clear
```

### Checkpoint, Cache, Context

```bash
tto checkpoint status --pretty
tto checkpoint list --pretty
tto checkpoint capture "before-change" --pretty
tto checkpoint precompact "before compact" --pretty
tto checkpoint postcompact "after compact" --pretty
tto checkpoint restore latest --pretty
tto cache stats --pretty
tto cache clear
tto context --pretty
```

### Install, Backup, Rollback

```bash
tto backup all
tto backups
tto install codex
tto install claude
tto install gemini
tto install opencode
tto install openclaw
tto install hermes
tto install cursor
tto install aider
tto install cline
tto install roo
tto install all
tto install-agents
tto doctor --pretty
tto rollback latest --dry-run
tto rollback latest
tto uninstall all
```

Use dry-run before rollback. Do not run install/uninstall/rollback in a user environment unless requested.

### Config

```bash
tto config path
tto config init
tto config get
tto config set defaultMode auto
tto config set defaultProfile coding
tto config set safetyMode strict
tto config set readCache.mode warn
tto config set readCache.mode block
```

---

## 10. Supported Agent Integrations

| Target | Integration | Main Command |
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

Important paths:

```text
~/.codex/config.toml
~/.codex/hooks.json
~/.codex/AGENTS.md
~/.claude/settings.json
~/.gemini/extensions/thai-token-optimizer/gemini-extension.json
~/.config/opencode/plugins/thai-token-optimizer.js
~/.cursor/rules/thai-token-optimizer.mdc
~/.aider/thai-token-optimizer.md
~/.cline/rules/thai-token-optimizer.md
~/.roo/rules/thai-token-optimizer.md
```

---

## 11. Documentation Rules

When writing docs for this repo:

- Keep `Thai Token Optimizer v2.0`.
- Keep `package version: 2.0.0`.
- Include terminal-first usage, not web dashboard claims.
- Include all current command families: `quality`, `coach`, `ops`, `fleet`, `calibration`, `context`, `checkpoint`, `cache`, MTP/speculative.
- Include supported agents truthfully.
- Include backup/rollback and doctor notes.
- Do not expose private planning docs if user asks to hide `docs/*` details.
- Do not claim tests pass unless run.
- Mention that `doctor --pretty` can be `WARN` depending on local adapter footprint.

---

## 12. Testing and Audit Behavior

When asked to test/audit TTO, prefer targeted checks first:

```bash
node --check bin/thai-token-optimizer.js
node --test tests/test_pretty_ui.js
node --test tests/test_mtp_speculative.js tests/test_mtp_benchmark.js tests/test_mtp_detectors.js
node --test tests/test_fleet_auditor.js tests/test_session_parsers_integration.js
tto benchmark --pretty --strict --default-policy --mtp
tto doctor --pretty
tto doctor --ci
```

Full checks:

```bash
npm test
npm run test:ci
npm run ci
```

Report results as:

```text
ผ่าน:
- ...

พบปัญหา:
- ...

ไฟล์ที่แก้:
- ...

ทดสอบ:
- ...
```

If tests generate artifacts such as `benchmarks/regression_report.md` or `benchmarks/regression_report.json`, inspect `git status` and avoid committing unintended artifacts.

---

## 13. Common Troubleshooting

### Invalid Codex hook JSON

Error:

```text
UserPromptSubmit hook failed
error: hook returned invalid user prompt submit JSON output
```

or:

```text
Stop hook failed
error: hook returned invalid stop hook JSON output
```

Likely cause:

- hook prints non-JSON text to stdout
- fallback output is not valid hook JSON
- debug banner leaks into stdout

Fix direction:

```text
stdout = valid JSON only
stderr = debug logs if needed
fallback = minimal valid JSON, e.g. {"continue":true} when contract allows
```

Verify:

```bash
node --check hooks/tto-mode-tracker.js
node --check hooks/tto-stop-summary.js
tto doctor codex --pretty
```

### Doctor WARN

`doctor --pretty` may be `WARN` if optional adapters are not installed or local agent binaries/configs are absent. That does not automatically mean core compression is broken.

### MTP performance

MTP/speculative in TTO is a candidate-selection layer. It can improve token reduction quality, but it is not a guaranteed model inference speedup.

---

## 14. Response Examples

### Mode enabled

```text
เปิด `token thai auto` แล้ว
```

### Safe install

```text
ติดตั้งแบบปลอดภัย:

```bash
tto backup codex
tto install codex
tto install-agents
tto doctor codex --pretty
```
```

### Bugfix report

```text
แก้แล้ว:
- replace `codex_hooks` เดิมแทนการ insert ซ้ำ
- stop hook คืน valid JSON เท่านั้น

ทดสอบ:
- `node --test tests/test_pretty_ui.js` ผ่าน
```

### Risky database request

```text
เสี่ยง: destructive database operation

backup ก่อน:
```bash
mysqldump -u USER -p DB_NAME > backup.sql
```

ตรวจเป้าหมาย:
```sql
SELECT COUNT(*) FROM users;
```

ยังไม่ควรรัน `DROP TABLE users` จนกว่าจะยืนยัน backup, environment, และ rollback plan
```

---

## 15. Prohibited Behavior

Do not:

- Reintroduce older version labels or stale package identity.
- Remove backup/rollback behavior from risky workflows.
- Compress away hard constraints.
- Mutate commands, paths, config keys, versions, or exact errors.
- Claim exact tokenizer behavior when output is heuristic.
- Claim tests passed without running them.
- Restore all targets when user requested one target.
- Uninstall all targets when user requested one target.
- Print non-JSON logs to stdout from hooks that must return JSON.
- Over-compress educational, production, database, security, auth, payment, or rollback guidance.

---

## 16. Final Rule

Thai Token Optimizer v2.0 should make Thai coding-agent interaction compact, but never at the cost of safety, correctness, constraints, reproducibility, or technical precision.
