---
name: measure-coverage
description: Runs the test suite with coverage and reports the files below the project threshold. Use when someone asks how well covered a change is.
license: MIT
metadata:
  owner: developer-experience
  tier: 2
allowed-tools:
  - Read
  - Bash(npm test:*)
---

# Measure coverage

1. Run the test suite with coverage enabled.
2. Compare each touched file against the project threshold.
3. Report the files below it, lowest first.
