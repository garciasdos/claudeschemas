---
name: audit-dependencies
description: Audits third-party dependencies for known advisories and writes the findings into a report.
when_to_use: Use before cutting a release, or when someone asks whether the dependencies are safe to ship.
context: fork
agent: general-purpose
background: false
model: inherit
effort: high
allowed-tools:
  - Read
  - Bash(npm audit:*)
---

# Audit dependencies

1. Run `npm audit --json` and read the advisories it reports.
2. Group them by severity and drop the ones that only affect development dependencies.
3. Write the summary to ${CLAUDE_PROJECT_DIR}/reports/dependency-audit.md.
4. Report the count per severity back in one paragraph.
