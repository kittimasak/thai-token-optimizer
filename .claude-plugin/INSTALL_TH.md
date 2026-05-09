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

# คู่มือติดตั้ง Claude Code Plugin — Thai Token Optimizer v1.0

> คู่มือสำหรับ `.claude-plugin` ของ **Thai Token Optimizer v1.0**

```text
Thai Token Optimizer v1.0
package version: 1.0.0
```

## ภาพรวม

โฟลเดอร์ `.claude-plugin` ใช้ประกาศ metadata และ hook configuration สำหรับติดตั้ง Thai Token Optimizer ให้กับ Claude Code

เมื่อใช้งานแล้ว Claude Code จะสามารถ:

- ตอบภาษาไทยแบบกระชับ
- ลดคำฟุ่มเฟือย
- รักษา command, path, config, version, error และ code
- เปิด/ปิดโหมดผ่านข้อความในแชต เช่น `token thai auto`
- ใช้ safety mode เมื่องานเสี่ยง
- เรียก hook ก่อน/หลัง tool use

## โครงสร้างไฟล์

```text
.claude-plugin/
├── marketplace.json
├── plugin.json
├── README.md
├── INSTALL_TH.md
├── commands/
│   ├── tto-auto.md
│   ├── tto-lite.md
│   ├── tto-full.md
│   ├── tto-safe.md
│   ├── tto-off.md
│   ├── tto-status.md
│   └── tto-doctor.md
└── skills/
    └── thai-token-optimizer/
        └── SKILL.md
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

## ติดตั้งเฉพาะ Claude Code

```bash
tto backup claude
tto install claude
tto doctor --pretty
```

## ติดตั้งทุกระบบ

```bash
tto backup all
tto install all
tto install-agents
tto doctor --pretty
```

## ใช้งานใน Claude Code

หลังติดตั้งแล้ว restart Claude Code จากนั้นพิมพ์:

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
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); console.log('plugin.json OK')"
```

## ตรวจสอบ marketplace.json

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); console.log('marketplace.json OK')"
```

## ตรวจสุขภาพระบบ

```bash
tto doctor --pretty
```

## Rollback

Preview ก่อน:

```bash
tto rollback claude --dry-run
```

Rollback จริง:

```bash
tto rollback claude
```

## Uninstall

```bash
tto uninstall claude
```

หรือ uninstall ทุก integration:

```bash
tto uninstall all
```

## ข้อควรระวัง

- ห้ามเปลี่ยน `package version: 1.0.0`
- ห้ามลบ safety checks
- ห้ามลบ backup/rollback behavior
- ห้ามใส่ API key, token, password หรือ secret ใน `.claude-plugin`
- ถ้าแก้ hook หรือ plugin metadata ให้รัน `npm test` และ `npm run ci`

## ผู้จัดทำ

```text
Author: Dr.Kittimasak Naijit
Repository: https://github.com/kittimasak/thai-token-optimizer
```
