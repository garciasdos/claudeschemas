---
name: guard-secrets
description: Watches for secrets being written into tracked files and blocks the write before it happens.
when_to_use: Use when working in a repository that must never contain credentials in plain text.
disable-model-invocation: false
hooks:
  PreToolUse:
    - matcher: Write|Edit
      hooks:
        - type: command
          command: scripts/scan-for-secrets.sh
          timeout: 20
  Stop:
    - hooks:
        - type: command
          command: scripts/report-scan-results.sh
---

# Guard secrets

Treat any match from the scanner as a hard stop: report the file and the line, and never write the
value back out in the transcript.
