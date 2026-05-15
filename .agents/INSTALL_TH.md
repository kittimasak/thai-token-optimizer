<!--
============================================================================
Thai Token Optimizer v2.0
============================================================================
Description :
คู่มือ `.agents` local marketplace สำหรับ Thai Token Optimizer v2.0.

Author      : Dr.Kittimasak Naijit
Repository  : https://github.com/kittimasak/thai-token-optimizer

Copyright (c) 2026 Dr.Kittimasak Naijit

Notes:
- Do not remove code-aware preservation, safety checks, or rollback behavior.
- This directory is part of the Thai Token Optimizer local-first CLI/hook system.
============================================================================
-->

# คู่มือ .agents สำหรับ Thai Token Optimizer v2.0

โฟลเดอร์ `.agents` ใช้ประกาศ local plugin marketplace ของโปรเจกต์ **Thai Token Optimizer v2.0**

```text
Thai Token Optimizer v2.0
package version: 2.0.0
```

## ไฟล์หลัก

```text
.agents/plugins/marketplace.json
```

ไฟล์นี้ทำหน้าที่บอก plugin host ว่า repo ปัจจุบันมี plugin ชื่อ `thai-token-optimizer` ที่โหลดจาก local path `./`

## โครงสร้าง

```text
thai-token-optimizer/
├── .agents/
│   ├── README.md
│   ├── INSTALL_TH.md
│   └── plugins/
│       ├── README.md
│       └── marketplace.json
├── README.md
├── README_EN.md
├── MANUAL.md
├── AGENTS.md
├── GEMINI.md
├── skills/
├── package.json
├── bin/
├── hooks/
└── adapters/
```

## ขั้นตอนติดตั้งจาก GitHub

```bash
git clone https://github.com/kittimasak/thai-token-optimizer.git
cd thai-token-optimizer

npm install
node -e "JSON.parse(require('fs').readFileSync('.agents/plugins/marketplace.json','utf8')); console.log('marketplace.json OK')"
node --test tests/test_pretty_ui.js
npm link

tto backup all
tto install all
tto install-agents
tto doctor --pretty

tto auto
tto ui
```

หลังจากนั้น restart AI coding tool แล้วพิมพ์:

```text
token thai auto
```

## ตรวจ marketplace

```bash
node -e "JSON.parse(require('fs').readFileSync('.agents/plugins/marketplace.json','utf8')); console.log('marketplace.json OK')"
```

## เนื้อหา marketplace.json

```json
{
  "name": "thai-token-optimizer-local",
  "interface": {
    "displayName": "Thai Token Optimizer Local"
  },
  "plugins": [
    {
      "name": "thai-token-optimizer",
      "source": {
        "source": "local",
        "path": "./"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

## คำสั่ง TTO v2 ที่ควรรู้

```bash
# Dashboard / health
tto status --pretty
tto dashboard --view overview
tto doctor --pretty

# Compression / MTP
tto compress --pretty --level auto --target codex --budget 500 --check prompt.txt
tto compress --speculative --diagnostics --check --target codex prompt.txt
tto benchmark --pretty --strict --default-policy --mtp

# Quality / operations
tto quality --pretty
tto coach --pretty
tto ops --pretty
tto fleet --pretty --doctor --calibration --session-scan

# Session analytics
tto checkpoint status --pretty
tto cache stats --pretty
tto context --pretty
tto calibration status --pretty
```

## Target ที่รองรับ

```text
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

## ข้อควรระวัง

- ห้ามใส่ API key, token, password, credential หรือ secret ใด ๆ ลงใน `.agents`
- ห้ามเปลี่ยน identity จาก `Thai Token Optimizer v2.0` และ `package version: 2.0.0`
- ห้ามลบ backup/rollback/preservation/safety behavior
- ถ้าแก้ config ให้รัน `tto backup all` ก่อนเสมอ
- ก่อน rollback ให้ใช้ `tto rollback latest --dry-run`
- หลังติดตั้งให้รัน `tto doctor --pretty`
- `doctor --pretty` อาจเป็น `WARN` หาก optional adapter ยังไม่มี footprint ในเครื่อง

## ผู้จัดทำ

```text
Author: Dr.Kittimasak Naijit
Repository: https://github.com/kittimasak/thai-token-optimizer
Thai Token Optimizer v2.0
package version: 2.0.0
```
