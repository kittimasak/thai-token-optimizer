<!--
============================================================================
Thai Token Optimizer v2.0
============================================================================
Description :
คู่มือติดตั้ง Codex Plugin สำหรับ Thai Token Optimizer v2.0.

Author      : Dr.Kittimasak Naijit
Repository  : https://github.com/kittimasak/thai-token-optimizer

Copyright (c) 2026 Dr.Kittimasak Naijit

Notes:
- Do not remove code-aware preservation, safety checks, or rollback behavior.
- This file is part of the Thai Token Optimizer local-first CLI/hook system.
============================================================================
-->

# คู่มือติดตั้ง Codex Plugin — Thai Token Optimizer v2.0

```text
Thai Token Optimizer v2.0
package version: 2.0.0
```

## ภาพรวม

โฟลเดอร์ `.codex-plugin` ใช้ประกาศ metadata, lifecycle hooks, command templates และ skill guidance สำหรับติดตั้ง Thai Token Optimizer ให้กับ Codex

เมื่อติดตั้งแล้ว Codex จะได้:

- compact Thai response behavior
- safety-aware hook guidance
- preservation ของ command/path/version/error/config exact
- mode trigger เช่น `token thai auto`
- MTP/speculative command guidance
- quality/coach/ops/fleet/checkpoint/cache/context command templates
- rollback-first installation workflow

## ติดตั้งเฉพาะ Codex

```bash
tto backup codex
tto install codex
tto install-agents
tto doctor codex --pretty
```

ไฟล์ที่เกี่ยวข้อง:

```text
~/.codex/hooks.json
~/.codex/config.toml
~/.codex/AGENTS.md
```

## ติดตั้งทุก integration

```bash
tto backup all
tto install all
tto install-agents
tto doctor --pretty
```

## ใช้งานใน Codex

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

## คำสั่ง v2 สำคัญ

```bash
tto status --pretty
tto dashboard --view overview
tto compress --pretty --level auto --target codex --budget 500 --check prompt.txt
tto compress --speculative --diagnostics --check --target codex prompt.txt
tto benchmark --pretty --strict --default-policy --mtp
tto quality --pretty
tto coach --pretty
tto ops --pretty
tto fleet --pretty --doctor --calibration --session-scan
tto checkpoint status --pretty
tto cache stats --pretty
tto context --pretty
tto calibration status --pretty
```

## ตรวจ plugin/hook files

```bash
node -e "JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('plugin.json OK')"
node -e "JSON.parse(require('fs').readFileSync('.codex-plugin/hooks/hooks.json','utf8')); console.log('hooks.json OK')"
find .codex-plugin/hooks -name '*.js' -print0 | xargs -0 -n1 node --check
node --test tests/test_codex_triggers.js tests/test_pretty_ui.js
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

## ข้อควรระวัง

- ห้ามเปลี่ยน `Thai Token Optimizer v2.0` และ `package version: 2.0.0`
- ห้ามลบ safety checks, preservation checks, backup หรือ rollback behavior
- ห้ามใส่ API key, token, password หรือ secret ใน `.codex-plugin`
- hook ที่ Codex parse เป็น JSON ต้องพิมพ์ valid JSON ใน stdout เท่านั้น
- `codex_hooks = true` ต้องอยู่เพียงครั้งเดียวใน `~/.codex/config.toml`
- `doctor --pretty` อาจเป็น `WARN` ถ้า optional integration footprint ยังไม่ครบในเครื่อง

