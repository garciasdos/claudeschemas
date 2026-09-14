import { describe, expect, it } from 'vitest'
import { ArgumentNameFormatRule } from '../../src/core/kinds/skill/rules/ArgumentNameFormatRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new ArgumentNameFormatRule()

describe('ArgumentNameFormatRule', () => {
  it('warns about a name that is not lowercase and hyphenated', () => {
    const diagnostics = rule.check(withFrontmatter('arguments:\n  - Pr_Number'))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/argument-name-format')
    expect(diagnostics[0]?.severity).toBe('warning')
    expect(diagnostics[0]?.message).toContain('such as "pr-number"')
    expect(diagnostics[0]?.range.start.line).toBe(2)
  })

  it('suggests a hyphenated form for camel case', () => {
    const diagnostics = rule.check(withFrontmatter('arguments: issueNumber'))
    expect(diagnostics[0]?.message).toContain('such as "issue-number"')
  })

  it('reports each unusual name', () => {
    expect(rule.check(withFrontmatter('arguments: [A, b, -c]'))).toHaveLength(2)
  })

  it('accepts lowercase names with digits and single hyphens', () => {
    expect(rule.check(withFrontmatter('arguments: issue branch-name v2'))).toEqual([])
  })

  it('stays quiet without arguments or frontmatter', () => {
    expect(rule.check(withFrontmatter('name: demo'))).toEqual([])
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
