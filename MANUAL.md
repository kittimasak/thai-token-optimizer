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

# Thai Token Optimizer v1.0 — คู่มือการใช้งาน CLI UI + Agent/Hook UI ครบทุกคำสั่ง

> คู่มือฉบับนี้อธิบายการใช้งาน **Thai Token Optimizer v1.0** ผ่าน **CLI UI** และ **Agent/Hook UI** พร้อมตัวอย่างคำสั่งและตัวอย่างการแสดงผลแบบ Pretty Terminal UI

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

---

## 1. ภาพรวมระบบ

**Thai Token Optimizer v1.0** เป็นเครื่องมือสำหรับลด token ภาษาไทยและปรับพฤติกรรม AI coding agents ให้ตอบไทยแบบกระชับ แต่ยังรักษาความถูกต้อง ความปลอดภัย และรายละเอียดทางเทคนิค เช่น command, path, config, error, version และ constraint สำคัญ

ระบบนี้ไม่ได้เป็น Web UI แต่มี UI จริง 2 แบบ:

```text
Thai Token Optimizer UI
├── CLI UI
│   ├── ใช้งานผ่าน Terminal ด้วยคำสั่ง tto ...
│   ├── แสดงผลเป็น JSON, report, table และ Pretty Terminal UI
│   └── ใช้ควบคุม mode, profile, install, doctor, benchmark, backup, rollback
│
└── Agent/Hook UI
    ├── ใช้งานผ่าน Codex, Claude Code, Gemini CLI, OpenCode ฯลฯ
    ├── ผู้ใช้พิมพ์คำสั่งเช่น token thai auto
    └── hook เปลี่ยนพฤติกรรม agent ให้ตอบไทยสั้น ปลอดภัย และ preserve technical details
```

รองรับ agent/tools:

| Tool | Integration type | คำสั่งติดตั้ง |
|---|---|---|
| Codex | hooks + `AGENTS.md` | `tto install codex` |
| Claude Code | hooks ใน `settings.json` | `tto install claude` |
| Gemini CLI | extension + custom commands | `tto install gemini` |
| OpenCode | native plugin + config | `tto install opencode` |
| Cursor | rule file | `tto install cursor` |
| Aider | instruction file | `tto install aider` |
| Cline | rule file | `tto install cline` |
| Roo Code | rule file | `tto install roo` |

---

## 2. การติดตั้งพื้นฐาน

### 2.1 แตกไฟล์และติดตั้ง dependency

```bash
unzip thai-token-optimizer-v1.0-pretty-cli-ui-pack.zip
cd thai-token-optimizer
npm install
```

### 2.2 ทดสอบระบบ

```bash
npm test
npm run ci
```

ผลที่คาดหวัง:

```text
75 tests passed
0 failed
package version: 1.0.0
```

### 2.3 ใช้คำสั่ง CLI โดยตรง

```bash
node bin/thai-token-optimizer.js status
```

ถ้าติดตั้งเป็น package หรือมี symlink แล้วจะใช้ได้แบบนี้:

```bash
tto status
thai-token-optimizer status
```

---

## 3. Help / Usage UI

ใช้ดูคำสั่งทั้งหมดแบบย่อ:

```bash
tto help
```

ตัวอย่างการแสดงผล:

```text
thai-token-optimizer v1.0 <command> [target]

Commands:
  on|auto                 Enable auto mode
  lite                    Enable lite mode
  full                    Enable full mode
  safe                    Enable safe mode
  off|stop                Disable optimizer
  status [--pretty]       Show state
  ui|dashboard            Show pretty terminal dashboard
  doctor [target] [--pretty] Health check target: all|codex|claude|gemini|opencode
  backup [target]         Create config backup
  backups                 List backups
  rollback [latest|id|target] [--dry-run] Restore backup
  install <target|all>    Install hooks/adapters with backup
  uninstall <target|all>  Remove hooks/adapters with backup
  install-agents [codex]  Merge AGENTS.md into ~/.codex/AGENTS.md with backup
  estimate [--target codex|claude] [--exact] <text> Estimate tokens
  compress [--pretty] [--level auto|lite|full|safe] [--budget N] [--target codex|claude] [--check] [text|file]
  rewrite                 Alias of compress
  preserve <originalFile> <optimizedFile> Check semantic preservation
  classify [--pretty] <text> Run safety classifier
  benchmark [--pretty] [--strict] [--default-policy] Run benchmark

Pretty UI:
  tto ui
  tto status --pretty
  tto doctor --pretty
  tto doctor codex --pretty
  tto compress --pretty --budget 500 prompt.txt
  tto classify --pretty "DROP TABLE users production"
  tto benchmark --pretty --strict --default-policy

Aliases:
  tto auto
  tto lite
  tto full
  tto off
```

> หมายเหตุ: ถ้าเรียก `tto` โดยไม่ใส่ command ระบบจะแสดง `status` เป็นค่า default

---

## 4. Pretty CLI UI

Pretty CLI UI คือหน้าจอแบบกรอบสวยใน Terminal ใช้กับคำสั่งเหล่านี้:

```bash
tto ui
tto dashboard
tto status --pretty
tto doctor --pretty
tto compress --pretty --budget 500 prompt.txt
tto classify --pretty "DROP TABLE users production"
tto benchmark --pretty --strict --default-policy
```

### 4.1 Dashboard: `tto ui` / `tto dashboard`

```bash
tto ui
```

ตัวอย่างการแสดงผล:

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

ใช้สำหรับดูภาพรวมในหน้าเดียว:

- สถานะเปิด/ปิด
- mode ปัจจุบัน
- profile ปัจจุบัน
- safety mode
- doctor summary
- saving preview
- agent integrations
- quick commands

### 4.2 Status แบบ Pretty

```bash
tto status --pretty
```

ตัวอย่างขณะปิดระบบ:

```text
╭──────────────────────────────────────────────────────────────────────╮
│ ⚡ Thai Token Optimizer v1.0                                          │
├──────────────────────────────────────────────────────────────────────┤
│ Compact Thai responses for AI coding agents                          │
│                                                                      │
│ Status        ○ OFF                                                  │
│ Mode          auto                                                   │
│ Profile       coding                                                 │
│ Safety        strict                                                 │
│ Version       1.0.0                                                  │
│                                                                      │
│ Token Saving  █████████████░░░░░░░   63%                             │
│                                                                      │
│ Quick Commands                                                       │
│ tto auto       tto compress --pretty --budget 500 prompt.txt         │
│ tto doctor     tto benchmark --pretty --strict --default-policy      │
╰──────────────────────────────────────────────────────────────────────╯
```

ตัวอย่างหลังเปิด `auto`:

```text
╭──────────────────────────────────────────────────────────────────────╮
│ ⚡ Thai Token Optimizer v1.0                                          │
├──────────────────────────────────────────────────────────────────────┤
│ Compact Thai responses for AI coding agents                          │
│                                                                      │
│ Status        ● ACTIVE                                               │
│ Mode          auto                                                   │
│ Profile       coding                                                 │
│ Safety        strict                                                 │
│ Version       1.0.0                                                  │
│                                                                      │
│ Token Saving  █████████████░░░░░░░   63%                             │
│                                                                      │
│ Quick Commands                                                       │
│ tto auto       tto compress --pretty --budget 500 prompt.txt         │
│ tto doctor     tto benchmark --pretty --strict --default-policy      │
╰──────────────────────────────────────────────────────────────────────╯
```

---

## 5. Mode commands

ใช้ควบคุมระดับการลด token และลักษณะการตอบ

| Command | ความหมาย | เหมาะกับ |
|---|---|---|
| `tto on` | เปิดระบบแบบ auto | ใช้งานทั่วไป |
| `tto auto` | เปิด auto mode | ให้ระบบเลือกระดับเอง |
| `tto lite` | ตอบกระชับแต่ยังอธิบาย | สอน, concept, research |
| `tto full` | สั้นที่สุดที่ยังใช้งานได้ | debug, command, code fix |
| `tto safe` | โหมดปลอดภัย | production, DB, secret, rollback |
| `tto off` | ปิดระบบ | กลับสู่พฤติกรรมปกติ |
| `tto stop` | alias ของ `off` | ปิดระบบ |

### 5.1 เปิด Auto mode

```bash
tto auto
```

ตัวอย่าง output:

```text
Thai Token Optimizer v1.0: ON auto
```

### 5.2 เปิด Lite mode

```bash
tto lite
```

ตัวอย่าง output:

```text
Thai Token Optimizer v1.0: ON lite
```

### 5.3 เปิด Full mode

```bash
tto full
```

ตัวอย่าง output:

```text
Thai Token Optimizer v1.0: ON full
```

### 5.4 เปิด Safe mode

```bash
tto safe
```

ตัวอย่าง output:

```text
Thai Token Optimizer v1.0: ON safe
```

### 5.5 ปิดระบบ

```bash
tto off
# หรือ
 tto stop
```

ตัวอย่าง output:

```text
Thai Token Optimizer v1.0: OFF
```

---

## 6. Status command

### 6.1 JSON status

```bash
tto status
```

ตัวอย่าง output:

```json
{
  "name": "Thai Token Optimizer",
  "versionLabel": "v1.0",
  "statePath": "~/.thai-token-optimizer/state.json",
  "statsPath": "~/.thai-token-optimizer/stats.jsonl",
  "enabled": true,
  "level": "auto",
  "profile": "coding",
  "safetyMode": "strict",
  "version": 1
}
```

### 6.2 Pretty status

```bash
tto status --pretty
```

ตัวอย่าง:

```text
╭──────────────────────────────────────────────────────────────────────╮
│ ⚡ Thai Token Optimizer v1.0                                          │
├──────────────────────────────────────────────────────────────────────┤
│ Compact Thai responses for AI coding agents                          │
│                                                                      │
│ Status        ● ACTIVE                                               │
│ Mode          auto                                                   │
│ Profile       coding                                                 │
│ Safety        strict                                                 │
│ Version       1.0.0                                                  │
│                                                                      │
│ Token Saving  █████████████░░░░░░░   63%                             │
│                                                                      │
│ Quick Commands                                                       │
│ tto auto       tto compress --pretty --budget 500 prompt.txt         │
│ tto doctor     tto benchmark --pretty --strict --default-policy      │
╰──────────────────────────────────────────────────────────────────────╯
```

---

## 7. Profile System

Profile ใช้ปรับลักษณะการตอบตามงาน

| Profile | เหมาะกับ | พฤติกรรม |
|---|---|---|
| `coding` | coding/debug/refactor | code/patch ก่อน อธิบายสั้น |
| `research` | งานวิจัย | คงเหตุผล วิธีวิจัย citation intent |
| `teaching` | อธิบายให้นักศึกษา | สั้นแต่เป็นขั้น มีตัวอย่าง |
| `paper` | academic writing | เป็นทางการ คงกรอบวิชาการ |
| `command` | terminal/devops | command ก่อน ผลลัพธ์คาดหวัง |
| `ultra` | ลด token สูงสุด | ใช้เฉพาะงานไม่เสี่ยง |

### 7.1 ดู profile ทั้งหมด

```bash
tto profile list
```

ตัวอย่าง output:

```json
[
  {
    "name": "coding",
    "levelBias": "full",
    "preserveCode": true,
    "response": "โค้ด/patch ก่อน อธิบายสั้น คง path/version/command/error exact"
  },
  {
    "name": "research",
    "levelBias": "lite",
    "preserveCode": true,
    "response": "คงเหตุผล วิธีวิจัย สมมติฐาน ตัวแปร และ citation intent"
  },
  {
    "name": "teaching",
    "levelBias": "lite",
    "preserveCode": true,
    "response": "สั้นแต่เป็นขั้น อธิบายศัพท์จำเป็นด้วยตัวอย่าง"
  },
  {
    "name": "command",
    "levelBias": "full",
    "preserveCode": true,
    "response": "คำสั่ง terminal ก่อน ผลลัพธ์คาดหวัง และข้อควรระวังสั้น"
  },
  {
    "name": "paper",
    "levelBias": "safe",
    "preserveCode": true,
    "response": "ภาษาเป็นทางการ คงกรอบวิชาการ/ข้อจำกัด/ตัวเลข"
  },
  {
    "name": "ultra",
    "levelBias": "full",
    "preserveCode": true,
    "response": "ลด token สูงสุด ใช้ bullet/fragment เฉพาะงานไม่เสี่ยง"
  }
]
```

### 7.2 ดู profile ปัจจุบัน

```bash
tto profile show
# หรือ
 tto profile
```

ตัวอย่าง output:

```json
{
  "profile": "coding",
  "levelBias": "full",
  "preserveCode": true,
  "response": "โค้ด/patch ก่อน อธิบายสั้น คง path/version/command/error exact"
}
```

### 7.3 ตั้ง profile

```bash
tto profile coding
tto profile research
tto profile teaching
tto profile paper
tto profile command
tto profile ultra
```

ตัวอย่าง `tto profile coding`:

```json
{
  "profile": "coding",
  "statePath": "/mnt/data/tto_home_manual/.thai-token-optimizer/state.json",
  "rules": {
    "profile": "coding",
    "levelBias": "full",
    "preserveCode": true,
    "response": "โค้ด/patch ก่อน อธิบายสั้น คง path/version/command/error exact"
  }
}
```

---

## 8. Policy Config

Policy config เก็บค่ากลางของระบบ เช่น default mode, profile, safety mode, exact tokenizer และ strict benchmark thresholds

ตำแหน่งไฟล์:

```text
~/.thai-token-optimizer/config.json
```

### 8.1 สร้าง config เริ่มต้น

```bash
tto config init
```

ตัวอย่าง output:

```text
/mnt/data/tto_home_manual/.thai-token-optimizer/config.json
```

### 8.2 ดู path config

```bash
tto config path
```

ตัวอย่าง:

```text
~/.thai-token-optimizer/config.json
```

### 8.3 ดู config

```bash
tto config get
```

ตัวอย่าง output:

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
  "adapters": {
    "codex": true,
    "claude": true,
    "cursor": false,
    "aider": false,
    "opencode": true,
    "gemini": true,
    "cline": false,
    "roo": false
  },
  "version": 1
}
```

### 8.4 ตั้งค่า config

```bash
tto config set defaultMode auto
tto config set defaultProfile coding
tto config set safetyMode strict
tto config set exactTokenizer true
tto config set benchmarkStrict.minAverageSavingPercent 10
```

ตัวอย่าง output:

```json
{
  "defaultMode": "auto",
  "defaultProfile": "coding",
  "safetyMode": "strict"
}
```

---

## 9. Token Estimator

ใช้ประมาณ token ของข้อความภาษาไทยตาม target agent/model

### 9.1 Estimate แบบ heuristic

```bash
tto estimate --target codex "ช่วยอธิบายการติดตั้ง Thai Token Optimizer v1.0 โดยห้ามเปลี่ยน package version 1.0.0"
```

ตัวอย่าง output:

```json
{
  "chars": 83,
  "thaiChars": 34,
  "latinWords": 7,
  "symbols": 3,
  "newlines": 0,
  "target": "codex",
  "estimatedTokens": 31,
  "exact": false,
  "tokenizer": "heuristic"
}
```

### 9.2 Exact tokenizer mode

```bash
tto estimate --exact --target codex "ข้อความภาษาไทย"
```

พฤติกรรม:

- ถ้ามี optional tokenizer เช่น `@dqbd/tiktoken` หรือ `gpt-tokenizer` จะใช้ exact tokenizer
- ถ้าไม่มี จะ fallback เป็น heuristic
- ห้ามอ้างว่า exact ถ้าระบบ fallback แล้ว

### 9.3 Targets ที่ใช้ได้

```text
codex
claude
gemini
opencode
```

---

## 10. Prompt Compressor / Rewrite

ใช้ย่อ prompt ภาษาไทยโดย preserve technical details

### 10.1 Compress ข้อความโดยตรง

```bash
tto compress "ช่วยอธิบายแนวทางการติดตั้งระบบอย่างละเอียด"
```

### 10.2 Rewrite เป็น alias ของ compress

```bash
tto rewrite "ช่วยอธิบายแนวทางการติดตั้งระบบอย่างละเอียด"
```

### 10.3 Compress จากไฟล์

```bash
tto compress --level auto prompt.txt
```

### 10.4 Compress จาก stdin

```bash
cat prompt.txt | tto compress --level auto
```

### 10.5 Compress to budget

```bash
tto compress --budget 500 --target codex prompt.txt
```

### 10.6 Compress พร้อม preservation check

```bash
tto compress --level auto --budget 500 --target codex --check prompt.txt
```

### 10.7 Pretty compress UI

```bash
tto compress --pretty --level auto --budget 80 --target codex --check "ช่วยอธิบายรายละเอียดเกี่ยวกับการติดตั้ง Thai Token Optimizer v1.0 โดยห้ามเปลี่ยน package version 1.0.0"
```

ตัวอย่าง output:

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
│                                                                                │
│ Optimized                                                                      │
│   ช่วยอธิบายรายละเอียดการติดตั้ง Thai Token Optimizer v1.0 โดยห้ามเปลี่ยน pac… │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### 10.8 Options ของ compress/rewrite

| Option | ความหมาย |
|---|---|
| `--pretty` | แสดงผลแบบ Pretty CLI UI |
| `--level auto` | เลือกระดับเองตาม prompt/profile/safety |
| `--level lite` | ย่อแบบยังอธิบายพอเข้าใจ |
| `--level full` | ย่อมากที่สุดที่ยังใช้ได้ |
| `--level safe` | ย่อแบบปลอดภัย ไม่ตัด warning/backup/rollback |
| `--budget N` | พยายามลดให้ใกล้ token budget |
| `--target codex` | ประมาณ token สำหรับ Codex |
| `--target claude` | ประมาณ token สำหรับ Claude |
| `--exact` | ใช้ exact tokenizer ถ้ามี |
| `--check` | ตรวจ semantic preservation |

### 10.9 Unknown flag behavior

ถ้าใส่ flag ผิด ระบบต้อง error ทันที ไม่เอา flag ไปนับเป็น input text

```bash
tto compress --unknown prompt.txt
```

ตัวอย่าง output:

```text
Unknown option: --unknown
```

---

## 11. Semantic Preservation Check

ใช้ตรวจว่า optimized prompt ยังรักษาสาระสำคัญจาก original หรือไม่

```bash
tto preserve original.txt optimized.txt
```

ตัวอย่าง output:

```json
{
  "preservationPercent": 100,
  "risk": "low",
  "missingCount": 0,
  "missing": []
}
```

ใช้หลัง compress เมื่อต้องการความมั่นใจว่า version, command, path, constraint ไม่หาย

---

## 12. Safety Classifier

ใช้ตรวจ prompt หรือคำสั่งที่เสี่ยง เช่น database, production, secret, auth, payment, destructive command

### 12.1 JSON safety classification

```bash
tto classify "DROP TABLE users production secret token"
```

ตัวอย่าง output:

```json
{
  "safeCritical": true,
  "shouldRelaxCompression": true,
  "score": 9,
  "categories": [
    "database_migration",
    "production_deploy",
    "security_secret"
  ]
}
```

### 12.2 Pretty safety UI

```bash
tto classify --pretty "DROP TABLE users production secret token"
```

ตัวอย่าง output:

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

### 12.3 Categories ที่อาจพบ

| Category | ตัวอย่าง trigger |
|---|---|
| `database_migration` | `DROP TABLE`, `TRUNCATE`, `DELETE FROM`, migration |
| `production_deploy` | production, prod, deploy, release, rollback, hotfix |
| `security_secret` | API key, secret, access token, password, private key |
| `destructive_command` | `rm -rf`, `git reset --hard`, `git push --force` |
| `auth_payment` | auth, permission, payment, billing |

เมื่อเจอ risk สูง ระบบควรใช้ `safe` behavior:

```text
backup → dry-run → verify → rollback ready
```

---

## 13. Doctor / Health Check

ใช้ตรวจสุขภาพระบบและ integration

### 13.1 Doctor แบบ text

```bash
tto doctor
```

ตรวจสิ่งสำคัญ:

- package version ยังเป็น `1.0.0`
- Node.js >= 18
- CLI entry exists
- backup module exists
- adapter module exists
- benchmark golden cases exist
- state directory writable
- Codex hooks installed
- Codex feature flag
- Claude hooks installed
- Gemini extension installed
- OpenCode plugin installed
- backup directory writable

### 13.2 Pretty doctor UI

```bash
tto doctor --pretty
```

ตัวอย่าง output:

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
│ ✓ Benchmark golden cases exist   benchmarks/golden_cases.jso…                  │
│ ✓ State directory writable       /mnt/data/tto_home_manual/.…                  │
│ ✓ State readable                 /mnt/data/tto_home_manual/.…                  │
│ ✓ Codex hooks installed          /mnt/data/tto_home_manual/.…                  │
│ ✓ Codex hooks feature flag       /mnt/data/tto_home_manual/.…                  │
│ ✓ Codex AGENTS block (optional)  /mnt/data/tto_home_manual/.…                  │
│ ✓ Claude hooks installed         /mnt/data/tto_home_manual/.…                  │
│ ✓ Gemini CLI extension installed /mnt/data/tto_home_manual/.…                  │
│ ✓ Gemini CLI hooks installed     /mnt/data/tto_home_manual/.…                  │
│ ✓ OpenCode plugin installed      /mnt/data/tto_home_manual/.…                  │
│ ✓ OpenCode config present        /mnt/data/tto_home_manual/.…                  │
│ ✓ Backup directory writable      /mnt/data/tto_home_manual/.…                  │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### 13.3 CI doctor

```bash
tto doctor --ci
```

ใช้ใน CI เพื่อตรวจ package health โดยไม่บังคับ installed state ของเครื่องผู้ใช้

---

## 14. Benchmark / Regression Gate

ใช้วัดคุณภาพการลด token และ preservation

### 14.1 Benchmark ปกติ

```bash
tto benchmark
```

### 14.2 Strict benchmark

```bash
tto benchmark --strict
```

### 14.3 Strict benchmark แบบ reproducible

```bash
tto benchmark --strict --default-policy
```

ใช้ใน CI เพราะไม่อิง user policy ใน `~/.thai-token-optimizer/config.json`

### 14.4 Pretty benchmark UI

```bash
tto benchmark --pretty --strict --default-policy
```

ตัวอย่าง output:

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
│ research                    4.9%  preserve 100%                                │
│ thai-filler-debug          30.3%  preserve 100%                                │
│ thai-filler-install        20.6%  preserve 100%                                │
│ thai-filler-research       20.9%  preserve 100%                                │
│ thai-filler-report          9.7%  preserve 100%                                │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### 14.5 สิ่งที่ benchmark ตรวจ

- average saving
- minimum preservation
- constraint preservation
- code/config preservation
- safety categories
- version preservation
- strict gate PASS/FAIL

---

## 15. Backup / Rollback / Uninstall

ระบบนี้แก้ global config หลายจุด จึงมี backup/rollback built-in

### 15.1 Backup target

```bash
tto backup all
tto backup codex
tto backup claude
tto backup gemini
tto backup opencode
tto backup cursor
tto backup aider
tto backup cline
tto backup roo
```

ตัวอย่าง `tto backup all`:

```json
{
  "backup": "20260509T101748787Z-6939-all",
  "target": "all",
  "files": 27,
  "root": "/mnt/data/tto_home_manual/.thai-token-optimizer/backups"
}
```

### 15.2 List backups

```bash
tto backups
```

ตัวอย่าง output:

```json
[
  {
    "id": "20260509T101748787Z-6939-all",
    "target": "all",
    "createdAt": "2026-05-09T10:17:48.789Z",
    "files": 27
  },
  {
    "id": "20260509T101748472Z-6925-codex",
    "target": "codex",
    "createdAt": "2026-05-09T10:17:48.473Z",
    "files": 4
  },
  {
    "id": "20260509T101748286Z-6918-all",
    "target": "all",
    "createdAt": "2026-05-09T10:17:48.288Z",
    "files": 27
  }
]
```

### 15.3 Rollback dry-run

```bash
tto rollback latest --dry-run
tto rollback gemini --dry-run
```

ตัวอย่าง output:

```json
{
  "dryRun": true,
  "backup": "20260509T101748787Z-6939-all",
  "backupTarget": "all",
  "target": "all",
  "filtered": false,
  "files": [
    "/mnt/data/tto_home_manual/.codex/hooks.json",
    "/mnt/data/tto_home_manual/.codex/config.toml",
    "/mnt/data/tto_home_manual/.codex/AGENTS.md",
    "/mnt/data/tto_home_manual/.claude/settings.json",
    "/mnt/data/tto_home_manual/.gemini/settings.json",
    "/mnt/data/tto_home_manual/.gemini/GEMINI.md",
    "/mnt/data/tto_home_manual/.gemini/extensions/thai-token-optimizer/gemini-extension.json",
    "/mnt/data/tto_home_manual/.gemini/extensions/thai-token-optimizer/GEMINI.md",
    "/mnt/data/tto_home_manual/.gemini/extensions/thai-token-optimizer/commands/tto/auto.toml",
    "/mnt/data/tto_home_manual/.gemini/extensions/thai-token-optimizer/commands/tto/lite.toml",
    "/mnt/data/tto_home_manual/.gemini/extensions/thai-token-optimizer/commands/tto/full.toml",
    "/mnt/data/tto_home_manual/.gemini/extensions/thai-token-optimizer/commands/tto/safe.toml",
    "/mnt/data/tto_home_manual/.gemini/extensions/thai-token-optimizer/commands/tto/off.toml",
    "/mnt/data/tto_home_manual/.gemini/extensions/thai-token-optimizer/commands/tto/status.toml",
    "/mnt/data/tto_home_manual/.gemini/extensions/thai-token-optimizer/commands/tto/compress.toml",
    "/mnt/data/tto_home_manual/.gemini/extensions/thai-token-optimizer/commands/tto/estimate.toml",
    "/mnt/data/tto_home_manual/.config/opencode/opencode.json",
    "/mnt/data/tto_home_manual/.config/opencode/plugins/thai-token-optimizer.js",
    "/mnt/data/tto_home_manual/.config/opencode/agents/thai-token-optimizer.md",
    "/mnt/data/tto_home_manual/.config/opencode/skills/thai-token-optimizer.md",
    "/mnt/data/tto_home_manual/.config/opencode/commands/tto-auto.md",
    "/mnt/data/tto_home_manual/.config/opencode/commands/tto-safe.md",
    "/mnt/data/tto_home_manual/.cursor/rules/thai-token-optimizer.mdc",
    "/mnt/data/tto_home_manual/.aider/thai-token-optimizer.md",
    "/mnt/data/tto_home_manual/.cline/rules/thai-token-optimizer.md",
    "/mnt/data/tto_home_manual/.roo/rules/thai-token-optimizer.md",
    "/mnt/data/tto_home_manual/.thai-token-optimizer/state.json"
  ]
}
```

### 15.4 Rollback จริง

```bash
tto rollback latest
tto rollback codex
tto rollback claude
tto rollback gemini
tto rollback opencode
tto rollback cursor
tto rollback aider
tto rollback cline
tto rollback roo
```

พฤติกรรมสำคัญ:

- สร้าง pre-rollback backup ให้อัตโนมัติ
- target-specific rollback restore เฉพาะ target นั้น
- `rollback gemini` ต้องไม่แตะ Codex/Claude/OpenCode
- ถ้าไม่ต้องการ pre-backup ให้ใช้ `--no-prebackup`

```bash
tto rollback latest --no-prebackup
```

### 15.5 Uninstall

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

`uninstall all` ต้องลบ integration ทั้งหมดที่ติดตั้งโดย Thai Token Optimizer:

- Codex hooks
- Claude hooks
- Gemini extension
- OpenCode plugin/config entries
- Cursor/Aider/Cline/Roo rule files

---

## 16. Install commands

### 16.1 Install all

```bash
tto install all
```

ตัวอย่าง output:

```text
Backup created: 20260509T101748286Z-6918-all
Installed Thai Token Optimizer v1.0 for Codex:
- /mnt/data/tto_home_manual/.codex/hooks.json
- /mnt/data/tto_home_manual/.codex/config.toml (enabled codex_hooks)
Installed Thai Token Optimizer v1.0 for Claude Code:
- /mnt/data/tto_home_manual/.claude/settings.json
{
  "installed": [
    {
      "adapter": "cursor",
      "file": "/mnt/data/tto_home_manual/.cursor/rules/thai-token-optimizer.mdc"
    },
    {
      "adapter": "aider",
      "file": "/mnt/data/tto_home_manual/.aider/thai-token-optimizer.md"
    },
    {
      "adapter": "gemini",
      "file": "/mnt/data/tto_home_manual/.gemini/extensions/thai-token-optimizer/gemini-extension.json"
    },
    {
      "adapter": "gemini",
      "file": "/mnt/data/tto_home_manual/.gemini/extensions/thai-token-optimizer/GEMINI.md"
    },
    {
      "adapter": "gemini",
      "file": "/mnt/data/tto_home_manual/.gemini/settings.json"
    },
    {
      "adapter": "opencode",
      "file": "/mnt/data/tto_home_manual/.config/opencode/plugins/thai-token-optimizer.js"
    },
    {
      "adapter": "opencode",
      "file": "/mnt/data/tto_home_manual/.config/opencode/opencode.json"
    },
    {
      "adapter": "opencode",
      "file": "/mnt/data/tto_home_manual/.config/opencode/agents/thai-token-optimizer.md"
    },
    {
      "adapter": "opencode",
      "file": "/mnt/data/tto_home_manual/.config/opencode/skills/thai-token-optimizer.md"
    },
    {
      "adapter": "cline",
      "file": "/mnt/data/tto_home_manual/.cline/rules/thai-token-optimizer.md"
    },
    {
      "adapter": "roo",
      "file": "/mnt/data/tto_home_manual/.roo/rules/thai-token-optimizer.md"
    }
  ],
  "note": "Gemini/OpenCode use native extension/plugin integration; other adapters use portable guidance files."
}

Restart the target CLI, then type: token thai auto
```

หลังติดตั้งให้ restart target CLI แล้วพิมพ์:

```text
token thai auto
```

### 16.2 Install Codex

```bash
tto install codex
```

ไฟล์ที่แก้/สร้าง:

```text
~/.codex/hooks.json
~/.codex/config.toml
```

ต้องมี feature flag:

```toml
[features]
codex_hooks = true
```

### 16.3 Install AGENTS.md สำหรับ Codex

```bash
tto install-agents
```

ตัวอย่าง output:

```text
Backup created: 20260509T101748472Z-6925-codex
Installed Thai Token Optimizer v1.0 AGENTS block to /mnt/data/tto_home_manual/.codex/AGENTS.md
```

ไฟล์เป้าหมาย:

```text
~/.codex/AGENTS.md
```

### 16.4 Install Claude Code

```bash
tto install claude
```

ไฟล์ที่แก้/สร้าง:

```text
~/.claude/settings.json
```

### 16.5 Install Gemini CLI

```bash
tto install gemini
```

ไฟล์ที่สร้าง:

```text
~/.gemini/extensions/thai-token-optimizer/gemini-extension.json
~/.gemini/extensions/thai-token-optimizer/GEMINI.md
~/.gemini/extensions/thai-token-optimizer/commands/tto/*.toml
~/.gemini/settings.json
```

Gemini commands ที่มี:

```text
/tto:auto
/tto:lite
/tto:full
/tto:safe
/tto:off
/tto:status
/tto:compress
/tto:estimate
```

### 16.6 Install OpenCode

```bash
tto install opencode
```

ไฟล์ที่สร้าง:

```text
~/.config/opencode/plugins/thai-token-optimizer.js
~/.config/opencode/opencode.json
~/.config/opencode/agents/thai-token-optimizer.md
~/.config/opencode/skills/thai-token-optimizer.md
~/.config/opencode/commands/tto-auto.md
~/.config/opencode/commands/tto-safe.md
```

### 16.7 Install portable adapters

```bash
tto install cursor
tto install aider
tto install cline
tto install roo
```

ไฟล์ที่สร้าง:

| Adapter | File |
|---|---|
| Cursor | `~/.cursor/rules/thai-token-optimizer.mdc` |
| Aider | `~/.aider/thai-token-optimizer.md` |
| Cline | `~/.cline/rules/thai-token-optimizer.md` |
| Roo | `~/.roo/rules/thai-token-optimizer.md` |

---

## 17. Agent/Hook UI

Agent/Hook UI คือการใช้งานผ่านช่อง prompt ของ AI agent ไม่ใช่ Terminal โดยตรง

### 17.1 คำสั่งใน agent

พิมพ์ใน Codex / Claude Code / Gemini CLI / OpenCode:

```text
token thai auto
token thai lite
token thai full
token thai safe
token thai off
token thai status
```

ตัวอย่าง:

```text
User: token thai auto
Agent: เปิด `token thai auto` แล้ว
```

### 17.2 พฤติกรรมหลังเปิด auto

User:

```text
อธิบายวิธีติดตั้ง Thai Token Optimizer กับ Codex แบบสั้น
```

Agent ควรตอบ:

```text
ติดตั้ง:

```bash
tto backup codex
tto install codex
tto install-agents
tto doctor
```
```

### 17.3 เมื่อเจองานเสี่ยง

User:

```text
DROP TABLE users ใน production ให้หน่อย
```

Agent ควรตอบแบบ safe:

```text
เสี่ยง: เป็น destructive database operation บน production

backup ก่อน:
```bash
mysqldump -u USER -p DB_NAME users > users_backup.sql
```

ตรวจ:
```sql
SELECT COUNT(*) FROM users;
```

ห้ามรัน `DROP TABLE users` จนกว่าจะมี backup, migration plan และ rollback
```

---

## 18. Hook events

### 18.1 Codex / Claude Code hooks

ติดตั้ง events:

| Event | Hook script | หน้าที่ |
|---|---|---|
| `SessionStart` | `tto-activate.js` | inject instruction ตอนเริ่ม session |
| `UserPromptSubmit` | `tto-mode-tracker.js` | จับคำสั่ง `token thai ...` |
| `PreToolUse` | `tto-pretool-guard.js` | ตรวจคำสั่งเสี่ยงก่อนใช้ tool |
| `PostToolUse` | `tto-posttool-summary.js` | สรุปผล tool แบบ compact |
| `Stop` | `tto-stop-summary.js` | สรุปท้าย turn/session |

### 18.2 Gemini hooks

| Hook | Script | หน้าที่ |
|---|---|---|
| `SessionStart` | `tto-gemini-session.js` | โหลด instruction |
| `BeforeTool` | `tto-gemini-beforetool.js` | ตรวจ safety ก่อนใช้ tool |
| `AfterTool` | `tto-gemini-aftertool.js` | สรุปผล tool |
| `PreCompress` | `tto-gemini-precompress.js` | บีบ/จัด prompt ก่อน compress |

### 18.3 OpenCode plugin events

รองรับแนวคิด:

```text
tool.execute.before
tool.execute.after
experimental.session.compacting
```

---

## 19. Pretty CLI UI Reference

### 19.1 Status Card

```bash
tto status --pretty
```

```text
╭──────────────────────────────────────────────────────────────────────╮
│ ⚡ Thai Token Optimizer v1.0                                          │
├──────────────────────────────────────────────────────────────────────┤
│ Compact Thai responses for AI coding agents                          │
│                                                                      │
│ Status        ● ACTIVE                                               │
│ Mode          auto                                                   │
│ Profile       coding                                                 │
│ Safety        strict                                                 │
│ Version       1.0.0                                                  │
│                                                                      │
│ Token Saving  █████████████░░░░░░░   63%                             │
│                                                                      │
│ Quick Commands                                                       │
│ tto auto       tto compress --pretty --budget 500 prompt.txt         │
│ tto doctor     tto benchmark --pretty --strict --default-policy      │
╰──────────────────────────────────────────────────────────────────────╯
```

### 19.2 Dashboard Card

```bash
tto ui
```

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

### 19.3 Doctor Card

```bash
tto doctor --pretty
```

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
│ ✓ Benchmark golden cases exist   benchmarks/golden_cases.jso…                  │
│ ✓ State directory writable       /mnt/data/tto_home_manual/.…                  │
│ ✓ State readable                 /mnt/data/tto_home_manual/.…                  │
│ ✓ Codex hooks installed          /mnt/data/tto_home_manual/.…                  │
│ ✓ Codex hooks feature flag       /mnt/data/tto_home_manual/.…                  │
│ ✓ Codex AGENTS block (optional)  /mnt/data/tto_home_manual/.…                  │
│ ✓ Claude hooks installed         /mnt/data/tto_home_manual/.…                  │
│ ✓ Gemini CLI extension installed /mnt/data/tto_home_manual/.…                  │
│ ✓ Gemini CLI hooks installed     /mnt/data/tto_home_manual/.…                  │
│ ✓ OpenCode plugin installed      /mnt/data/tto_home_manual/.…                  │
│ ✓ OpenCode config present        /mnt/data/tto_home_manual/.…                  │
│ ✓ Backup directory writable      /mnt/data/tto_home_manual/.…                  │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### 19.4 Compress Card

```bash
tto compress --pretty --budget 80 --target codex --check "..."
```

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
│                                                                                │
│ Optimized                                                                      │
│   ช่วยอธิบายรายละเอียดการติดตั้ง Thai Token Optimizer v1.0 โดยห้ามเปลี่ยน pac… │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### 19.5 Safety Card

```bash
tto classify --pretty "DROP TABLE users production secret token"
```

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

### 19.6 Benchmark Card

```bash
tto benchmark --pretty --strict --default-policy
```

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
│ research                    4.9%  preserve 100%                                │
│ thai-filler-debug          30.3%  preserve 100%                                │
│ thai-filler-install        20.6%  preserve 100%                                │
│ thai-filler-research       20.9%  preserve 100%                                │
│ thai-filler-report          9.7%  preserve 100%                                │
╰────────────────────────────────────────────────────────────────────────────────╯
```

---

## 20. NPM scripts

จาก `package.json` มี scripts สำคัญ:

```bash
npm test
npm run ci
npm run install:codex
npm run install:claude
npm run install:all
npm run tto:on
npm run tto:off
npm run tto:auto
npm run tto:full
npm run tto:safe
npm run tto:benchmark
npm run tto:doctor
npm run tto:backup
npm run tto:compress:budget
npm run benchmark
npm run benchmark:strict
npm run doctor
```

### 20.1 Test

```bash
npm test
```

คาดหวัง:

```text
75 tests passed
0 failed
```

### 20.2 CI

```bash
npm run ci
```

ภายในรัน:

```bash
npm test
node bin/thai-token-optimizer.js benchmark --strict --default-policy
node bin/thai-token-optimizer.js doctor --ci
```

---

## 21. Environment variables

| Variable | ใช้ทำอะไร |
|---|---|
| `HOME` | root สำหรับ state/config ถ้าไม่ override |
| `CODEX_HOME` | path ของ Codex config เช่น `~/.codex` |
| `CLAUDE_HOME` | path ของ Claude config เช่น `~/.claude` |

ตัวอย่าง isolated test:

```bash
export HOME=/tmp/tto-home
export CODEX_HOME=$HOME/.codex
export CLAUDE_HOME=$HOME/.claude
npm test
```

---

## 22. File structure สำคัญ

```text
thai-token-optimizer/
├── bin/
│   └── thai-token-optimizer.js
├── hooks/
│   ├── tto-ui.js
│   ├── tto-config.js
│   ├── tto-policy.js
│   ├── tto-profiles.js
│   ├── tto-token-estimator.js
│   ├── tto-compressor.js
│   ├── tto-budget-compressor.js
│   ├── tto-safety-classifier.js
│   ├── tto-preservation-checker.js
│   ├── tto-code-aware-parser.js
│   ├── tto-constraint-locker.js
│   ├── tto-doctor.js
│   └── tto-backup.js
├── adapters/
│   └── index.js
├── benchmarks/
│   ├── run_benchmark.js
│   ├── golden_cases.jsonl
│   └── report.md
├── tests/
├── skills/thai-token-optimizer/SKILL.md
├── AGENTS.md
├── README.md
└── package.json
```

---

## 23. Troubleshooting

### 23.1 คำสั่ง `tto` ไม่เจอ

ใช้ node path แทน:

```bash
node bin/thai-token-optimizer.js status
```

หรือติดตั้ง/link package:

```bash
npm link
which tto
```

### 23.2 Codex hooks ไม่ทำงาน

ตรวจ:

```bash
tto doctor
cat ~/.codex/config.toml
```

ต้องมี:

```toml
[features]
codex_hooks = true
```

แก้:

```bash
tto backup codex
tto install codex
tto install-agents
tto doctor
```

### 23.3 Doctor WARN เพราะ AGENTS.md ยังไม่ติดตั้ง

ติดตั้ง:

```bash
tto install-agents
tto doctor
```

### 23.4 Benchmark fail ในเครื่องส่วนตัว

ใช้ default policy:

```bash
tto benchmark --strict --default-policy
```

### 23.5 Rollback ก่อนทำจริง

```bash
tto rollback latest --dry-run
```

ถ้าถูกต้องค่อยรัน:

```bash
tto rollback latest
```

---

## 24. Best Practices

### ใช้งานทั่วไป

```bash
tto auto
tto profile coding
tto status --pretty
```

### ก่อนติดตั้ง/แก้ config

```bash
tto backup all
tto install all
tto doctor --pretty
```

### ก่อน rollback

```bash
tto rollback latest --dry-run
tto rollback latest
```

### ก่อน commit/release

```bash
npm test
npm run ci
tto benchmark --strict --default-policy
```

### เมื่อทำงาน production / database / security

```bash
tto safe
tto classify --pretty "ข้อความหรือคำสั่งที่เสี่ยง"
tto backup all
```

---

## 25. สรุปคำสั่งทั้งหมดแบบ Quick Reference

```bash
# Status / UI
tto
tto status
tto status --pretty
tto ui
tto dashboard

# Mode
tto on
tto auto
tto lite
tto full
tto safe
tto off
tto stop

# Profile
tto profile
tto profile show
tto profile list
tto profile coding
tto profile research
tto profile teaching
tto profile paper
tto profile command
tto profile ultra

# Config
tto config init
tto config path
tto config get
tto config set defaultProfile coding
tto config set safetyMode strict
tto config set exactTokenizer true

# Install
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

# Uninstall
tto uninstall codex
tto uninstall claude
tto uninstall gemini
tto uninstall opencode
tto uninstall cursor
tto uninstall aider
tto uninstall cline
tto uninstall roo
tto uninstall all

# Token estimate
tto estimate "ข้อความไทย"
tto estimate --target codex "ข้อความไทย"
tto estimate --exact --target codex "ข้อความไทย"

# Compress / rewrite
tto compress "ข้อความไทย"
tto rewrite "ข้อความไทย"
tto compress --level auto prompt.txt
tto compress --level full prompt.txt
tto compress --budget 500 --target codex prompt.txt
tto compress --pretty --budget 500 --target codex --check prompt.txt
cat prompt.txt | tto compress --level auto

# Preservation / safety
tto preserve original.txt optimized.txt
tto classify "DROP TABLE users production secret token"
tto classify --pretty "DROP TABLE users production secret token"

# Backup / rollback
tto backup all
tto backup codex
tto backup gemini
tto backups
tto rollback latest --dry-run
tto rollback latest
tto rollback gemini --dry-run
tto rollback gemini
tto rollback latest --no-prebackup

# Doctor / benchmark
tto doctor
tto doctor codex
tto doctor codex --pretty
tto doctor --pretty
tto doctor --ci
tto benchmark
tto benchmark --strict
tto benchmark --strict --default-policy
tto benchmark --pretty --strict --default-policy

# Test / CI
npm test
npm run ci
```

---

## 26. ข้อควรระวัง

- ระบบนี้แก้ไฟล์ config ของหลาย tools ได้ ควรใช้ `tto backup all` ก่อน `install all` หรือ `uninstall all`
- ใช้ `--dry-run` ก่อน rollback เสมอ
- ถ้าใช้ `--exact` แต่ไม่มี tokenizer package ระบบอาจ fallback เป็น heuristic
- ห้ามเปลี่ยน `Thai Token Optimizer v1.0` หรือ `package version: 1.0.0` ถ้าไม่ได้รับคำสั่งชัดเจน
- งาน production, database, auth, payment, secret และ destructive command ให้ใช้ `tto safe`

---

## 27. คำตอบสั้นที่สุด

**CLI UI** ของระบบคือคำสั่ง `tto ...` พร้อม output แบบ JSON/report/Pretty Terminal UI  
**Agent/Hook UI** คือคำสั่งใน agent เช่น `token thai auto` ที่ทำให้ Codex/Claude/Gemini/OpenCode ตอบไทยสั้นขึ้นและปลอดภัยขึ้น

ตัวอย่าง UI ที่สวยที่สุดตอนนี้:

```bash
tto ui
```

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
