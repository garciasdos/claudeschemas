import { describe, expect, it } from 'vitest'
import { UnstructuredBodyRule } from '../../../src/core/kinds/skill/rules/hints/UnstructuredBodyRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new UnstructuredBodyRule()

const body = (lines: number): string =>
  Array.from({ length: lines }, (_, index) => `line ${index + 1}`).join('\n')

describe('UnstructuredBodyRule', () => {
  it('hints when a long body has no heading', () => {
    const diagnostics = rule.check(parseDocument(`---\nname: demo\n---\n${body(40)}`))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/body-structure')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.source).toBe('body')
    expect(diagnostics[0]?.message).toContain('40 lines')
    expect(diagnostics[0]?.range.start.line).toBe(4)
  })

  it('points at the first non-blank body line', () => {
    const diagnostics = rule.check(withFrontmatter('name: demo', body(40)))
    expect(diagnostics[0]?.message).toContain('41 lines')
    expect(diagnostics[0]?.range.start.line).toBe(5)
  })

  it('stays quiet below the minimum', () => {
    expect(rule.check(parseDocument(body(39)))).toEqual([])
  })

  it('accepts any markdown heading', () => {
    expect(rule.check(parseDocument(`## Steps\n${body(60)}`))).toEqual([])
    expect(rule.check(parseDocument(`${body(30)}\n# Late heading\n${body(30)}`))).toEqual([])
  })

  it('does not treat a bare hash or a hashtag as a heading', () => {
    expect(rule.check(parseDocument(`#\n${body(40)}`))).toHaveLength(1)
    expect(rule.check(parseDocument(`#tag\n${body(40)}`))).toHaveLength(1)
  })

  it('honours a custom minimum', () => {
    expect(new UnstructuredBodyRule(5).check(parseDocument(body(5)))).toHaveLength(1)
    expect(new UnstructuredBodyRule(5).check(parseDocument(body(4)))).toEqual([])
  })
})
