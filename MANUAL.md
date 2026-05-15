<!--
============================================================================
Thai Token Optimizer v2.0
============================================================================
Description :
A Thai token optimization tool for AI coding agents that keeps commands, code,
and technical details accurate.

Author      : Dr.Kittimasak Naijit
Repository  : https://github.com/kittimasak/thai-token-optimizer

Copyright (c) 2026 Dr.Kittimasak Naijit

Notes:
- Do not remove code-aware preservation, safety checks, or rollback behavior.
- This file is part of the Thai Token Optimizer local-first CLI/hook system.
============================================================================
-->

# Thai Token Optimizer v2.0 Manual

คู่มือใช้งาน **Thai Token Optimizer (TTO) v2.0** สำหรับผู้ใช้และผู้ดูแลระบบที่ต้องการลด token ภาษาไทยในงาน AI coding agent โดยยังรักษาความถูกต้องของคำสั่ง โค้ด path version error config และข้อจำกัดสำคัญ

```text
Thai Token Optimizer v2.0
package version: 2.0.0
UI model: Terminal CLI + Agent/Hook UI
Core rule: ลด token ได้ แต่ห้ามลด safety/correctness/constraints
```

---

## 1. TTO คืออะไร

TTO เป็นระบบ local-first ประกอบด้วย:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Thai Token Optimizer v2.0                                                  │
├────────────────────────────────────────────────────────────────────────────┤
│ CLI commands      tto status / compress / doctor / benchmark / quality     │
│ Agent hooks       Codex / Claude / Gemini / OpenCode / OpenClaw / Hermes   │
│ Compression       Thai filler trim + semantic dedup + selective context    │
│ Preservation      command / path / version / code / config / error exact   │
│ Operations        dashboard / ops / fleet / coach / checkpoint / cache      │
│ Safety            classifier + safe mode + backup/rollback discipline      │
└────────────────────────────────────────────────────────────────────────────┘
```

TTO ไม่ใช่ Web dashboard และไม่ใช่ model ใหม่ แต่เป็น **CLI + hooks + adapters + policy layer** ที่ช่วยให้ AI agent ทำงานภาษาไทยแบบกระชับขึ้นและปลอดภัยขึ้น

---

## 2. สิ่งที่ TTO ต้องรักษาเสมอ

ห้ามบีบอัดจนทำให้สิ่งเหล่านี้ผิดเพี้ยน:

| สิ่งที่ต้องคง exact | ตัวอย่าง |
|---|---|
| commands | `npm run ci`, `tto benchmark --strict --default-policy --mtp` |
| paths | `~/.codex/config.toml`, `hooks/tto-stop-summary.js` |
| versions | `Thai Token Optimizer v2.0`, `2.0.0` |
| config keys | `codex_hooks = true`, `readCache.mode` |
| code blocks | JavaScript, SQL, JSON, TOML, YAML |
| error messages | `UserPromptSubmit hook failed` |
| safety steps | backup, dry-run, verification, rollback |
| user dictionary | words added by `tto keep <word>` |

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

## 3. Install และเริ่มต้น

### 3.1 ติดตั้ง dependency

```bash
npm install
```

### 3.2 เรียก CLI โดยตรง

```bash
node bin/thai-token-optimizer.js status
```

ถ้าติดตั้งเป็น package หรือมี bin link แล้ว:

```bash
tto status
thai-token-optimizer status
```

### 3.3 ตรวจคำสั่งทั้งหมด

```bash
tto help
```

คำสั่งหลักที่ระบบปัจจุบันรองรับ:

หมายเหตุ: `tto help` ใช้ดู usage สำหรับมนุษย์ได้ แต่ CLI ปัจจุบันอาจคืน exit code `1` ใน help/usage path ดังนั้น automation ควรใช้คำสั่งจริง เช่น `tto status` หรือ `tto doctor --ci` แทนการใช้ exit code ของ `tto help`

```text
on|auto                 Enable auto mode
lite                    Enable lite mode
full                    Enable full mode
safe                    Enable safe mode
off|stop                Disable optimizer
status [--pretty]       Show state
ui|dashboard [--view overview|quality|waste|trend|agents|doctor|fleet]
ops [--pretty] | scan|audit|context|quality|drift|validate [options]
fleet [--roots dir1,dir2] [--pretty] [--doctor] [--calibration] [--session-scan]
doctor [target] [--pretty]
quality [--pretty]
coach [--pretty] [--apply quick|safe]
calibration status|record|from-stats|clear [--pretty]
context [--pretty]
checkpoint status|list|capture|restore|precompact|postcompact [--pretty]
cache stats|clear [--pretty]
backup [target]
backups
rollback [latest|id|target] [--dry-run]
install <target|all>
uninstall <target|all>
install-agents [codex]
keep <word>
forget <word>
dictionary
estimate [--target codex|claude] [--exact] <text>
compress [--pretty] [--level auto|lite|full|safe] [--budget N] [--target codex|claude] [--check] [--speculative|--no-speculative] [--diagnostics] [text|file]
rewrite
preserve <originalFile> <optimizedFile>
classify [--pretty] <text>
benchmark [--pretty] [--strict] [--default-policy] [--mtp]
```

---

## 4. Quick Start Workflows

### 4.1 ใช้งานทั่วไปกับ Codex

```bash
tto backup codex
tto install codex
tto install-agents
tto doctor codex --pretty
tto auto
tto status --pretty
```

### 4.2 ติดตั้งทุก target ที่รองรับ

```bash
tto backup all
tto install all
tto doctor --pretty
```

### 4.3 บีบอัด prompt พร้อมตรวจ preservation

```bash
tto compress --pretty --level auto --target codex --budget 500 --check prompt.txt
```

### 4.4 ตรวจคุณภาพก่อน release

```bash
tto benchmark --pretty --strict --default-policy --mtp
tto quality --pretty
tto coach --pretty
```

### 4.5 ตรวจ fleet/หลายโปรเจกต์

```bash
tto fleet --pretty --roots /path/repoA,/path/repoB --doctor --calibration --session-scan
```

### 4.6 One-shot operations report

```bash
tto ops --pretty
```

---

## 5. Modes

| Mode | Command | เหมาะกับ | พฤติกรรม |
|---|---|---|---|
| `auto` | `tto auto` | ใช้งานทั่วไป | เลือกระดับตาม prompt/profile/risk |
| `lite` | `tto lite` | สอน อธิบาย research | กระชับแต่ยังมีเหตุผล |
| `full` | `tto full` | debug/command/code fix ไม่เสี่ยง | สั้นที่สุดที่ยังใช้งานได้ |
| `safe` | `tto safe` | production, DB, auth, secret, rollback | คง risk/backup/verify/rollback |
| `off` | `tto off` | ปิด optimization | กลับสู่พฤติกรรมปกติ |

ตัวอย่าง:

```bash
tto auto
tto lite
tto full
tto safe
tto off
```

Expected output:

```text
Thai Token Optimizer v2.0: ON auto
Thai Token Optimizer v2.0: OFF
```

---

## 6. Profiles

Profile ปรับ bias ตามงาน

| Profile | ใช้กับ | Style |
|---|---|---|
| `coding` | code/debug/refactor | code/patch ก่อน อธิบายสั้น |
| `command` | terminal/devops | command ก่อน ผลลัพธ์คาดหวัง |
| `research` | research/methodology | คงสมมติฐาน ตัวแปร วิธีวิจัย |
| `teaching` | อธิบายเพื่อเรียนรู้ | สั้น เป็นขั้น มีตัวอย่างพอจำเป็น |
| `paper` | paper/academic | formal, คงตัวเลขและกรอบวิชาการ |
| `ultra` | งานไม่เสี่ยงที่ต้องลด token สูงสุด | bullet/fragment สั้นมาก |

คำสั่ง:

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

---

## 7. Status และ Dashboard

### 7.1 Status JSON

```bash
tto status
```

ใช้กับ automation หรือ debug state file

### 7.2 Status Pretty

```bash
tto status --pretty
```

ตัวอย่างรูปแบบ:

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
│ Quick Commands                                                       │
│ tto auto       tto compress --pretty --budget 500 prompt.txt         │
│ tto doctor     tto benchmark --pretty --strict --default-policy      │
╰──────────────────────────────────────────────────────────────────────╯
```

### 7.3 Dashboard views

```bash
tto dashboard --view overview
tto dashboard --view quality
tto dashboard --view waste
tto dashboard --view trend
tto dashboard --view agents
tto dashboard --view doctor
tto dashboard --view fleet
```

ใช้เมื่ออยากดูภาพรวมแบบ terminal dashboard โดยไม่เปิดเว็บ

---

## 8. Agent/Hook UI

เมื่อติดตั้ง adapter แล้ว ผู้ใช้สามารถพิมพ์ trigger ใน agent ได้ เช่น:

```text
token thai auto
token thai lite
token thai full
token thai safe
token thai off
ลด token ไทย
ตอบสั้น
ประหยัด token
หยุดลด token
```

รูปแบบ hook output ของ TTO v2 ใช้ stage เดียวกันทั้งระบบ:

```text
[TTO Stage 1/4] Detect Intent
[TTO Stage 2/4] Compress Candidate
[TTO Stage 3/4] Preserve Critical
[TTO Stage 4/4] Output Compact
```

ความหมาย:

| Stage | ทำอะไร | ผู้ใช้ควรรู้อะไร |
|---|---|---|
| 1/4 Detect Intent | ตรวจ mode/profile/risk | ระบบกำลังตีความงาน |
| 2/4 Compress Candidate | เลือกวิธีลด token | ยังไม่ตัดของสำคัญ |
| 3/4 Preserve Critical | ล็อก command/path/version/safety | ถ้างานเสี่ยงจะเข้า safe behavior |
| 4/4 Output Compact | ส่งผลลัพธ์กระชับ | พร้อมใช้งานหรืออ่านต่อ |

หากพบ error เช่น:

```text
UserPromptSubmit hook failed
error: hook returned invalid user prompt submit JSON output
```

ให้ตรวจว่า hook คืน JSON ตาม schema ที่ agent ต้องการ และไม่มี log แปลกปลอมปนใน stdout ของ hook

---

## 9. Supported Agents และ Adapter Targets

| Target | Install | Doctor | หมายเหตุ |
|---|---|---|---|
| Codex | `tto install codex` | `tto doctor codex --pretty` | hooks + `AGENTS.md` |
| Claude Code | `tto install claude` | `tto doctor claude --pretty` | settings hooks |
| Gemini CLI | `tto install gemini` | `tto doctor gemini --pretty` | extension + hooks |
| OpenCode | `tto install opencode` | `tto doctor opencode --pretty` | native plugin |
| OpenClaw | `tto install openclaw` | `tto doctor openclaw --pretty` | managed hook + simulator |
| Hermes Agent | `tto install hermes` | `tto doctor hermes --pretty` | shell hooks + plugin hooks |
| Cursor | `tto install cursor` | `tto doctor cursor --pretty` | rule file |
| Aider | `tto install aider` | `tto doctor aider --pretty` | instruction file |
| Cline | `tto install cline` | `tto doctor cline --pretty` | rule file |
| Roo Code | `tto install roo` | `tto doctor roo --pretty` | rule file |

ติดตั้ง/ถอดถอน:

```bash
tto install all
tto uninstall all
```

Target-specific rollback ควรทำแบบนี้:

```bash
tto rollback codex --dry-run
tto rollback codex
```

---

## 10. Compression และ Rewrite

### 10.1 Compress ข้อความโดยตรง

```bash
tto compress "ช่วยอธิบายวิธีติดตั้ง Thai Token Optimizer v2.0 โดยคงคำสั่ง npm run ci และ tto doctor --pretty"
```

### 10.2 Compress จากไฟล์

```bash
tto compress --level auto prompt.txt
```

### 10.3 Compress พร้อม budget

```bash
tto compress --level auto --budget 500 --target codex prompt.txt
```

### 10.4 Compress พร้อม preservation check

```bash
tto compress --pretty --level auto --target codex --budget 500 --check prompt.txt
```

### 10.5 Rewrite alias

```bash
tto rewrite --pretty --budget 300 prompt.txt
```

### 10.6 Options สำคัญ

| Option | ความหมาย |
|---|---|
| `--pretty` | แสดงผลเป็น terminal UI |
| `--level auto|lite|full|safe` | เลือกระดับ compression |
| `--budget N` | พยายามลดให้ใกล้ token budget |
| `--target codex|claude` | ใช้ target estimator ที่เหมาะสม |
| `--exact` | ใช้ exact tokenizer ถ้ามี optional dependency |
| `--check` | ตรวจ semantic preservation |
| `--speculative` | เปิด MTP/speculative สำหรับคำสั่งนี้ |
| `--no-speculative` | ปิด MTP/speculative สำหรับคำสั่งนี้ |
| `--diagnostics` | แสดง candidate selection diagnostics |

Speculative precedence:

```text
1. --no-speculative
2. --speculative
3. state.speculative
```

---

## 11. MTP และ Speculative Decoding

TTO v2 มี MTP/speculative layer สำหรับสร้างหลาย candidate แล้วใช้ verifier เลือกผลลัพธ์ที่ดีที่สุด

คำสั่งใช้งาน:

```bash
tto compress --speculative --diagnostics --check --target codex prompt.txt
tto compress --no-speculative --check --target codex prompt.txt
tto benchmark --pretty --strict --default-policy --mtp
```

ควรรู้:

- MTP ใน TTO คือ optimization/candidate-selection layer ไม่ใช่การเร่ง inference ของ model โดยตรง
- จุดที่ช่วยลด token คือเลือก candidate ที่บีบอัดได้ดีกว่าแต่ preservation ยังผ่าน
- ใช้ benchmark gate ตรวจว่า enhanced path ต้องชนะ baseline ตาม KPI ที่กำหนด
- `--diagnostics` ช่วยดูว่าเลือก candidate ใด เพราะอะไร

---

## 12. Personalization / Adaptive Compression Learning

TTO v2 รองรับ user-specific dictionary เพื่อคงศัพท์เฉพาะของผู้ใช้

```bash
tto keep "คำสำคัญ"
tto forget "คำสำคัญ"
tto dictionary
```

หลักการ:

- คำใน dictionary เป็น hard protected
- ระบบจะไม่ตัดหรือเปลี่ยนคำที่ผู้ใช้ `keep`
- เหมาะกับ jargon, project name, domain-specific term, ชื่อโมดูล, ชื่อสูตร, คำเฉพาะทีม

ตัวอย่าง:

```bash
tto keep "ระบบเทพ"
tto compress --pretty "รบกวนช่วยอธิบายระบบเทพแบบละเอียด"
```

---

## 13. Quality, Coach, และ Guided Remediation

### 13.1 Quality score

```bash
tto quality --pretty
```

ใช้ดู:

- score / grade
- strict gate
- MTP gate
- action routing gate
- weak signals
- suggested actions
- stage 1 / stage 2 quality signals
- distortion bounds
- calibration signal

### 13.2 Coach mode

```bash
tto coach --pretty
```

ใช้แปลง weak signals เป็น fix plan ที่อ่านง่าย พร้อม owner/severity

### 13.3 Apply remediation

```bash
tto coach --apply safe --pretty
tto coach --apply quick --pretty
```

ความแตกต่าง:

| Mode | ทำอะไร |
|---|---|
| `safe` | ตั้งค่าที่ปลอดภัยและ capture precompact checkpoint |
| `quick` | ทำแบบ safe แล้ว capture postcompact checkpoint เพิ่ม |

---

## 14. Benchmark และ CI Gates

### 14.1 Benchmark ปกติ

```bash
tto benchmark --pretty
```

### 14.2 Strict benchmark

```bash
tto benchmark --pretty --strict --default-policy
```

### 14.3 Strict + MTP

```bash
tto benchmark --pretty --strict --default-policy --mtp
```

Benchmark ตรวจ:

- average token saving
- preservation
- strict gate
- MTP gate
- enhanced vs baseline KPI
- detector signals เช่น `output_waste`, `tool_cascade`, `bad_decomposition`
- action routing suggestions

Artifacts ที่เกี่ยวข้อง:

```text
benchmarks/regression_report.md
benchmarks/regression_report.json
benchmarks/regression_diff.md
benchmarks/regression_history.jsonl
benchmarks/regression_trend.md
benchmarks/fleet_history.jsonl
```

### 14.4 CI commands

```bash
npm test
npm run test:ci
npm run ci
```

หมายเหตุ:

- `npm run ci` ออกแบบให้รัน tests, benchmark strict MTP, และ `doctor --ci`
- ผลลัพธ์ขึ้นกับ test suite และ local repository state ณ เวลารัน
- อย่าเขียนเอกสารว่า CI ผ่าน หากยังไม่ได้รันจริงใน environment นั้น

---

## 15. Operations Analytics

### 15.1 One-shot report

```bash
tto ops --pretty
```

แสดง overview, quality, trend, fleet/doctor/calibration ในชุดเดียว

### 15.2 Scan

```bash
tto ops scan --pretty
```

เทียบเท่าการตรวจ fleet พร้อม doctor, calibration และ session scan

### 15.3 Audit target

```bash
tto ops audit codex --pretty
```

เรียก doctor target เดียวผ่าน ops family

### 15.4 Context / Quality / Drift / Validate

```bash
tto ops context --pretty
tto ops quality --pretty
tto ops drift --pretty
tto ops validate --pretty
```

`ops validate` จะรัน benchmark แบบ strict/default-policy/MTP

---

## 16. Fleet / Organization View

ใช้ตรวจหลาย repo หรือหลาย agent พร้อมกัน

```bash
tto fleet --pretty
```

ระบุ roots:

```bash
tto fleet --pretty --roots /path/repoA,/path/repoB
```

เปิด doctor ต่อโปรเจกต์:

```bash
tto fleet --pretty --roots /path/repoA,/path/repoB --doctor --doctor-target codex
```

เปิด calibration และ session scan:

```bash
tto fleet --pretty --calibration --session-scan
```

ตัวชี้วัดที่ดูได้:

- projects
- benchmark pass/fail
- strict/MTP/routing pass
- avg quality
- avg saving
- waste total
- calibration gap
- session scan detector findings
- estimated cost/confidence

---

## 17. Calibration

Calibration ใช้เทียบ estimated token กับ real provider usage เพื่อหาช่องว่างระหว่าง heuristic กับ usage จริง

### 17.1 ดูสถานะ

```bash
tto calibration status --pretty
```

### 17.2 บันทึก manual sample

```bash
tto calibration record --estimated 1200 --real 1350 --target codex
```

### 17.3 บันทึกจาก stats รวม

```bash
tto calibration from-stats --real-total 25000 --samples 20 --target codex
```

### 17.4 ล้าง calibration records

```bash
tto calibration clear
```

ใช้ร่วมกับ CI gate:

```bash
npm run calibration:history
npm run calibration:gate
```

---

## 18. Checkpoint / Continuity Lite

Checkpoint ใช้เก็บ continuity state ก่อน/หลัง compact หรือจุดสำคัญของ session

```bash
tto checkpoint status --pretty
tto checkpoint list --pretty
tto checkpoint capture "before large refactor" --pretty
tto checkpoint precompact "before context compaction" --pretty
tto checkpoint postcompact "after context compaction" --pretty
tto checkpoint restore latest --pretty
```

Lifecycle events ที่ระบบใช้:

| Event | ใช้เมื่อ |
|---|---|
| `capture` | ผู้ใช้ต้องการ snapshot เอง |
| `precompact` | ก่อน compact context |
| `postcompact` | หลัง compact context |
| fill-band checkpoint | context usage สูงตาม band |
| quality-drop checkpoint | quality score ตกผ่าน threshold |
| milestone checkpoint | session milestone |

---

## 19. Read-cache Analytics และ `.contextignore`

Read-cache ช่วยดูว่า workflow อ่านไฟล์ซ้ำมากแค่ไหน เพื่อลด token จาก repeated context

```bash
tto cache stats --pretty
tto cache clear
```

Policy ที่เกี่ยวข้อง:

```bash
tto config set readCache.mode warn
tto config set readCache.mode block
```

`.contextignore` ใช้ block ไฟล์ที่ไม่ควรถูกอ่านซ้ำหรือไม่ควรเข้า context

ตัวอย่าง `.contextignore`:

```text
node_modules/
benchmarks/regression_report.json
*.log
```

ถ้าโดน block จะพบ error ประมาณ:

```text
Blocked by .contextignore: <file>
```

---

## 20. Context Audit

Context audit แยกต้นทุน context ตาม component

```bash
tto context --pretty
```

หรือผ่าน ops:

```bash
tto ops context --pretty
```

ตรวจ component เช่น:

- skills
- MCP/config
- memory
- agents
- tools
- package/config files
- benchmark artifacts

ใช้เมื่อต้องรู้ว่า token overhead มาจากส่วนใดของ repo/session

---

## 21. Backup, Rollback, Uninstall

### 21.1 Backup

```bash
tto backup all
tto backup codex
tto backup claude
tto backup gemini
tto backup opencode
tto backup openclaw
tto backup hermes
```

### 21.2 List backups

```bash
tto backups
```

### 21.3 Dry-run rollback

```bash
tto rollback latest --dry-run
tto rollback codex --dry-run
tto rollback gemini --dry-run
```

### 21.4 Apply rollback

```bash
tto rollback latest
tto rollback codex
```

### 21.5 Uninstall

```bash
tto uninstall codex
tto uninstall claude
tto uninstall gemini
tto uninstall opencode
tto uninstall openclaw
tto uninstall hermes
tto uninstall all
```

กฎสำคัญ:

- dry-run ก่อน rollback เสมอ
- target-specific rollback ต้อง restore เฉพาะ target นั้น
- uninstall ต้อง backup ก่อนเปลี่ยน config
- ห้ามลบ user config ที่ไม่ได้สร้างโดย TTO แบบเงียบๆ

---

## 22. Doctor / Health Check

ตรวจสุขภาพรวม:

```bash
tto doctor --pretty
```

ตรวจ target เดียว:

```bash
tto doctor codex --pretty
tto doctor claude --pretty
tto doctor gemini --pretty
tto doctor opencode --pretty
tto doctor openclaw --pretty
tto doctor hermes --pretty
```

ใช้ใน CI/package health:

```bash
tto doctor --ci
```

อ่านผล:

| สถานะ | ความหมาย |
|---|---|
| PASS | ตรวจผ่านตาม config/local footprint |
| WARN | มีบาง integration ยังไม่ครบหรือ optional target ไม่พร้อม |
| FAIL | มีปัญหาที่ควรแก้ก่อนใช้งานจริง |

หมายเหตุ: `doctor --pretty` ในเครื่อง local อาจเป็น WARN หากยังไม่ได้ติดตั้ง adapter บางตัว หรือ binary ของ agent นั้นไม่มีในเครื่อง นั่นไม่เท่ากับ core compression พังเสมอไป

---

## 23. Safety Classifier

ตรวจความเสี่ยงของ prompt/command:

```bash
tto classify --pretty "DROP TABLE users production secret"
```

Risk ที่ทำให้เข้า safe behavior:

- destructive command เช่น `rm -rf`, `git reset --hard`
- database destructive เช่น `DROP TABLE`, `TRUNCATE`, `DELETE FROM`
- production/deploy/release
- secrets/API keys/private keys
- auth/payment/billing
- global config เช่น `~/.codex/*`, `~/.claude/*`
- package publish/CI release

Safe answer ต้องมี:

```text
risk
backup/dry-run
exact command
verification
rollback
```

---

## 24. Token Estimate และ Exact Mode

### 24.1 Heuristic estimate

```bash
tto estimate --target codex "ข้อความภาษาไทยสำหรับทดสอบ token"
```

### 24.2 Exact mode

```bash
tto estimate --exact --target codex "ข้อความภาษาไทยสำหรับทดสอบ token"
```

ข้อควรระวัง:

- ถ้า optional tokenizer ไม่พร้อม ระบบ fallback เป็น heuristic
- ห้าม claim ว่า exact ถ้า output ระบุ `exact: false`
- token count ต่างกันตาม target/model/tokenizer

---

## 25. Preservation Check

ตรวจว่า optimized file ยังรักษาความหมายและ critical terms จาก original ได้หรือไม่

```bash
tto preserve original.txt optimized.txt
```

ควรใช้หลัง rewrite ขนาดใหญ่ หรือก่อนนำ prompt ที่บีบอัดไปใช้จริงในงาน production/research

---

## 26. Config Policy

ดู path:

```bash
tto config path
```

สร้างค่าเริ่มต้น:

```bash
tto config init
```

ดู config:

```bash
tto config get
```

ตั้งค่า:

```bash
tto config set defaultMode auto
tto config set defaultProfile coding
tto config set safetyMode strict
tto config set exactTokenizer false
tto config set readCache.mode warn
tto config set readCache.mode block
```

ไฟล์หลักอยู่ใต้:

```text
~/.thai-token-optimizer/config.json
~/.thai-token-optimizer/state.json
~/.thai-token-optimizer/dictionary.json
~/.thai-token-optimizer/checkpoints.jsonl
~/.thai-token-optimizer/cache-reads.jsonl
~/.thai-token-optimizer/cache-decisions.jsonl
~/.thai-token-optimizer/calibration.jsonl
```

---

## 27. Files และ Project Structure

```text
thai-token-optimizer/
├── bin/
│   └── thai-token-optimizer.js
├── hooks/
│   ├── tto-compressor.js
│   ├── tto-budget-compressor.js
│   ├── tto-code-aware-parser.js
│   ├── tto-constraint-locker.js
│   ├── tto-preservation-checker.js
│   ├── tto-token-estimator.js
│   ├── tto-safety-classifier.js
│   ├── tto-runtime-analytics.js
│   ├── tto-context-audit.js
│   ├── tto-fleet-audit.js
│   ├── tto-fleet-detectors.js
│   ├── tto-session-parsers.js
│   ├── tto-doctor.js
│   ├── tto-backup.js
│   ├── tto-policy.js
│   └── tto-ui.js
├── adapters/
├── benchmarks/
├── tests/
├── .codex-plugin/
├── .claude-plugin/
├── .github/
├── README.md
├── MANUAL.md
├── AGENTS.md
├── package.json
└── LICENSE
```

---

## 28. Testing สำหรับผู้พัฒนา

Syntax/targeted tests:

```bash
node --check bin/thai-token-optimizer.js
node --test tests/test_pretty_ui.js
node --test tests/test_mtp_speculative.js tests/test_mtp_benchmark.js tests/test_mtp_detectors.js
node --test tests/test_fleet_auditor.js tests/test_session_parsers_integration.js
```

Full tests:

```bash
npm test
npm run test:ci
npm run ci
```

Benchmark/fleet scripts:

```bash
npm run benchmark:strict
npm run benchmark:history
npm run benchmark:trend
npm run fleet:fixtures
npm run fleet:history
npm run fleet:gate
npm run calibration:history
npm run calibration:gate
```

ถ้า test สร้าง artifact เช่น `benchmarks/regression_report.md` หรือ `benchmarks/regression_report.json` ให้ตรวจ `git status` ก่อน commit เสมอ

---

## 29. Troubleshooting

### 29.1 `UserPromptSubmit hook failed`

อาการ:

```text
UserPromptSubmit hook failed
error: hook returned invalid user prompt submit JSON output
```

สาเหตุที่พบบ่อย:

- hook เขียน text/log ลง stdout ปนกับ JSON
- JSON schema ไม่ตรงกับ agent hook contract
- exception แล้ว fallback output ไม่ใช่ JSON

ตรวจ:

```bash
tto doctor codex --pretty
node --check hooks/tto-mode-tracker.js
node --check hooks/tto-stop-summary.js
```

แนวทางแก้:

- stdout ต้องเป็น JSON เท่านั้นสำหรับ hook ที่ agent ต้อง parse
- debug log ควรไป stderr หรือปิดใน hook path
- fallback ต้องคืน minimal valid JSON เช่น `{"continue":true}` ตาม hook contract

### 29.2 `Stop hook failed`

อาการ:

```text
Stop hook failed
error: hook returned invalid stop hook JSON output
```

ตรวจ:

```bash
tto doctor codex --pretty
node --check hooks/tto-stop-summary.js
```

แนวทางแก้:

- stop hook ต้องคืน JSON ที่ Codex รับได้
- ห้ามพิมพ์ dashboard/banner ลง stdout ใน stop hook
- ใช้ stage message แบบ compact เฉพาะช่องทางที่ agent อนุญาต

### 29.3 `doctor` เป็น WARN

ไม่จำเป็นต้องแปลว่า TTO core พังเสมอไป ให้ดู target ที่ WARN:

```bash
tto doctor --pretty
tto doctor codex --pretty
tto doctor hermes --pretty
```

ถ้าเป็น optional adapter ที่ยังไม่ได้ติดตั้งจริง สามารถติดตั้ง target นั้นหรือปล่อยไว้ตาม workflow ได้

### 29.4 `benchmark` fail

ตรวจ artifacts:

```bash
tto benchmark --pretty --strict --default-policy --mtp
tto quality --pretty
tto coach --pretty
```

ถ้าเกิด action routing fail หรือ MTP fail ให้ดู weak signals และ suggested actions ก่อนปรับ threshold

---

## 30. Recommended Daily Workflow

เริ่มงาน:

```bash
tto auto
tto status --pretty
tto checkpoint capture "start session" --pretty
```

ระหว่างทำงาน:

```bash
tto compress --pretty --check --target codex --budget 500 prompt.txt
tto cache stats --pretty
tto quality --pretty
```

ก่อน compact/refactor ใหญ่:

```bash
tto checkpoint precompact "before major context compaction" --pretty
```

หลัง compact:

```bash
tto checkpoint postcompact "after context compaction" --pretty
tto coach --pretty
```

ก่อน commit/release:

```bash
node --check bin/thai-token-optimizer.js
node --test tests/test_pretty_ui.js
tto benchmark --pretty --strict --default-policy --mtp
tto doctor --pretty
```

---

## 31. What Not To Do

ห้าม:

- เปลี่ยน `2.0.0` เป็น version อื่นโดยไม่มีคำสั่งจาก maintainer
- ลบ preservation/safety/rollback behavior
- บีบอัดจน command/path/version/error ผิด
- claim ว่า tests ผ่านถ้ายังไม่ได้รัน
- claim exact tokenizer ถ้า fallback เป็น heuristic
- rollback ทุก target เมื่อผู้ใช้ขอ target เดียว
- ใส่ stdout log ลง hook ที่ต้องคืน JSON
- ใช้ `full` กับ production/DB/secret/payment/auth โดยไม่เข้า safe behavior

---

## 32. Minimal Command Cheat Sheet

```bash
# status/dashboard
tto status --pretty
tto dashboard --view overview

# mode/profile
tto auto
tto safe
tto profile coding

# compression
tto compress --pretty --level auto --target codex --budget 500 --check prompt.txt
tto compress --speculative --diagnostics --check prompt.txt

# personalization
tto keep "คำเฉพาะ"
tto dictionary

# quality/benchmark
tto benchmark --pretty --strict --default-policy --mtp
tto quality --pretty
tto coach --pretty

# operations
tto ops --pretty
tto fleet --pretty --doctor --calibration --session-scan
tto context --pretty
tto cache stats --pretty
tto checkpoint status --pretty

# install/safety
tto backup all
tto install all
tto doctor --pretty
tto rollback latest --dry-run
```

---

## 33. Complete Command Reference

หมวดนี้สรุปการใช้งาน **ทุก command surface** ของ TTO v2.0 ตาม CLI ปัจจุบัน ใช้เป็น cheat sheet เชิงปฏิบัติสำหรับผู้ใช้และผู้ดูแลระบบ

หมายเหตุ:

- ตัวอย่าง output บางคำสั่งเป็นรูปแบบย่อ เพื่อไม่ให้คู่มือยาวเกินไป
- คำสั่ง `install`, `uninstall`, `rollback` มีผลกับ config จริง ควร backup/dry-run ก่อนเสมอ
- ค่าจริงใน pretty UI เปลี่ยนตาม local state, installed adapters, benchmark artifacts, cache, checkpoints และ calibration records

### 33.1 Mode Commands

| Command | ใช้ทำอะไร | Output หลัก |
|---|---|---|
| `tto on` | เปิดระบบแบบ auto | `Thai Token Optimizer v2.0: ON auto` |
| `tto auto` | เปิด auto mode | `Thai Token Optimizer v2.0: ON auto` |
| `tto lite` | เปิด lite mode | `Thai Token Optimizer v2.0: ON lite` |
| `tto full` | เปิด full mode | `Thai Token Optimizer v2.0: ON full` |
| `tto safe` | เปิด safe mode | `Thai Token Optimizer v2.0: ON safe` |
| `tto off` | ปิด optimizer | `Thai Token Optimizer v2.0: OFF` |
| `tto stop` | alias ของ `off` | `Thai Token Optimizer v2.0: OFF` |

ตัวอย่าง:

```bash
tto auto
tto status --pretty
```

### 33.2 Status, UI, Dashboard

| Command | ใช้ทำอะไร | เหมาะกับ |
|---|---|---|
| `tto status` | ดู state JSON | automation/debug |
| `tto status --pretty` | ดูสถานะแบบกล่อง terminal | ผู้ใช้ทั่วไป |
| `tto ui` | dashboard overview | เปิดดูภาพรวมเร็ว |
| `tto dashboard` | dashboard overview | alias ของ `ui` |
| `tto dashboard --view overview` | ภาพรวมระบบ | daily health |
| `tto dashboard --view quality` | quality score | release/CI triage |
| `tto dashboard --view waste` | waste signals/actions | หา token waste |
| `tto dashboard --view trend` | rolling trend | ดู drift หลายรัน |
| `tto dashboard --view agents` | integration checks | ดู agent footprint |
| `tto dashboard --view doctor` | doctor panel | health triage |
| `tto dashboard --view fleet` | fleet panel | หลาย repo/หลาย agent |

ตัวอย่าง:

```bash
tto dashboard --view quality
```

### 33.3 Profile Commands

| Command | ใช้ทำอะไร |
|---|---|
| `tto profile` | ดู profile ปัจจุบัน |
| `tto profile show` | ดู profile ปัจจุบัน |
| `tto profile list` | ดู profile ทั้งหมด |
| `tto profile coding` | code/patch first |
| `tto profile command` | terminal command first |
| `tto profile research` | research/methodology |
| `tto profile teaching` | compact teaching |
| `tto profile paper` | academic/safe style |
| `tto profile ultra` | maximum compression สำหรับงานไม่เสี่ยง |

ตัวอย่าง:

```bash
tto profile coding
```

### 33.4 Compression Commands

| Command | ใช้ทำอะไร |
|---|---|
| `tto compress <text>` | บีบอัดข้อความโดยตรง |
| `tto compress prompt.txt` | บีบอัดจากไฟล์ |
| `tto compress --level auto prompt.txt` | บีบอัดตาม auto mode |
| `tto compress --budget 500 prompt.txt` | พยายามลดให้ใกล้ budget |
| `tto compress --target codex prompt.txt` | ใช้ Codex estimator |
| `tto compress --target claude prompt.txt` | ใช้ Claude estimator |
| `tto compress --check prompt.txt` | ตรวจ preservation |
| `tto compress --pretty prompt.txt` | แสดงผลแบบ UI |
| `tto compress --speculative prompt.txt` | เปิด MTP/speculative เฉพาะคำสั่งนี้ |
| `tto compress --no-speculative prompt.txt` | ปิด MTP/speculative เฉพาะคำสั่งนี้ |
| `tto compress --diagnostics prompt.txt` | แสดง candidate selection diagnostics |
| `tto rewrite ...` | alias ของ `compress` |

ตัวอย่างแนะนำ:

```bash
tto compress --pretty --level auto --target codex --budget 500 --check prompt.txt
```

Speculative precedence:

```text
1. --no-speculative
2. --speculative
3. state.speculative
```

### 33.5 Personalization Commands

| Command | ใช้ทำอะไร |
|---|---|
| `tto keep <word>` | เพิ่มคำลง user dictionary ห้ามบีบอัด |
| `tto forget <word>` | ลบคำจาก user dictionary |
| `tto dictionary` | แสดงคำทั้งหมดใน dictionary |

ตัวอย่าง:

```bash
tto keep "ระบบเทพ"
tto dictionary
tto forget "ระบบเทพ"
```

### 33.6 Safety and Preservation Commands

| Command | ใช้ทำอะไร |
|---|---|
| `tto classify <text>` | classify risk JSON/text |
| `tto classify --pretty <text>` | safety UI |
| `tto preserve original.txt optimized.txt` | ตรวจ semantic preservation ระหว่างไฟล์ |
| `tto estimate <text>` | ประมาณ token |
| `tto estimate --target codex <text>` | ประมาณ token สำหรับ Codex |
| `tto estimate --exact --target codex <text>` | ใช้ exact tokenizer ถ้าพร้อม |

ตัวอย่าง:

```bash
tto classify --pretty "DROP TABLE users production secret"
tto preserve original.txt optimized.txt
tto estimate --exact --target codex "ข้อความภาษาไทย"
```

### 33.7 Benchmark, Quality, Coach

| Command | ใช้ทำอะไร |
|---|---|
| `tto benchmark` | run benchmark ปกติ |
| `tto benchmark --pretty` | benchmark UI |
| `tto benchmark --strict` | เปิด strict gate |
| `tto benchmark --default-policy` | ไม่พึ่ง user policy |
| `tto benchmark --mtp` | เปิด MTP comparison |
| `tto quality` | quality JSON จาก artifacts |
| `tto quality --pretty` | quality UI |
| `tto coach` | guided remediation JSON |
| `tto coach --pretty` | coach UI |
| `tto coach --apply safe --pretty` | apply safe remediation |
| `tto coach --apply quick --pretty` | apply quick remediation |

ตัวอย่าง release gate:

```bash
tto benchmark --pretty --strict --default-policy --mtp
tto quality --pretty
tto coach --pretty
```

### 33.8 Operations Analytics Commands

| Command | ใช้ทำอะไร |
|---|---|
| `tto ops --pretty` | one-shot operations report |
| `tto ops scan --pretty` | fleet scan + doctor/calibration/session scan |
| `tto ops audit codex --pretty` | doctor target ผ่าน ops |
| `tto ops context --pretty` | context audit ผ่าน ops |
| `tto ops quality --pretty` | quality ผ่าน ops |
| `tto ops drift --pretty` | trend/drift view |
| `tto ops validate --pretty` | benchmark strict/default-policy/MTP |

ตัวอย่าง:

```bash
tto ops --pretty
tto ops validate --pretty
```

### 33.9 Fleet Commands

| Command | ใช้ทำอะไร |
|---|---|
| `tto fleet --pretty` | fleet summary ของ repo ปัจจุบัน |
| `tto fleet --roots dir1,dir2 --pretty` | audit หลาย repo |
| `tto fleet --doctor --pretty` | เปิด doctor ต่อ project |
| `tto fleet --doctor-target codex --pretty` | doctor เฉพาะ target |
| `tto fleet --calibration --pretty` | รวม calibration gap |
| `tto fleet --session-scan --pretty` | scan session logs/detectors |
| `tto fleet --calibration-limit 50 --pretty` | จำกัดจำนวน calibration records |

ตัวอย่าง:

```bash
tto fleet --pretty --roots /path/repoA,/path/repoB --doctor --doctor-target codex --calibration --session-scan
```

### 33.10 Calibration Commands

| Command | ใช้ทำอะไร |
|---|---|
| `tto calibration status` | ดู calibration JSON |
| `tto calibration status --pretty` | calibration UI |
| `tto calibration record --estimated N --real N` | บันทึก sample manual |
| `tto calibration from-stats --real-total N --samples N` | calibrate จาก stats รวม |
| `tto calibration clear` | ล้าง calibration records |

ตัวอย่าง:

```bash
tto calibration record --estimated 1200 --real 1350 --target codex
tto calibration status --pretty
```

### 33.11 Checkpoint Commands

| Command | ใช้ทำอะไร |
|---|---|
| `tto checkpoint status` | checkpoint JSON |
| `tto checkpoint status --pretty` | checkpoint UI |
| `tto checkpoint list --pretty` | list checkpoints |
| `tto checkpoint capture "note" --pretty` | capture manual snapshot |
| `tto checkpoint restore latest --pretty` | restore latest checkpoint |
| `tto checkpoint restore <id> --pretty` | restore checkpoint by id |
| `tto checkpoint precompact "note" --pretty` | snapshot ก่อน compact |
| `tto checkpoint postcompact "note" --pretty` | snapshot หลัง compact |

ตัวอย่าง:

```bash
tto checkpoint precompact "before compact" --pretty
tto checkpoint postcompact "after compact" --pretty
```

### 33.12 Cache and Context Commands

| Command | ใช้ทำอะไร |
|---|---|
| `tto cache stats` | read-cache JSON |
| `tto cache stats --pretty` | read-cache UI |
| `tto cache clear` | ล้าง read-cache analytics |
| `tto context` | context audit JSON |
| `tto context --pretty` | context audit UI |

ตัวอย่าง:

```bash
tto cache stats --pretty
tto context --pretty
```

### 33.13 Config Commands

| Command | ใช้ทำอะไร |
|---|---|
| `tto config path` | แสดง path config |
| `tto config init` | สร้าง config เริ่มต้น |
| `tto config get` | แสดง config JSON |
| `tto config set <key> <value>` | ตั้งค่า policy |

ตัวอย่าง:

```bash
tto config set defaultMode auto
tto config set readCache.mode warn
tto config set readCache.mode block
```

### 33.14 Install, Backup, Rollback Commands

| Command | ใช้ทำอะไร |
|---|---|
| `tto backup all` | backup config ทุก target |
| `tto backup codex` | backup เฉพาะ Codex |
| `tto backups` | list backups |
| `tto install <target>` | install adapter target |
| `tto install all` | install adapters ทั้งหมด |
| `tto install-agents` | merge `AGENTS.md` เข้า Codex agent guide |
| `tto uninstall <target>` | uninstall adapter target |
| `tto uninstall all` | uninstall adapters ทั้งหมด |
| `tto rollback latest --dry-run` | preview rollback latest |
| `tto rollback latest` | restore latest backup |
| `tto rollback <target> --dry-run` | preview target rollback |
| `tto rollback <id>` | restore backup id |

Targets ที่รองรับ:

```text
all
codex
claude
gemini
opencode
openclaw
hermes
cursor
aider
cline
roo
```

Safe install workflow:

```bash
tto backup all
tto install all
tto doctor --pretty
```

Safe rollback workflow:

```bash
tto rollback latest --dry-run
tto rollback latest
tto doctor --pretty
```

### 33.15 NPM Scripts

| Script | ใช้ทำอะไร |
|---|---|
| `npm test` | run Node tests แบบ glob |
| `npm run test:ci` | run CI test runner |
| `npm run ci` | tests + strict MTP benchmark + `doctor --ci` |
| `npm run benchmark` | run benchmark |
| `npm run benchmark:strict` | run strict benchmark |
| `npm run benchmark:history` | update benchmark history |
| `npm run benchmark:trend` | render trend report |
| `npm run fleet:fixtures` | generate fleet fixtures |
| `npm run fleet:history` | update fleet history |
| `npm run fleet:gate` | run fleet drift gate |
| `npm run calibration:history` | update calibration history |
| `npm run calibration:gate` | run calibration CI gate |

---

## 34. Complete Terminal UI Gallery

หมวดนี้รวมหน้าจอ terminal UI สำคัญของ TTO v2.0 พร้อมคำอธิบาย ใช้เป็น reference ว่าผู้ใช้จะเห็นอะไรเมื่อรันคำสั่งจริง

### 34.1 Status UI

คำสั่ง:

```bash
tto status --pretty
```

ใช้ตอบคำถามเร็วว่า TTO เปิดอยู่หรือไม่ mode/profile/safety ปัจจุบันคืออะไร

```text
╭──────────────────────────────────────────────────────────────────────╮
│ ⚡ Thai Token Optimizer v2.0.0                                        │
├──────────────────────────────────────────────────────────────────────┤
│ Compact Thai responses for AI coding agents                          │
│                                                                      │
│ Status        ○ OFF                                                  │
│ Mode          auto                                                   │
│ Profile       coding                                                 │
│ Safety        strict                                                 │
│ Version       2.0.0                                                  │
│                                                                      │
│ Token Saving  █████████████░░░░░░░   63%                             │
│                                                                      │
│ Quick Commands                                                       │
│ tto auto       tto compress --pretty --budget 500 prompt.txt         │
│ tto doctor     tto benchmark --pretty --strict --default-policy      │
╰──────────────────────────────────────────────────────────────────────╯
```

### 34.2 Dashboard Overview UI

คำสั่ง:

```bash
tto dashboard --view overview
```

ใช้ดูภาพรวมระบบ, doctor summary, agent support, checkpoint และ read-cache ในหน้าเดียว

```text
╭────────────────────────────────────────────────────────────────────────────╮
│ ⚡ Thai Token Optimizer v2.0.0                              ○ OFF           │
├────────────────────────────────────────────────────────────────────────────┤
│ Token-efficient Thai workflow for Codex / Claude / Gemini / OpenCode / Op… │
│                                                                            │
│ Mode          auto            Profile   coding                             │
│ Safety        strict          Version   2.0.0                              │
│                                                                            │
│ Doctor        WARN            Checks    48/53                              │
│ Saving        ██████████░░░░░░ 63%                                         │
│                                                                            │
│ Agents                                                                     │
│ ✓ Codex         hooks + AGENTS.md                                          │
│ ✓ Claude Code   settings hooks                                             │
│ ✓ Gemini CLI    extension                                                  │
│ ✓ OpenCode      native plugin                                              │
│ ✓ OpenClaw      managed hook                                               │
│ ✓ Hermes Agent  shell + plugin hooks                                       │
│ ✓ Cursor/Aider/Cline/Roo rules                                             │
│                                                                            │
│ Checkpoint    0 total                                                      │
│ Read-cache    0 repeated files | reads 0                                   │
│                                                                            │
│ Quick Commands                                                             │
│ tto ui          tto doctor --pretty                                        │
│ tto compress --pretty --budget 500 prompt.txt                              │
│ tto rollback latest --dry-run                                              │
╰────────────────────────────────────────────────────────────────────────────╯
```

### 34.3 Dashboard Quality UI

คำสั่ง:

```bash
tto dashboard --view quality
tto quality --pretty
```

ใช้ดูคุณภาพรวม, gate status, weak signals และ suggested actions

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
│ Stage 1 Signals                                                                │
│ • contextFillRisk: 0%                                                          │
│ • sessionLengthRisk: 0%                                                        │
│ • modelRoutingRisk: 15%                                                        │
│ • emptyRunRisk: 0%                                                             │
│ • outcomeHealthRisk: 15%                                                       │
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

### 34.4 Dashboard Waste UI

คำสั่ง:

```bash
tto dashboard --view waste
```

ใช้หา waste signals ที่ทำให้ token ยังไม่ลดเต็มที่

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ 🧩 Waste Signals                                                                │
├────────────────────────────────────────────────────────────────────────────────┤
│ Total signals 2                                                                │
│                                                                                │
│ • low_saving_cluster | warn | 3 samples have <=1% savings; consider prompt de… │
│ • tool_cascade | warn | 3 consecutive low-saving technical turns detected; li… │
│                                                                                │
│ Actions                                                                        │
│ • add_tool_circuit_breaker: After 2 consecutive tool failures, stop retri…     │
│ • tune_selective_window: Increase selective-window aggressiveness for low…     │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### 34.5 Dashboard Trend UI

คำสั่ง:

```bash
tto dashboard --view trend
tto ops drift --pretty
```

ใช้ดู rolling history ของ saving, MTP gain และ slowdown drift

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ 📈 Trend (Rolling Window)                                                       │
├────────────────────────────────────────────────────────────────────────────────┤
│ Window size   1                                                                │
│ Source        benchmarks/regression_history.jsonl                              │
│                                                                                │
│ Slowdown ms   15.8 (latest)                                                    │
│ Gain %        566.7 (latest)                                                   │
│ Saving %      10.8 (latest)                                                    │
│                                                                                │
│ Recent Runs                                                                    │
│ • 2026-05-12T11:14:59.743Z | save 10.8% | gain 566.7% | slow 15.8ms | mtp F…   │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### 34.6 Compression UI

คำสั่ง:

```bash
tto compress --pretty --level auto --target codex --budget 120 --check "..."
```

ใช้ดู token before/after, saving ratio, preservation และ optimized preview

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ ✂️  Prompt Compression Result                                                  │
├────────────────────────────────────────────────────────────────────────────────┤
│ Target        codex                                                            │
│ Mode          auto                                                             │
│ Budget        120 tokens                                                       │
│                                                                                │
│ Before        42 tokens                                                        │
│ After         40 tokens                                                        │
│ Saved         2 tokens                                                         │
│ Ratio         █░░░░░░░░░░░░░░░░░░░   4.8%                                      │
│                                                                                │
│ Preservation  ████████████████████   100%                                      │
│ Risk          low                                                              │
│ Missing       0                                                                │
│                                                                                │
│ Optimized                                                                      │
│   อธิบายวิธีใช้งาน Thai Token Optimizer v2.0 โดยต้องคงคำสั่ง tto doctor --pre… │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### 34.7 Safety Classifier UI

คำสั่ง:

```bash
tto classify --pretty "DROP TABLE users production secret"
```

ใช้ก่อนงานเสี่ยงเพื่อดู risk level และ action ที่ควรทำ

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

### 34.8 Benchmark UI

คำสั่ง:

```bash
tto benchmark --pretty --strict --default-policy --mtp
```

ใช้ยืนยัน regression gate, preservation และ MTP comparison

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
│ Normal ms    0.7 (p95 1)                                                       │
│ Spec ms      7 (p95 8.7)                                                       │
│ Delta ms     6.3                                                               │
│ Spec Hits    7/8 (87.5%)                                                       │
│ MTP Gate     PASS                                                              │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### 34.9 Fleet UI

คำสั่ง:

```bash
tto fleet --pretty --calibration --session-scan
```

ใช้ audit หลายโปรเจกต์/หลาย agent พร้อม calibration และ detector summary

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
│ Doctor        OFF                                                              │
│ Calibration   ON (limit 50)                                                    │
│ SessionScan   ON                                                               │
│ Runs/Cost     0 runs | input 0 | cost ~$0                                      │
│ Detectors    0 findings | waste 0 tok | ~$0/mo                                 │
│                                                                                │
│ Coverage      Codex:1 Claude:1 CI:1                                            │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### 34.10 Coach UI

คำสั่ง:

```bash
tto coach --pretty
```

ใช้แปลง weak signals เป็น fix plan พร้อม severity/owner

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

### 34.11 Checkpoint UI

คำสั่ง:

```bash
tto checkpoint status --pretty
```

ใช้ดู continuity checkpoints และ lifecycle state

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ 🧷 Checkpoint / Continuity Lite                                                 │
├────────────────────────────────────────────────────────────────────────────────┤
│ Total         0                                                                │
│ Latest        none                                                             │
│ Session       -                                                                │
│ Fill bands    -                                                                │
│ Quality drop  -                                                                │
│ Milestones    -                                                                │
│                                                                                │
│ • no checkpoints                                                               │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### 34.12 Read-cache UI

คำสั่ง:

```bash
tto cache stats --pretty
```

ใช้หา repeated file reads และดูว่า `.contextignore` หรือ read-cache policy ช่วยลด context ได้ตรงไหน

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ 🗂️  Read-cache Analytics                                                       │
├────────────────────────────────────────────────────────────────────────────────┤
│ Mode          warn                                                             │
│ Total reads   6                                                                │
│ Unique files  6                                                                │
│ Repeated      0                                                                │
│                                                                                │
│ Decision Counts                                                                │
│ • miss: 6                                                                      │
│                                                                                │
│ Top Repeated Files                                                             │
│ • no repeated file reads                                                       │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### 34.13 Context Audit UI

คำสั่ง:

```bash
tto context --pretty
```

ใช้ดู token overhead ตาม component เช่น skills, agents, config, tools, MCP, memory

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ 🧭 Context Audit                                                                │
├────────────────────────────────────────────────────────────────────────────────┤
│ Total tokens  76239                                                            │
│ Total bytes   235200                                                           │
│                                                                                │
│ Components                                                                     │
│ • skills   tok    68127 |  89.4% | files 19                                    │
│ • agents   tok     3090 |   4.1% | files 5                                     │
│ • config   tok     2606 |   3.4% | files 7                                     │
│ • tools    tok     2300 |     3% | files 3                                     │
│ • mcp      tok      116 |   0.2% | files 1                                     │
│ • memory   tok        0 |     0% | files 0                                     │
│                                                                                │
│ Recommendations                                                                │
│ • ลด skills: ใช้งานเฉพาะไฟล์จำเป็น/แยกไฟล์ยาว                                  │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### 34.14 Calibration UI

คำสั่ง:

```bash
tto calibration status --pretty
```

ใช้ดู gap ระหว่าง estimated token และ real provider usage

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ 🎯 Real Session Calibration                                                     │
├────────────────────────────────────────────────────────────────────────────────┤
│ Samples       0                                                                │
│ Quality       unknown                                                          │
│ Avg gap       0%                                                               │
│ Avg bias      0                                                                │
│ Within 10%    0                                                                │
│ Within 20%    0                                                                │
│                                                                                │
│ Latest        none                                                             │
│ Path          ~/.thai-token-optimizer/calibration.jsonl                        │
│                                                                                │
│ Commands                                                                       │
│ tto calibration status --pretty                                                │
│ tto calibration record --estimated 1000 --real 1120                            │
│ tto calibration from-stats --real-total 24000 --samples 20                     │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### 34.15 Doctor UI

คำสั่ง:

```bash
tto doctor --pretty
```

ใช้ตรวจ installation footprint, hooks, adapters และ optional targets ในเครื่องนั้นๆ

```text
╭────────────────────────────────────────────────────────────────────────────────╮
│ 🩺 Thai Token Optimizer Doctor                                                  │
├────────────────────────────────────────────────────────────────────────────────┤
│ Overall       PASS / WARN / FAIL                                                │
│ Checks        passed/total                                                      │
│                                                                                │
│ Codex         config/hooks/AGENTS footprint                                     │
│ Claude        settings hook footprint                                           │
│ Gemini        extension + hook wrappers                                         │
│ OpenCode      plugin/config footprint                                           │
│ OpenClaw      managed hook + simulator                                          │
│ Hermes        shell hooks + plugin hooks                                        │
│                                                                                │
│ Next          fix WARN/FAIL target, then rerun `tto doctor --pretty`            │
╰────────────────────────────────────────────────────────────────────────────────╯
```

หมายเหตุ: Doctor UI ขึ้นกับ local installed adapters จึงอาจเป็น `WARN` แม้ core compression/benchmark ยังทำงานปกติ

### 34.16 Agent/Hook Stage UI

ผู้ใช้จะเห็น stage message เมื่อ hook ทำงานใน agent session:

```text
[TTO Stage 1/4] Detect Intent
ตรวจ mode/profile/risk และ trigger ที่ผู้ใช้ส่งมา

[TTO Stage 2/4] Compress Candidate
สร้าง candidate ที่ลด token ได้โดยยังไม่ตัด critical details

[TTO Stage 3/4] Preserve Critical
ล็อก command/path/version/error/config/safety; ถ้าเสี่ยงจะเข้า safe behavior

[TTO Stage 4/4] Output Compact
สรุปผลแบบสั้น ชัด พร้อม command/test/next action ที่จำเป็น
```

ถ้า hook ต้องคืน JSON ให้ agent parse ต้องระวังมาก:

```text
stdout = valid JSON only
debug logs = stderr หรือปิด
fallback = minimal valid JSON ตาม hook contract
```

---

## 35. Final Rule

TTO v2.0 ต้องทำให้ภาษาไทยในงาน AI coding agent กระชับขึ้น โดยไม่ทำลาย:

```text
safety
correctness
constraints
reproducibility
technical precision
```

ถ้าความสั้นชนกับความถูกต้อง ให้เลือกความถูกต้อง  
ถ้าการลด token ชนกับความปลอดภัย ให้เลือกความปลอดภัย  
ถ้า budget ชนกับ command/path/version/error ให้คง technical detail exact ก่อนเสมอ
