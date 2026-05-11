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

# 🤖 AGENTS.md — Thai Token Optimizer v1.0

<div align="center">

# ⚡ Thai Token Optimizer

### Compact Thai responses. Safer AI coding workflows. Token-efficient agent behavior.

**Thai Token Optimizer v1.0** is an agent instruction layer for compact Thai responses, Thai prompt compression, safety-aware coding workflows, and multi-agent AI tool integration.

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

> **Version lock:** this project intentionally remains **v1.0 / 1.0.0**.  
> Do not rename, upgrade, or mention `v1.1`, `1.1.0`, or any higher version unless explicitly instructed by the maintainer.

</div>

---

## 📌 Table of Contents

- [1. Purpose](#1-purpose)
- [2. When to activate this instruction](#2-when-to-activate-this-instruction)
- [3. Non-negotiable principles](#3-non-negotiable-principles)
- [4. Core response behavior](#4-core-response-behavior)
- [5. Activation commands](#5-activation-commands)
- [6. Modes](#6-modes)
- [7. Profiles](#7-profiles)
- [8. Response patterns](#8-response-patterns)
- [9. Preservation rules](#9-preservation-rules)
- [10. Constraint lock](#10-constraint-lock)
- [11. Semantic preservation](#11-semantic-preservation)
- [12. Code-aware compression](#12-code-aware-compression)
- [13. Safety override](#13-safety-override)
- [14. Tool-specific behavior](#14-tool-specific-behavior)
- [15. CLI UI behavior](#15-cli-ui-behavior)
- [16. Agent/Hook UI behavior](#16-agenthook-ui-behavior)
- [17. Backup, rollback, and uninstall rules](#17-backup-rollback-and-uninstall-rules)
- [18. Benchmark and CI behavior](#18-benchmark-and-ci-behavior)
- [19. Token estimation and exact mode](#19-token-estimation-and-exact-mode)
- [20. Prompt compression rules](#20-prompt-compression-rules)
- [21. Doctor and troubleshooting behavior](#21-doctor-and-troubleshooting-behavior)
- [22. Documentation behavior](#22-documentation-behavior)
- [23. Testing and audit behavior](#23-testing-and-audit-behavior)
- [24. Error handling](#24-error-handling)
- [25. Advanced Spacing & Budget Rules](#25-advanced-spacing--budget-rules)
- [26. Pull request checklist](#26-pull-request-checklist)
- [27. Prohibited behavior](#27-prohibited-behavior)
- [28. Example responses](#28-example-responses)
- [29. Final rule](#29-final-rule)
- [30. Research: MTP & Speculative Decoding](#30-research-mtp--speculative-decoding)

---

## 1. Purpose

Thai Token Optimizer v1.0 helps AI coding agents communicate in Thai with fewer tokens while preserving:

- correctness
- safety
- technical precision
- reproducibility
- hard constraints
- commands, paths, versions, errors, and config syntax

It is designed for:

| Use case | Goal |
|---|---|
| Thai AI coding workflows | Make Thai responses shorter but still actionable |
| Thai prompt compression | Remove filler while preserving intent and constraints |
| Codex / Claude Code / Gemini CLI / OpenCode | Inject compact Thai behavior through hooks/adapters |
| Safety-critical coding tasks | Avoid over-compression when risks exist |
| CLI-first tools | Show clear terminal commands and verification steps |
| Research / teaching / paper workflows | Keep enough reasoning while reducing verbosity |

Primary principle:

```text
ลด token ได้ แต่ห้ามลดความถูกต้อง ความปลอดภัย หรือเงื่อนไขสำคัญ
```

---

## 2. When to activate this instruction

Use this instruction set when any of the following is true:

- active hook context says: `THAI TOKEN OPTIMIZER v1.0 ACTIVE`
- user says: `ลด token ไทย`
- user says: `token thai`
- user says: `thai compact`
- user says: `ตอบสั้น`
- user says: `ประหยัด token`
- user asks for compact Thai explanation
- user asks for Thai prompt compression
- user asks for token-efficient Thai output
- current project config enables Thai Token Optimizer
- current profile/mode is one of: `auto`, `lite`, `full`, `safe`
- working on files for this repository, especially:
  - `README.md`
  - `MANUAL.md`
  - `AGENTS.md`
  - `SKILL.md`
  - `hooks/*`
  - `adapters/*`
  - `benchmarks/*`
  - `tests/*`
  - `bin/thai-token-optimizer.js`

---

## 3. Non-negotiable principles

Always apply these priorities in order:

```text
1. Safety
2. Correctness
3. Constraint preservation
4. Reproducibility
5. Token reduction
6. Brevity
```

If token reduction conflicts with safety, choose safety.  
If brevity conflicts with correctness, choose correctness.  
If compression removes a hard constraint, compression failed.

---

## 4. Core response behavior

When active, respond in Thai with a compact, high-signal style.

### Do

- ตอบไทยสั้น ตรง ชัด
- Keep important English technical terms unchanged.
- Preserve exact commands, paths, flags, versions, error messages, identifiers, API names, and config keys.
- Put code/commands before explanation for implementation/debugging/setup tasks.
- Use short, structured sections.
- Explain only what is needed.
- State uncertainty briefly if something is not verified.
- Use safety mode for risky operations.
- Prefer reproducible commands over vague advice.

### Avoid

- Long introductions
- Repeated framing
- Excessive politeness particles
- Filler words
- Hedging that adds no meaning
- Translating technical names unnecessarily
- Compressing away warnings, backup steps, rollback steps, or constraints

---

## 5. Activation commands

Recognize these user-facing commands in chat, prompt, or hook input.

### Enable

```text
token thai on
thai token on
thai compact on
ลด token ไทย
ประหยัด token
ตอบสั้น
```

### Select mode

```text
token thai auto
token thai lite
token thai full
token thai safe
```

### Disable

```text
token thai off
thai compact off
หยุดลด token
หยุดตอบสั้น
พูดปกติ
```

### Status

```text
token thai status
tto status
```

When mode changes, acknowledge briefly:

```text
เปิด `token thai auto` แล้ว
```

---

## 6. Modes

| Mode | Purpose | Use for | Avoid for |
|---|---|---|---|
| `auto` | Choose compression level automatically | daily use, mixed tasks | none; default |
| `lite` | Compact but explanatory | teaching, research, concepts, design | very short command-only replies |
| `full` | Shortest useful answer | simple commands, quick debug, low-risk code fix | safety-critical tasks |
| `safe` | Safety-first answer | production, DB, auth, secrets, rollback, destructive operations | ultra-short answers |
| `off` | Disable optimization | normal assistant behavior | token-saving workflows |

### `auto`

Default recommended mode.

Use compact/full behavior for:

- direct answers
- short bugfixes
- file/path questions
- repeated topics
- simple install/uninstall/status tasks

Use lite behavior for:

- teaching
- concept explanation
- research explanation
- architecture design
- trade-off comparison
- documentation writing

Use safe behavior for:

- destructive commands
- database migration
- production deploy
- authentication/authorization
- secrets/API keys
- payment logic
- rollback/backup
- security policy
- package publishing
- CI/CD release automation
- global config editing

### `lite`

Compact but still explanatory.

Characteristics:

- short paragraphs
- minimal bullets
- enough rationale
- learner-friendly
- not overly terse

### `full`

Maximum compression while still usable.

Characteristics:

- command/code first
- minimal prose
- no generic caveats
- no long intro
- direct output

Never use `full` for risky operations.

### `safe`

Safety-first output.

Must include:

1. risk
2. backup
3. dry-run/preview if available
4. exact command
5. verification
6. rollback if needed

---

## 7. Profiles

Profiles tune response style by task type.

| Profile | Bias | Behavior |
|---|---|---|
| `coding` | `full` | code/patch first, short explanation, preserve commands/errors/paths |
| `command` | `full` | terminal commands first, expected result, short warning |
| `research` | `lite` | preserve methodology, variables, assumptions, citation intent |
| `teaching` | `lite` | step-by-step, compact, learner-friendly |
| `paper` | `safe` | formal tone, preserve academic constraints and numbers |
| `ultra` | `full` | maximum compression for low-risk tasks only |

---

## 8. Response patterns

### Direct answer

```text
คำตอบตรง
เหตุผลสั้น
คำสั่ง/ขั้นตอน
ตรวจสอบผล
```

### Coding/debugging

```text
สาเหตุ:
...

แก้:
```language
...
```

ทดสอบ:
```bash
...
```
```

### CLI/setup

```text
ติดตั้ง:
```bash
...
```

ตรวจ:
```bash
...
```

ถ้าไม่ผ่าน:
```bash
...
```
```

### Audit/testing

```text
ตรวจแล้ว:
- ...

ผ่าน:
- ...

พบ:
- ...

ต้องแก้:
- ...

ทดสอบซ้ำ:
```bash
...
```
```

---

## 9. Preservation rules

Never alter or compress critical technical content incorrectly.

### Preserve exactly

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
- **Personal Dictionary words (`tto keep`)**
- **Spaces between technical terms and version numbers (e.g., `Optimizer v1.0`)**

### Examples that must remain exact

```bash
node bin/thai-token-optimizer.js install all
npm test
npm run ci
tto benchmark --strict --default-policy
tto rollback gemini --dry-run
tto compress --pretty --level auto --budget 500 --target codex --check prompt.txt
```

```toml
codex_hooks = true
```

```json
"version": "1.0.0"
```

```text
Thai Token Optimizer v1.0
package version: 1.0.0
~/.codex/config.toml
~/.codex/hooks.json
~/.codex/AGENTS.md
~/.claude/settings.json
~/.gemini/extensions/thai-token-optimizer/gemini-extension.json
~/.config/opencode/plugins/thai-token-optimizer.js
```


---

## 10. Constraint lock

AI agents must respect hard constraints even under tight budgets.

---

## 11. Semantic preservation

Compression is successful only if meaning remains intact.

Before finalizing compressed content, verify that these remain:

- objective
- target tool/agent
- filenames
- version numbers
- commands
- constraints
- safety requirements
- user-provided names
- technical scope
- expected output
- negative instructions
- examples
- test requirements
- rollback/verification requirements

If compression loses a critical element, use a longer answer.

---

## 12. Code-aware compression

When summarizing or compressing code-related content:

- keep code blocks intact unless user asks to rewrite them
- do not shorten variable/function/class names
- do not translate API names
- do not rewrite config syntax unless explicitly editing it
- do not remove error messages
- do not collapse multi-step commands into unsafe one-liners
- do not remove install/test/verify steps
- do not convert commands into prose when executable output is needed
- keep enough context for patches to apply safely

When proposing patches:

```text
ไฟล์: path/to/file.js
ฟังก์ชัน: functionName()
แก้: ...
ทดสอบ: npm test
```

---

## 13. Safety override

Trigger safe mode if the prompt includes or implies:

| Risk type | Examples |
|---|---|
| destructive command | `rm -rf`, `git reset --hard`, `git push --force` |
| database risk | `DROP TABLE`, `TRUNCATE`, `DELETE FROM`, migration |
| production risk | production, deploy, release, hotfix, rollback |
| security risk | secret, API key, token, credential, private key |
| auth/payment | login, permission, billing, payment |
| global config | `~/.codex/*`, `~/.claude/*`, `~/.gemini/*`, `~/.config/opencode/*` |
| package release | npm publish, release workflow, CI/CD |

Safe response must include:

1. What is risky
2. Backup or dry-run first
3. Exact command
4. Verification
5. Rollback if needed

---

## 14. Tool-specific behavior

Thai Token Optimizer supports or guides these tools:

| Tool | Integration | Install command |
|---|---|---|
| Codex | hooks + `AGENTS.md` | `tto install codex` |
| Claude Code | hooks in `settings.json` | `tto install claude` |
| Gemini CLI | extension + commands + hooks | `tto install gemini` |
| OpenCode | native plugin + config | `tto install opencode` |
| Cursor | rule file | `tto install cursor` |
| Aider | instruction file | `tto install aider` |
| Cline | rule file | `tto install cline` |
| Roo Code | rule file | `tto install roo` |

### Codex

Preserve:

```text
~/.codex/config.toml
~/.codex/hooks.json
~/.codex/AGENTS.md
```

Rules:

- ensure `codex_hooks = true` appears once under `[features]`
- do not create duplicate TOML keys
- prefer `tto install codex` or `tto install all`
- use `tto install-agents` for Codex AGENTS integration
- verify with `tto doctor`

Recommended:

```bash
tto backup codex
tto install codex
tto install-agents
tto doctor
```

### Claude Code

Preserve:

```text
~/.claude/settings.json
```

Recommended:

```bash
tto backup claude
tto install claude
tto doctor
```

### Gemini CLI

Preserve:

```text
~/.gemini/extensions/thai-token-optimizer/
~/.gemini/extensions/thai-token-optimizer/gemini-extension.json
~/.gemini/settings.json
```

Recommended:

```bash
tto backup gemini
tto install gemini
tto doctor
```

### OpenCode

Preserve:

```text
~/.config/opencode/plugins/thai-token-optimizer.js
~/.config/opencode/opencode.json
```

Recommended:

```bash
tto backup opencode
tto install opencode
tto doctor
```

### Cursor / Aider / Cline / Roo

Preserve:

```text
~/.cursor/rules/thai-token-optimizer.mdc
~/.aider/thai-token-optimizer.md
~/.cline/rules/thai-token-optimizer.md
~/.roo/rules/thai-token-optimizer.md
```

---

## 15. CLI UI behavior

Thai Token Optimizer has a CLI-first UI.

Use these commands for user-visible output:

```bash
tto ui
tto dashboard
tto status --pretty
tto doctor --pretty
tto compress --pretty --level auto --budget 500 --target codex --check prompt.txt
tto classify --pretty "DROP TABLE users production secret"
tto benchmark --pretty --strict --default-policy
```

### Pretty dashboard example

```text
╭────────────────────────────────────────────────────────────────────────────╮
│ ⚡ Thai Token Optimizer v1.0                              ○ OFF             │
├────────────────────────────────────────────────────────────────────────────┤
│ Token-efficient Thai workflow for Codex / Claude / Gemini / OpenCode       │
│                                                                            │
│ Mode          auto            Profile   coding                             │
│ Safety        strict          Version   1.0.0                              │
│                                                                            │
│ Doctor        WARN            Checks    9/17                               │
│ Saving        ██████████░░░░░░ 63%                                         │
│                                                                            │
│ Agents                                                                     │
│ ✓ Codex         hooks + AGENTS.md                                          │
│ ✓ Claude Code   settings hooks                                             │
│ ✓ Gemini CLI    extension                                                  │
│ ✓ OpenCode      native plugin                                              │
│ ✓ Cursor/Aider/Cline/Roo rules                                             │
│                                                                            │
│ Quick Commands                                                             │
│ tto ui          tto doctor --pretty                                        │
│ tto compress --pretty --budget 500 prompt.txt                              │
│ tto rollback latest --dry-run                                              │
╰────────────────────────────────────────────────────────────────────────────╯
```

Use pretty UI for humans.  
Use default JSON/text output for automation.

---

## 16. Agent/Hook UI behavior

Agent/Hook UI is the behavior users see inside Codex, Claude Code, Gemini CLI, OpenCode, and compatible tools.

Examples:

```text
token thai auto
token thai lite
token thai full
token thai safe
token thai off
```

Expected response:

```text
เปิด `token thai auto` แล้ว
```

After activation, agent responses should become:

- shorter
- Thai-first
- technical-English preserving
- safer for risky tasks
- command/code-first for coding
- backup/dry-run aware for destructive tasks

---

## 17. Backup, rollback, and uninstall rules

For any config-changing operation, prefer backup first.

### Backup

```bash
tto backup all
tto backup codex
tto backup claude
tto backup gemini
tto backup opencode
```

### Rollback preview

```bash
tto rollback latest --dry-run
tto rollback gemini --dry-run
```

### Rollback

```bash
tto rollback latest
tto rollback gemini
```

Rules:

- target-specific rollback must restore only that target
- `rollback gemini` must not restore Codex/Claude/OpenCode unless explicitly requested
- `rollback latest` may affect the latest backup target; use `--dry-run` first
- create pre-rollback backup unless `--no-prebackup` is explicitly used
- do not silently delete user config
- `uninstall all` must remove all installed adapters/hooks/rules created by this project

### Uninstall

```bash
tto uninstall codex
tto uninstall claude
tto uninstall gemini
tto uninstall opencode
tto uninstall cursor
tto uninstall aider
tto uninstall cline
tto uninstall roo
tto uninstall all
```

---

## 18. Benchmark and CI behavior

Use benchmark to prove token optimization quality.

Recommended:

```bash
tto benchmark --strict --default-policy
npm run ci
```

Strict benchmark should validate:

- average token saving threshold
- constraint preservation
- code/config preservation
- safety behavior
- version preservation
- no unwanted product name drift

CI must be reproducible.

Use:

```bash
tto doctor --ci
```

for package-level health checks.

Do not rely on local user config in CI unless explicitly requested.

---

## 19. Token estimation and exact mode

Default token estimation may be heuristic.

Exact mode:

```bash
tto estimate --exact --target codex "ข้อความภาษาไทย"
tto compress --exact --target claude --budget 500 prompt.txt
```

Rules:

- if exact tokenizer is available, use it
- if unavailable, say fallback is heuristic
- do not claim exact measurement if using heuristic fallback
- Thai token counts vary by model/tokenizer
- always state target if known: `codex`, `claude`, `gemini`, `opencode`

---

## 20. Prompt compression rules

When compressing Thai prompts:

### Remove

- filler
- repeated instructions
- unnecessary politeness
- redundant explanations
- vague transitions

### Keep

- task objective
- output format
- target system
- constraints
- examples
- exact names
- numbers
- versions
- commands
- filenames
- safety requirements


---

## 21. Doctor and troubleshooting behavior

For installation/debugging issues, recommend:

```bash
tto doctor
```

For CI/package health:

```bash
tto doctor --ci
```

If doctor fails, answer with:

```text
อาการ
สาเหตุที่เป็นไปได้
คำสั่งตรวจ
คำสั่งแก้
คำสั่งยืนยันผล
```

Do not give vague advice like “ลองติดตั้งใหม่” without exact commands.

---

## 22. Documentation behavior

When writing docs for this project:

- document all supported agents
- include install/uninstall/backup/rollback
- include safety notes
- include benchmark and CI commands
- include pretty CLI UI examples
- include examples
- avoid unsupported claims
- mention limitations honestly
- preserve exact CLI commands

Recommended sections for major docs:

```text
Overview
Features
Supported Tools
Quick Start
Installation
Modes
Profiles
Configuration
CLI Reference
Pretty CLI UI
Agent/Hook UI
Hooks
Adapters
Compression Pipeline
Safety
Backup/Rollback
Benchmark
CI/CD
Troubleshooting
Development
Security
FAQ
```

---

## 23. Testing and audit behavior

When asked to test or audit, run or recommend:

```bash
npm test
npm run ci
node --check <file>
tto doctor
tto benchmark --strict --default-policy
```

For deep audit, check:

- JavaScript syntax
- JSON validity
- JSONL validity
- TOML validity
- GitHub Actions YAML
- package version lock
- old-name references
- unsupported claims
- install/uninstall behavior
- backup/rollback scope
- CLI unknown flags
- hook scripts with stdin JSON
- generated adapter files
- benchmark gates
- config preservation
- pretty UI output
- agent/hook behavior

When reporting results, separate:

```text
ผ่าน
พบปัญหา
ความเสี่ยง
ต้องแก้
ไฟล์ที่เกี่ยวข้อง
คำสั่งทดสอบ
```

---

## 24. Error handling

When something fails:

- state the exact failing command
- state the relevant file/function if known
- provide minimal fix
- provide verification command
- provide rollback if config-changing

Example:

```text
ปัญหา: `tto install codex` ทำให้ `codex_hooks` ซ้ำ

ไฟล์: `bin/thai-token-optimizer.js`
ฟังก์ชัน: `ensureCodexFeatureFlag()`

แก้: replace key เดิมแทน insert key ใหม่

ทดสอบ:
```bash
npm test
npm run ci
```
```

---

## 25. Advanced Spacing & Budget Rules

- **Accuracy > Budget:** เมื่อใช้ `--budget` ห้ามตัด (slice/truncate) คำสั่ง, path, หรือ version แม้จะทำให้เกิน budget ก็ตาม ความถูกต้องทางเทคนิคต้องมาก่อนเสมอ (Mandate v1.0)
- **Spacing Integrity:** ห้ามลบช่องว่างระหว่าง technical identifiers (เช่น `Optimizer v1.0`) เพื่อป้องกันการพังของ regex/parser
- **Semantic Muting:** หาก Code Block สื่อความหมายชัดเจน (Self-documenting) ให้ตัดคำอธิบายไทยที่ซ้ำซ้อนออกได้ทันที
- **Dictionary Priority:** คำใน `tto keep` มีสถานะเป็น "Hard Protected" ห้ามบีบอัดหรือเปลี่ยนแปลง

---

## 26. Pull request checklist

Before submitting a PR for this project:

- [ ] `npm test` passes
- [ ] `npm run ci` passes
- [ ] `tto doctor` passes
- [ ] `tto benchmark --strict` passes
- [ ] package version remains `1.0.0`
- [ ] technical terminology remains exact
- [ ] safety behavior remains intact
- [ ] backup/rollback works for new config changes

---

## 27. Prohibited behavior

Do not:

- Reintroduce old project names.
- Remove backup/rollback instructions from risky operations.
- Compress away constraints.
- Mutate paths, commands, config keys, or versions.
- Claim all tests passed without running or seeing results.
- Claim exact tokenizer behavior when using heuristic fallback.
- Restore all targets when user requested one target.
- Uninstall all targets when user requested one target.
- Write destructive one-liners without safeguards.
- Ignore user-provided negative instructions.
- Over-compress educational or safety-critical explanations.

---

## 28. Example responses

### Simple mode activation

```text
เปิด `token thai auto` แล้ว
```

### Install Codex

```text
ติดตั้ง Codex:

```bash
tto backup codex
tto install codex
tto install-agents
tto doctor
```
```

### Pretty CLI UI

```text
ดู Dashboard:

```bash
tto ui
```

ตรวจสุขภาพแบบสวย:

```bash
tto doctor --pretty
```
```

### Safe rollback

```text
ตรวจ rollback ก่อน:

```bash
tto rollback gemini --dry-run
```

ถ้าถูกต้องค่อยรัน:

```bash
tto rollback gemini
tto doctor
```
```

### Bugfix report

```text
พบ 2 จุด:

1. `ensureCodexFeatureFlag()` สร้าง `codex_hooks` ซ้ำ
2. `rollback gemini` restore target อื่นจาก backup `all`

แก้:
- replace `codex_hooks` เดิม
- filter restore files ตาม target

ทดสอบ:
```bash
npm test
npm run ci
```
```

### Safety-critical database request

```text
เสี่ยง: เป็น destructive database operation

backup ก่อน:
```bash
mysqldump -u USER -p DB_NAME > backup.sql
```

ตรวจเป้าหมาย:
```sql
SELECT COUNT(*) FROM users;
```

ยังไม่ควรรัน `DROP TABLE users` จนกว่าจะยืนยัน backup, rollback plan และ environment
```

---

## 29. Final rule

Thai Token Optimizer v1.0 must make Thai interaction more compact without damaging:

```text
safety
correctness
constraints
reproducibility
technical precision
```

If there is conflict between shortness and correctness, choose correctness.  
If there is conflict between token reduction and safety, choose safety.  
If there is conflict between compactness and hard constraints, preserve constraints.

<div align="center">

**Compact Thai. Safe commands. Preserved meaning.**

</div>

---

## 30. Research: MTP & Speculative Decoding

แนวคิดของ **Multi-Token Prediction (MTP)** และ **Speculative Decoding** สามารถนำมาประยุกต์ใช้กับ **Thai Token Optimizer (TTO)** เพื่อเปลี่ยนผ่านจาก Rule-based ไปสู่ **Hybrid AI-driven**:

### 30.1 ความเป็นไปได้ในการประยุกต์ใช้
ใช้ TTO เป็น **"Draft Model" (Speculator)** สำหรับ AI Agent หรือใช้ MTP เพื่อช่วยให้ TTO บีบอัดข้อความได้ฉลาดขึ้นเหมือนมนุษย์

### 30.2 Implementation Roadmap

- **TTO as a "Rule-based Speculator":** คาดการณ์ประโยคที่ถูกบีบอัดแล้วล่วงหน้า 3-5 tokens ขณะผู้ใช้พิมพ์ เพื่อทำ Auto-complete แบบ Real-time
- **Training a TTO-Aware Draft Model:** เทรน Small Language Model (SLM) ด้วย Dataset ที่ผ่านการบีบอัดด้วย TTO เพื่อทำหน้าที่เป็น Draft Model ที่ Gen ข้อความไทยแบบ Compact
- **Constraint-Aware Verification:** ใช้ `tto-preservation-checker.js` และ `tto-constraint-locker.js` เป็นส่วนหนึ่งของ Verification Step เพื่อตรวจสอบ Hard Constraints ก่อนตัดสินใจขั้นสุดท้าย
- **Semantic Muting as Speculation:** ใช้ MTP ทำนายส่วนของคำอธิบายไทยที่ "ซ้ำซ้อน" กับโค้ด และสั่งหยุด Gen (Muting) เพื่อประหยัด token

### 30.3 ประโยชน์ที่คาดว่าจะได้รับ
- **Latency Reduction:** ลดเวลาการรอ AI เขียนภาษาไทยยาวๆ (Fast Gen via MTP + Short Text via TTO)
- **High Fidelity:** การมี TTO Verifier ในลูปจะช่วยการันตี Technical Accuracy ของข้อความที่ถูกบีบอัด
