# claudeschemas

A static, client-side validator for Claude `.md` document formats, in the spirit of jsonschemavalidator.net. The first supported document kind is `SKILL.md` (Claude Code Agent Skills).

Besides schema and semantic problems, the validator lists improvement hints for a skill that is already valid: a description that never says when to use the skill or speaks in the first person, declared arguments the body never places, a missing `argument-hint`, an empty or unstructured body, leftover `TODO` text, shell blocks or injected `` !`command` `` lines without `allowed-tools`, absolute paths that only exist on one machine, a deploy or publish skill Claude may invoke on its own, a description that claims every request, and similar. Problems cover the frontmatter contradictions Claude Code ignores silently, such as `background` or `agent` without `context: fork`, `when_to_use` or `paths` next to `disable-model-invocation: true`, a tool in both `allowed-tools` and `disallowed-tools`, a `matcher` on a hook event that has none, and duplicate or oddly named `arguments`. A misspelled field name gets a suggestion for the field that was meant. Hints are shown apart from problems and never count against "No problems found". The missing-`argument-hint` and injected-command hints ignore text inside fenced code blocks, so a skill that documents skill syntax is not flagged for the syntax it is explaining.

## Target selector

A skill file that Claude Code accepts is not necessarily one that claude.ai, the Skills API or another agent accepts. The target selector says which of those the file is being checked against:

- `Claude Code` — the full frontmatter Claude Code accepts. This is the default, and the result is exactly what the validator reported before target selection existed.
- `claude.ai / Skills API` — only the six Agent Skills fields (`name`, `description`, `license`, `allowed-tools`, `compatibility`, `metadata`). Any other key fails the upload with an unexpected-key error; client-specific values belong under `metadata`.
- `Agent Skills spec` — the vendor-neutral specification at https://agentskills.io/specification. The same six fields, with a stricter `name` (no leading, trailing or repeated hyphen), `allowed-tools` as a space-separated string rather than a list, and `metadata` as a map from strings to strings.
- `All targets` — runs every target and tags each finding with the targets it affects.

The selection is remembered for the session.

## Portability problems

On any target other than `Claude Code`, findings in the `portability` class report that a file which is valid in Claude Code will break or silently misbehave elsewhere:

- a frontmatter key the target does not accept, such as `when_to_use`, `arguments`, `context` or `model`;
- a frontmatter value the target's schema rejects for another reason, such as a missing `name`, a `name` shape the spec forbids, `allowed-tools` given as a list where the spec wants a string, or `metadata` values that are not strings;
- a body construct only Claude Code expands: `` !`command` `` dynamic context injection inline or as a ` ```! ` block, the `$ARGUMENTS`, `$1` and `$name` argument placeholders, and the `${CLAUDE_*}` variables.

Portability findings are problems, not hints: they count against "No problems found", and they are listed in their own section. The `Claude Code` target produces none of them. Text inside a fenced code block is documentation, so nothing in one is ever reported.

## Portable version

When a file has portability problems, a portable version of it is shown beside the report: a read-only copy with the frontmatter reduced to the keys the target accepts, in their original order, and the injection lines removed. A note lists what was stripped and what still has to be rewritten by hand, such as an argument placeholder that has no equivalent outside Claude Code. It is a preview with a copy button; the editor itself is never modified.

## Development

```
npm install
npm run dev
npm run build
npm run preview
npm run test
npm run lint
npm run format
npm run typecheck
npm run check
```

## Schemas

- `schemas/skill.schema.json` — the frontmatter Claude Code accepts.
- `schemas/skill.skills-api.schema.json` — the frontmatter claude.ai and the Skills API accept.
- `schemas/skill.agent-skills-spec.schema.json` — the frontmatter the Agent Skills specification defines.

Every file under `schemas/` is a plain, standalone JSON Schema document. They carry no dependency on this project's code, refer to nothing outside themselves, and can be used with any JSON Schema validator.

## Contributing

Code follows SOLID principles and carries no comments; names should make intent clear on their own.
