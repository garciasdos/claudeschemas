---
name: audit-bundle-size
description: Compares the bundle size of the current branch against main and reports the packages responsible for the difference. Use when a change touches build configuration or someone asks why the bundle grew.
when_to_use: Use before merging a change to the build setup, or when a size budget check fails.
argument-hint: '[branch]'
arguments:
  - branch
context: fork
model: inherit
disable-model-invocation: false
allowed-tools: Read Bash(npm run build:*)
---

# Audit bundle size

1. Build the branch named on invocation and record the size of every emitted chunk.
2. Build main the same way and record the same numbers.
3. Report the chunks that grew, largest difference first, with the packages inside them.
