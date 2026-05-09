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
- This directory is part of the Thai Token Optimizer local-first CLI/hook system.
============================================================================
-->

# คู่มือ .agents สำหรับ Thai Token Optimizer v1.0

## ภาพรวม

โฟลเดอร์ `.agents` ใช้สำหรับประกาศ local plugin marketplace ของโปรเจกต์ **Thai Token Optimizer v1.0**

ไฟล์หลักคือ:

```text
.agents/plugins/marketplace.json
```

## โครงสร้างที่ควรวางใน repository

```text
thai-token-optimizer/
├── .agents/
│   ├── README.md
│   └── plugins/
│       ├── README.md
│       └── marketplace.json
├── README.md
├── README_TH.md
├── MANUAL.md
├── AGENTS.md
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

หลังจากนั้น restart AI coding tool แล้วพิมพ์:

```text
token thai auto
```

## ตรวจไฟล์ marketplace

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

## ข้อควรระวัง

- ห้ามใส่ API key, token, password หรือ secret ใด ๆ ลงใน `.agents`
- ห้ามเปลี่ยนเวอร์ชันจาก `v1.0 / 1.0.0`
- ห้ามลบ backup/rollback behavior ของระบบ
- ถ้าแก้ config ให้รัน `tto backup all` ก่อนเสมอ
- หลังติดตั้งให้รัน `tto doctor --pretty`

## ผู้จัดทำ

```text
Author: Dr.Kittimasak Naijit
Repository: https://github.com/kittimasak/thai-token-optimizer
Thai Token Optimizer v1.0
package version: 1.0.0
```
