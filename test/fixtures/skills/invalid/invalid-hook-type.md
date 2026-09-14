---
name: notify-done
description: Notifies the team channel when a task finishes and the user asked to be notified.
disable-model-invocation: true
hooks:
  Stop:
    - hooks:
        - type: webhook
          command: scripts/notify.sh
---

# Notify when done

Post the summary of the finished task.
