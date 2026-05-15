<!--
============================================================================
Thai Token Optimizer v2.0
============================================================================
Description :
Thai installation guide for the Claude Code plugin package.

Author      : Dr.Kittimasak Naijit
Repository  : https://github.com/kittimasak/thai-token-optimizer

Copyright (c) 2026 Dr.Kittimasak Naijit

Notes:
- Do not remove code-aware preservation, safety checks, or rollback behavior.
- This file is part of the Thai Token Optimizer local-first CLI/hook system.
============================================================================
-->

# คู่มือติดตั้ง Claude Code Plugin - Thai Token Optimizer v2.0

คู่มือนี้ใช้สำหรับ `.claude-plugin` ของ **Thai Token Optimizer v2.0**

```text
Thai Token Optimizer v2.0
package version: 2.0.0
```

## สิ่งที่ plugin ทำ

- เพิ่ม Claude Code hooks สำหรับ compact Thai workflow
- ติดตาม mode/profile/safety/speculative state
- ช่วยคง command, path, error, identifier, config key ให้ตรงเดิม
- ใช้ safety override เมื่อเป็นงาน production, auth, database, destructive command หรือ rollback
- มี command templates สำหรับ dashboard, quality, coach, ops, fleet, benchmark, compress, context

## ติดตั้งแบบแนะนำ

```bash
git clone https://github.com/kittimasak/thai-token-optimizer.git
cd thai-token-optimizer
npm install
npm test
npm run ci
npm link
```

ติดตั้ง Claude Code integration:

```bash
tto backup claude
tto install claude
tto doctor claude --pretty
```

ติดตั้งทุก integration:

```bash
tto backup all
tto install all
tto install-agents
tto doctor --pretty
```

## คำสั่งใน Claude Code

```text
token thai auto
token thai lite
token thai full
token thai safe
token thai off
/tto spec
/tto nospec
/tto nointeractive
```

ค่าแนะนำ:

```text
token thai auto
```

## คำสั่ง v2 ที่ควรตรวจหลังติดตั้ง

```bash
tto status --pretty
tto dashboard --view overview
tto doctor claude --pretty
tto quality --pretty
tto coach --pretty
tto ops --pretty
tto compress --pretty --level auto --target claude --budget 500 --check prompt.txt
tto benchmark --pretty --strict --default-policy --mtp
```

## สถานะ Hook ที่ผู้ใช้จะเห็น

```text
[TTO Stage 1/4] Detect Intent - loading Thai Token Optimizer v2.0
[TTO Stage 1/4] Detect Intent - tracking TTO mode/profile/safety
[TTO Stage 3/4] Preserve Critical - checking safety guard
[TTO Stage 4/4] Output Compact - preparing compact tool summary
[TTO Stage 4/4] Output Compact - finalizing safely
```

## Backup และ Rollback

ก่อนแก้ config ควร backup:

```bash
tto backup claude
```

ตรวจ rollback ก่อน:

```bash
tto rollback claude --dry-run
```

rollback จริง:

```bash
tto rollback claude
tto doctor claude --pretty
```

## ตรวจความถูกต้องของ plugin package

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); console.log('plugin.json OK')"
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); console.log('marketplace.json OK')"
find .claude-plugin/hooks -name '*.js' -print0 | xargs -0 -n1 node --check
node --test tests/test_install.js
```

## ข้อควรระวัง

- ห้ามแก้ stdout ของ hooks ให้มี debug text ปนกับ JSON
- ห้ามลบ backup/rollback behavior
- ห้ามลดทอนคำสั่ง, path, error, version หรือ config key
- ห้ามเปลี่ยน version lock ออกจาก `Thai Token Optimizer v2.0` และ `package version: 2.0.0`
