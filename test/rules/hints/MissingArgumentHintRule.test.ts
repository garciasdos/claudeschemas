import { describe, expect, it } from 'vitest'
import { MissingArgumentHintRule } from '../../../src/core/kinds/skill/rules/hints/MissingArgumentHintRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new MissingArgumentHintRule()

describe('MissingArgumentHintRule', () => {
  it('hints when arguments are declared without an argument-hint', () => {
    const diagnostics = rule.check(
      withFrontmatter('name: close-issue\narguments:\n  - issue', 'Close $issue.\n'),
    )
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/missing-argument-hint')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.source).toBe('frontmatter')
    expect(diagnostics[0]?.range.start.line).toBe(3)
    expect(diagnostics[0]?.message).toContain('"/close-issue"')
  })

  it('hints at the first positional placeholder when nothing is declared', () => {
    const diagnostics = rule.check(withFrontmatter('name: demo', 'Close $ARGUMENTS now.\n'))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.source).toBe('body')
    expect(diagnostics[0]?.range.start).toEqual({ line: 5, column: 7 })
  })

  it('recognises indexed placeholders', () => {
    expect(rule.check(withFrontmatter('name: demo', 'Use $0 and $ARGUMENTS[1].\n'))).toHaveLength(1)
  })

  it('ignores an escaped placeholder', () => {
    expect(rule.check(withFrontmatter('name: demo', 'Costs \\$5.\n'))).toEqual([])
  })

  it('stays quiet once an argument-hint is present', () => {
    expect(
      rule.check(withFrontmatter("arguments: issue\nargument-hint: '[issue]'", 'Close $0.\n')),
    ).toEqual([])
    expect(
      rule.check(withFrontmatter('arguments: issue\nargument-hint: [issue]', 'Close $0.\n')),
    ).toEqual([])
  })

  it('treats a blank argument-hint as missing', () => {
    expect(rule.check(withFrontmatter("arguments: issue\nargument-hint: ''"))).toHaveLength(1)
  })

  it('stays quiet when the skill is hidden from the / menu', () => {
    expect(
      rule.check(withFrontmatter('arguments: issue\nuser-invocable: false', 'Close $0.\n')),
    ).toEqual([])
  })

  it('stays quiet for a skill that takes no arguments', () => {
    expect(rule.check(withFrontmatter('name: demo', 'Tidy the file.\n'))).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Use $ARGUMENTS.\n'))).toEqual([])
  })
})
