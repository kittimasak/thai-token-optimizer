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

# คู่มือติดตั้ง Codex Plugin — Thai Token Optimizer v1.0

> คู่มือสำหรับ `.codex-plugin` ของ **Thai Token Optimizer v1.0**

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

## ภาพรวม

โฟลเดอร์ `.codex-plugin` ใช้ประกาศ metadata, hooks, command templates และ skill guidance สำหรับติดตั้ง Thai Token Optimizer ให้กับ Codex

เมื่อใช้งานแล้ว Codex จะสามารถ:

- ตอบภาษาไทยแบบกระชับ
- ลดคำฟุ่มเฟือย
- รักษา command, path, config, version, error และ code
- เปิด/ปิดโหมดผ่านข้อความในแชต เช่น `token thai auto`
- ใช้ safety mode เมื่องานเสี่ยง
- เรียก hook ก่อน/หลัง tool use
- ใช้ `AGENTS.md` เป็น instruction หลักของ Codex

## โครงสร้างไฟล์

```text
.codex-plugin/
├── plugin.json
├── README.md
├── INSTALL_TH.md
├── VALIDATION.md
├── hooks/
│   └── hooks.json
├── commands/
│   ├── tto-auto.md
│   ├── tto-lite.md
│   ├── tto-full.md
│   ├── tto-safe.md
│   ├── tto-off.md
│   ├── tto-status.md
│   ├── tto-doctor.md
│   └── tto-dashboard.md
└── skills/
    └── thai-token-optimizer/
        ├── SKILL.md
        └── AGENT_GUIDE.md
```

## ติดตั้งจาก GitHub

```bash
git clone https://github.com/kittimasak/thai-token-optimizer.git
cd thai-token-optimizer

npm install
npm test
npm run ci
npm link
```

## ติดตั้งเฉพาะ Codex

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

## ติดตั้งทุกระบบ

```bash
tto backup all
tto install all
tto install-agents
tto doctor --pretty
```

## ใช้งานใน Codex

หลังติดตั้งแล้ว restart Codex จากนั้นพิมพ์:

```text
token thai auto
```

โหมดอื่น:

```text
token thai lite
token thai full
token thai safe
token thai off
```

## ตรวจสอบ plugin.json

```bash
node -e "JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('plugin.json OK')"
```

## ตรวจสอบ hooks.json

```bash
node -e "JSON.parse(require('fs').readFileSync('.codex-plugin/hooks/hooks.json','utf8')); console.log('hooks.json OK')"
```

## ตรวจสุขภาพระบบ

```bash
tto doctor --pretty
```

## ตรวจ UI

```bash
tto ui
tto status --pretty
tto doctor --pretty
```

## Rollback

Preview ก่อน:

```bash
tto rollback codex --dry-run
```

Rollback จริง:

```bash
tto rollback codex
```

## Uninstall

```bash
tto uninstall codex
```

หรือ uninstall ทุก integration:

```bash
tto uninstall all
```

## ข้อควรระวัง

- ห้ามเปลี่ยน `package version: 1.0.0`
- ห้ามลบ safety checks
- ห้ามลบ backup/rollback behavior
- ห้ามใส่ API key, token, password หรือ secret ใน `.codex-plugin`
- ถ้าแก้ hook หรือ plugin metadata ให้รัน `npm test` และ `npm run ci`
- `codex_hooks = true` ต้องอยู่เพียงครั้งเดียวใน `~/.codex/config.toml`

## ผู้จัดทำ

```text
Author: Dr.Kittimasak Naijit
Repository: https://github.com/kittimasak/thai-token-optimizer
```
