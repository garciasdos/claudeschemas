---
name: summarize-changelog
description: Turns a list of merged pull requests into changelog entries grouped by audience-visible change. Use when a release is being cut or someone asks for a changelog.
license: Apache-2.0
compatibility: Works in Claude Code, claude.ai and the Skills API; needs nothing beyond reading the repository.
metadata:
  owner: developer-experience
  catalog-id: changelog-2
allowed-tools: Read Grep
---

# Summarize the changelog

1. Read the pull request titles and bodies you are given.
2. Drop anything a reader cannot observe, such as refactors and test-only changes.
3. Write one line per remaining change, grouped under Added, Changed and Fixed.
