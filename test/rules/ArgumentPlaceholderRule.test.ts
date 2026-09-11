import { describe, expect, it } from 'vitest'
import { ArgumentPlaceholderRule } from '../../src/core/kinds/skill/rules/ArgumentPlaceholderRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new ArgumentPlaceholderRule()

describe('ArgumentPlaceholderRule', () => {
  it('stays quiet when arguments are not declared', () => {
    expect(rule.check(withFrontmatter('name: demo', 'Use $7 and $ARGUMENTS[9].\n'))).toEqual([])
  })

  it('accepts indexes within range', () => {
    expect(
      rule.check(withFrontmatter('arguments: issue branch', 'Move $0 onto $ARGUMENTS[1].\n')),
    ).toEqual([])
  })

  it('warns about an index past the declared arguments', () => {
    const diagnostics = rule.check(withFrontmatter('arguments: issue branch', 'Also $2.\n'))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/argument-placeholder')
    expect(diagnostics[0]?.severity).toBe('warning')
    expect(diagnostics[0]?.message).toContain('"$2" is out of range')
    expect(diagnostics[0]?.source).toBe('body')
  })

  it('warns about $ARGUMENTS[N] past the declared arguments', () => {
    const diagnostics = rule.check(withFrontmatter('arguments: issue', 'Use $ARGUMENTS[3].\n'))
    expect(diagnostics[0]?.message).toContain('"$ARGUMENTS[3]" is out of range')
  })

  it('locates the placeholder in the body', () => {
    const diagnostics = rule.check(withFrontmatter('arguments: issue', 'first\nsecond $4 here\n'))
    expect(diagnostics[0]?.range).toEqual({
      start: { line: 6, column: 8 },
      end: { line: 6, column: 10 },
    })
  })

  it('ignores an escaped placeholder', () => {
    expect(rule.check(withFrontmatter('arguments: issue', 'Costs \\$5 today.\n'))).toEqual([])
  })

  it('warns about a named placeholder that is not declared', () => {
    const diagnostics = rule.check(
      withFrontmatter('arguments:\n  - issue', 'Rebase $issue onto $branch.\n'),
    )
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.message).toContain('"$branch" is not a declared argument')
  })

  it('checks named placeholders only for a declared list', () => {
    expect(rule.check(withFrontmatter('arguments: issue', 'Rebase onto $branch.\n'))).toEqual([])
  })

  it('leaves uppercase shell variables alone', () => {
    expect(
      rule.check(withFrontmatter('arguments:\n  - issue', 'Read $HOME and $ARGUMENTS.\n')),
    ).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Use $9 freely.\n'))).toEqual([])
  })
})
