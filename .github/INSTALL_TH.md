<!--
============================================================================
Thai Token Optimizer v2.0
============================================================================
คำอธิบาย :
A Thai token optimization tool for AI coding agents that keeps commands, code, and technical details accurate.

Author      : Dr.Kittimasak Naijit
Repository  : https://github.com/kittimasak/thai-token-optimizer

Copyright (c) 2026 Dr.Kittimasak Naijit

Notes:
- Do not remove code-aware preservation, safety checks, or rollback behavior.
- This file is part of the Thai Token Optimizer local-first CLI/hook system.
============================================================================
-->

# คู่มือ .github สำหรับ Thai Token Optimizer v2.0

## ภาพรวม

โฟลเดอร์ `.github` ใช้เก็บ GitHub workflows, issue templates, pull request template และ config ที่ช่วยดูแลคุณภาพของโปรเจกต์

```text
Thai Token Optimizer v2.0
package version: 2.0.0
```

## Workflow ที่มี

| ไฟล์ | หน้าที่ |
|---|---|
| `workflows/test.yml` | ทดสอบ Node.js 18, 20, 22 |
| `workflows/validate.yml` | ตรวจ syntax, JSON, JSONL, plugin metadata และ version lock |
| `workflows/docs-check.yml` | ตรวจเอกสารสำคัญและคำสั่งที่ต้องมี |
| `workflows/security-scan.yml` | ตรวจ secret pattern และคำสั่งเสี่ยง |
| `workflows/release.yml` | ตรวจ release tag `v2.0*` |

## คำสั่งตรวจในเครื่อง

```bash
npm install
npm test
npm run ci
node bin/thai-token-optimizer.js benchmark --strict --default-policy
node bin/thai-token-optimizer.js doctor --ci
```

## Checklist ก่อน push

- [ ] `package version` ยังเป็น `2.0.0`
- [ ] README/AGENTS/MANUAL ยังใช้ `Thai Token Optimizer v2.0`
- [ ] ไม่มี secret/API key/token
- [ ] `npm test` ผ่าน
- [ ] `npm run ci` ผ่าน
- [ ] `tto benchmark --strict --default-policy` ผ่าน
- [ ] `tto doctor --ci` ผ่าน
