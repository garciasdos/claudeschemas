---
name: summarize-release-notes
description: Turns a list of merged pull requests into release notes grouped by audience-visible change.
license: Apache-2.0
compatibility: Works in Claude Code, claude.ai and the Skills API; needs no tools beyond reading the repository.
metadata:
  owner: developer-experience
  catalog-id: rel-notes-2
  tier: 2
allowed-tools: Read
---

# Summarize release notes

1. Read the pull request titles and bodies you are given.
2. Drop anything a user cannot observe, such as refactors and test-only changes.
3. Write one line per remaining change, grouped under Added, Changed and Fixed.
