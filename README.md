# claudeschemas

A static, client-side validator for Claude `.md` document formats, in the spirit of jsonschemavalidator.net. The first supported document kind is `SKILL.md` (Claude Code Agent Skills).

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
