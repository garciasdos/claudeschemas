import { describe, expect, it } from 'vitest'
import type { Diagnostic, Severity } from '../../src/core'
import {
  countBySeverity,
  groupDiagnostics,
  problemDiagnostics,
  problemSeverities,
} from '../../src/core'

const diagnostic = (severity: Severity): Diagnostic => ({
  ruleId: 'demo.rule',
  severity,
  message: 'Demo message',
  range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
  source: 'body',
})

const portabilityDiagnostic = (severity: Severity, targets: readonly string[]): Diagnostic => ({
  ...diagnostic(severity),
  ruleId: 'portability.demo',
  portability: { targets },
})

describe('countBySeverity', () => {
  it('reports zero for every severity when there are no diagnostics', () => {
    expect(countBySeverity([])).toEqual({ error: 0, warning: 0, info: 0, hint: 0 })
  })

  it('counts each severity separately', () => {
    expect(
      countBySeverity([
        diagnostic('error'),
        diagnostic('error'),
        diagnostic('warning'),
        diagnostic('info'),
        diagnostic('hint'),
        diagnostic('hint'),
        diagnostic('hint'),
      ]),
    ).toEqual({ error: 2, warning: 1, info: 1, hint: 3 })
  })
})

describe('groupDiagnostics', () => {
  it('keeps hints apart from problems in their original order', () => {
    const groups = groupDiagnostics([
      diagnostic('hint'),
      diagnostic('error'),
      diagnostic('info'),
      diagnostic('hint'),
    ])
    expect(groups.problems.map((entry) => entry.severity)).toEqual(['error', 'info'])
    expect(groups.portability).toEqual([])
    expect(groups.hints.map((entry) => entry.severity)).toEqual(['hint', 'hint'])
  })

  it('splits problems, portability findings and hints into three groups', () => {
    const groups = groupDiagnostics([
      diagnostic('error'),
      portabilityDiagnostic('warning', ['skills-api']),
      diagnostic('hint'),
      portabilityDiagnostic('error', ['skills-api', 'agent-skills-spec']),
      diagnostic('warning'),
    ])
    expect(groups.problems.map((entry) => entry.severity)).toEqual(['error', 'warning'])
    expect(groups.portability.map((entry) => entry.portability?.targets)).toEqual([
      ['skills-api'],
      ['skills-api', 'agent-skills-spec'],
    ])
    expect(groups.hints.map((entry) => entry.severity)).toEqual(['hint'])
  })

  it('keeps portability findings out of the plain problem group', () => {
    const groups = groupDiagnostics([portabilityDiagnostic('error', ['skills-api'])])
    expect(groups.problems).toEqual([])
    expect(groups.hints).toEqual([])
    expect(groups.portability).toHaveLength(1)
  })

  it('leaves hints out of the problem severities', () => {
    expect(problemSeverities).toEqual(['error', 'warning', 'info'])
  })
})

describe('problemDiagnostics', () => {
  it('is empty only when there is neither a problem nor a portability finding', () => {
    expect(problemDiagnostics(groupDiagnostics([]))).toEqual([])
    expect(problemDiagnostics(groupDiagnostics([diagnostic('hint')]))).toEqual([])
  })

  it('counts a portability finding as a problem so the clean state is suppressed', () => {
    const summarised = problemDiagnostics(
      groupDiagnostics([portabilityDiagnostic('warning', ['skills-api']), diagnostic('hint')]),
    )
    expect(summarised).toHaveLength(1)
    expect(countBySeverity(summarised).warning).toBe(1)
  })

  it('counts plain problems and portability findings together', () => {
    const summarised = problemDiagnostics(
      groupDiagnostics([
        diagnostic('error'),
        portabilityDiagnostic('error', ['agent-skills-spec']),
        diagnostic('hint'),
      ]),
    )
    expect(countBySeverity(summarised).error).toBe(2)
  })
})
