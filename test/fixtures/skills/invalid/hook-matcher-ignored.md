---
name: log-turns
description: Records the end of every turn to a log file when the user asks for turn logging.
hooks:
  Stop:
    - matcher: Bash
      hooks:
        - type: command
          command: scripts/log-turn.sh
  PreToolUse:
    - matcher: Write
      hooks:
        - type: command
          command: scripts/log-write.sh
---

# Log turns

Say nothing extra; the hooks do the work.
