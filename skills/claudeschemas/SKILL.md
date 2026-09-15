---
name: claudeschemas
description: Checks a SKILL.md file against the claudeschemas JSON Schemas, semantic rules and improvement hints, then reports every problem and suggestion with its line number. Use when writing or reviewing a skill file, when claude.ai or the Skills API rejects one, or when a skill never triggers and its frontmatter may be the reason.
allowed-tools:
  - Bash(curl:*)
  - Bash(node:*)
  - Read
  - Edit
---

# Validate a Claude skill file

## Get the validator

The validator is one self-contained file that needs Node 20 or newer and no install step.
Download it once per session:

```bash
curl -fsSL https://garciasdos.github.io/claudeschemas/api/cli.mjs -o /tmp/claudeschemas-cli.mjs
```

## Run it

```bash
node /tmp/claudeschemas-cli.mjs path/to/SKILL.md
```

The output is one line per finding, then a summary line per file:

```
path/to/SKILL.md:3:1: hint: skill/description-brevity: The description is 2 words long...
path/to/SKILL.md: no problems, 1 hint (claude-code)
```

Useful flags:

- `--json` emits one JSON object with `problems`, `portability`, `hints` and `counts` per file.
- `--target skills-api` or `--target agent-skills-spec` checks the file against claude.ai and the
  Skills API, or against the vendor-neutral Agent Skills specification, instead of Claude Code.
- `--target all` reports against every target and tags each finding with the targets it affects.
- `--strict` exits non-zero when only improvement hints are left.
- `--list-targets` prints the known document kinds and their targets.
- Several files may be passed at once, and `-` or no path reads the file from standard input.

Exit codes are 0 when clean, 1 when findings were reported, and 2 for bad usage or unreadable
input.

## Read the findings

- `error`, `warning` and `info` are problems: the file is wrong, or Claude Code will silently
  ignore part of it. Fix every one.
- `hint` is an improvement suggestion on a file that is already valid, usually about a description
  Claude will not match, an argument that is declared but never placed, or a body Claude cannot
  navigate. Apply the ones that fit the skill.
- A finding that names the targets it affects is a portability problem: the file works in Claude
  Code but breaks elsewhere. It only appears on a target other than `claude-code`.

Each message says what to change, so fix the file from the message rather than guessing, then run
the validator again until it reports no problems.

## Choose the right target

Check the file against the client it is actually written for. A file meant for claude.ai or the
Skills API has to pass `--target skills-api`, which rejects the Claude Code frontmatter keys those
clients do not accept.
