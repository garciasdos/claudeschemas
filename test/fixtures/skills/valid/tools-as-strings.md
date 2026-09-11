---
name: rebase-branch
description: Rebases a working branch onto a target branch and resolves the conflicts it can resolve on its own.
argument-hint: '[branch] [onto]'
arguments: branch onto
allowed-tools: Read, Edit, Bash(git status:*), Bash(git rebase:*)
paths: src/**/*.ts, test/**/*.ts
model: inherit
---

# Rebase a branch

1. Check out $0 and confirm the working tree is clean.
2. Rebase it onto $ARGUMENTS[1].
3. Stop and report as soon as a conflict needs a human decision.
