import { describe, expect, it } from 'vitest'
import type { Diagnostic, Severity } from '../../src/core'
import { countBySeverity, countLabel } from '../../src/web/diagnostics/summary'

const diagnostic = (severity: Severity): Diagnostic => ({
  ruleId: 'demo.rule',
  severity,
  message: 'Demo message',
  range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
  source: 'body',
})

describe('countBySeverity', () => {
  it('reports zero for every severity when there are no diagnostics', () => {
    expect(countBySeverity([])).toEqual({ error: 0, warning: 0, info: 0 })
  })

  it('counts each severity separately', () => {
    expect(
      countBySeverity([
        diagnostic('error'),
        diagnostic('error'),
        diagnostic('warning'),
        diagnostic('info'),
      ]),
    ).toEqual({ error: 2, warning: 1, info: 1 })
  })
})

describe('countLabel', () => {
  it('uses the singular form for one problem', () => {
    expect(countLabel('error', 1)).toBe('1 error')
  })

  it('uses the plural form for other counts', () => {
    expect(countLabel('warning', 0)).toBe('0 warnings')
    expect(countLabel('warning', 3)).toBe('3 warnings')
  })

  it('leaves info uncountable', () => {
    expect(countLabel('info', 2)).toBe('2 info')
  })
})
