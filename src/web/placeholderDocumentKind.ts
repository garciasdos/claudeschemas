import type { Diagnostic, DocumentKind, Severity } from '../core'

const sample = `---
name: pdf-forms
description: Fill and flatten PDF forms. Use when the user needs to complete an AcroForm, read field values, or produce a flattened copy for signing.
allowed-tools:
  - Bash
  - Read
  - Write
---

# PDF forms

Read the field inventory before writing anything: a bad field name fails silently
and the filled document looks correct until someone opens it in Acrobat.

## Workflow

1. Run \`scripts/list_fields.py <file>\` to dump every field and its type.
2. Map the user's values onto those exact field names.
3. Fill with \`scripts/fill.py\`, then flatten only once the user confirms.

## Notes

- Never guess a checkbox export value; a bad guess silently leaves the box empty.
- Keep the unflattened original alongside the flattened copy.
`

const rotation: readonly Severity[] = ['error', 'warning', 'info']

const messages: Record<Severity, string> = {
  error: 'Placeholder rule: the word "bad" is not allowed in this document.',
  warning: 'Placeholder rule: consider rewording this sentence.',
  info: 'Placeholder rule: this line matched the sample validator.',
}

export const placeholderDocumentKind: DocumentKind = {
  id: 'placeholder',
  label: 'SKILL.md (placeholder)',
  schemaUrl: 'https://github.com/garciasdos/claudeschemas/tree/main/schemas',
  sample,
  validate(text: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = []
    text.split('\n').forEach((line, index) => {
      const column = line.indexOf('bad')
      if (column < 0) {
        return
      }
      const severity = rotation[diagnostics.length % rotation.length]
      diagnostics.push({
        ruleId: `placeholder.no-${severity}-words`,
        severity,
        message: messages[severity],
        range: {
          start: { line: index + 1, column: column + 1 },
          end: { line: index + 1, column: column + 4 },
        },
        source: 'body',
      })
    })
    return diagnostics
  },
}
