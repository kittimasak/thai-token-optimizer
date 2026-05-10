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

# ⚡ Thai Token Optimizer

<div align="center">

## Compact Thai responses for AI coding agents

**Thai Token Optimizer v1.0** is a local-first **CLI + hook + adapter pack** that makes AI coding assistants respond in concise Thai while preserving technical accuracy, commands, paths, versions, errors, safety constraints, and reproducibility.

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

**Compact Thai. Safe commands. Preserved meaning.**

<br/>

![Version](https://img.shields.io/badge/version-v1.0-blue)
![Package](https://img.shields.io/badge/package-1.0.0-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![Local First](https://img.shields.io/badge/local--first-yes-success)
![CLI](https://img.shields.io/badge/UI-CLI%20%2B%20Agent%20Hooks-purple)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

</div>

---

## 🔥 What is Thai Token Optimizer?

Thai Token Optimizer is a token-efficient Thai communication layer for AI coding tools such as **Codex**, **Claude Code**, **Gemini CLI**, **OpenCode**, **Cursor**, **Aider**, **Cline**, and **Roo Code**.

It helps agents answer in Thai more compactly by removing filler, repeated explanation, unnecessary politeness, and verbose phrasing — while protecting technical details that must never be corrupted.

It is useful when Thai prompts and Thai responses become too long, too repetitive, or too expensive in token-heavy coding workflows.

---

## ✨ Key idea

```text
ลด token ได้ แต่ห้ามลดความถูกต้อง ความปลอดภัย หรือเงื่อนไขสำคัญ
```

Thai Token Optimizer is not just “short Thai”.

It is designed to preserve:

- commands
- code
- file paths
- URLs
- version numbers
- config keys
- exact errors
- API names
- database names
- model names
- hard constraints
- safety warnings
- backup / rollback steps

---

## 🧠 Why this exists

Thai language can consume many tokens in LLM workflows, especially when prompts contain repeated context, politeness particles, long explanations, and mixed Thai-English technical details.

Thai Token Optimizer solves this by adding:

| Problem | Solution |
|---|---|
| Thai responses are too verbose | Compact Thai response rules |
| Prompt repeats too much context | Local prompt compression |
| Commands or versions get corrupted | Code-aware preservation |
| Risky operations get over-compressed | Safety classifier + safe mode |
| AI tool configs are hard to manage | Installer + backup + rollback |
| CLI output is hard to read | Pretty terminal UI |
| Multi-agent setup is inconsistent | Adapters for multiple tools |
| Regressions are hard to catch | Strict benchmark + CI gate |

---

## ✅ Supported tools

| Tool | Integration type | Main install command |
|---|---|---|
| **Codex** | Hooks + optional `AGENTS.md` | `tto install codex` |
| **Claude Code** | Hooks in `settings.json` | `tto install claude` |
| **Gemini CLI** | Extension + commands + hooks | `tto install gemini` |
| **OpenCode** | Native plugin + config | `tto install opencode` |
| **Cursor** | Rule file adapter | `tto install cursor` |
| **Aider** | Guidance file adapter | `tto install aider` |
| **Cline** | Rule file adapter | `tto install cline` |
| **Roo Code** | Rule file adapter | `tto install roo` |

Install all supported targets:

```bash
tto install all
```

---

## 🖥️ UI: CLI UI + Agent/Hook UI

Thai Token Optimizer does **not** use a web dashboard.

It has two real interfaces:

```text
Thai Token Optimizer UI
├── CLI UI
│   ├── Terminal commands: tto ...
│   ├── JSON/text output for automation
│   └── Pretty Terminal UI for humans
│
└── Agent/Hook UI
    ├── In-chat commands: token thai auto
    ├── Hook-based behavior injection
    └── Compact Thai responses inside AI tools
```

---

## 🎨 Pretty CLI UI

Thai Token Optimizer v1.0 includes a dependency-free terminal UI renderer using Unicode boxes and progress bars.

```bash
tto ui
```

Example:

```text
╭────────────────────────────────────────────────────────────────────────────╮
│ ⚡ Thai Token Optimizer v1.0                              ● ACTIVE          │
├────────────────────────────────────────────────────────────────────────────┤
│ Token-efficient Thai workflow for Codex / Claude / Gemini / OpenCode       │
│                                                                            │
│ Mode          auto            Profile   coding                             │
│ Safety        strict          Version   1.0.0                              │
│                                                                            │
│ Doctor        PASS            Checks    17/17                              │
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

Other pretty commands:

```bash
tto status --pretty
tto doctor --pretty
tto compress --pretty --level auto --budget 500 --target codex --check prompt.txt
tto classify --pretty "DROP TABLE users production secret"
tto benchmark --pretty --strict --default-policy
```

Use `--pretty` for humans.  
Use default JSON/text output for scripts and automation.

---

## 🚀 Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Run tests

```bash
npm test
npm run ci
```

Expected result:

```text
75 tests passed
0 failed
package version: 1.0.0
```

### 3. Install integrations

```bash
tto install all
```

or use the direct Node command:

```bash
node bin/thai-token-optimizer.js install all
```

### 4. Install Codex AGENTS.md integration

```bash
tto install-agents
```

### 5. Check health

```bash
tto doctor --pretty
```

### 6. Enable auto mode

```bash
tto auto
```

### 7. Restart your AI CLI tool

Then type inside Codex / Claude Code / Gemini CLI / OpenCode:

```text
token thai auto
```

or:

```text
ลด token ไทย
```

---

## 📦 Requirements

- Node.js **18.0.0 or newer**
- npm
- Optional tokenizer packages:
  - `@dqbd/tiktoken`
  - `gpt-tokenizer`

The tool works without optional tokenizer packages by using a built-in heuristic estimator.

---

## 🚀 Install from GitHub

Use this section when installing directly from the GitHub repository:

```text
https://github.com/kittimasak/thai-token-optimizer
```

### 1. Clone the repository

```bash
git clone https://github.com/kittimasak/thai-token-optimizer.git
cd thai-token-optimizer
```

### 2. Check Node.js and npm

Thai Token Optimizer requires **Node.js 18.0.0 or newer**.

```bash
node -v
npm -v
```

If Node.js is older than 18, upgrade Node.js before continuing.

### 3. Install dependencies

```bash
npm install
```

### 4. Run tests

```bash
npm test
npm run ci
```

Expected result:

```text
75 tests passed
0 failed
package version: 1.0.0
```

### 5. Use the CLI directly from the repository

You can run the tool without global installation:

```bash
node bin/thai-token-optimizer.js status
node bin/thai-token-optimizer.js ui
node bin/thai-token-optimizer.js doctor --pretty
```

### 6. Register global CLI commands

To use the short commands `tto` and `thai-token-optimizer` globally:

```bash
npm link
```

Verify:

```bash
tto status
thai-token-optimizer status
```

If `tto` is not found, restart your terminal or check the npm global binary path:

```bash
npm bin -g
```

### 7. Backup existing AI tool configuration

Before installing integrations, create a backup:

```bash
tto backup all
```

Check backups:

```bash
tto backups
```

### 8. Install all supported integrations

```bash
tto install all
```

This installs integrations for:

- Codex
- Claude Code
- Gemini CLI
- OpenCode
- Cursor
- Aider
- Cline
- Roo Code

If you do not use global `tto`, run:

```bash
node bin/thai-token-optimizer.js install all
```

### 9. Install Codex AGENTS.md integration

If you use Codex, also run:

```bash
tto install-agents
```

This writes a managed block into:

```text
~/.codex/AGENTS.md
```

Managed block:

```text
<!-- Thai Token Optimizer START -->
...
<!-- Thai Token Optimizer END -->
```

### 10. Verify installation

```bash
tto doctor --pretty
```

Expected result should show `PASS` or actionable warnings:

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ 🩺 Thai Token Optimizer Doctor                                                  │
├────────────────────────────────────────────────────────────────────────────────┤
│ Mode          installed                                                        │
│ Status        PASS                                                             │
│ Package       1.0.0                                                            │
│ ✓ Package version remains 1.0.0                                                │
│ ✓ Node >= 18                                                                   │
│ ✓ Codex hooks installed                                                        │
│ ✓ Claude hooks installed                                                       │
│ ✓ Gemini CLI extension installed                                               │
│ ✓ OpenCode plugin installed                                                    │
│ ✓ Backup directory writable                                                    │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### 11. Enable Thai Token Optimizer

Recommended default mode:

```bash
tto auto
```

Other modes:

```bash
tto lite
tto full
tto safe
tto off
```

### 12. Show the Pretty CLI UI

```bash
tto ui
```

or:

```bash
tto dashboard
```

### 13. Restart your AI coding tools

After installation, restart the tools you use:

- Codex
- Claude Code
- Gemini CLI
- OpenCode
- Cursor
- Aider
- Cline
- Roo Code

Then type inside the AI tool:

```text
token thai auto
```

or:

```text
ลด token ไทย
```

Disable from inside the AI tool:

```text
token thai off
```

### 14. Install only one integration

Use these commands if you do not want to install everything.

#### Codex

```bash
tto backup codex
tto install codex
tto install-agents
tto doctor --pretty
```

Files involved:

```text
~/.codex/hooks.json
~/.codex/config.toml
~/.codex/AGENTS.md
```

#### Claude Code

```bash
tto backup claude
tto install claude
tto doctor --pretty
```

File involved:

```text
~/.claude/settings.json
```

#### Gemini CLI

```bash
tto backup gemini
tto install gemini
tto doctor --pretty
```

Files involved:

```text
~/.gemini/extensions/thai-token-optimizer/gemini-extension.json
~/.gemini/extensions/thai-token-optimizer/GEMINI.md
~/.gemini/extensions/thai-token-optimizer/commands/tto/*.toml
~/.gemini/settings.json
```

#### OpenCode

```bash
tto backup opencode
tto install opencode
tto doctor --pretty
```

Files involved:

```text
~/.config/opencode/plugins/thai-token-optimizer.js
~/.config/opencode/opencode.json
```

#### Cursor / Aider / Cline / Roo Code

```bash
tto install cursor
tto install aider
tto install cline
tto install roo
```

### 15. Test prompt compression

```bash
tto compress --pretty --level auto --budget 80 --target codex --check \
"ช่วยอธิบายรายละเอียดเกี่ยวกับการติดตั้ง Thai Token Optimizer v1.0 โดยห้ามเปลี่ยน package version 1.0.0"
```

### 16. Test safety classifier

```bash
tto classify --pretty "DROP TABLE users production secret token"
```

Expected behavior:

- Risk level should be high.
- Compression should relax to safe behavior.
- Recommended action should include backup, dry-run, verification, and rollback readiness.

### 17. Rollback if needed

Preview rollback first:

```bash
tto rollback latest --dry-run
```

Rollback latest backup:

```bash
tto rollback latest
```

Rollback only one target:

```bash
tto rollback gemini --dry-run
tto rollback gemini
```

### 18. Uninstall if needed

Uninstall all integrations:

```bash
tto uninstall all
```

Or uninstall one target:

```bash
tto uninstall codex
tto uninstall claude
tto uninstall gemini
tto uninstall opencode
tto uninstall cursor
tto uninstall aider
tto uninstall cline
tto uninstall roo
```

### Complete GitHub installation command set

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



---

## 🧭 Core design principles

| Principle | Meaning |
|---|---|
| **Compact Thai, not vague Thai** | Shorter answers must remain useful |
| **Correctness beats token saving** | Never corrupt commands, code, paths, versions, or config |
| **Safety beats brevity** | Risky tasks require backup, dry-run, verify, rollback |
| **Local-first** | Core CLI, hooks, compression, backup, benchmark, and doctor run locally |
| **Reversible installation** | Installer creates backups before changing configs |
| **Version stability** | This project remains `v1.0 / 1.0.0` |

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

## 🧩 Features

### Response optimization

- `auto`, `lite`, `full`, `safe`, `off`
- In-chat triggers such as `token thai auto`
- Profile-aware behavior
- Hook-based context injection
- Compact Thai output with technical preservation

### Prompt optimization

- `tto compress`
- `tto rewrite`
- `--budget` token target
- `--check` semantic preservation
- Code-aware compression
- Constraint lock for words such as `ต้อง`, `ห้าม`, `เด็ดขาด`, `v1.0`, `1.0.0`
- Adaptive Compression Learning with `tto keep`, `tto forget`, and `tto dictionary`
- User-specific Dictionary for jargon and writing style that must be preserved

### Safety

- Rule-based safety classifier
- Pre-tool guard hooks
- Safe mode override
- Backup / rollback guidance
- Production, database, auth, secret, and destructive-command detection

### Reliability

- `tto doctor`
- `tto doctor codex`
- `tto doctor claude`
- `tto doctor gemini`
- `tto doctor opencode`
- `tto backup`
- `tto backups`
- `tto rollback`
- `rollback --dry-run`
- automatic pre-rollback backup
- strict benchmark gate
- `npm test`
- `npm run ci`

### Pretty terminal UI

- `tto ui`
- `tto dashboard`
- `tto status --pretty`
- `tto doctor --pretty`
- `tto compress --pretty`
- `tto classify --pretty`
- `tto benchmark --pretty`

---

## ⚙️ Installation targets

### Install everything

```bash
tto install all
```

This installs integrations for:

- Codex
- Claude Code
- Gemini CLI
- OpenCode
- Cursor
- Aider
- Cline
- Roo Code

It creates a backup before writing configuration files.

### Install only Codex

```bash
tto install codex
```

Updates:

```text
~/.codex/hooks.json
~/.codex/config.toml
```

Ensures:

```toml
[features]
codex_hooks = true
```

If `codex_hooks = false` exists, it is replaced instead of duplicated.

### Install Codex AGENTS.md block

```bash
tto install-agents
```

Writes managed content into:

```text
~/.codex/AGENTS.md
```

inside:

```text
<!-- Thai Token Optimizer START -->
...
<!-- Thai Token Optimizer END -->
```

### Install only Claude Code

```bash
tto install claude
```

Updates:

```text
~/.claude/settings.json
```

### Install only Gemini CLI

```bash
tto install gemini
```

Creates:

```text
~/.gemini/extensions/thai-token-optimizer/gemini-extension.json
~/.gemini/extensions/thai-token-optimizer/GEMINI.md
~/.gemini/extensions/thai-token-optimizer/commands/tto/*.toml
~/.gemini/settings.json
```

### Install only OpenCode

```bash
tto install opencode
```

Creates:

```text
~/.config/opencode/plugins/thai-token-optimizer.js
~/.config/opencode/opencode.json
~/.config/opencode/agents/thai-token-optimizer.md
~/.config/opencode/skills/thai-token-optimizer.md
~/.config/opencode/commands/tto-auto.md
~/.config/opencode/commands/tto-safe.md
```

### Install portable adapters

```bash
tto install cursor
tto install aider
tto install cline
tto install roo
```

---

## 🎛️ Modes

| Mode | Command | Behavior | Best for |
|---|---|---|---|
| Auto | `tto auto` | Selects level automatically | Daily use |
| Lite | `tto lite` | Compact but still explanatory | Teaching, concepts, research |
| Full | `tto full` | Shortest useful Thai | Commands, debugging, code fixes |
| Safe | `tto safe` | Warning + backup + verify + rollback | Production, DB, security, destructive ops |
| Off | `tto off` | Disable optimizer | Normal behavior |

Examples:

```bash
tto auto
tto lite
tto full
tto safe
tto off
```

State is stored in:

```text
~/.thai-token-optimizer/state.json
```

---

## 🧑‍💻 Profiles

Profiles tune the optimizer for different tasks.

```bash
tto profile list
tto profile show
tto profile coding
tto profile research
tto profile teaching
tto profile paper
tto profile command
tto profile ultra
```

| Profile | Bias | Behavior |
|---|---|---|
| `coding` | `full` | Code/patch first, preserve paths/errors/commands |
| `research` | `lite` | Preserve reasoning, variables, methodology |
| `teaching` | `lite` | Step-based, compact, learner-friendly |
| `paper` | `safe` | Formal, preserves academic constraints |
| `command` | `full` | Terminal commands first |
| `ultra` | `full` | Maximum compression for low-risk work |

Example:

```bash
tto profile coding
tto auto
```

---

## 🧾 Policy configuration

User policy file:

```text
~/.thai-token-optimizer/config.json
```

Commands:

```bash
tto config init
tto config path
tto config get
tto config set defaultProfile coding
tto config set safetyMode strict
tto config set exactTokenizer true
tto config set benchmarkStrict.minAverageSavingPercent 10
```

Default policy shape:

```json
{
  "defaultMode": "auto",
  "defaultProfile": "coding",
  "safetyMode": "strict",
  "preservePoliteness": false,
  "preserveTechnicalTerms": true,
  "maxCompressionRatio": 0.6,
  "targetAgent": "auto",
  "exactTokenizer": false,
  "benchmarkStrict": {
    "minAverageSavingPercent": 10,
    "minTechnicalTermPreservationPercent": 95,
    "requireConstraintPreservationPercent": 100,
    "requireCodeBlockPreservationPercent": 100
  },
  "version": 1
}
```

Use default policy for reproducible CI:

```bash
tto benchmark --strict --default-policy
```

---

## 📚 CLI reference

### Help

```bash
tto help
```

### Status

```bash
tto status
tto status --pretty
```

### Mode commands

```bash
tto on
tto auto
tto lite
tto full
tto safe
tto off
tto stop
```

### Install

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

### Token estimation

```bash
tto estimate "ข้อความภาษาไทย"
tto estimate --target codex "ข้อความภาษาไทย"
tto estimate --target claude "ข้อความภาษาไทย"
tto estimate --target gemini "ข้อความภาษาไทย"
tto estimate --exact --target codex "ข้อความภาษาไทย"
```

### Prompt compression

```bash
tto compress "ช่วยอธิบายแนวทางการพัฒนาระบบอย่างละเอียด"
tto rewrite "ช่วยอธิบายแนวทางการพัฒนาระบบอย่างละเอียด"
tto compress --level auto prompt.txt
tto compress --level full prompt.txt
cat prompt.txt | tto compress --level auto
```

### Personalization

```bash
tto keep "รบกวนช่วย"
tto keep "API_KEY(foo)[bar]*"
tto dictionary
tto forget "รบกวนช่วย"
```

### Budget compression

```bash
tto compress --budget 500 --target codex prompt.txt
tto compress --level auto --budget 500 --target claude --check prompt.txt
tto compress --exact --budget 300 --target codex "ข้อความ..."
```

### Semantic preservation

```bash
tto preserve original.txt optimized.txt
```

### Safety classification

```bash
tto classify "DROP TABLE users production secret token"
tto classify --pretty "DROP TABLE users production secret token"
```

### Backup and rollback

```bash
tto backup all
tto backup codex
tto backup gemini
tto backups
tto rollback latest --dry-run
tto rollback latest
tto rollback gemini --dry-run
tto rollback gemini
tto rollback latest --no-prebackup
```

### Doctor

```bash
tto doctor
tto doctor codex
tto doctor codex --pretty
tto doctor --pretty
tto doctor --ci
```

### Benchmark

```bash
tto benchmark
tto benchmark --strict
tto benchmark --strict --default-policy
tto benchmark --pretty --strict --default-policy
```

---

## 💬 In-chat controls

Use inside Codex, Claude Code, Gemini CLI, OpenCode, or compatible tools.

| User message | Result |
|---|---|
| `token thai on` | Enable full mode |
| `token thai auto` | Enable auto mode |
| `token thai lite` | Enable lite mode |
| `token thai full` | Enable full mode |
| `token thai safe` | Enable safe mode |
| `token thai off` | Disable optimizer |
| `thai compact on` | Enable full mode |
| `ลด token ไทย` | Enable full mode |
| `ลด token ไทย auto` | Enable auto mode |
| `หยุดลด token` | Disable optimizer |
| `พูดปกติ` | Disable optimizer |

Plain text triggers are recommended for Codex because Codex may reserve slash commands.

---

## ✂️ Prompt compression

Example:

```bash
tto compress --pretty --level auto --budget 80 --target codex --check \
"ช่วยอธิบายรายละเอียดเกี่ยวกับการติดตั้ง Thai Token Optimizer v1.0 โดยห้ามเปลี่ยน package version 1.0.0"
```

Example output:

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ ✂️  Prompt Compression Result                                                  │
├────────────────────────────────────────────────────────────────────────────────┤
│ Target        codex                                                            │
│ Mode          auto                                                             │
│ Budget        80 tokens                                                        │
│                                                                                │
│ Before        42 tokens                                                        │
│ After         37 tokens                                                        │
│ Saved         5 tokens                                                         │
│ Ratio         ██░░░░░░░░░░░░░░░░░░  11.9%                                      │
│                                                                                │
│ Preservation  ████████████████████   100%                                      │
│ Risk          low                                                              │
│ Missing       0                                                                │
╰────────────────────────────────────────────────────────────────────────────────╯
```

If the budget is too small, the compressor prioritizes preservation over forced shortening.

---

## 🧠 Adaptive Compression Learning

Personalization makes Thai Token Optimizer v1.0 more than a static compression rule set. It can learn user-specific terms through a local User-specific Dictionary and protect those terms during compression.

Core idea:

```text
Static filler rules + User-specific keep dictionary = personalized compression
```

### When to use it

Use personalization when a word or phrase looks like filler to a generic compressor but carries meaning in your workflow, such as:

- team jargon
- internal system names
- feature or module names
- writing style that should remain intact
- prompt phrases that influence agent behavior
- tokens, config keys, labels, or identifiers that should not be touched

Examples:

```bash
tto keep "รบกวนช่วย"
tto keep "ระบบเทพ"
tto keep "API_KEY(foo)[bar]*"
```

After this, the compressor protects those terms during `tto compress` and `tto rewrite`.

### Commands

| Command | Purpose |
|---|---|
| `tto keep <word>` | Add a word or phrase to the personal dictionary so the compressor preserves it |
| `tto forget <word>` | Remove a word or phrase from the personal dictionary |
| `tto dictionary` | Show the words currently protected for this user |

Example workflow:

```bash
tto compress --level auto "รบกวนช่วยอธิบายขั้นตอนแบบละเอียดครับ"
tto keep "รบกวนช่วย"
tto compress --level auto "รบกวนช่วยอธิบายขั้นตอนแบบละเอียดครับ"
tto forget "รบกวนช่วย"
tto dictionary
```

Before `keep`, the phrase `รบกวนช่วย` may be treated as filler.  
After `keep`, it is preserved as part of the user's style.

### Persistent storage

The dictionary is stored locally at:

```text
~/.thai-token-optimizer/dictionary.json
```

If `TTO_HOME` or `THAI_TOKEN_OPTIMIZER_HOME` is set, the dictionary is stored under that directory:

```bash
TTO_HOME=/tmp/tto-home tto keep "ระบบเทพ"
```

File format:

```json
{
  "keep": [
    "รบกวนช่วย",
    "ระบบเทพ",
    "API_KEY(foo)[bar]*"
  ],
  "version": 1
}
```

The implementation uses an in-memory cache inside each process to avoid repeated disk reads. It also normalizes malformed dictionary files so empty values, duplicates, unexpected types, or hand-edited files do not crash compression.

### Parser-level protection

The personal dictionary is integrated into `tto-code-aware-parser.js`; it is not applied as a fragile post-compression string replacement.

Protection order:

1. Protected technical ranges such as code fences, inline code, URLs, paths, commands, versions, and env/config lines
2. User-specific keep dictionary
3. Filler/replacement compression
4. Constraint lock and preservation check

Technical structures remain the highest priority, then user-specific terms are protected before compression rules run.

### RegExp safety

Dictionary entries may contain special characters:

```bash
tto keep "API_KEY(foo)[bar]*"
```

Thai Token Optimizer escapes dictionary entries before building dynamic RegExp patterns, so these values do not break parsing or match unintended patterns.

### Overlapping terms

Overlapping entries are handled safely:

```bash
tto keep "ระบบ"
tto keep "ระบบเทพ"
```

Longer entries are prioritized so `ระบบเทพ` can be protected as a full phrase before shorter terms like `ระบบ`.

### Backup and rollback

`dictionary.json` is part of the user's learned behavior, so backup and rollback include it:

```bash
tto backup codex
tto rollback codex --dry-run
tto rollback codex
```

After rollback, the personal dictionary is restored to the snapshot state together with related state/config files.

### Limitations

- Learning is explicit: the user teaches terms with `tto keep`
- The tool does not yet infer important terms automatically from behavior
- The dictionary is local per machine and per `TTO_HOME`
- Very broad entries such as `ระบบ` may reduce compression opportunities because they are always protected

---

## 🛡️ Safety classifier

Example:

```bash
tto classify --pretty "DROP TABLE users production secret token"
```

Output:

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ 🛡️  Safety Classifier                                                          │
├────────────────────────────────────────────────────────────────────────────────┤
│ Risk Level     HIGH                                                            │
│ Compression    relaxed / safe                                                  │
│ Score          9                                                               │
│                                                                                │
│ Categories                                                                     │
│ • database_migration                                                           │
│ • production_deploy                                                            │
│ • security_secret                                                              │
│                                                                                │
│ Recommended Action                                                             │
│ 1. backup  2. dry-run  3. verify  4. rollback ready                            │
╰────────────────────────────────────────────────────────────────────────────────╯
```

Risk categories include:

| Category | Trigger examples |
|---|---|
| `database_migration` | `DROP TABLE`, `TRUNCATE`, `DELETE FROM`, migration |
| `production_deploy` | production, deploy, release, rollback, hotfix |
| `security_secret` | API key, secret, access token, password, private key |
| `destructive_command` | `rm -rf`, `git reset --hard`, `git push --force` |
| `auth_payment` | auth, permission, payment, billing |

---

## 🩺 Doctor

Run:

```bash
tto doctor --pretty
```

Example:

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ 🩺 Thai Token Optimizer Doctor                                                  │
├────────────────────────────────────────────────────────────────────────────────┤
│ Mode          installed                                                        │
│ Status        PASS                                                             │
│ Package       1.0.0                                                            │
│                                                                                │
│ ✓ Package version remains 1.0.0  1.0.0                                         │
│ ✓ Node >= 18                     22.16.0                                       │
│ ✓ CLI entry exists               bin/thai-token-optimizer.js                   │
│ ✓ Backup module exists           hooks/tto-backup.js                           │
│ ✓ Adapter module exists          adapters/index.js                             │
│ ✓ Benchmark golden cases exist   benchmarks/golden_cases.jsonl                 │
│ ✓ Codex hooks installed          ~/.codex/hooks.json                           │
│ ✓ Codex hooks feature flag       ~/.codex/config.toml                          │
│ ✓ Claude hooks installed         ~/.claude/settings.json                       │
│ ✓ Gemini CLI extension installed ~/.gemini/extensions/thai-token-optimizer     │
│ ✓ OpenCode plugin installed      ~/.config/opencode/plugins/thai-token-optimizer.js │
│ ✓ Backup directory writable      ~/.thai-token-optimizer/backups               │
╰────────────────────────────────────────────────────────────────────────────────╯
```

Use CI mode:

```bash
tto doctor --ci
```

---

## 📊 Benchmark

Run strict benchmark:

```bash
tto benchmark --pretty --strict --default-policy
```

Example:

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ 📊 Thai Token Optimizer Benchmark                                               │
├────────────────────────────────────────────────────────────────────────────────┤
│ Samples       8                                                                │
│ Average Save  ██░░░░░░░░░░░░░░░░░░  10.8%                                      │
│ Preservation  ████████████████████   100%                                      │
│ Strict Gate   PASS                                                             │
│                                                                                │
│ Cases                                                                          │
│ constraint-version            0%  preserve 100%                                │
│ code-command                  0%  preserve 100%                                │
│ db-safety                     0%  preserve 100%                                │
│ thai-filler-debug          30.3%  preserve 100%                                │
╰────────────────────────────────────────────────────────────────────────────────╯
```

Strict benchmark checks:

- average saving
- preservation score
- code/config preservation
- constraint preservation
- safety behavior
- version preservation

---

## 💾 Backup and rollback

### Backup

```bash
tto backup all
```

Example:

```json
{
  "backup": "20260509T101748787Z-6939-all",
  "target": "all",
  "files": 27,
  "root": "~/.thai-token-optimizer/backups"
}
```

### List backups

```bash
tto backups
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

- `rollback gemini` restores only Gemini files
- `rollback codex` restores only Codex files
- `rollback latest` follows latest backup target
- pre-rollback backup is created by default
- use `--no-prebackup` only when intentionally skipping safety backup

---

## 🔌 Integration details

### Codex

Files:

```text
~/.codex/hooks.json
~/.codex/config.toml
~/.codex/AGENTS.md
```

Hooks:

| Event | Script | Purpose |
|---|---|---|
| `SessionStart` | `hooks/tto-activate.js` | Inject compact Thai rules |
| `UserPromptSubmit` | `hooks/tto-mode-tracker.js` | Detect triggers and safety |
| `PreToolUse` | `hooks/tto-pretool-guard.js` | Add safety guidance |
| `PostToolUse` | `hooks/tto-posttool-summary.js` | Compact post-tool summary |
| `Stop` | `hooks/tto-stop-summary.js` | Compact final response |

### Claude Code

File:

```text
~/.claude/settings.json
```

Uses similar hook scripts for session, prompt, tool, and final summary events.

### Gemini CLI

Files:

```text
~/.gemini/extensions/thai-token-optimizer/gemini-extension.json
~/.gemini/extensions/thai-token-optimizer/GEMINI.md
~/.gemini/extensions/thai-token-optimizer/commands/tto/*.toml
~/.gemini/settings.json
```

Commands after restart:

```text
/tto:auto
/tto:lite
/tto:full
/tto:safe
/tto:off
/tto:status
/tto:compress <text>
/tto:estimate <text>
```

### OpenCode

Files:

```text
~/.config/opencode/plugins/thai-token-optimizer.js
~/.config/opencode/opencode.json
~/.config/opencode/agents/thai-token-optimizer.md
~/.config/opencode/skills/thai-token-optimizer.md
```

Adds:

- `tool.execute.before`
- `tool.execute.after`
- session compaction guidance
- environment hints

### Portable adapters

| Adapter | File |
|---|---|
| Cursor | `~/.cursor/rules/thai-token-optimizer.mdc` |
| Aider | `~/.aider/thai-token-optimizer.md` |
| Cline | `~/.cline/rules/thai-token-optimizer.md` |
| Roo Code | `~/.roo/rules/thai-token-optimizer.md` |

---

## 🏗️ Compression pipeline

```text
Input Thai prompt
  ↓
Code-aware parser
  ↓
User-specific dictionary protection
  ↓
Constraint locker
  ↓
Safety classifier
  ↓
Prompt compressor
  ↓
Budget compressor
  ↓
Semantic preservation checker
  ↓
Optimized prompt
```

Main modules:

| Module | Purpose |
|---|---|
| `tto-compressor.js` | Main prompt rewrite/compression engine |
| `tto-budget-compressor.js` | Compresses toward token budget |
| `tto-code-aware-parser.js` | Protects code/config/path/URL/command/version |
| `tto-config.js` | Stores state, policy home paths, and personal dictionary |
| `tto-constraint-locker.js` | Extracts and re-adds hard constraints |
| `tto-preservation-checker.js` | Checks missing protected items |
| `tto-token-estimator.js` | Estimates token savings |
| `tto-safety-classifier.js` | Detects risky content |
| `tto-ui.js` | Pretty terminal UI renderer |

---

## 🧪 Development and testing

Run tests:

```bash
npm test
```

Run CI checks:

```bash
npm run ci
```

Recommended manual checks:

```bash
node --check bin/thai-token-optimizer.js
tto doctor --ci
tto benchmark --strict --default-policy
tto ui
tto doctor --pretty
```


---

## 📁 Project structure

```text
thai-token-optimizer/
├── bin/
│   └── thai-token-optimizer.js
├── hooks/
│   ├── tto-activate.js
│   ├── tto-mode-tracker.js
│   ├── tto-pretool-guard.js
│   ├── tto-posttool-summary.js
│   ├── tto-stop-summary.js
│   ├── tto-compressor.js
│   ├── tto-budget-compressor.js
│   ├── tto-code-aware-parser.js
│   ├── tto-constraint-locker.js
│   ├── tto-preservation-checker.js
│   ├── tto-token-estimator.js
│   ├── tto-safety-classifier.js
│   ├── tto-backup.js
│   ├── tto-doctor.js
│   ├── tto-policy.js
│   ├── tto-profiles.js
│   └── tto-ui.js
├── adapters/
│   └── index.js
├── benchmarks/
│   ├── golden_cases.jsonl
│   └── run_benchmark.js
├── tests/
├── .codex-plugin/
├── .claude-plugin/
├── .github/
│   └── workflows/
├── README.md
├── MANUAL.md
├── AGENTS.md
├── package.json
└── LICENSE
```

---

## 🔐 Security notes

Thai Token Optimizer:

- does not call external APIs for core operation
- does not send prompts to remote services
- stores state locally under `~/.thai-token-optimizer/`
- modifies tool configs only during install/uninstall/rollback
- creates backups before config changes

Still, always inspect changes before using on production machines:

```bash
tto backup all
tto install all
tto doctor
```

For rollback-sensitive work:

```bash
tto rollback latest --dry-run
```

---

## ⚠️ Known limitations

- Token estimation is heuristic unless optional tokenizer packages are installed.
- Exact token counts vary by model and tokenizer.
- Hook behavior depends on each AI tool’s supported hook system.
- Some portable adapters are instruction-file based, not runtime hooks.
- Pretty UI is for humans; automation should use JSON/text output.
- The tool optimizes prompt/response style, not model reasoning quality.
- It is not a replacement for reviewing destructive commands manually.

---

## ❓ FAQ

### Is this a model?

No. It is a local CLI + hook + adapter pack.

### Does it call an external API?

No core feature requires network calls.

### Does it work without optional tokenizer packages?

Yes. It falls back to heuristic estimation.

### Can it reduce Thai prompt tokens?

Yes, through `tto compress` / `tto rewrite`.

### Can it force every answer to be extremely short?

Yes, with `tto full`, but risky operations automatically require safer behavior.

### Does `tto install all` change global config files?

Yes. It modifies supported tool config files, but creates backups first.

### Can I preview rollback?

Yes.

```bash
tto rollback latest --dry-run
```

### Can I disable it?

Yes.

```bash
tto off
tto uninstall all
```

### Why does the version remain 1.0.0?

This project intentionally locks the package identity at:

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

---

## 🗺️ Recommended workflow

```bash
npm install
npm test
npm run ci

tto backup all
tto install all
tto install-agents
tto doctor --pretty

tto auto
tto profile coding
tto ui
```

Then inside your AI coding tool:

```text
token thai auto
```

For risky work:

```text
token thai safe
```

For rollback:

```bash
tto rollback latest --dry-run
tto rollback latest
tto doctor
```

---

## 🧾 License

MIT

---

<div align="center">

## ⚡ Thai Token Optimizer v1.0

**Compact Thai. Safe commands. Preserved meaning.**

```text
package version: 1.0.0
```

</div>
