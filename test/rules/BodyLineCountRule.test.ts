import { describe, expect, it } from 'vitest'
import { BodyLineCountRule } from '../../src/core/kinds/skill/rules/BodyLineCountRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new BodyLineCountRule()

const body = (lines: number): string =>
  Array.from({ length: lines }, (_, index) => `line ${index + 1}`).join('\n')

describe('BodyLineCountRule', () => {
  it('stays quiet for a short body', () => {
    expect(rule.check(withFrontmatter('name: demo', body(10)))).toEqual([])
  })

  it('stays quiet at exactly the limit', () => {
    expect(rule.check(parseDocument(body(500)))).toEqual([])
  })

  it('warns past the limit and reports the real line count', () => {
    const diagnostics = rule.check(parseDocument(body(501)))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/body-line-count')
    expect(diagnostics[0]?.severity).toBe('warning')
    expect(diagnostics[0]?.message).toContain('501 lines')
    expect(diagnostics[0]?.source).toBe('body')
  })

  it('counts body lines from the end of the frontmatter', () => {
    const diagnostics = new BodyLineCountRule(3).check(withFrontmatter('name: demo', body(5)))
    expect(diagnostics[0]?.range.start.line).toBe(7)
  })

  it('honours a custom limit', () => {
    expect(new BodyLineCountRule(4).check(parseDocument(body(4)))).toEqual([])
    expect(new BodyLineCountRule(4).check(parseDocument(body(5)))).toHaveLength(1)
  })

  it('ignores a trailing newline', () => {
    expect(new BodyLineCountRule(3).check(parseDocument(`${body(3)}\n`))).toEqual([])
  })
})
