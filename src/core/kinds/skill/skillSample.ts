export const skillSample = `---
name: changelog-entry
description: Records a merged pull request in CHANGELOG.md using the repository's existing entry format.
when_to_use: Use after a pull request is merged, or when someone asks for a change to be written into the changelog.
argument-hint: [pull-request-number]
arguments:
  - pull-request
allowed-tools:
  - Read
  - Edit
  - Bash(gh pr view:*)
---

# Changelog entry

Record pull request $pull-request in \`CHANGELOG.md\`.

## Steps

1. Read the pull request: \`gh pr view $pull-request --json title,body,author,mergedAt\`.
2. Open \`CHANGELOG.md\` and find the \`## Unreleased\` section. Create it above the
   most recent release heading if it is missing.
3. Add one line under \`### Added\`, \`### Changed\` or \`### Fixed\`, whichever fits the
   pull request, and match the wording style of the entries already there.
4. Link the pull request number at the end of the line.

## Style

- One sentence per entry, present tense, no trailing period.
- Describe the change from a user's point of view, not the implementation.
- Leave released sections untouched.
`
