<!--
============================================================================
Thai Token Optimizer v2.0
============================================================================
คำอธิบาย :
เครื่องมือเพิ่มประสิทธิภาพ token ภาษาไทยสำหรับ AI coding agents ที่ยังคงรักษาความถูกต้องของคำสั่ง โค้ด และรายละเอียดทางเทคนิค

ผู้เขียน     : Dr.Kittimasak Naijit
Repository  : https://github.com/kittimasak/thai-token-optimizer

Copyright (c) 2026 Dr.Kittimasak Naijit

หมายเหตุ:
- ห้ามลบการรักษาส่วนสำคัญแบบ code-aware, การตรวจสอบความปลอดภัย หรือพฤติกรรม rollback
- ไฟล์นี้เป็นส่วนหนึ่งของระบบ Thai Token Optimizer แบบ local-first สำหรับ CLI/hook
============================================================================
-->

# Thai Token Optimizer

<div align="center">

## ภาษาไทยแบบกระชับสำหรับ AI Coding Agents

**Thai Token Optimizer (TTO) v2.0** คือระบบแบบ local-first ในรูปแบบ `CLI + hooks + adapters` สำหรับลดการใช้ token ภาษาไทย พร้อมรักษาความถูกต้องทางเทคนิค ข้อจำกัดด้านความปลอดภัย และความสามารถในการทำซ้ำผลลัพธ์

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

## สารบัญ

```text
┌─ เริ่มต้นที่นี่ ──────────────────────────────────────────────────────────┐
│ 1) คุณค่าหลักของระบบ     4) การติดตั้ง          5) เส้นทางเริ่มต้นเร็ว │
│ 2) ตารางการผสานระบบ     6) ชุดคำสั่ง            7) Workflow แบบภาพ    │
│ 3) สถาปัตยกรรมระบบ      8) โหมดและโปรไฟล์       9) การปรับเฉพาะบุคคล │
├─ ขั้นสูง ─────────────────────────────────────────────────────────────────┤
│ 10) MTP / Speculative     11) Fleet Analytics      12) Backup/Rollback   │
│ 13) Terminal UI           14) Policy and Config    15) CI Pipeline        │
├─ การปฏิบัติการ ───────────────────────────────────────────────────────────┤
│ 16) การลด token จริง      17) Runtime Artifacts    18) การแก้ปัญหา      │
│ 19) การพัฒนา              20) Safety Checklist     22) Shell Proxy Mode │
│ 21) License                                                                │
└────────────────────────────────────────────────────────────────────────────┘
```

## 1) คุณค่าหลักของระบบ

```text
┌────────────────────────────── ก่อนใช้ ────────────────────────────────────┐
│ prompt/คำตอบภาษาไทยยาว ซ้ำ เปลืองค่าใช้จ่าย และปะปนกับคำสั่ง            │
└───────────────────────────────────┬────────────────────────────────────────┘
                                    v
┌─────────────────────────────── TTO v2 ─────────────────────────────────────┐
│ ภาษาไทยกระชับ + รักษาโค้ดแบบ code-aware + safety mode + วินัย rollback │
└───────────────────────────────────┬────────────────────────────────────────┘
                                    v
┌────────────────────────────── หลังใช้ ────────────────────────────────────┐
│ token น้อยลง โดยคำสั่ง path version และ constraints ยังถูกต้องครบถ้วน   │
└────────────────────────────────────────────────────────────────────────────┘
```

TTO ลด token ที่สูญเปล่า พร้อมปกป้องสิ่งต่อไปนี้:

- คำสั่งที่ต้องตรงทุกตัวอักษร
- code fences และ inline code
- path และ URL
- version และ config keys
- hard constraints
- คำสั่งที่สำคัญด้านความปลอดภัย
- ความสามารถในการ rollback เพื่อทำซ้ำได้

กฎหลัก:

```text
ลด token ได้ แต่ห้ามลดความถูกต้อง ความปลอดภัย หรือเงื่อนไขสำคัญ
```

---

## แผนที่ความสามารถ

```text
┌─ การบีบอัด ───────────────┬─ ความปลอดภัย ────────────┬─ การปฏิบัติการ ───┐
│ ลบคำฟุ่มเฟือย             │ ตัวจำแนกประเภทงาน        │ doctor            │
│ ลบความหมายซ้ำ             │ safe mode                 │ quality score     │
│ Aggressive Log Dedup      │ hard-constraint lock      │ coach mode        │
│ Dynamic Masking           │ preservation checker      │ ops scan          │
│ Sequence Detection        │ rollback-first workflow   │ fleet audit       │
│ Smart Middle-Truncation   │ budget optimizer          │ context audit     │
│ MTP speculative candidates │                           │ tto proxy (ใหม่)  │
└────────────────────────────┴──────────────────────────┴──────────────────┘
```

---

## 2) ตารางการผสานระบบ

| เป้าหมาย | ประเภทการผสานระบบ | คำสั่งติดตั้ง |
|---|---|---|
| Codex | hooks + AGENTS injection | `tto install codex` |
| Claude Code | hooks ใน settings | `tto install claude` |
| Gemini CLI | extension + hooks | `tto install gemini` |
| OpenCode | native plugin + config | `tto install opencode` |
| OpenClaw | managed hook + config | `tto install openclaw` |
| Hermes Agent | shell hooks + plugin hooks + config | `tto install hermes` |
| Cursor | rule adapter | `tto install cursor` |
| Aider | rule adapter | `tto install aider` |
| Cline | rule adapter | `tto install cline` |
| Roo Code | rule adapter | `tto install roo` |

ติดตั้งทั้งหมด:

```bash
tto install all
```

---

## 3) สถาปัตยกรรมระบบ (v2)

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

ไฟล์ runtime หลัก:

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

## 4) การติดตั้ง

### ข้อกำหนด

- Node.js `>=18`

### ติดตั้งแบบ local

```bash
npm install
npm test
```

### รันผ่าน node

```bash
node bin/thai-token-optimizer.js status --pretty
```

### คำสั่ง global แบบเลือกใช้ได้

```bash
npm link
tto status --pretty
```

---

## 5) เส้นทางเริ่มต้นเร็ว

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

ใน chat/session:

```text
token thai auto
```

---

## 6) ชุดคำสั่ง

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

## 7) Workflow แบบภาพ

### 7.1 เส้นทางการบีบอัด

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

### 7.2 เส้นทางความปลอดภัย

```bash
tto classify --pretty "DROP TABLE users production secret"
```

### 7.3 เส้นทางตรวจสุขภาพ

```bash
tto doctor --pretty
tto doctor codex --pretty
tto doctor --ci
```

### 7.4 เส้นทาง benchmark

```bash
tto benchmark --pretty --strict --default-policy --mtp
```

### 7.5 เส้นทาง fleet

```bash
tto fleet --pretty --roots /path/repoA,/path/repoB --doctor --calibration --session-scan
```

### 7.6 เส้นทาง ops

```bash
tto ops --pretty
tto ops scan --pretty
```

### 7.7 เส้นทาง calibration

```bash
tto calibration status --pretty
tto calibration record --estimated 1000 --real 1200 --target codex
tto calibration from-stats --real-total 24000 --samples 20 --target codex
```

### 7.8 เส้นทาง checkpoint และ cache

```bash
tto checkpoint status --pretty
tto checkpoint capture --pretty "before major rewrite"
tto checkpoint restore latest --pretty

tto cache stats --pretty
tto cache clear
```

---

## 8) โหมดและโปรไฟล์

โหมด:

- `auto`: ค่าเริ่มต้นแบบปรับตัวได้
- `lite`: กระชับ แต่มีคำอธิบายเพิ่มเล็กน้อย
- `full`: ผลลัพธ์แน่นขึ้นสำหรับงานความเสี่ยงต่ำ
- `safe`: ผลลัพธ์ที่ให้ความปลอดภัยเป็นอันดับแรก
- `off`: ปิดพฤติกรรม optimizer

คำสั่ง:

```bash
tto auto
tto lite
tto full
tto safe
tto off
```

โปรไฟล์:

```bash
tto profile list
tto profile show
tto profile coding
```

---

## 9) การปรับเฉพาะบุคคล (Adaptive Compression Learning)

```text
User dictionary = คำที่ห้ามถูกบีบอัดหรือตัดออก
```

```bash
tto keep "คำเฉพาะของทีม"
tto forget "คำเฉพาะของทีม"
tto dictionary
```

พฤติกรรม:

- dictionary แบบ local ที่ถูกบันทึกคงอยู่
- ผสานกับการปกป้องแบบ code-aware
- รองรับอักขระพิเศษได้อย่างปลอดภัย

---

## 10) MTP / Speculative Decoding

กลุ่ม candidate:

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

พฤติกรรมสำคัญ:

- ลำดับความสำคัญของ `--speculative` และ `--no-speculative`
- diagnostics พร้อม selected family/level/reason
- กรณีคะแนน preservation เท่ากัน จะให้ความสำคัญกับ `dedup_plus_selective`
- benchmark gates สำหรับ preservation, hit-rate, slowdown, enhanced gain, fixture guard, action routing

คำสั่ง:

```bash
tto compress --speculative --diagnostics "..."
tto benchmark --strict --default-policy --mtp
```

---

## 11) Fleet และ Session Analytics

`fleet` รวมสัญญาณข้ามโปรเจกต์:

- สถานะ benchmark
- สุขภาพจาก doctor
- ช่องว่าง calibration
- ผลรวม session scan
- สิ่งที่ detector พบ และ waste/cost โดยประมาณ

adapter สำหรับ parser ของ session:

- Codex
- Claude
- OpenClaw
- Hermes
- OpenCode

สคริปต์ที่เกี่ยวข้อง:

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

## 13) Terminal UI (ไม่มี Web Dashboard)

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

ตัวอย่างรูปแบบ dashboard:

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

### 13.1 ตัวอย่าง UI จริง

ตัวอย่างต่อไปนี้มาจากการรันคำสั่งจริงของ TTO v2 ผ่าน terminal renderer ปัจจุบัน ไม่ใช่ mock UI ค่าในแต่ละเครื่องอาจเปลี่ยนตาม local state, adapter ที่ติดตั้ง, benchmark artifacts และ policy ที่ใช้งาน

#### Status UI

ใช้ตรวจสถานะเร็วที่สุดว่า TTO เปิดอยู่หรือไม่ อยู่ mode/profile/safety ใด และควรรันคำสั่งถัดไปอะไร

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

ใช้หลัง benchmark หรือ CI เพื่อดูคะแนนคุณภาพรวม พร้อมสถานะ strict gate, MTP gate, routing gate, weak signals และ suggested actions

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

ใช้เมื่ออยากเห็นผลบีบอัดแบบอ่านง่าย มี token ก่อน/หลัง, จำนวน token ที่ประหยัด, preservation score, risk และตัวอย่าง optimized prompt

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
│   อธิบายวิธีใช้งาน Thai Token Optimizer v2.0 ละเอียด โดยต้องคงคำสั่ง tto doct… │
╰────────────────────────────────────────────────────────────────────────────────╯
```

#### Benchmark UI

ใช้เป็นหน้าจอหลักสำหรับ release/CI confidence เพราะรวม strict regression gate และ MTP comparison ในจุดเดียว

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

ใช้ audit หลายโปรเจกต์หรือหลาย agent พร้อมดู benchmark, calibration, session scan, detector, cost และ coverage ในมุมองค์กร

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

ใช้เมื่อระบบยังผ่านคุณภาพรวม แต่มี weak signals หรือ anti-patterns ที่ควรแก้ต่อแบบมีแผน ไม่ต้องเดาเองจากตัวเลขดิบ

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
│ • step-2 | medium | developer | Capture checkpoint before optimizat…          │
│ • step-3b | medium | agent-runtime-owner | After repeated tool cycles, stop a… │
│ • step-3d | medium | compression-engine-owner | Tune selective compression fo… │
│                                                                                │
│ Applied       NO                                                               │
│ • no auto-remediation                                                          │
╰────────────────────────────────────────────────────────────────────────────────╯
```

---

## 14) Policy และ Config

```bash
tto config path
tto config get
tto config set benchmarkStrict.mtpRepeats 9
```

policy controls ประกอบด้วย:

- strict saving gate
- MTP preservation/hit-rate/slowdown thresholds
- enhanced corpus minimum gain
- detector thresholds สำหรับ routing

---

## 15) CI Pipeline

```bash
npm run ci
```

ลำดับ CI ปัจจุบันจาก `package.json`:

```text
1) npm run test:ci
2) node bin/thai-token-optimizer.js benchmark --strict --default-policy --mtp
3) node bin/thai-token-optimizer.js doctor --ci
```

---

## 16) Snapshot การลด token จริง

การเปรียบเทียบจริงล่าสุดในเครื่อง (`without TTO` เทียบกับ `with TTO`, 18 กรณี):

```text
┌──────────────────────┬────────┬───────────────┬──────────────┐
│ Mode                 │ Tokens │ Saved         │ Preservation │
├──────────────────────┼────────┼───────────────┼──────────────┤
│ without TTO          │ 1789   │ baseline      │ n/a          │
│ with TTO normal      │ 1344   │ -445 / -24.9% │ 100% min     │
│ with TTO MTP/spec    │ 1334   │ -455 / -25.4% │ 100% min     │
└──────────────────────┴────────┴───────────────┴──────────────┘
```

### ตารางเปรียบเทียบการลด Token

```text
┌──────────────────┬────────────────────────────────┬────────────────────────────────────────────────┬───────────────────────────────────────────┐
│ หัวข้อเปรียบเทียบ    │ ภาษาไทย (Thai)                 │ ภาษาอังกฤษ (English)                            │ Mixed Language (ไทยผสมอังกฤษ)              │
├──────────────────┼────────────────────────────────┼────────────────────────────────────────────────┼───────────────────────────────────────────┤
│ อัตราการลดเฉลี่ย    │ 30% - 50%                      │ 15% - 98% (Logs/ALD)                           │ 25% - 60%                                 │
│ กลไกหลัก          │ Filler Removal / สรุปความประโยค │ Aggressive Log Dedup / Sequence Detection      │ Technical Anchor Compression              │
│ สิ่งที่ถูกลดออก     │ คำสุภาพ, คำเชื่อม, วลีเกริ่นนำ   │ Repeated Logs, Timestamps, Stack Traces        │ ภาษาไทยรอบข้าง Technical terms             │
│ สิ่งที่ถูกรักษาไว้    │ ใจความสำคัญ, ตัวเลข, หน่วย      │ Code, Paths, Versions, JSON Keys               │ Technical terms และ Constraints ทั้ง 2 ภาษา │
└──────────────────┴────────────────────────────────┴────────────────────────────────────────────────┴───────────────────────────────────────────┘
```

#### Aggressive Log Deduplication (ALD) [v2.0+]
ระบบบีบอัด Log ขั้นสูงที่สามารถลด Token ได้ถึง **98%++** สำหรับข้อมูลเชิงเทคนิค:
- **Dynamic Masking:** ปกปิดข้อมูลตัวแปร (Timestamp, UUID, Hex, IPs) อัตโนมัติเพื่อให้เห็นโครงสร้างที่แท้จริง
- **Sequence Detection:** ตรวจจับชุดลำดับบรรทัดที่ซ้ำกัน (เช่น `[RUN]` ตามด้วย `[PASS]`) แม้ข้อมูลภายในจะเปลี่ยน
- **Maximum Capacity:** สามารถลด Log ปริมาณมหาศาล (1,000+ บรรทัด) เหลือเพียง 1-2 บรรทัดสรุป

#### Smart Middle-Truncation (SMT) [v2.0+]
เทคนิคการจัดการ Token เมื่อข้อมูลยาวเกินงบประมาณ (Budget) โดยไม่ใช้วิธีตัดท้ายทิ้งเพียงอย่างเดียว:
- **Head-Tail Preservation:** รักษา "จุดประสงค์" (ตอนต้น) และ "ผลลัพธ์" (ตอนท้าย) ไว้เสมอ
- **Context Continuity:** เจาะรูเฉพาะส่วนกลางที่เป็นรายละเอียดปลีกย่อย ช่วยให้ AI Agent ไม่เสียตรรกะการทำงาน
- **Iterative Pruning:** ย่อรายละเอียดแบบเป็นลำดับขั้นเพื่อให้พอดีกับ Budget ที่จำกัดมากที่สุด

---

หมายเหตุ:

- prompt ที่เข้มงวดด้านเทคนิค/ความปลอดภัย อาจตั้งใจลด token ได้น้อย
- estimator อาจเป็นแบบ heuristic เว้นแต่ติดตั้ง exact tokenizer dependencies แล้ว

---

## 17) Runtime Files และ Artifacts

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

## 18) การแก้ปัญหา

### ปัญหา Hook JSON: UserPromptSubmit

```text
UserPromptSubmit hook failed
error: hook returned invalid user prompt submit JSON output
```

```bash
tto doctor codex --pretty
node --test tests/test_codex_triggers.js tests/test_tracker.js
```

### ปัญหา Hook JSON: Stop

```text
Stop hook failed
error: hook returned invalid stop hook JSON output
```

```bash
tto doctor --pretty
node --test tests/test_activate.js tests/test_pretty_ui.js
```

### CI timeout หรือ flaky gate

```bash
npm run test:ci
```

ตรวจสอบ artifacts:

- `benchmarks/regression_report.md`
- `benchmarks/regression_report.json`

---

## 19) Quick Reference สำหรับการพัฒนา

ไดเรกทอรีสำคัญ:

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

การรันทดสอบแบบเจาะจง:

```bash
node --test tests/test_mtp_speculative.js tests/test_mtp_benchmark.js tests/test_mtp_detectors.js
node --test tests/test_pretty_ui.js tests/test_fleet_auditor.js
```

---

## 20) Safety Checklist (สำหรับการทำงานที่มีความเสี่ยง)

```text
[1] classify risk
[2] backup first
[3] dry-run when available
[4] apply change
[5] verify result
[6] keep rollback ready
```

ตัวอย่าง:

```bash
tto backup all
tto rollback latest --dry-run
tto doctor --pretty
```

---

## 22) Shell Proxy Mode (TTO-Proxy)

TTO-Proxy ใช้ครอบคำสั่ง Shell เพื่อบีบอัด Output ภาษาไทยหรือ Log ที่ซ้ำซ้อนก่อนที่ AI Agent จะได้อ่าน ช่วยประหยัด Input Token ตั้งแต่ "ต้นน้ำ"

### 22.1 การใช้งานพื้นฐาน

```bash
tto proxy <command> [args...]
tto run <command> [args...]
```

ตัวอย่าง:

```bash
tto proxy npm run test
tto run git status
```

### 22.2 การผสานกับ AI Agents

คุณสามารถตั้งค่าให้ Agent เรียกใช้ TTO-Proxy อัตโนมัติสำหรับคำสั่ง Bash (เช่นใน `.claude/settings.json`):

```json
{
  "tools": {
    "BashCommand": {
      "wrapper": "tto proxy --silent --"
    }
  }
}
```

### 22.3 Specialized Command Lenses (การบีบอัดแบบเข้าใจบริบท)

TTO-Proxy มาพร้อมกับฟีเจอร์ "Lenses" หรือฟิลเตอร์เฉพาะทางสำหรับแต่ละคำสั่ง (เช่น `git`, `docker`, `npm`) เพื่อการบีบอัดที่แม่นยำยิ่งขึ้น:
*   **Git Lens:** รู้วิธีอ่านและแปล Output ของ `git status` ภาษาไทยที่ยาวและเป็นทางการ ให้กลายเป็นสัญลักษณ์ทางเทคนิคที่สั้นกระชับ (เช่น `ไฟล์ที่ถูกแก้ไขแต่ยังไม่ได้จัดเตรียมสำหรับการ commit` → `[!] ไม่ได้ stage:` หรือ `[M]`)
*   **ความแม่นยำสูง:** ตัด "น้ำ" ออกจากคำสั่งเฉพาะทางก่อนที่จะส่งให้ ALD/SMT ช่วยลด Token ได้กว่า 90%
*   **รองรับ Mixed Language:** ทำงานได้อย่างสมบูรณ์แบบไม่ว่า Tool จะพ่น Output ออกมาเป็นภาษาไทย, ภาษาอังกฤษ, หรือผสมกัน โดยยังคงรักษา Path และข้อมูลเทคนิคไว้ 100%

---

## 21) License

MIT License

ดู [LICENSE](LICENSE)
