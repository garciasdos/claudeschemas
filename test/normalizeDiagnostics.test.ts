import { describe, expect, it } from 'vitest'
import { normalizeDiagnostics } from '../src/core/diagnostics/normalizeDiagnostics'
import type { Diagnostic } from '../src/core/diagnostics/types'

const at = (line: number, column: number, overrides: Partial<Diagnostic> = {}): Diagnostic => ({
  ruleId: 'skill/example',
  severity: 'warning',
  message: 'message',
  range: { start: { line, column }, end: { line, column: column + 1 } },
  source: 'frontmatter',
  ...overrides,
})

describe('normalizeDiagnostics', () => {
  it('sorts by line, then column', () => {
    const sorted = normalizeDiagnostics([at(4, 1), at(2, 5), at(2, 1)])
    expect(sorted.map((diagnostic) => diagnostic.range.start)).toEqual([
      { line: 2, column: 1 },
      { line: 2, column: 5 },
      { line: 4, column: 1 },
    ])
  })

  it('puts errors before warnings before info before hints on the same position', () => {
    const sorted = normalizeDiagnostics([
      at(1, 1, { severity: 'hint' }),
      at(1, 1, { severity: 'info' }),
      at(1, 1, { severity: 'error' }),
      at(1, 1, { severity: 'warning' }),
    ])
    expect(sorted.map((diagnostic) => diagnostic.severity)).toEqual([
      'error',
      'warning',
      'info',
      'hint',
    ])
  })

  it('drops duplicates', () => {
    expect(normalizeDiagnostics([at(1, 1), at(1, 1)])).toHaveLength(1)
  })

  it('keeps two diagnostics of the same rule with different messages', () => {
    const sorted = normalizeDiagnostics([at(1, 1), at(1, 1, { message: 'other' })])
    expect(sorted.map((diagnostic) => diagnostic.message)).toEqual(['message', 'other'])
  })
})
