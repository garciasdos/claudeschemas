import { describe, expect, it } from 'vitest'
import { DuplicateArgumentRule } from '../../src/core/kinds/skill/rules/DuplicateArgumentRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new DuplicateArgumentRule()

describe('DuplicateArgumentRule', () => {
  it('reports a repeated name once', () => {
    const diagnostics = rule.check(withFrontmatter('arguments: branch branch branch'))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/duplicate-argument')
    expect(diagnostics[0]?.severity).toBe('error')
    expect(diagnostics[0]?.message).toContain('"branch" is declared more than once')
    expect(diagnostics[0]?.range.start.line).toBe(2)
  })

  it('reports each repeated name from a list', () => {
    const diagnostics = rule.check(withFrontmatter('arguments: [a, b, a, b, c]'))
    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      expect.stringContaining('"a"'),
      expect.stringContaining('"b"'),
    ])
  })

  it('stays quiet when every name is distinct', () => {
    expect(rule.check(withFrontmatter('arguments: issue branch'))).toEqual([])
  })

  it('stays quiet without arguments or frontmatter', () => {
    expect(rule.check(withFrontmatter('name: demo'))).toEqual([])
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
