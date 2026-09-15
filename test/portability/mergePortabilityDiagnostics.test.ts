import { describe, expect, it } from 'vitest'
import { mergePortabilityDiagnostics } from '../../src/core/kinds/skill/portability/mergePortabilityDiagnostics'
import type { Diagnostic } from '../../src/core/diagnostics/types'

const finding = (targets: string[], overrides: Partial<Diagnostic> = {}): Diagnostic => ({
  ruleId: 'portability/unsupported-field',
  severity: 'error',
  message: 'message',
  range: { start: { line: 3, column: 1 }, end: { line: 3, column: 12 } },
  source: 'frontmatter',
  portability: { targets },
  ...overrides,
})

describe('mergePortabilityDiagnostics', () => {
  it('collapses the same finding on two targets into one diagnostic', () => {
    const merged = mergePortabilityDiagnostics([
      finding(['skills-api']),
      finding(['agent-skills-spec']),
    ])
    expect(merged).toHaveLength(1)
    expect(merged[0]?.portability?.targets).toEqual(['skills-api', 'agent-skills-spec'])
  })

  it('keeps the message of the first finding in input order', () => {
    const merged = mergePortabilityDiagnostics([
      finding(['skills-api'], { message: 'the upload fails' }),
      finding(['agent-skills-spec'], { message: 'a spec agent ignores it' }),
    ])
    expect(merged[0]?.message).toBe('the upload fails')
  })

  it('does not repeat a target that already attributes the finding', () => {
    const merged = mergePortabilityDiagnostics([finding(['skills-api']), finding(['skills-api'])])
    expect(merged[0]?.portability?.targets).toEqual(['skills-api'])
  })

  it('keeps findings of the same rule at different ranges apart', () => {
    const merged = mergePortabilityDiagnostics([
      finding(['skills-api']),
      finding(['agent-skills-spec'], {
        range: { start: { line: 4, column: 1 }, end: { line: 4, column: 12 } },
      }),
    ])
    expect(merged).toHaveLength(2)
  })

  it('keeps findings of different rules at the same range apart', () => {
    const merged = mergePortabilityDiagnostics([
      finding(['skills-api']),
      finding(['agent-skills-spec'], { ruleId: 'portability/field-constraint' }),
    ])
    expect(merged.map((diagnostic) => diagnostic.ruleId)).toEqual([
      'portability/unsupported-field',
      'portability/field-constraint',
    ])
  })

  it('passes diagnostics without a portability attribution through untouched', () => {
    const plain = finding([], { portability: undefined })
    const merged = mergePortabilityDiagnostics([plain, finding(['skills-api'])])
    expect(merged[0]).toBe(plain)
    expect(merged[1]?.portability?.targets).toEqual(['skills-api'])
  })

  it('returns an empty list for no input', () => {
    expect(mergePortabilityDiagnostics([])).toEqual([])
  })
})
