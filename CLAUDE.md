# claudeschemas

A static, client-side validator for Claude `.md` document formats (jsonschemavalidator.net, but
for Claude documents). The first supported document kind is `SKILL.md` (Claude Code Agent
Skills); more kinds are planned. Public repo.

Hard rules the owner set, always follow them:

- SOLID principles throughout.
- No code comments and no JSDoc, anywhere. Names must be self-explanatory instead.
- UI stays clean and understated: no gradients, no shadows, no emoji, no hero copy or marketing
  text.
- Everything runs client-side. No backend, no server-side logic.
- Hosted on GitHub Pages at the `/claudeschemas/` base path.

## Commands

```
npm run dev        # vite dev server
npm run build       # production build
npm run preview     # serve the production build (base path /claudeschemas/)
npm run test        # vitest run
npm run lint         # eslint .
npm run format       # prettier --write .
npm run typecheck    # tsc --noEmit
npm run check        # lint + typecheck + test
```

`npm run check` and `npm run build` must both pass before any commit.

## Architecture

`src/core` has zero DOM dependencies; it is plain TypeScript. `src/web` (browser) and `src/cli`
(Node) may only depend on core through the public exports in `src/core/index.ts` — never reach
into `src/core/**` internals directly, and never depend on each other. Diagnostic grouping
(`groupDiagnostics`, `problemDiagnostics`, `countBySeverity`) lives in core because both surfaces
need it; only the wording of counts and section titles stays in `src/web/diagnostics/summary.ts`.

Core contracts (see `src/core/index.ts` for the full export list):

- `Diagnostic` — `{ ruleId, severity, message, range, source }`. `Position`/`Range` are 1-based
  (line and column both start at 1).
- `ParsedDocument` — `{ text, lines, frontmatter, body }`, produced by a `DocumentParser`
  (`MarkdownFrontmatterParser` is the concrete implementation).
- `Rule` — `{ id, severity, check(document): Diagnostic[] }`.
- `DocumentKind` — `{ id, label, schemaUrl, sample, validate(text): Diagnostic[] }`, held by a
  `DocumentKindRegistry` (`InMemoryDocumentKindRegistry`). `createDefaultRegistry()` builds and
  registers every known kind.

The skill kind (`src/core/kinds/skill/`) composes a `MarkdownFrontmatterParser`, an
`AjvSchemaValidator` bound to `schemas/skill.schema.json`, and an ordered list of semantic `Rule`
instances (`createSkillRules()`), wired together by `createSkillDocumentKind()` into a
`SkillDocumentKind`. `SkillDocumentKind.validate` merges YAML-syntax, JSON Schema, and rule
diagnostics, then runs them through `normalizeDiagnostics`.

Improvement hints are ordinary `Rule` instances with severity `hint`, kept under
`src/core/kinds/skill/rules/hints/` and listed by `createSkillHintRules()`, which
`createSkillRules()` appends after the validation rules. A hint never reports a violation; it
points at something a valid skill could do better (a description that never says when to use the
skill, arguments declared but never placed, a shell block with no `allowed-tools`, and so on). The
web panel lists hints in their own section below the problems, and "No problems found" ignores
them.

JSON Schemas live in `schemas/*.schema.json` as plain, standalone documents with no dependency on
this project's code — usable with any JSON Schema validator. They are served in dev and emitted
into the build by the `staticSchemas` plugin in `vite.config.ts`, which reads a `schemaAssets`
list of `{ fileName, source }` entries.

## Command line and agent surface

`src/cli` is a Node CLI over the same core: `parseCliOptions` reads the arguments,
`FileDocumentSourceReader` reads the files or standard input, `DocumentValidationService` resolves
the kind and target and produces a `ValidationReport`, and a `ReportFormatter`
(`TextReportFormatter` or `JsonReportFormatter`) turns it into lines. `CliApplication` wires those
together and returns the exit code: 0 clean, 1 findings reported, 2 bad usage or unreadable input.
`src/cli/main.ts` is the composition root and the only file that touches `process`.

`vite.cli.config.ts` bundles it into `dist/api/cli.mjs` as one self-contained ESM file (Node
builtins external, shebang banner) and copies `skills/claudeschemas/SKILL.md` to
`dist/api/SKILL.md`. `npm run build` runs the app build first, then the CLI build, so both land in
the Pages deploy. An agent downloads the CLI with `curl` and runs it with `node`; there is no API
endpoint, because GitHub Pages serves static files only.

`skills/claudeschemas/SKILL.md` is the agent skill that documents that workflow. It must validate
clean against itself — no problems and no hints — as part of any change to it.

## Adding a new document kind

1. Create `src/core/kinds/<id>/`.
2. Add a JSON Schema at `schemas/<id>.schema.json`.
3. Write semantic rule classes, one class per file, under `src/core/kinds/<id>/rules/`,
   implementing `Rule`.
4. Add a `create<Id>Rules()` factory that returns the ordered rule list.
5. Add a `<Name>DocumentKind` class implementing `DocumentKind`, composing the parser, an
   `AjvSchemaValidator` over the new schema, and the rules.
6. Add a `create<Name>DocumentKind()` factory (mirrors `createSkillDocumentKind`) and export it,
   plus its schema URL constant, from `src/core/index.ts`.
7. Register it in `createDefaultRegistry()` (`src/core/createDefaultRegistry.ts`).
8. Add fixtures under `test/fixtures/<kind>/valid/*.md` and `test/fixtures/<kind>/invalid/*.md`
   with one `.expected.json` sidecar per invalid fixture: `{ "problem": string, "ruleIds":
string[] }`. Valid fixtures must produce zero diagnostics, hints included. Invalid sidecars list
   the problem rule ids only; hints that also fire on an invalid fixture are ignored. Hint rules get
   their own fixtures under `test/fixtures/<kind>/hints/*.md` with a `{ "hint": string, "ruleIds":
string[] }` sidecar, and must produce nothing but the listed hints.
9. Add the new schema file to the `schemaAssets` list in `vite.config.ts` so it is served in dev
   and emitted at build.

## Conventions

- Rule ids are `<namespace>/<kebab-case-name>`: `skill/name-format` for semantic rules,
  `schema/unknown-field` (etc., from `translateAjvError.ts`) for JSON Schema violations,
  `frontmatter/yaml-syntax` for parse failures.
- Severities are `error`, `warning`, `info`, `hint`. The first three are problems; `hint` is an
  improvement suggestion and must never fire on a kind's sample or on a valid fixture.
- Messages are human-readable and tell the author what to do, not just what is wrong (see
  `NameFormatRule` for the pattern).
- Diagnostics are sorted by line, then column, then severity, then rule id, then message, and
  de-duplicated — via `normalizeDiagnostics`. Every `DocumentKind.validate` must return through it.
- One class per file. Constructor injection for all collaborators (parser, schema validator,
  rules); no hidden singletons.
- Formatting is Prettier-enforced (`.prettierrc`: no semicolons, single quotes, 100 print width).
- Tests live in `test/`, mirroring `src/core` by concern (e.g. `test/rules/*.test.ts`,
  `test/fixtures.test.ts` runs every fixture against its `DocumentKind`).

## Design tokens

CSS custom properties are defined in `src/styles/base.css`: `--space-*`, `--font-ui`/`--font-mono`,
`--text-*`, `--bg*`/`--text*`/`--border*`, `--accent`/`--focus`, and severity colors
(`--error`/`--warning`/`--info`/`--hint`/`--success`), plus editor-specific tokens (`--gutter-bg`,
`--selection`, `--syntax-*`). Light values are on `:root`; dark values are redefined under
`@media (prefers-color-scheme: dark)`. Chrome uses the system font stack (`--font-ui`); the editor,
rule ids, and other code-like text use the monospace stack (`--font-mono`).

## Known constraints

- `.github/workflows/*` can only be pushed from a credential with the `workflow` scope. Sessions
  without it must leave those files for the owner to push.
- When verifying the built app with Playwright, launch Chromium with `--no-proxy-server`, and use
  `vite preview` (not `vite dev`) so the app is served under the real `/claudeschemas/` base path.
