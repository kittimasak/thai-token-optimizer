<!--
============================================================================
Thai Token Optimizer v2.0
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

# Thai Token Optimizer

<div align="center">

## Compact Thai for AI Coding Agents

**Thai Token Optimizer (TTO) v2.0** is a local-first `CLI + hooks + adapters` system for reducing Thai token usage while preserving technical correctness, safety constraints, and reproducibility.

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Thai Token Optimizer v2.0                                                 │
│ package version: 2.0.0                                                    │
│ principle: reduce token without losing safety/correctness/constraints     │
└────────────────────────────────────────────────────────────────────────────┘
```

![Version](https://img.shields.io/badge/version-v2.0-blue)
![Package](https://img.shields.io/badge/package-2.0.0-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![UI](https://img.shields.io/badge/UI-Terminal%20CLI-orange)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

</div>

---

## Table of Contents

```text
┌─ Start Here ───────────────────────────────────────────────────────────────┐
│ 1) Value Proposition      4) Installation          5) Quick Start Lane     │
│ 2) Integration Matrix     6) Command Surface       7) Visual Workflows     │
│ 3) System Architecture    8) Modes and Profiles    9) Personalization      │
├─ Advanced ─────────────────────────────────────────────────────────────────┤
│ 10) MTP / Speculative     11) Fleet Analytics      12) Backup/Rollback     │
│ 13) Terminal UI           14) Policy and Config    15) CI Pipeline          │
├─ Operations ───────────────────────────────────────────────────────────────┤
│ 16) Real Reduction        17) Runtime Artifacts    18) Troubleshooting      │
│ 19) Development           20) Safety Checklist     22) Shell Proxy Mode     │
│ 21) License                                                                │
└────────────────────────────────────────────────────────────────────────────┘
```

## 1) Value Proposition

```text
┌────────────────────────────── BEFORE ──────────────────────────────────────┐
│ Thai prompt/reply is long, repetitive, expensive, and mixed with commands. │
└───────────────────────────────────┬────────────────────────────────────────┘
                                    v
┌─────────────────────────────── TTO v2 ─────────────────────────────────────┐
│ compact Thai + code-aware preservation + safety mode + rollback discipline │
└───────────────────────────────────┬────────────────────────────────────────┘
                                    v
┌────────────────────────────── AFTER ───────────────────────────────────────┐
│ fewer tokens while commands, paths, versions, constraints remain exact     │
└────────────────────────────────────────────────────────────────────────────┘
```

TTO reduces token waste while protecting:

- exact commands
- code fences and inline code
- paths and URLs
- versions and config keys
- hard constraints
- safety-critical instructions
- rollback reproducibility

Core rule:

```text
Tokens can be reduced, but correctness, safety, and key constraints must not be reduced.
```

---

## Capability Map

```text
┌─ Compression ────────────────┬─ Safety ─────────────────┬─ Operations ──────┐
│ filler removal               │ task classifier           │ doctor            │
│ semantic dedup               │ safe mode                 │ quality score     │
│ selective context window     │ hard-constraint lock      │ coach mode        │
│ budget optimizer             │ preservation checker      │ ops scan          │
│ MTP speculative candidates   │ rollback-first workflow   │ fleet audit       │
├─ Integration ────────────────┼─ Personalization ────────┼─ CI / Research ───┤
│ Codex hooks                  │ tto keep                  │ strict benchmark  │
│ Claude Code hooks            │ tto forget                │ MTP gate          │
│ Gemini extension             │ user dictionary           │ drift history     │
│ OpenCode plugin              │ code-aware protection     │ calibration gate  │
│ OpenClaw / Hermes adapters   │ local persistent state    │ tto proxy (new)   │
└──────────────────────────────┴──────────────────────────┴──────────────────┘
```

---

## 2) Integration Matrix

| Target | Integration Type | Install Command |
|---|---|---|
| Codex | hooks + AGENTS injection | `tto install codex` |
| Claude Code | hooks in settings | `tto install claude` |
| Gemini CLI | extension + hooks | `tto install gemini` |
| OpenCode | native plugin + config | `tto install opencode` |
| OpenClaw | managed hook + config | `tto install openclaw` |
| Hermes Agent | shell hooks + plugin hooks + config | `tto install hermes` |
| Cursor | rule adapter | `tto install cursor` |
| Aider | rule adapter | `tto install aider` |
| Cline | rule adapter | `tto install cline` |
| Roo Code | rule adapter | `tto install roo` |

Install everything:

```bash
tto install all
```

---

## 3) System Architecture (v2)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                           USER / AGENT INPUT                              │
│  prompt text | hook payload | file input | benchmark corpus | session log  │
└───────────────────────────────────┬────────────────────────────────────────┘
                                    v
┌────────────────────────────────────────────────────────────────────────────┐
│                         CONTROL AND RISK LAYER                             │
│  mode tracker -> profile selector -> safety classifier -> policy defaults  │
└───────────────────────────────────┬────────────────────────────────────────┘
                                    v
┌────────────────────────────────────────────────────────────────────────────┐
│                         COMPRESSION PIPELINE                               │
│  code-aware parser                                                         │
│  semantic analyzer                                                         │
│  personalization dictionary                                                │
│  semantic dedup + repeated phrase collapse                                 │
│  selective window + budget optimizer                                       │
│  MTP speculative candidate families                                        │
└───────────────────────────────────┬────────────────────────────────────────┘
                                    v
┌────────────────────────────────────────────────────────────────────────────┐
│                         VERIFICATION LAYER                                 │
│  constraint locker -> preservation checker -> safety fallback -> reports   │
└───────────────────────────────────┬────────────────────────────────────────┘
                                    v
┌────────────────────────────────────────────────────────────────────────────┐
│                         OUTPUT AND OPERATIONS                              │
│  CLI text/json/pretty | hook context | dashboard | fleet | ci artifacts    │
└────────────────────────────────────────────────────────────────────────────┘
```

Core runtime files:

- `bin/thai-token-optimizer.js`
- `hooks/tto-compressor.js`
- `hooks/tto-budget-compressor.js`
- `hooks/tto-code-aware-parser.js`
- `hooks/tto-constraint-locker.js`
- `hooks/tto-preservation-checker.js`
- `hooks/tto-safety-classifier.js`
- `hooks/tto-ui.js`
- `hooks/tto-runtime-analytics.js`
- `hooks/tto-fleet-audit.js`

---

## 4) Installation

### Requirements

- Node.js `>=18`

### Local install

```bash
npm install
npm test
```

### Run via node

```bash
node bin/thai-token-optimizer.js status --pretty
```

### Optional global command

```bash
npm link
tto status --pretty
```

---

## 5) Quick Start Lane

```text
┌────────────┐   ┌────────────┐   ┌───────────────┐   ┌────────────┐
│  backup    │ > │  install   │ > │ install-agents│ > │   doctor   │
└────────────┘   └────────────┘   └───────────────┘   └──────┬─────┘
                                                               v
                                                        ┌────────────┐
                                                        │  tto auto  │
                                                        └──────┬─────┘
                                                               v
                                                        ┌────────────┐
                                                        │ agent chat │
                                                        └────────────┘
```

```bash
tto backup all
tto install all
tto install-agents
tto doctor --pretty
tto auto
```

In chat/session:

```text
token thai auto
```

---

## 6) Command Surface

```text
MODE
  on|auto | lite | full | safe | off|stop

STATUS/UI
  status [--pretty]
  ui
  dashboard [--view overview|quality|waste|trend|agents|doctor|fleet]

COMPRESSION
  compress [--pretty] [--level auto|lite|full|safe] [--budget N]
           [--target codex|claude] [--check] [--speculative|--no-speculative]
           [--diagnostics] [text|file]
  rewrite
  estimate [--target codex|claude] [--exact] <text>
  preserve <originalFile> <optimizedFile>
  classify [--pretty] <text>

HEALTH / QUALITY
  doctor [target] [--pretty]
  quality [--pretty]
  coach [--pretty] [--apply quick|safe]

OPS / FLEET
  ops [--pretty] | scan|audit|context|quality|drift|validate [options]
  fleet [--roots dir1,dir2] [--pretty] [--doctor]
        [--doctor-target all|codex|claude|gemini|opencode|openclaw|hermes]
        [--calibration] [--calibration-limit N] [--session-scan]
  context [--pretty]

CALIBRATION / CHECKPOINT / CACHE
  calibration status|record|from-stats|clear [--pretty]
  checkpoint status|list|capture|restore|precompact|postcompact [--pretty]
  cache stats|clear [--pretty]

BACKUP / INSTALL
  backup [target]
  backups
  rollback [latest|id|target] [--dry-run]
  install <target|all>
  uninstall <target|all>
  install-agents [codex]

PERSONALIZATION
  keep <word>
  forget <word>
  dictionary

BENCHMARK
  benchmark [--pretty] [--strict] [--default-policy] [--mtp]
```

---

## 7) Visual Workflows

### 7.1 Compression lane

```text
┌────────┐   ┌──────────┐   ┌──────────────────┐   ┌──────────────┐   ┌────────┐
│ input  │ > │ classify │ > │ compress / MTP   │ > │ preservation │ > │ output │
└────────┘   └──────────┘   └──────────────────┘   └──────────────┘   └────────┘
```

```bash
tto compress --pretty --level auto --target codex --budget 500 --check prompt.txt
```

```bash
tto compress --speculative --diagnostics "..."
```

```bash
tto compress --no-speculative "..."
```

### 7.2 Safety lane

```bash
tto classify --pretty "DROP TABLE users production secret"
```

### 7.3 Health lane

```bash
tto doctor --pretty
tto doctor codex --pretty
tto doctor --ci
```

### 7.4 Benchmark lane

```bash
tto benchmark --pretty --strict --default-policy --mtp
```

### 7.5 Fleet lane

```bash
tto fleet --pretty --roots /path/repoA,/path/repoB --doctor --calibration --session-scan
```

### 7.6 Ops lane

```bash
tto ops --pretty
tto ops scan --pretty
```

### 7.7 Calibration lane

```bash
tto calibration status --pretty
tto calibration record --estimated 1000 --real 1200 --target codex
tto calibration from-stats --real-total 24000 --samples 20 --target codex
```

### 7.8 Checkpoint and cache lane

```bash
tto checkpoint status --pretty
tto checkpoint capture --pretty "before major rewrite"
tto checkpoint restore latest --pretty

tto cache stats --pretty
tto cache clear
```

---

## 8) Modes and Profiles

Modes:

- `auto`: adaptive default
- `lite`: compact with a bit more explanation
- `full`: tighter output for low-risk tasks
- `safe`: safety-first output
- `off`: disable optimizer behavior

Commands:

```bash
tto auto
tto lite
tto full
tto safe
tto off
```

Profiles:

```bash
tto profile list
tto profile show
tto profile coding
```

---

## 9) Personalization (Adaptive Compression Learning)

```text
User dictionary = words that must never be compressed away
```

```bash
tto keep "team-specific term"
tto forget "team-specific term"
tto dictionary
```

Behavior:

- persisted local dictionary
- integrated with code-aware protection
- supports special characters safely

---

## 10) MTP / Speculative Decoding

Candidate families:

- `baseline`
- `semantic_dedup`
- `selective_window`
- `dedup_plus_selective`

```text
┌────────────┐  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│ baseline   │  │ semantic_dedup │  │ selective_window │  │ dedup_plus_selective │
└─────┬──────┘  └────────┬───────┘  └────────┬─────────┘  └──────────┬───────────┘
      └──────────────────┴──────────────────┴───────────────────────┘
                                  v
                    ┌─────────────────────────────┐
                    │ preservation + budget score │
                    └──────────────┬──────────────┘
                                   v
                    ┌─────────────────────────────┐
                    │ selected candidate + reason │
                    └─────────────────────────────┘
```

Key behavior:

- `--speculative` and `--no-speculative` precedence
- diagnostics with selected family/level/reason
- tie-break preference for `dedup_plus_selective` when preservation is equal
- benchmark gates for preservation, hit-rate, slowdown, enhanced gain, fixture guard, action routing

Commands:

```bash
tto compress --speculative --diagnostics "..."
tto benchmark --strict --default-policy --mtp
```

---

## 11) Fleet and Session Analytics

`fleet` aggregates cross-project signals:

- benchmark status
- doctor health
- calibration gap
- session scan totals
- detector findings and estimated waste/cost

Session parser adapters:

- Codex
- Claude
- OpenClaw
- Hermes
- OpenCode

Related scripts:

```bash
npm run fleet:fixtures
npm run fleet:history
npm run fleet:gate
```

---

## 12) Backup / Rollback / Uninstall

```bash
tto backup all
tto backup codex
```

```bash
tto backups
```

```bash
tto rollback latest --dry-run
tto rollback latest
tto rollback codex
```

```bash
tto uninstall codex
tto uninstall all
```

---

## 13) Terminal UI (No Web Dashboard)

```text
tto ui
  ├─ overview
  ├─ quality
  ├─ waste
  ├─ trend
  ├─ agents
  ├─ doctor
  └─ fleet
```

Example dashboard shape:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Thai Token Optimizer v2.0.0                                                │
├────────────────────────────────────────────────────────────────────────────┤
│ Mode      auto        Profile   coding        Safety   strict              │
│ Doctor    PASS/WARN   Quality   S/A/B/C/F     MTP      PASS/FAIL           │
│ Saving    tokens reduced while preserving commands, paths, versions        │
├────────────────────────────────────────────────────────────────────────────┤
│ Commands   tto doctor --pretty | tto benchmark --strict --default-policy   │
│ Views      overview | quality | waste | trend | agents | doctor | fleet    │
└────────────────────────────────────────────────────────────────────────────┘
```

```bash
tto ui
tto dashboard --view overview
tto dashboard --view quality
tto dashboard --view waste
tto dashboard --view trend
tto dashboard --view agents
tto dashboard --view doctor
tto dashboard --view fleet
```

### 13.1 Real UI Showcase

The following examples come from actual TTO v2 command runs through the current terminal renderer, not a mock UI. Values on each machine may vary based on local state, installed adapters, benchmark artifacts, and the active policy.

#### Status UI

Use this as the fastest way to check whether TTO is enabled, which mode/profile/safety setting is active, and what command should be run next.

```bash
tto status --pretty
```

```text
╭──────────────────────────────────────────────────────────────────────╮
│ ⚡ Thai Token Optimizer v2.0.0                                        │
├──────────────────────────────────────────────────────────────────────┤
│ Compact Thai responses for AI coding agents                          │
│                                                                      │
│ Status        ● ACTIVE                                               │
│ Mode          auto                                                   │
│ Profile       coding                                                 │
│ Safety        strict                                                 │
│ Version       2.0.0                                                  │
│                                                                      │
│ Token Saving  ░░░░░░░░░░░░░░░░░░░░    0%                             │
│                                                                      │
│ Quick Commands                                                       │
│ tto auto       tto compress --pretty --budget 500 prompt.txt         │
│ tto doctor     tto benchmark --pretty --strict --default-policy      │
╰──────────────────────────────────────────────────────────────────────╯
```

#### Quality UI

Use this after benchmark or CI to view the overall quality score together with strict gate, MTP gate, routing gate, weak signals, and suggested actions.

```bash
tto quality --pretty
```

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ 🧠 TTO Quality Score                                                            │
├────────────────────────────────────────────────────────────────────────────────┤
│ Score         ███████████████░ 95.8/100                                        │
│ Grade         S                                                                │
│ Strict Gate   PASS                                                             │
│ MTP Gate      PASS                                                             │
│ Routing Gate  PASS                                                             │
│                                                                                │
│ Weak Signals                                                                   │
│ • low_saving_cluster                                                           │
│ • tool_cascade                                                                 │
│                                                                                │
│ Suggested Actions                                                              │
│ • add_tool_circuit_breaker: After 2 consecutive tool failures, stop retri…     │
│ • tune_selective_window: Increase selective-window aggressiveness for low…     │
╰────────────────────────────────────────────────────────────────────────────────╯
```

#### Compression UI

Use this when you want an easy-to-read compression result showing before/after tokens, saved tokens, preservation score, risk, and an optimized prompt example.

```bash
tto compress --pretty --level auto --target codex --budget 120 --check "..."
```

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ ✂️  Prompt Compression Result                                                  │
├────────────────────────────────────────────────────────────────────────────────┤
│ Target        codex                                                            │
│ Mode          auto                                                             │
│ Budget        120 tokens                                                       │
│                                                                                │
│ Before        53 tokens                                                        │
│ After         48 tokens                                                        │
│ Saved         5 tokens                                                         │
│ Ratio         ██░░░░░░░░░░░░░░░░░░   9.4%                                      │
│                                                                                │
│ Preservation  ████████████████████   100%                                      │
│ Risk          low                                                              │
│ Missing       0                                                                │
│                                                                                │
│ Optimized                                                                      │
│   Explain how to use Thai Token Optimizer v2.0 in detail while preserving tto doct… │
╰────────────────────────────────────────────────────────────────────────────────╯
```

#### Benchmark UI

Use this as the main screen for release/CI confidence because it combines the strict regression gate and MTP comparison in one place.

```bash
tto benchmark --pretty --strict --default-policy --mtp
```

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ 📊 Thai Token Optimizer v2.0.0 Benchmark                                        │
├────────────────────────────────────────────────────────────────────────────────┤
│ Samples       8                                                                │
│ Average Save  ██░░░░░░░░░░░░░░░░░░    12%                                      │
│ Preservation  ████████████████████   100%                                      │
│ Strict Gate   PASS                                                             │
│                                                                                │
│ MTP Compare  ON                                                                │
│ Normal ms    1.3 (p95 3.7)                                                     │
│ Spec ms      11.3 (p95 16)                                                     │
│ Delta ms     10                                                                │
│ Spec Hits    7/8 (87.5%)                                                       │
│ MTP Gate     PASS                                                              │
╰────────────────────────────────────────────────────────────────────────────────╯
```

#### Fleet UI

Use this to audit multiple projects or agents while viewing benchmark, calibration, session scan, detector, cost, and coverage from an organizational perspective.

```bash
tto fleet --pretty --calibration --session-scan
```

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ 🌐 Fleet / Organization View                                                    │
├────────────────────────────────────────────────────────────────────────────────┤
│ Projects      1                                                                │
│ Benchmarks    1                                                                │
│ Strict PASS   1                                                                │
│ MTP PASS      1                                                                │
│ Route PASS    1                                                                │
│ Avg Quality   90                                                               │
│ Avg Saving    12%                                                              │
│ Waste total   2                                                                │
│ Calibration   ON (limit 50)                                                    │
│ SessionScan   ON                                                               │
│ Runs/Cost     0 runs | input 0 | cost ~$0                                      │
│ Detectors    0 findings | waste 0 tok | ~$0/mo                                 │
│                                                                                │
│ Coverage      Codex:1 Claude:1 CI:1                                            │
╰────────────────────────────────────────────────────────────────────────────────╯
```

#### Coach UI

Use this when the system still passes overall quality checks but has weak signals or anti-patterns that should be addressed with a plan, without having to infer from raw numbers yourself.

```bash
tto coach --pretty
```

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ 🧭 TTO Coach Mode (Guided Remediation)                                          │
├────────────────────────────────────────────────────────────────────────────────┤
│ Health Score  ███████████████░ 95.8/100                                        │
│ Health Grade  S                                                                │
│ Summary       grade=S; weak=2; antiPatterns=2                                  │
│                                                                                │
│ Anti-patterns                                                                  │
│ • tool_cascade | medium | agent-runtime-owner | Repeated tool cycles may add … │
│ • low_saving_cluster | medium | compression-engine-owner | Low-value narrativ… │
│                                                                                │
│ Fix Plan                                                                       │
│ • step-1 | medium | developer | Run `tto quality --pretty` and `tto…           │
│ • step-2 | medium | developer | Capture checkpoint before optimizat…           │
│ • step-3b | medium | agent-runtime-owner | After repeated tool cycles, stop a… │
│ • step-3d | medium | compression-engine-owner | Tune selective compression fo… │
│                                                                                │
│ Applied       NO                                                               │
│ • no auto-remediation                                                          │
╰────────────────────────────────────────────────────────────────────────────────╯
```

---

## 14) Policy and Config

```bash
tto config path
tto config get
tto config set benchmarkStrict.mtpRepeats 9
```

Policy controls include:

- strict saving gate
- MTP preservation/hit-rate/slowdown thresholds
- enhanced corpus minimum gain
- detector thresholds for routing

---

## 15) CI Pipeline

```bash
npm run ci
```

Current CI flow from `package.json`:

```text
1) npm run test:ci
2) node bin/thai-token-optimizer.js benchmark --strict --default-policy --mtp
3) node bin/thai-token-optimizer.js doctor --ci
```

---

## 16) Real Reduction Snapshot

Latest local real comparison (`without TTO` vs `with TTO`, 18 cases):

```text
┌──────────────────────┬────────┬───────────────┬──────────────┐
│ Mode                 │ Tokens │ Saved         │ Preservation │
├──────────────────────┼────────┼───────────────┼──────────────┤
│ without TTO          │ 1789   │ baseline      │ n/a          │
│ with TTO normal      │ 1344   │ -445 / -24.9% │ 100% min     │
│ with TTO MTP/spec    │ 1334   │ -455 / -25.4% │ 100% min     │
└──────────────────────┴────────┴───────────────┴──────────────┘
```

### Token Reduction Comparison Table

```text
┌──────────────────┬────────────────────────────────┬────────────────────────────────────────────────┬───────────────────────────────────────────┐
│ Comparison Topic │ Thai                           │ English                                        │ Mixed Language (Thai & English)           │
├──────────────────┼────────────────────────────────┼────────────────────────────────────────────────┼───────────────────────────────────────────┤
│ Avg. Reduction   │ 30% - 50%                      │ 15% - 60%                                      │ 25% - 45%                                 │
│ Core Mechanism   │ Filler Removal / Summarization │ Selective Windowing (Masking) / Prose Trimming │ Technical Anchor Compression              │
│ What is Reduced  │ Polite words, conjunctions     │ Logs, Stack Traces, general prose              │ Thai surrounding technical terms          │
│ What is Preserved│ Key meaning, numbers, units    │ Code, Paths, Versions, JSON Keys               │ Tech terms & Constraints in both languages│
└──────────────────┴────────────────────────────────┴────────────────────────────────────────────────┴───────────────────────────────────────────┘
```

Notes:

- strict technical/safety prompts may intentionally reduce little
- estimator may be heuristic unless exact tokenizer dependencies are installed

---

## 17) Runtime Files and Artifacts

```text
┌─ Local State ──────────────────────────────────────────────────────────────┐
│ state.json              mode/profile/speculative flags                     │
│ stats.jsonl             runtime stats                                      │
│ dictionary.json          personalization words from tto keep               │
│ policy.json              benchmark and compression policy                  │
├─ Runtime Analytics ────────────────────────────────────────────────────────┤
│ checkpoint JSONL         checkpoint lifecycle                              │
│ cache read log           repeated read analytics                           │
│ calibration JSONL        estimated vs real token gap                       │
├─ Benchmark Artifacts ──────────────────────────────────────────────────────┤
│ benchmarks/regression_report.md                                            │
│ benchmarks/regression_report.json                                          │
│ benchmarks/regression_history.jsonl                                        │
│ benchmarks/fleet_history.jsonl                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 18) Troubleshooting

### Hook JSON issue: UserPromptSubmit

```text
UserPromptSubmit hook failed
error: hook returned invalid user prompt submit JSON output
```

```bash
tto doctor codex --pretty
node --test tests/test_codex_triggers.js tests/test_tracker.js
```

### Hook JSON issue: Stop

```text
Stop hook failed
error: hook returned invalid stop hook JSON output
```

```bash
tto doctor --pretty
node --test tests/test_activate.js tests/test_pretty_ui.js
```

### CI timeout or flaky gate

```bash
npm run test:ci
```

Inspect artifacts:

- `benchmarks/regression_report.md`
- `benchmarks/regression_report.json`

---

## 19) Development Quick Reference

Important directories:

```text
thai-token-optimizer/
├── bin/          CLI entrypoint
├── hooks/        core engine, hooks, analytics, UI
├── adapters/     integration installers
├── benchmarks/   corpora, reports, gates
├── tests/        regression and integration tests
├── .codex-plugin/
├── .claude-plugin/
├── .github/
├── README.md
├── AGENTS.md
├── MANUAL.md
├── package.json
└── LICENSE
```

Focused test runs:

```bash
node --test tests/test_mtp_speculative.js tests/test_mtp_benchmark.js tests/test_mtp_detectors.js
node --test tests/test_pretty_ui.js tests/test_fleet_auditor.js
```

---

## 20) Safety Checklist (for risky operations)

```text
[1] classify risk
[2] backup first
[3] dry-run when available
[4] apply change
[5] verify result
[6] keep rollback ready
```

Example:

```bash
tto backup all
tto rollback latest --dry-run
tto doctor --pretty
```

---

## 22) Shell Proxy Mode (TTO-Proxy)

TTO-Proxy wraps shell commands to compress their output **before** it reaches the AI agent. This saves input tokens and helps the AI focus on critical errors.

### 22.1 Basic Usage

```bash
tto proxy <command> [args...]
tto run <command> [args...]
```

Example:

```bash
tto proxy npm run test
tto run git status
```

### 22.2 Agent Integration

Configure your agent to use TTO-Proxy as a tool wrapper (e.g., in `.claude/settings.json`):

```json
{
  "tools": {
    "BashCommand": {
      "wrapper": "tto proxy --silent --"
    }
  }
}
```

---

## 21) License

MIT License

See [LICENSE](LICENSE).
