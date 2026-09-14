# claudeschemas

A static, client-side validator for Claude `.md` document formats, in the spirit of jsonschemavalidator.net. The first supported document kind is `SKILL.md` (Claude Code Agent Skills).

Besides schema and semantic problems, the validator lists improvement hints for a skill that is already valid: a description that never says when to use the skill or speaks in the first person, declared arguments the body never places, a missing `argument-hint`, an empty or unstructured body, leftover `TODO` text, shell blocks or injected `` !`command` `` lines without `allowed-tools`, absolute paths that only exist on one machine, a deploy or publish skill Claude may invoke on its own, a description that claims every request, and similar. Problems cover the frontmatter contradictions Claude Code ignores silently, such as `background` or `agent` without `context: fork`, `when_to_use` or `paths` next to `disable-model-invocation: true`, a tool in both `allowed-tools` and `disallowed-tools`, a `matcher` on a hook event that has none, and duplicate or oddly named `arguments`. A misspelled field name gets a suggestion for the field that was meant. Hints are shown apart from problems and never count against "No problems found".

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

The JSON Schema files under `schemas/` are plain, standalone JSON Schema documents. They carry no dependency on this project's code and can be used with any JSON Schema validator.

## Contributing

Code follows SOLID principles and carries no comments; names should make intent clear on their own.
