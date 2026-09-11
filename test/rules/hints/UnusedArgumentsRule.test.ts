import { describe, expect, it } from 'vitest'
import { UnusedArgumentsRule } from '../../../src/core/kinds/skill/rules/hints/UnusedArgumentsRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new UnusedArgumentsRule()

describe('UnusedArgumentsRule', () => {
  it('hints when declared arguments never appear in the body', () => {
    const diagnostics = rule.check(
      withFrontmatter('arguments:\n  - issue\n  - branch', 'Close the issue.\n'),
    )
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/unused-arguments')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.message).toContain('declares "issue", "branch"')
    expect(diagnostics[0]?.message).toContain('for example "$issue"')
    expect(diagnostics[0]?.range.start.line).toBe(2)
  })

  it('accepts a named reference', () => {
    expect(rule.check(withFrontmatter('arguments: issue', 'Close $issue.\n'))).toEqual([])
  })

  it('accepts positional references', () => {
    expect(rule.check(withFrontmatter('arguments: issue', 'Close $0.\n'))).toEqual([])
    expect(rule.check(withFrontmatter('arguments: issue', 'Close $ARGUMENTS.\n'))).toEqual([])
    expect(rule.check(withFrontmatter('arguments: issue', 'Close $ARGUMENTS[0].\n'))).toEqual([])
  })

  it('does not count an undeclared name or an escaped placeholder', () => {
    expect(rule.check(withFrontmatter('arguments: issue', 'Close $branch.\n'))).toHaveLength(1)
    expect(rule.check(withFrontmatter('arguments: issue', 'Close \\$issue.\n'))).toHaveLength(1)
  })

  it('stays quiet when no arguments are declared', () => {
    expect(rule.check(withFrontmatter('name: demo', 'Tidy the file.\n'))).toEqual([])
    expect(rule.check(withFrontmatter('arguments: []', 'Tidy the file.\n'))).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
