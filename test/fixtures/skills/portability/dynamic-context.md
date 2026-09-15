---
name: review-working-tree
description: Reviews the uncommitted changes in the working tree and reports the ones worth a second look before a commit. Use when someone asks for a review of what is currently staged or modified.
allowed-tools: Bash(git:*)
---

# Review the working tree

Current state: !`git status --short`

```!
git diff --stat
```

1. Read the status and the diff summary above.
2. Name the files whose changes need a closer read, with one sentence each.
