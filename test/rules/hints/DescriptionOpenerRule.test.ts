import { describe, expect, it } from 'vitest'
import { DescriptionOpenerRule } from '../../../src/core/kinds/skill/rules/hints/DescriptionOpenerRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new DescriptionOpenerRule()

describe('DescriptionOpenerRule', () => {
  it('hints when the description opens with "This skill"', () => {
    const diagnostics = rule.check(
      withFrontmatter('description: This skill sorts imports when asked.'),
    )
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/description-opener')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.message).toContain('opens with "This skill"')
    expect(diagnostics[0]?.range.start.line).toBe(2)
  })

  it('catches other filler openers regardless of case', () => {
    for (const opener of ['a skill that', 'A tool for', 'this is a', 'Skill to']) {
      expect(rule.check(withFrontmatter(`description: ${opener} sorts imports.`))).toHaveLength(1)
    }
  })

  it('accepts a description that leads with a verb', () => {
    expect(rule.check(withFrontmatter('description: Sorts imports when asked.'))).toEqual([])
  })

  it('ignores the phrase when it is not the opener', () => {
    expect(
      rule.check(withFrontmatter('description: Sorts imports. This skill never edits code.')),
    ).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('This skill does things.\n'))).toEqual([])
  })
})
