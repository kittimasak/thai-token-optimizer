<!--
============================================================================
Thai Token Optimizer v1.0
============================================================================
คำอธิบาย :
เครื่องมือเพิ่มประสิทธิภาพ token ภาษาไทยสำหรับ AI coding agents โดยยังคงความถูกต้องของคำสั่ง โค้ด และรายละเอียดทางเทคนิค

ผู้เขียน     : Dr.Kittimasak Naijit
Repository  : https://github.com/kittimasak/thai-token-optimizer

Copyright (c) 2026 Dr.Kittimasak Naijit

หมายเหตุ:
- ห้ามลบการรักษาโค้ดแบบ code-aware preservation, safety checks หรือ rollback behavior
- ไฟล์นี้เป็นส่วนหนึ่งของระบบ Thai Token Optimizer แบบ local-first CLI/hook
============================================================================
-->

# ⚡ Thai Token Optimizer

<div align="center">

## คำตอบภาษาไทยแบบกระชับสำหรับ AI coding agents

**Thai Token Optimizer v1.0** คือชุดเครื่องมือแบบ local-first ประกอบด้วย **CLI + hook + adapter pack** ที่ช่วยให้ AI coding assistants ตอบภาษาไทยแบบกระชับ โดยยังรักษาความถูกต้องทางเทคนิค คำสั่ง path เวอร์ชัน error ข้อจำกัดด้านความปลอดภัย และความสามารถในการทำซ้ำได้

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

**ภาษาไทยกระชับ คำสั่งปลอดภัย ความหมายไม่หาย**

<br/>

![Version](https://img.shields.io/badge/version-v1.0-blue)
![Package](https://img.shields.io/badge/package-1.0.0-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![Local First](https://img.shields.io/badge/local--first-yes-success)
![CLI](https://img.shields.io/badge/UI-CLI%20%2B%20Agent%20Hooks-purple)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

</div>

---

## 🔥 Thai Token Optimizer คืออะไร?

Thai Token Optimizer คือชั้นการสื่อสารภาษาไทยที่ประหยัด token สำหรับเครื่องมือ AI coding เช่น **Codex**, **Claude Code**, **Gemini CLI**, **OpenCode**, **OpenClaw**, **Hermes Agent**, **Cursor**, **Aider**, **Cline** และ **Roo Code**

เครื่องมือนี้ช่วยให้ agents ตอบภาษาไทยได้กระชับขึ้น โดยตัดคำฟุ่มเฟือย การอธิบายซ้ำ คำสุภาพที่ไม่จำเป็น และสำนวนที่ยาวเกินไป พร้อมปกป้องรายละเอียดทางเทคนิคที่ห้ามผิดเพี้ยนเด็ดขาด

เหมาะเมื่อ prompt ภาษาไทยและคำตอบภาษาไทยยาวเกินไป ซ้ำเกินไป หรือมีต้นทุน token สูงใน workflow งาน coding ที่ใช้ token จำนวนมาก

---

## ✨ แนวคิดหลัก

```text
ลด token ได้ แต่ห้ามลดความถูกต้อง ความปลอดภัย หรือเงื่อนไขสำคัญ
```

Thai Token Optimizer ไม่ใช่แค่ “ภาษาไทยสั้น ๆ”

แต่ถูกออกแบบมาเพื่อรักษาสิ่งต่อไปนี้:

- คำสั่ง
- โค้ด
- file paths
- URLs
- เลขเวอร์ชัน
- config keys
- error แบบตรงตัว
- API names
- database names
- model names
- hard constraints
- safety warnings
- ขั้นตอน backup / rollback

---

## 🧠 ทำไมต้องมีเครื่องมือนี้?

ภาษาไทยสามารถใช้ token จำนวนมากใน workflow ของ LLM โดยเฉพาะเมื่อ prompt มีบริบทซ้ำ คำสุภาพ คำอธิบายยาว และรายละเอียดทางเทคนิคที่ผสมไทย-อังกฤษ

Thai Token Optimizer แก้ปัญหานี้ด้วยการเพิ่ม:

| ปัญหา | วิธีแก้ |
|---|---|
| คำตอบภาษาไทยยืดยาวเกินไป | กฎการตอบภาษาไทยแบบกระชับ |
| Prompt มีบริบทซ้ำมากเกินไป | การบีบอัด prompt แบบ local |
| คำสั่งหรือเวอร์ชันผิดเพี้ยน | การรักษารายละเอียดแบบ code-aware |
| งานเสี่ยงถูกบีบอัดมากเกินไป | Safety classifier + safe mode |
| Config ของ AI tool จัดการยาก | Installer + backup + rollback |
| Output ของ CLI อ่านยาก | Pretty terminal UI |
| การตั้งค่าหลาย agents ไม่สอดคล้องกัน | Adapters สำหรับหลายเครื่องมือ |
| จับ regression ได้ยาก | Strict benchmark + CI gate |

---

## ✅ เครื่องมือที่รองรับ

| เครื่องมือ | ประเภทการเชื่อมต่อ | คำสั่งติดตั้งหลัก |
|---|---|---|
| **Codex** | Hooks + `AGENTS.md` แบบเลือกใช้ได้ | `tto install codex` |
| **Claude Code** | Hooks ใน `settings.json` | `tto install claude` |
| **Gemini CLI** | Extension + commands + hooks | `tto install gemini` |
| **OpenCode** | Native plugin + config | `tto install opencode` |
| **OpenClaw** | Managed hook + `openclaw.json` config | `tto install openclaw` |
| **Hermes Agent** | Shell hooks + plugin hooks + `config.yaml` | `tto install hermes` |
| **Cursor** | Rule file adapter | `tto install cursor` |
| **Aider** | Guidance file adapter | `tto install aider` |
| **Cline** | Rule file adapter | `tto install cline` |
| **Roo Code** | Rule file adapter | `tto install roo` |

ติดตั้งทุก target ที่รองรับ:

```bash
tto install all
```

---

## 🖥️ UI: CLI UI + Agent/Hook UI

Thai Token Optimizer **ไม่ได้ใช้ web dashboard**

ระบบนี้มี interface จริง 2 แบบ:

```text
Thai Token Optimizer UI
├── CLI UI
│   ├── คำสั่งใน Terminal: tto ...
│   ├── output แบบ JSON/text สำหรับ automation
│   └── Pretty Terminal UI สำหรับมนุษย์
│
└── Agent/Hook UI
    ├── คำสั่งในแชต: token thai auto
    ├── การ inject behavior ผ่าน hook
    └── คำตอบภาษาไทยแบบกระชับภายใน AI tools
```

---

## 🎨 Pretty CLI UI

Thai Token Optimizer v1.0 มี terminal UI renderer แบบไม่ต้องพึ่ง dependency โดยใช้กรอบ Unicode และ progress bars

```bash
tto ui
```

ตัวอย่าง:

```text
╭────────────────────────────────────────────────────────────────────────────╮
│ ⚡ Thai Token Optimizer v1.0                              ● ACTIVE          │
├────────────────────────────────────────────────────────────────────────────┤
│ Token-efficient Thai workflow for Codex / Claude / Gemini / OpenCode / OpenClaw / Hermes       │
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
│ ✓ OpenClaw      managed hook                                               │
│ ✓ Hermes Agent  shell + plugin hooks                                       │
│ ✓ Cursor/Aider/Cline/Roo rules                                             │
│                                                                            │
│ Quick Commands                                                             │
│ tto ui          tto doctor --pretty                                        │
│ tto compress --pretty --budget 500 prompt.txt                              │
│ tto rollback latest --dry-run                                              │
╰────────────────────────────────────────────────────────────────────────────╯
```

คำสั่ง pretty อื่น ๆ:

```bash
tto status --pretty
tto doctor --pretty
tto compress --pretty --level auto --budget 500 --target codex --check prompt.txt
tto classify --pretty "DROP TABLE users production secret"
tto benchmark --pretty --strict --default-policy
```

ใช้ `--pretty` สำหรับมนุษย์  
ใช้ output แบบ JSON/text ปกติสำหรับ scripts และ automation

---

## 🚀 เริ่มใช้งานอย่างรวดเร็ว

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. รัน tests

```bash
npm test
npm run ci
```

ผลลัพธ์ที่คาดหวัง:

```text
75 tests passed
0 failed
package version: 1.0.0
```

### 3. ติดตั้ง integrations

```bash
tto install all
```

หรือใช้คำสั่ง Node โดยตรง:

```bash
node bin/thai-token-optimizer.js install all
```

### 4. ติดตั้ง Codex AGENTS.md integration

```bash
tto install-agents
```

### 5. ตรวจสุขภาพระบบ

```bash
tto doctor --pretty
```

### 6. เปิด auto mode

```bash
tto auto
```

### 7. Restart AI CLI tool ของคุณ

จากนั้นพิมพ์ภายใน Codex / Claude Code / Gemini CLI / OpenCode / OpenClaw / Hermes Agent:

```text
token thai auto
```

หรือ:

```text
ลด token ไทย
```

---

## 📦 สิ่งที่ต้องมี

- Node.js **18.0.0 หรือใหม่กว่า**
- npm
- Optional tokenizer packages:
  - `@dqbd/tiktoken`
  - `gpt-tokenizer`

เครื่องมือนี้ทำงานได้โดยไม่ต้องมี optional tokenizer packages โดยจะ fallback ไปใช้ built-in heuristic estimator

---

## 🚀 ติดตั้งจาก GitHub

ใช้ส่วนนี้เมื่อต้องการติดตั้งโดยตรงจาก GitHub repository:

```text
https://github.com/kittimasak/thai-token-optimizer
```

### 1. Clone repository

```bash
git clone https://github.com/kittimasak/thai-token-optimizer.git
cd thai-token-optimizer
```

### 2. ตรวจ Node.js และ npm

Thai Token Optimizer ต้องใช้ **Node.js 18.0.0 หรือใหม่กว่า**

```bash
node -v
npm -v
```

ถ้า Node.js ต่ำกว่า 18 ให้ upgrade Node.js ก่อนดำเนินการต่อ

### 3. ติดตั้ง dependencies

```bash
npm install
```

### 4. รัน tests

```bash
npm test
npm run ci
```

ผลลัพธ์ที่คาดหวัง:

```text
75 tests passed
0 failed
package version: 1.0.0
```

### 5. ใช้ CLI โดยตรงจาก repository

คุณสามารถรันเครื่องมือได้โดยไม่ต้องติดตั้ง global:

```bash
node bin/thai-token-optimizer.js status
node bin/thai-token-optimizer.js ui
node bin/thai-token-optimizer.js doctor --pretty
```

### 6. ลงทะเบียน global CLI commands

เพื่อใช้คำสั่งสั้น ๆ `tto` และ `thai-token-optimizer` ได้ทั่วระบบ:

```bash
npm link
```

ตรวจสอบ:

```bash
tto status
thai-token-optimizer status
```

ถ้าไม่พบคำสั่ง `tto` ให้ restart terminal หรือเช็ก npm global binary path:

```bash
npm bin -g
```

### 7. Backup configuration เดิมของ AI tool

ก่อนติดตั้ง integrations ให้สร้าง backup ก่อน:

```bash
tto backup all
```

ตรวจ backups:

```bash
tto backups
```

### 8. ติดตั้ง integrations ทั้งหมดที่รองรับ

```bash
tto install all
```

คำสั่งนี้ติดตั้ง integrations สำหรับ:

- Codex
- Claude Code
- Gemini CLI
- OpenCode
- OpenClaw
- Hermes Agent
- Cursor
- Aider
- Cline
- Roo Code

ถ้าไม่ได้ใช้ global `tto` ให้รัน:

```bash
node bin/thai-token-optimizer.js install all
```

### 9. ติดตั้ง Codex AGENTS.md integration

ถ้าคุณใช้ Codex ให้รันเพิ่ม:

```bash
tto install-agents
```

คำสั่งนี้จะเขียน managed block เข้าไปใน:

```text
~/.codex/AGENTS.md
```

Managed block:

```text
<!-- Thai Token Optimizer START -->
...
<!-- Thai Token Optimizer END -->
```

### 10. ตรวจสอบการติดตั้ง

```bash
tto doctor --pretty
```

ผลลัพธ์ที่คาดหวังควรแสดง `PASS` หรือ actionable warnings:

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

### 11. เปิดใช้งาน Thai Token Optimizer

โหมดเริ่มต้นที่แนะนำ:

```bash
tto auto
```

โหมดอื่น ๆ:

```bash
tto lite
tto full
tto safe
tto off
```

### 12. แสดง Pretty CLI UI

```bash
tto ui
```

หรือ:

```bash
tto dashboard
```

### 13. Restart AI coding tools ของคุณ

หลังติดตั้งแล้ว ให้ restart เครื่องมือที่คุณใช้:

- Codex
- Claude Code
- Gemini CLI
- OpenCode
- Cursor
- Aider
- Cline
- Roo Code

จากนั้นพิมพ์ภายใน AI tool:

```text
token thai auto
```

หรือ:

```text
ลด token ไทย
```

ปิดจากภายใน AI tool:

```text
token thai off
```

### 14. ติดตั้งเฉพาะ integration เดียว

ใช้คำสั่งเหล่านี้ถ้าคุณไม่ต้องการติดตั้งทุกอย่าง

#### Codex

```bash
tto backup codex
tto install codex
tto install-agents
tto doctor --pretty
```

ไฟล์ที่เกี่ยวข้อง:

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

ไฟล์ที่เกี่ยวข้อง:

```text
~/.claude/settings.json
```

#### Gemini CLI

```bash
tto backup gemini
tto install gemini
tto doctor --pretty
```

ไฟล์ที่เกี่ยวข้อง:

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

ไฟล์ที่เกี่ยวข้อง:

```text
~/.config/opencode/plugins/thai-token-optimizer.js
~/.config/opencode/opencode.json
```

#### OpenClaw

```bash
tto backup openclaw
tto install openclaw
tto doctor openclaw --pretty
```

ไฟล์ที่เกี่ยวข้อง:

```text
~/.openclaw/openclaw.json
~/.openclaw/hooks/thai-token-optimizer/HOOK.md
~/.openclaw/hooks/thai-token-optimizer/handler.ts
~/.openclaw/hooks/thai-token-optimizer/simulate.cjs
```

OpenClaw adapter ใช้ managed hook ตาม model ของ OpenClaw: hook ถูก discover จาก `~/.openclaw/hooks/`, เปิดผ่าน `hooks.internal.entries["thai-token-optimizer"]`, และ `tto doctor openclaw` จะตรวจ metadata, handler, config entry, command events และ simulation ของ safety event.

**จุดเด่นการทำงานร่วมกับ OpenClaw:**
- **Managed Lifecycle**: รองรับเหตุการณ์ `gateway:startup`, `agent:bootstrap` และ `command:*` เพื่อแทรกคำแนะนำภาษาไทยแบบกระชับ (Compact Thai) ได้ทันท่วงที
- **Enhanced Thai Safety**: ระบบตรวจจับความเสี่ยงรองรับคีย์เวิร์ดภาษาไทย (เช่น "ลบไฟล์ทั้งหมด", "โปรดักชัน", "ฐานข้อมูล") ทำให้สลับเข้าสู่ Safe Mode ได้แม่นยำแม้สั่งงานเป็นภาษาไทย
- **Automated Validation**: มี Simulator ในตัวเพื่อให้ตรวจสอบความถูกต้องของ Hook ได้โดยไม่ต้องรัน OpenClaw จริง

#### Hermes Agent

```bash
tto backup hermes
tto install hermes
tto doctor hermes --pretty
```

ไฟล์ที่เกี่ยวข้อง:

```text
~/.hermes/config.yaml
~/.hermes/plugins/thai-token-optimizer/
~/.hermes/agent-hooks/
```

**จุดเด่นการทำงานร่วมกับ Hermes Agent (Hybrid Integration):**
- **Native Python Plugin**: ทำงานที่เลเยอร์สูงสุดของ Agent ผ่านระบบ Plugin ของ Hermes ทำให้สามารถแทรกแซงการเรียก LLM และการใช้เครื่องมือ (Tool Use) ได้อย่างสมบูรณ์
- **Terminal Output Truncation**: มีระบบอัจฉริยะที่ช่วยตัดผลลัพธ์จาก Terminal ที่ยาวเกินไป (เกิน 50,000 ตัวอักษร) ให้เหลือเพียงบทสรุปที่สำคัญ เพื่อประหยัด Token มหาศาลแต่ยังคงบริบทงานไว้ได้
- **Multi-layer Protection**: ใช้ทั้ง Shell Hooks (Node.js) และ Plugin Hooks (Python) ร่วมกันเพื่อป้องกันคำสั่งอันตราย (Block risky tool calls) และรักษาความแม่นยำทางเทคนิค (Preserve commands/paths/versions)
- **Thai-Aware Guard**: ระบบ Guard ตรวจจับทั้งภาษาอังกฤษและภาษาไทย ครอบคลุมงานด้าน Destructive commands, Database, Production, Secrets และ Payment

#### Cursor / Aider / Cline / Roo Code

```bash
tto install cursor
tto install aider
tto install cline
tto install roo
```

### 15. ทดสอบ prompt compression

```bash
tto compress --pretty --level auto --budget 80 --target codex --check \
"ช่วยอธิบายรายละเอียดเกี่ยวกับการติดตั้ง Thai Token Optimizer v1.0 โดยห้ามเปลี่ยน package version 1.0.0"
```

### 16. ทดสอบ safety classifier

```bash
tto classify --pretty "DROP TABLE users production secret token"
```

พฤติกรรมที่คาดหวัง:

- Risk level ควรเป็น high
- Compression ควร relax ไปใช้ safe behavior
- Recommended action ควรรวม backup, dry-run, verification และ rollback readiness

### 17. Rollback หากจำเป็น

Preview rollback ก่อน:

```bash
tto rollback latest --dry-run
```

Rollback backup ล่าสุด:

```bash
tto rollback latest
```

Rollback เฉพาะ target เดียว:

```bash
tto rollback gemini --dry-run
tto rollback gemini
```

### 18. Uninstall หากจำเป็น

Uninstall integrations ทั้งหมด:

```bash
tto uninstall all
```

หรือ uninstall target เดียว:

```bash
tto uninstall codex
tto uninstall claude
tto uninstall gemini
tto uninstall opencode
tto uninstall openclaw
tto uninstall hermes
tto uninstall cursor
tto uninstall aider
tto uninstall cline
tto uninstall roo
```

### ชุดคำสั่งติดตั้งจาก GitHub แบบครบถ้วน

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

จากนั้น restart AI coding tool ของคุณ แล้วพิมพ์:

```text
token thai auto
```



---

## 🧭 หลักการออกแบบหลัก

| หลักการ | ความหมาย |
|---|---|
| **ภาษาไทยกระชับ แต่ไม่กำกวม** | คำตอบที่สั้นลงต้องยังมีประโยชน์ |
| **ความถูกต้องสำคัญกว่าการประหยัด token** | ห้ามทำให้คำสั่ง โค้ด path เวอร์ชัน หรือ config ผิดเพี้ยน |
| **ความปลอดภัยสำคัญกว่าความสั้น** | งานเสี่ยงต้องมี backup, dry-run, verify, rollback |
| **Local-first** | CLI, hooks, compression, backup, benchmark และ doctor หลักทำงานแบบ local |
| **ติดตั้งย้อนกลับได้** | Installer สร้าง backups ก่อนเปลี่ยน configs |
| **ความเสถียรของเวอร์ชัน** | โปรเจกต์นี้คงอยู่ที่ `v1.0 / 1.0.0` |

ลำดับความสำคัญ:

```text
1. Safety
2. Correctness
3. Constraint preservation
4. Reproducibility
5. Token reduction
6. Brevity
```

---

## 🧩 คุณสมบัติ

### การเพิ่มประสิทธิภาพคำตอบ

- `auto`, `lite`, `full`, `safe`, `off`
- trigger ในแชต เช่น `token thai auto`
- behavior ตาม profile
- การ inject context ผ่าน hook
- output ภาษาไทยแบบกระชับพร้อมรักษารายละเอียดทางเทคนิค

### การเพิ่มประสิทธิภาพ Prompt

- `tto compress`
- `tto rewrite`
- `--budget` token target
- `--check` semantic preservation
- Code-aware compression
- Constraint lock สำหรับคำอย่าง `ต้อง`, `ห้าม`, `เด็ดขาด`, `v1.0`, `1.0.0`
- Adaptive Compression Learning ด้วย `tto keep`, `tto forget`, `tto dictionary`
- User-specific Dictionary สำหรับศัพท์เฉพาะและสไตล์ที่ต้องคงไว้

### ความปลอดภัย

- Rule-based safety classifier
- Pre-tool guard hooks
- Safe mode override
- คำแนะนำ backup / rollback
- การตรวจจับ production, database, auth, secret และ destructive-command

### ความน่าเชื่อถือ

- `tto doctor`
- `tto doctor codex`
- `tto doctor claude`
- `tto doctor gemini`
- `tto doctor opencode`
- `tto doctor openclaw`
- `tto doctor hermes`
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

### ติดตั้งทุกอย่าง

```bash
tto install all
```

คำสั่งนี้ติดตั้ง integrations สำหรับ:

- Codex
- Claude Code
- Gemini CLI
- OpenCode
- Cursor
- Aider
- Cline
- Roo Code

ระบบจะสร้าง backup ก่อนเขียน configuration files

### ติดตั้งเฉพาะ Codex

```bash
tto install codex
```

อัปเดต:

```text
~/.codex/hooks.json
~/.codex/config.toml
```

ทำให้แน่ใจว่า:

```toml
[features]
codex_hooks = true
```

ถ้ามี `codex_hooks = false` อยู่แล้ว ระบบจะแทนที่แทนการสร้าง key ซ้ำ

### ติดตั้ง Codex AGENTS.md block

```bash
tto install-agents
```

เขียน managed content เข้าไปใน:

```text
~/.codex/AGENTS.md
```

ภายใน:

```text
<!-- Thai Token Optimizer START -->
...
<!-- Thai Token Optimizer END -->
```

### ติดตั้งเฉพาะ Claude Code

```bash
tto install claude
```

อัปเดต:

```text
~/.claude/settings.json
```

### ติดตั้งเฉพาะ Gemini CLI

```bash
tto install gemini
```

สร้าง:

```text
~/.gemini/extensions/thai-token-optimizer/gemini-extension.json
~/.gemini/extensions/thai-token-optimizer/GEMINI.md
~/.gemini/extensions/thai-token-optimizer/commands/tto/*.toml
~/.gemini/settings.json
```

### ติดตั้งเฉพาะ OpenCode

```bash
tto install opencode
```

สร้าง:

```text
~/.config/opencode/plugins/thai-token-optimizer.js
~/.config/opencode/opencode.json
~/.config/opencode/agents/thai-token-optimizer.md
~/.config/opencode/skills/thai-token-optimizer.md
~/.config/opencode/commands/tto-auto.md
~/.config/opencode/commands/tto-safe.md
```

### ติดตั้งเฉพาะ OpenClaw

```bash
tto install openclaw
tto doctor openclaw --pretty
```

ไฟล์ที่ติดตั้ง:

```text
~/.openclaw/openclaw.json
~/.openclaw/hooks/thai-token-optimizer/HOOK.md
~/.openclaw/hooks/thai-token-optimizer/handler.ts
~/.openclaw/hooks/thai-token-optimizer/simulate.cjs
```

### ติดตั้งเฉพาะ Hermes Agent

```bash
tto backup hermes
tto install hermes
tto doctor hermes --pretty
```

ไฟล์ที่ติดตั้ง:

```text
~/.hermes/config.yaml
~/.hermes/plugins/thai-token-optimizer/plugin.yaml
~/.hermes/plugins/thai-token-optimizer/__init__.py
~/.hermes/agent-hooks/thai-token-optimizer-pre_llm_call.cjs
~/.hermes/agent-hooks/thai-token-optimizer-pre_tool_call.cjs
~/.hermes/agent-hooks/thai-token-optimizer-post_tool_call.cjs
~/.hermes/agent-hooks/thai-token-optimizer-on_session_start.cjs
~/.hermes/agent-hooks/thai-token-optimizer-on_session_reset.cjs
~/.hermes/agent-hooks/thai-token-optimizer-on_session_finalize.cjs
~/.hermes/agent-hooks/thai-token-optimizer-subagent_stop.cjs
```

Hermes adapter ใช้ 2 ชั้นพร้อมกัน: Shell hooks ผ่าน `hooks:` ใน `~/.hermes/config.yaml` สำหรับ context injection และ tool guard แบบ subprocess, และ Plugin hooks ผ่าน `ctx.register_hook()` เพื่อทำงานใน CLI + Gateway sessions.
### ติดตั้ง portable adapters

```bash
tto install cursor
tto install aider
tto install cline
tto install roo
```

---

## 🎛️ Modes

| Mode | คำสั่ง | Behavior | เหมาะกับ |
|---|---|---|---|
| Auto | `tto auto` | เลือกระดับเองโดยอัตโนมัติ | การใช้งานประจำวัน |
| Lite | `tto lite` | กระชับแต่ยังอธิบายได้ | การสอน, concepts, research |
| Full | `tto full` | ภาษาไทยที่สั้นที่สุดแต่ยังใช้ได้ | คำสั่ง, debugging, code fixes |
| Safe | `tto safe` | warning + backup + verify + rollback | Production, DB, security, destructive ops |
| Off | `tto off` | ปิด optimizer | พฤติกรรมปกติ |

ตัวอย่าง:

```bash
tto auto
tto lite
tto full
tto safe
tto off
```

State ถูกเก็บไว้ที่:

```text
~/.thai-token-optimizer/state.json
```

---

## 🧑‍💻 Profiles

Profiles ใช้ปรับ optimizer ให้เหมาะกับงานต่าง ๆ

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
| `coding` | `full` | code/patch ก่อน รักษา paths/errors/commands |
| `research` | `lite` | รักษา reasoning, variables, methodology |
| `teaching` | `lite` | เป็นขั้นตอน กระชับ เหมาะกับผู้เรียน |
| `paper` | `safe` | เป็นทางการ รักษาข้อจำกัดทางวิชาการ |
| `command` | `full` | คำสั่ง terminal ก่อน |
| `ultra` | `full` | ลดความยาวสูงสุดสำหรับงานที่ไม่เสี่ยง |

ตัวอย่าง:

```bash
tto profile coding
tto auto
```

---

## 🧾 Policy configuration

ไฟล์ policy ของผู้ใช้:

```text
~/.thai-token-optimizer/config.json
```

คำสั่ง:

```bash
tto config init
tto config path
tto config get
tto config set defaultProfile coding
tto config set safetyMode strict
tto config set exactTokenizer true
tto config set benchmarkStrict.minAverageSavingPercent 10
```

รูปแบบ default policy:

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

ใช้ default policy เพื่อให้ CI reproducible:

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

ใช้ภายใน Codex, Claude Code, Gemini CLI, OpenCode, OpenClaw, Hermes Agent หรือ compatible tools

| User message | ผลลัพธ์ |
|---|---|
| `token thai on` | เปิด full mode |
| `token thai auto` | เปิด auto mode |
| `token thai lite` | เปิด lite mode |
| `token thai full` | เปิด full mode |
| `token thai safe` | เปิด safe mode |
| `token thai off` | ปิด optimizer |
| `thai compact on` | เปิด full mode |
| `ลด token ไทย` | เปิด full mode |
| `ลด token ไทย auto` | เปิด auto mode |
| `หยุดลด token` | ปิด optimizer |
| `พูดปกติ` | ปิด optimizer |

แนะนำให้ใช้ plain text triggers สำหรับ Codex เพราะ Codex อาจ reserve slash commands ไว้ใช้เอง

---

## ✂️ Prompt compression

ตัวอย่าง:

```bash
tto compress --pretty --level auto --budget 80 --target codex --check \
"ช่วยอธิบายรายละเอียดเกี่ยวกับการติดตั้ง Thai Token Optimizer v1.0 โดยห้ามเปลี่ยน package version 1.0.0"
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
╰────────────────────────────────────────────────────────────────────────────────╯
```

ถ้า budget ต่ำเกินไป compressor จะให้ความสำคัญกับ preservation มากกว่าการฝืนตัดให้สั้น

---

## 🧠 Adaptive Compression Learning

ระบบ Personalization ทำให้ Thai Token Optimizer v1.0 ไม่ได้บีบอัดด้วยกฎ static ชุดเดียวสำหรับทุกคนอีกต่อไป แต่สามารถเรียนรู้คำสำคัญของผู้ใช้แต่ละคนผ่าน User-specific Dictionary ได้

แนวคิดหลัก:

```text
Static filler rules + User-specific keep dictionary = personalized compression
```

### ใช้เมื่อไร

ใช้เมื่อมีคำหรือสำนวนที่ดูเหมือน filler สำหรับระบบทั่วไป แต่มีความหมายสำคัญใน workflow ของคุณ เช่น:

- ศัพท์เฉพาะทีม
- ชื่อระบบภายใน
- คำเรียก feature หรือ module
- สไตล์การเขียนที่ต้องคงไว้
- prompt phrase ที่มีผลต่อ agent behavior
- token, config key, label หรือ identifier ที่ไม่ควรถูกแตะ

ตัวอย่าง:

```bash
tto keep "รบกวนช่วย"
tto keep "ระบบเทพ"
tto keep "API_KEY(foo)[bar]*"
```

หลังจากนั้น compressor จะปกป้องคำเหล่านี้ระหว่าง `tto compress` และ `tto rewrite`

### คำสั่งหลัก

| Command | Purpose |
|---|---|
| `tto keep <word>` | เพิ่มคำ/วลีลง personal dictionary เพื่อปกป้องไม่ให้ compressor เปลี่ยนหรือตัด |
| `tto forget <word>` | ลบคำ/วลีออกจาก personal dictionary |
| `tto dictionary` | แสดงรายการคำที่ระบบกำลังปกป้องให้ผู้ใช้นี้ |

ตัวอย่าง workflow:

```bash
tto compress --level auto "รบกวนช่วยอธิบายขั้นตอนแบบละเอียดครับ"
tto keep "รบกวนช่วย"
tto compress --level auto "รบกวนช่วยอธิบายขั้นตอนแบบละเอียดครับ"
tto forget "รบกวนช่วย"
tto dictionary
```

ก่อน `keep` ระบบอาจตัด `รบกวนช่วย` เพราะเป็น filler ทั่วไป  
หลัง `keep` ระบบจะคงคำนี้ไว้ตามสไตล์ผู้ใช้

### Persistent storage

Dictionary ถูกเก็บแบบ local-first ที่:

```text
~/.thai-token-optimizer/dictionary.json
```

หรือ path ภายใต้ `TTO_HOME` / `THAI_TOKEN_OPTIMIZER_HOME` ถ้าตั้งค่าไว้:

```bash
TTO_HOME=/tmp/tto-home tto keep "ระบบเทพ"
```

รูปแบบไฟล์:

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

ระบบมี memory cache เพื่อลดการอ่านไฟล์ซ้ำระหว่าง process เดียวกัน และมี normalization เพื่อกันค่าว่าง, duplicate, type แปลก ๆ หรือไฟล์ที่ถูกแก้มือไม่ให้ทำให้ compression พัง

### Parser-level protection

Personal dictionary ถูกผูกเข้ากับ `tto-code-aware-parser.js` โดยตรง ไม่ได้ทำเป็น string replace ภายหลัง

ลำดับการปกป้อง:

1. Protected technical ranges เช่น code fences, inline code, URLs, paths, commands, versions, env/config lines
2. User-specific keep dictionary
3. Filler/replacement compression
4. Constraint lock และ preservation check

เหตุผลคือโครงสร้างเทคนิคต้องปลอดภัยก่อนเสมอ จากนั้นจึงปกป้องศัพท์ส่วนตัวของผู้ใช้

### RegExp safety

คำใน dictionary รองรับอักขระพิเศษได้ เช่น:

```bash
tto keep "API_KEY(foo)[bar]*"
```

ระบบ escape ค่าเหล่านี้ก่อนสร้าง dynamic RegExp จึงไม่ทำให้ parser พังหรือ match ผิดรูปแบบ

### Overlapping terms

ถ้ามีคำซ้อนกัน เช่น:

```bash
tto keep "ระบบ"
tto keep "ระบบเทพ"
```

ระบบจะจัดเรียงคำที่ยาวกว่าก่อน เพื่อให้ `ระบบเทพ` ถูกปกป้องเป็นก้อนเดียวก่อนคำสั้นอย่าง `ระบบ`

### Backup and rollback

`dictionary.json` เป็นข้อมูลสำคัญของระบบเรียนรู้รายบุคคล จึงถูกเก็บใน backup/rollback ด้วย:

```bash
tto backup codex
tto rollback codex --dry-run
tto rollback codex
```

เมื่อ rollback แล้ว personal dictionary จะกลับไปตาม snapshot เดิมพร้อม state/config อื่น ๆ

### ข้อจำกัด

- ระบบเรียนรู้เฉพาะคำที่ผู้ใช้สั่งผ่าน `tto keep`
- ยังไม่ auto-infer คำสำคัญจากพฤติกรรมโดยไม่ถามผู้ใช้
- dictionary เป็น local ต่อเครื่อง/ต่อ `TTO_HOME`
- ถ้าบันทึกคำกว้างเกินไป เช่น `ระบบ` อาจลด compression opportunity เพราะคำนั้นจะถูกปกป้องเสมอ

---

## 🛡️ Safety classifier

ตัวอย่าง:

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

Risk categories ประกอบด้วย:

| Category | Trigger examples |
|---|---|
| `database_migration` | `DROP TABLE`, `TRUNCATE`, `DELETE FROM`, migration |
| `production_deploy` | production, deploy, release, rollback, hotfix |
| `security_secret` | API key, secret, access token, password, private key |
| `destructive_command` | `rm -rf`, `git reset --hard`, `git push --force` |
| `auth_payment` | auth, permission, payment, billing |

---

## 🩺 Doctor

รัน:

```bash
tto doctor --pretty
```

ตัวอย่าง:

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

ใช้ CI mode:

```bash
tto doctor --ci
```

---

## 📊 Benchmark

รัน strict benchmark:

```bash
tto benchmark --pretty --strict --default-policy
```

ตัวอย่าง:

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

Strict benchmark ตรวจ:

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

ตัวอย่าง:

```json
{
  "backup": "20260509T101748787Z-6939-all",
  "target": "all",
  "files": 27,
  "root": "~/.thai-token-optimizer/backups"
}
```

### แสดงรายการ backups

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

กฎ:

- `rollback gemini` restore เฉพาะไฟล์ของ Gemini
- `rollback codex` restore เฉพาะไฟล์ของ Codex
- `rollback latest` ทำงานตาม target ของ backup ล่าสุด
- pre-rollback backup ถูกสร้างโดย default
- ใช้ `--no-prebackup` เฉพาะเมื่อตั้งใจข้าม safety backup

---

## 🔌 รายละเอียด Integration

### Codex

ไฟล์:

```text
~/.codex/hooks.json
~/.codex/config.toml
~/.codex/AGENTS.md
```

Hooks:

| Event | Script | Purpose |
|---|---|---|
| `SessionStart` | `hooks/tto-activate.js` | Inject compact Thai rules |
| `UserPromptSubmit` | `hooks/tto-mode-tracker.js` | ตรวจ triggers และ safety |
| `PreToolUse` | `hooks/tto-pretool-guard.js` | เพิ่ม safety guidance |
| `PostToolUse` | `hooks/tto-posttool-summary.js` | สรุปหลังใช้ tool แบบกระชับ |
| `Stop` | `hooks/tto-stop-summary.js` | คำตอบสุดท้ายแบบกระชับ |

### Claude Code

ไฟล์:

```text
~/.claude/settings.json
```

ใช้ hook scripts คล้ายกันสำหรับ session, prompt, tool และ final summary events

### Gemini CLI

ไฟล์:

```text
~/.gemini/extensions/thai-token-optimizer/gemini-extension.json
~/.gemini/extensions/thai-token-optimizer/GEMINI.md
~/.gemini/extensions/thai-token-optimizer/commands/tto/*.toml
~/.gemini/settings.json
```

คำสั่งหลัง restart:

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

ไฟล์:

```text
~/.config/opencode/plugins/thai-token-optimizer.js
~/.config/opencode/opencode.json
~/.config/opencode/agents/thai-token-optimizer.md
~/.config/opencode/skills/thai-token-optimizer.md
```

เพิ่ม:

- `tool.execute.before`
- `tool.execute.after`
- session compaction guidance
- environment hints

### OpenClaw

ไฟล์:

```text
~/.openclaw/openclaw.json
~/.openclaw/hooks/thai-token-optimizer/HOOK.md
~/.openclaw/hooks/thai-token-optimizer/handler.ts
~/.openclaw/hooks/thai-token-optimizer/simulate.cjs
```

เพิ่ม:

- Managed hook metadata สำหรับ `gateway:startup`, `agent:bootstrap`, `command:new`, `command:reset`, `command`
- Config entry `hooks.internal.entries["thai-token-optimizer"].enabled = true`
- Local simulator สำหรับ `tto doctor openclaw` เพื่อ validate safety behavior โดยไม่ต้องพึ่ง OpenClaw binary

### Hermes Agent

ไฟล์:

```text
~/.hermes/config.yaml
~/.hermes/plugins/thai-token-optimizer/plugin.yaml
~/.hermes/plugins/thai-token-optimizer/__init__.py
~/.hermes/agent-hooks/thai-token-optimizer-pre_llm_call.cjs
~/.hermes/agent-hooks/thai-token-optimizer-pre_tool_call.cjs
~/.hermes/agent-hooks/thai-token-optimizer-post_tool_call.cjs
~/.hermes/agent-hooks/thai-token-optimizer-on_session_start.cjs
~/.hermes/agent-hooks/thai-token-optimizer-on_session_reset.cjs
~/.hermes/agent-hooks/thai-token-optimizer-on_session_finalize.cjs
~/.hermes/agent-hooks/thai-token-optimizer-subagent_stop.cjs
```

เพิ่ม:

- Shell hooks: `pre_llm_call`, `pre_tool_call`, `post_tool_call`, `on_session_start`, `on_session_reset`, `on_session_finalize`, `subagent_stop`
- Plugin hooks: `pre_llm_call`, `pre_tool_call`, `post_tool_call`, `post_llm_call`, session lifecycle, `transform_terminal_output`, `transform_llm_output`
- `hooks_auto_accept: true` ใน managed block เพื่อให้ shell hooks พร้อมทำงานหลังติดตั้งใน non-TTY/gateway
- `plugins.enabled: [thai-token-optimizer]` เพื่อเปิด plugin hooks
### Portable adapters

| Adapter | ไฟล์ |
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

Modules หลัก:

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

## 🗺️ Text Diagram: กระบวนการทำงานของระบบทั้งหมด

แผนภาพนี้สรุปการไหลงานตั้งแต่ผู้ใช้สั่งงาน จนได้ผลลัพธ์การบีบอัดที่ปลอดภัยและคงความหมายสำคัญ

```text
User / Agent
  (Codex / Claude / Gemini CLI / OpenCode / OpenClaw / Hermes)
            │
            ▼
Entry Points
  - Chat triggers: token thai auto|lite|full|safe|off
  - CLI commands: tto compress / keep / forget / doctor / backup
            │
            ▼
State + Policy Layer
  - state.json
  - config.json
  - dictionary.json (personalization)
            │
            ▼
Hook Runtime (SessionStart / UserPromptSubmit / PreToolUse / PostToolUse / Stop)
            │
            ▼
Safety Classifier
  - detects destructive / db / prod / secret / auth-payment risks
            │
            ▼
Compression Pipeline
  1) Code-aware parser
  2) User-specific dictionary protection
  3) Filler/replacement compression
  4) Constraint locker
  5) Budget compressor
  6) Preservation checker
            │
            ▼
Optimized Output
  - concise Thai
  - preserved commands/code/paths/versions
  - safety details retained when risky
            │
            ▼
Backup / Rollback Safety Net
  - backup manifests include dictionary.json + state/config files
  - rollback restores target-scoped files
```

### คำอธิบายทีละช่วง

1. `Entry Points`
ผู้ใช้สั่งผ่านแชต trigger หรือคำสั่ง CLI ปกติ ระบบจะเลือก mode และ policy ที่เหมาะกับงานนั้น

2. `State + Policy`
เก็บสถานะการทำงานและ personalization (`dictionary.json`) เพื่อให้ระบบเรียนรู้สไตล์รายบุคคลแบบต่อเนื่อง

3. `Hook Runtime`
inject พฤติกรรมตอนเริ่ม session, ก่อนใช้ tool, หลังใช้ tool และก่อนตอบ final เพื่อรักษาความสม่ำเสมอ

4. `Safety Classifier`
ถ้าเจอคำสั่งเสี่ยง ระบบจะบังคับแนวตอบแบบ safe โดยไม่ย่อจนเสียขั้นตอน backup/rollback/verify

5. `Compression Pipeline`
เริ่มจากปกป้องโครงสร้างเทคนิคและคำเฉพาะผู้ใช้ก่อน แล้วค่อยบีบอัดส่วนที่เป็น filler เพื่อลด token โดยไม่เสีย context

6. `Backup / Rollback`
ทุกงานแก้ config สำคัญมี backup รองรับ และ rollback สามารถ restore เฉพาะ target ที่ต้องการ

---

## 🧪 Development and testing

รัน tests:

```bash
npm test
```

รัน CI checks:

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

- ไม่เรียก external APIs สำหรับ core operation
- ไม่ส่ง prompts ไปยัง remote services
- เก็บ state แบบ local ที่ `~/.thai-token-optimizer/`
- แก้ไข tool configs เฉพาะตอน install/uninstall/rollback
- สร้าง backups ก่อนเปลี่ยน config

อย่างไรก็ตาม ควรตรวจสอบการเปลี่ยนแปลงก่อนใช้งานบนเครื่อง production:

```bash
tto backup all
tto install all
tto doctor
```

สำหรับงานที่เกี่ยวกับ rollback:

```bash
tto rollback latest --dry-run
```

---

## ⚠️ ข้อจำกัดที่ทราบ

- Token estimation เป็น heuristic เว้นแต่จะติดตั้ง optional tokenizer packages
- Exact token counts แตกต่างกันตาม model และ tokenizer
- Hook behavior ขึ้นอยู่กับ hook system ที่แต่ละ AI tool รองรับ
- Portable adapters บางตัวเป็น instruction-file based ไม่ใช่ runtime hooks
- Pretty UI สำหรับมนุษย์ ส่วน automation ควรใช้ JSON/text output
- เครื่องมือนี้เพิ่มประสิทธิภาพ style ของ prompt/response ไม่ใช่คุณภาพ reasoning ของ model
- ไม่ใช่เครื่องมือแทนการ review destructive commands ด้วยตนเอง

---

## ❓ FAQ

### นี่คือ model หรือไม่?

ไม่ใช่ เป็น local CLI + hook + adapter pack

### เครื่องมือนี้เรียก external API หรือไม่?

ไม่มี core feature ใดที่ต้องใช้ network calls

### ใช้งานโดยไม่มี optional tokenizer packages ได้หรือไม่?

ได้ ระบบ fallback ไปใช้ heuristic estimation

### ลด token ของ prompt ภาษาไทยได้หรือไม่?

ได้ ผ่าน `tto compress` / `tto rewrite`

### บังคับให้ทุกคำตอบสั้นมากได้หรือไม่?

ได้ ด้วย `tto full` แต่งานเสี่ยงจะถูกบังคับให้ใช้ behavior ที่ปลอดภัยกว่าโดยอัตโนมัติ

### `tto install all` แก้ global config files หรือไม่?

ใช่ คำสั่งนี้แก้ config files ของเครื่องมือที่รองรับ แต่จะสร้าง backups ก่อน

### Preview rollback ได้หรือไม่?

ได้

```bash
tto rollback latest --dry-run
```

### ปิดระบบได้หรือไม่?

ได้

```bash
tto off
tto uninstall all
```

### ทำไมเวอร์ชันยังคงเป็น 1.0.0?

โปรเจกต์นี้ล็อก package identity ไว้ที่:

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

---

## 🗺️ Workflow ที่แนะนำ

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

จากนั้นภายใน AI coding tool ของคุณ:

```text
token thai auto
```

สำหรับงานเสี่ยง:

```text
token thai safe
```

สำหรับ rollback:

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

**ภาษาไทยกระชับ คำสั่งปลอดภัย ความหมายไม่หาย**

```text
package version: 1.0.0
```

</div>
