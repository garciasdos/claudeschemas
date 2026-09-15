---
name: triage-issue
description: Labels an issue, assigns a reviewer and writes a short triage note on it. Use when someone asks for an issue to be triaged or handed to a reviewer.
argument-hint: '[issue] [reviewer]'
arguments:
  - issue
  - reviewer
allowed-tools: Bash(gh issue:*)
---

# Triage an issue

1. Read issue $issue and decide which area label fits it.
2. Assign $1 as the reviewer and apply the label.
3. Leave a triage note quoting the request: $ARGUMENTS.
