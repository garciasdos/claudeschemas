---
name: explain-authoring-syntax
description: Explains the Claude Code additions to SKILL.md to someone writing their first skill. Use when a person asks what the extra syntax in a skill file means.
---

# Explain skill syntax

Show the reader the reference below and answer whichever part they asked about.

## Reference

```markdown
!`git status --short`

$ARGUMENTS
$1

${CLAUDE_SKILL_DIR}
```

## Notes

- The first line runs a command before the skill loads.
- The middle lines stand for whatever was typed after the skill name.
- The last line is the directory the skill file sits in.
