---
name: check-spelling
description: Checks prose files against the word list bundled with this skill and reports the words it does not know. Use when someone asks for a spelling pass over documentation.
license: MIT
allowed-tools: Read
---

# Check spelling

1. Read the word list at ${CLAUDE_SKILL_DIR}/words.txt.
2. Compare every word in the files you were given against that list.
3. Report the unknown words with the file and line they appear on.
