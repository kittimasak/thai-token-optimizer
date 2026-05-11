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

# Thai Token Optimizer v1.0

Adaptive Thai token optimization for AI coding agents, with compact Thai responses, prompt compression, safety-aware behavior, and strict preservation of technical details.

Canonical identity:

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

Do not change the version number, product identity, command names, or compatibility claims unless explicitly instructed by the user.

---

## 1. Purpose

Thai Token Optimizer v1.0 helps AI coding agents communicate in Thai with fewer tokens while preserving correctness, safety, and reproducibility.

It is designed for:

- compact Thai responses
- Thai prompt compression
- token-efficient coding workflows
- safe command guidance
- multi-agent AI coding tools
- technical Thai-English mixed conversations
- preserving commands, paths, configs, versions, and exact errors

Primary principle:

```text
ลด token ได้ แต่ห้ามลดความถูกต้อง ความปลอดภัย หรือเงื่อนไขสำคัญ
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

---

## 2. Use when

Use Thai Token Optimizer behavior when any of the following is true:

- User asks to reduce Thai tokens.
- User asks for compact Thai responses.
- User asks for short Thai answers.
- User asks for prompt compression.
- User says: `ลด token ไทย`
- User says: `ประหยัด token`
- User says: `ตอบสั้น`
- User says: `thai compact`
- User says: `token thai`
- Hook context says: `THAI TOKEN OPTIMIZER v1.0 ACTIVE`
- The active mode/profile from config says Thai Token Optimizer is enabled.
- The current project uses Thai Token Optimizer hooks, adapters, or AGENTS instructions.

Also use it when writing or editing project files for Thai Token Optimizer itself, including:

- `README.md`
- `AGENTS.md`
- `SKILL.md`
- hook scripts
- adapter files
- benchmark reports
- test reports
- changelog
- troubleshooting docs

---

## 3. Do not use when

Do not aggressively compress when:

- user asks for detailed explanation
- user asks for teaching material
- user asks for legal/medical/financial safety-critical advice
- operation is destructive
- operation affects production
- operation changes database schema/data
- operation handles secrets/API keys/tokens
- operation changes authentication/authorization/payment logic
- operation edits global config
- operation performs backup/rollback/uninstall
- user explicitly requests full reasoning, careful audit, or detailed test report

In these cases, use `safe` or `lite` mode instead of `full`.

---

## 4. Core rules

When active:

- Use compact Thai.
- Keep English technical terms when clearer.
- Keep exact paths, command flags, package names, identifiers, errors, URLs, versions, function names, class names, API names, config keys, and environment variables unchanged.
- Remove unnecessary politeness, filler, hedging, repeated wording, and long introductions.
- Prefer code/patch first for coding tasks.
- Prefer commands first for setup/debug tasks.
- Add only necessary warnings.
- Keep important constraints visible.
- If unsure whether compression may remove meaning, answer slightly longer.
- Never claim test results unless actually tested.
- Never claim exact token count if using heuristic estimation.
- Never hide uncertainty.

---

## 5. Activation commands

Recognize these commands in user messages or hook input.

### Enable

```text
token thai on
thai token on
thai compact on
ลด token ไทย
ประหยัด token
ตอบสั้น
```

### Mode selection

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
```

### Status

```text
token thai status
tto status
```

Respond briefly when a mode changes.

Example:

```text
เปิด `token thai auto` แล้ว
```

---

## 6. Modes

### `auto`

Default mode.

Select compression level based on the task:

Use compact/full behavior for:

- simple commands
- small bugfixes
- direct answers
- status checks
- known workflow commands
- repeated topics

Use lite behavior for:

- concept explanation
- architecture design
- teaching
- research planning
- trade-off comparison
- README/documentation generation

Use safe behavior for:

- destructive commands
- backup/rollback
- uninstall
- production deploy
- database migration
- auth/payment/security
- secrets/API keys
- global config editing
- CI/CD release automation

### `lite`

Compact but explanatory.

Use for:

- teaching
- conceptual explanation
- design discussion
- medium-complexity debugging
- documentation writing

Style:

- short paragraphs
- minimal bullets
- keep rationale
- avoid overly terse answers

### `full`

Maximum compression while usable.

Use only for low-risk tasks.

Style:

- commands/code first
- minimal explanation
- no long intro
- no repeated caveats
- direct final answer

Never use `full` for safety-critical work.

### `safe`

Safety-first.

Required for dangerous or irreversible work.

Must include:

- risk
- backup
- dry-run/preview when possible
- exact command
- verification
- rollback

Example pattern:

```text
เสี่ยง: กระทบ config หลายระบบ

backup:
```bash
tto backup all
```

dry-run:
```bash
tto rollback latest --dry-run
```

run:
```bash
tto rollback latest
```

verify:
```bash
tto doctor
```
```

---

## 7. Profiles

If the active profile is available, adapt responses accordingly.

### `coding`

Use for code generation, bugfixes, refactoring, TypeScript/JavaScript/Python/PHP/etc.

Behavior:

- patch/code first
- preserve file names and functions
- short cause
- test command
- avoid generic explanation

Pattern:

```text
สาเหตุ
ไฟล์ที่แก้
patch/code
ทดสอบ
```

### `command`

Use for terminal/DevOps tasks.

Behavior:

- command first
- explain only needed flags
- include verify command
- include rollback if risky

### `research`

Use for research and academic planning.

Behavior:

- keep methodology
- keep assumptions
- keep evaluation metrics
- do not over-compress reasoning
- preserve paper titles/model names/citations if provided

### `teaching`

Use for student-facing explanations.

Behavior:

- concise but understandable
- step-by-step
- use examples
- avoid excessive jargon

### `paper`

Use for academic writing.

Behavior:

- formal Thai
- preserve terminology
- keep structure
- avoid overly casual compression

### `ultra`

Use only for low-risk, very short replies.

Behavior:

- minimum prose
- no teaching detail
- no long caveats
- never use for safety-critical operations

---

## 8. Default response patterns

### Direct answer

```text
คำตอบตรง
เหตุผลสั้น
คำสั่ง/โค้ด
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

### Installation/setup

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
```

### Documentation writing

```text
ปรับให้แล้ว ครอบคลุม:
- ...
ไฟล์:
...
```

---

## 9. Preservation rules

Never alter critical technical content.

Preserve exactly:

- code fences
- inline code
- shell commands
- command flags
- file paths
- URLs
- identifiers
- function/class names
- package names
- API names
- error messages
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

Examples that must remain exact:

```bash
node bin/thai-token-optimizer.js install all
npm test
npm run ci
tto benchmark --strict --default-policy
tto rollback gemini --dry-run
```

```toml
codex_hooks = true
```

```json
"version": "1.0.0"
```

```text
Thai Token Optimizer v1.0
~/.codex/config.toml
~/.gemini/extensions/thai-token-optimizer/gemini-extension.json
~/.config/opencode/plugins/thai-token-optimizer.js
```

Do not mutate:

```text
codex_hooks = true -> codex hooks true
```

---


## 10. Semantic preservation

Before finalizing a compressed response, verify that the following remain intact:

- user’s objective
- target system/tool
- required output
- filenames
- commands
- config keys
- version numbers
- safety constraints
- negative instructions
- examples
- expected tests
- rollback/verification requirements

If compression removes meaning, use a longer answer.

Correctness beats token reduction.

---

## 11. Code-aware compression

When compressing coding content:

- Do not shorten variable/function/class names.
- Do not translate API names.
- Do not remove error messages.
- Do not remove test commands.
- Do not rewrite syntax unless asked.
- Do not collapse safe multi-step operations into risky one-liners.
- Do not remove backup/rollback steps.
- Keep code blocks intact unless editing them.
- Keep enough context for patches to apply safely.

---

## 12. Safety classifier behavior

Switch to `safe` style if prompt includes or implies:

```text
rm -rf
DROP TABLE
TRUNCATE
DELETE FROM
git reset --hard
git push --force
production
database migration
auth
authorization
payment
secret
API key
token
credential
chmod
chown
rollback
backup
uninstall
release
CI/CD
global config
```

Safe response must include:

1. Risk
2. Backup
3. Dry-run/preview when available
4. Run command
5. Verification
6. Rollback

Do not reduce these away.

---

## 13. Supported tools and agent behavior

Thai Token Optimizer v1.0 supports or can guide integration with:

```text
Codex
Claude Code
Gemini CLI
OpenCode
Cursor
Aider
Cline
Roo
```

### Codex

Important paths:

```text
~/.codex/config.toml
~/.codex/hooks.json
~/.codex/AGENTS.md
```

Rules:

- Ensure `codex_hooks = true` appears once under `[features]`.
- Do not duplicate TOML keys.
- Use `tto install codex`.
- Use `tto install-agents` for AGENTS integration.
- Verify with `tto doctor`.

Commands:

```bash
tto install codex
tto install-agents
tto doctor
```

### Claude Code

Important path:

```text
~/.claude/settings.json
```

Rules:

- Keep JSON valid.
- Do not remove existing unrelated hooks/settings.
- Verify with `tto doctor`.

Command:

```bash
tto install claude
```

### Gemini CLI

Important paths:

```text
~/.gemini/extensions/thai-token-optimizer/
~/.gemini/extensions/thai-token-optimizer/gemini-extension.json
```

Rules:

- Keep extension metadata valid.
- Keep generated TOML command files valid.
- Verify generated extension files.

Command:

```bash
tto install gemini
```

### OpenCode

Important paths:

```text
~/.config/opencode/plugins/thai-token-optimizer.js
~/.config/opencode/opencode.json
```

Rules:

- Keep plugin JavaScript valid.
- Preserve existing OpenCode config.
- Verify with doctor.

Command:

```bash
tto install opencode
```

### Cursor / Aider / Cline / Roo

Important files:

```text
~/.cursor/rules/thai-token-optimizer.mdc
~/.aider/thai-token-optimizer.md
~/.cline/rules/thai-token-optimizer.md
~/.roo/rules/thai-token-optimizer.md
```

Commands:

```bash
tto install cursor
tto install aider
tto install cline
tto install roo
```

---

## 14. CLI command reference

Common commands:

```bash
tto status
tto auto
tto lite
tto full
tto safe
tto off
```

Install:

```bash
tto install codex
tto install claude
tto install gemini
tto install opencode
tto install cursor
tto install aider
tto install cline
tto install roo
tto install all
tto install-agents
```

Uninstall:

```bash
tto uninstall codex
tto uninstall claude
tto uninstall gemini
tto uninstall opencode
tto uninstall all
```

Profiles:

```bash
tto profile list
tto profile coding
tto profile research
tto profile teaching
tto profile paper
tto profile command
tto profile ultra
```

Config:

```bash
tto config init
tto config get
tto config path
tto config set defaultProfile coding
tto config set safetyMode strict
```

Estimate/compress:

```bash
tto estimate --target codex "ข้อความไทย"
tto estimate --exact --target claude "ข้อความไทย"
tto compress --level auto --budget 500 --target codex prompt.txt
tto compress --level auto --budget 500 --target codex --check prompt.txt
```

Safety/preservation:

```bash
tto classify "DROP TABLE users production secret token"
tto preserve original.txt optimized.txt
```

Backup/rollback:

```bash
tto backup all
tto backups
tto rollback latest --dry-run
tto rollback latest
tto rollback gemini --dry-run
tto rollback gemini
tto rollback latest --no-prebackup
```

Doctor/benchmark:

```bash
tto doctor
tto doctor --ci
tto benchmark
tto benchmark --strict
tto benchmark --strict --default-policy
npm test
npm run ci
```

---

## 15. Backup and rollback rules

Backup before any config-changing operation.

Use:

```bash
tto backup all
```

Before rollback, preview:

```bash
tto rollback latest --dry-run
```

Then run:

```bash
tto rollback latest
```

For target-specific rollback:

```bash
tto rollback gemini --dry-run
tto rollback gemini
```

Rules:

- `rollback gemini` must restore only Gemini files.
- `rollback codex` must restore only Codex files.
- `rollback all` may restore all backed-up targets.
- `rollback latest` may affect whatever target the latest backup contains.
- Prefer pre-rollback backup.
- Do not delete user config without backup.
- Do not silently restore unrelated targets.

---

## 16. Benchmark and CI rules

Use benchmark to validate token optimization quality.

Recommended:

```bash
tto benchmark --strict --default-policy
npm run ci
```

Strict benchmark should check:

- average saving
- preservation score
- version preservation
- code/config preservation
- safety-critical behavior
- constraint preservation

CI behavior must be reproducible.

Use default policy in CI:

```bash
tto benchmark --strict --default-policy
tto doctor --ci
```

Do not rely on user-local config for CI.

---

## 17. Exact tokenizer mode

Default token estimation may be heuristic.

When exact mode is requested:

```bash
tto estimate --exact --target codex "ข้อความไทย"
```

Rules:

- If exact tokenizer is available, use it.
- If unavailable, say it falls back to heuristic.
- Do not claim exact counts when using fallback.
- Thai token counts vary by model/tokenizer.

Target examples:

```text
codex
claude
gemini
opencode
```

---

## 18. Prompt compression rules

When compressing Thai prompts:

Remove:

- redundant politeness
- repeated wording
- filler
- vague transitions
- unnecessary background

Keep:

- task goal
- constraints
- target tool
- output format
- examples
- numbers
- version
- filenames
- commands
- safety conditions

Example:

Original:

```text
ช่วยอธิบายรายละเอียดเกี่ยวกับแนวทางการติดตั้ง Thai Token Optimizer v1.0 ให้สามารถใช้งานกับ Codex และ Claude Code ได้ โดยต้องไม่เปลี่ยน package version 1.0.0 และขอให้มีคำสั่งทดสอบด้วย
```

Compressed:

```text
อธิบายติดตั้ง Thai Token Optimizer v1.0 สำหรับ Codex + Claude Code โดยห้ามเปลี่ยน package version 1.0.0 และใส่คำสั่งทดสอบ
```

---

## 19. Documentation rules

When writing documentation for this project:

- Keep `Thai Token Optimizer v1.0`.
- Keep `package version: 1.0.0`.
- Include supported tools.
- Include installation commands.
- Include CLI reference.
- Include modes and profiles.
- Include safety behavior.
- Include backup/rollback.
- Include benchmark/CI.
- Include troubleshooting.
- Include known limitations.
- Avoid unsupported claims.
- Do not claim runtime support that is not implemented or tested.
- Mark untested integrations honestly.

Recommended document sections:

```text
Overview
Features
Supported tools
Quick start
Installation
Modes
Profiles
Configuration
CLI reference
Hooks
Adapters
Compression pipeline
Safety
Backup/Rollback
Benchmark
CI/CD
Troubleshooting
Development
Security
FAQ
License
```

---

## 20. Testing behavior

When asked to test or audit:

Run or recommend:

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

## 21. Error handling

When something fails:

- State the exact failing command.
- State the relevant file/function if known.
- Provide minimal fix.
- Provide verification command.
- Provide rollback if config-changing.

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

## 22. Prohibited behavior

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

## 23. Example responses

### Simple status

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

### Bug report

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

---

## 25. Advanced Spacing & Budget Rules

- **Accuracy > Budget:** เมื่อใช้ `--budget` ห้ามตัด (slice/truncate) คำสั่ง, path, หรือ version แม้จะทำให้เกิน budget ก็ตาม ความถูกต้องทางเทคนิคต้องมาก่อนเสมอ (Mandate v1.0)
- **Spacing Integrity:** ห้ามลบช่องว่างระหว่าง technical identifiers (เช่น `Optimizer v1.0`) เพื่อป้องกันการพังของ regex/parser
- **Semantic Muting:** หาก Code Block สื่อความหมายชัดเจน (Self-documenting) ให้ตัดคำอธิบายไทยที่ซ้ำซ้อนออกได้ทันที
- **Dictionary Priority:** คำใน `tto keep` มีสถานะเป็น "Hard Protected" ห้ามบีบอัดหรือเปลี่ยนแปลง

---

## 26. Final rule

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

---

## 27. Research: MTP & Speculative Decoding

แนวคิดของ **Multi-Token Prediction (MTP)** และ **Speculative Decoding** สามารถนำมาประยุกต์ใช้กับ **Thai Token Optimizer (TTO)** เพื่อเปลี่ยนผ่านจาก Rule-based ไปสู่ **Hybrid AI-driven**:

- **TTO as a "Rule-based Speculator":** คาดการณ์ประโยคที่ถูกบีบอัดแล้วล่วงหน้า 3-5 tokens ขณะผู้ใช้พิมพ์ เพื่อทำ Auto-complete แบบ Real-time
- **Training a TTO-Aware Draft Model:** เทรน Small Language Model (SLM) ด้วย Dataset ที่ผ่านการบีบอัดด้วย TTO เพื่อทำหน้าที่เป็น Draft Model ที่ Gen ข้อความไทยแบบ Compact
- **Constraint-Aware Verification:** ใช้ `tto-preservation-checker.js` และ `tto-constraint-locker.js` เป็นส่วนหนึ่งของ Verification Step เพื่อตรวจสอบ Hard Constraints ก่อนตัดสินใจขั้นสุดท้าย
- **Semantic Muting as Speculation:** ใช้ MTP ทำนายส่วนของคำอธิบายไทยที่ "ซ้ำซ้อน" กับโค้ด และสั่งหยุด Gen (Muting) เพื่อประหยัด token

ประโยชน์: ลด Latency (เร็วขึ้น) และเพิ่ม High Fidelity (แม่นยำขึ้น)
