---
name: explain-authoring-syntax
description: Explains the Claude Code additions to SKILL.md to someone writing their first one. Use when a person asks what the extra syntax in a skill file means.
license: MIT
compatibility: Reads as plain prose everywhere; nothing in it is executed.
metadata:
  owner: developer-experience
allowed-tools: Read
---

# Document the skill syntax

Show the reader this reference, unchanged:

```markdown
Output of a command runs before the skill loads:

    !`git status --short`

Invocation arguments land where the placeholders are:

    $ARGUMENTS
    $1
    $branch

Files bundled with the skill live under:

    ${CLAUDE_SKILL_DIR}
```

Then answer whichever part of it the reader asked about.
