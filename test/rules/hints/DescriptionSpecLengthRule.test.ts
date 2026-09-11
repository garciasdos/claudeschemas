import { describe, expect, it } from 'vitest'
import { DescriptionSpecLengthRule } from '../../../src/core/kinds/skill/rules/hints/DescriptionSpecLengthRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new DescriptionSpecLengthRule()

describe('DescriptionSpecLengthRule', () => {
  it('stays quiet at exactly the spec cap', () => {
    expect(rule.check(withFrontmatter(`description: ${'d'.repeat(1024)}`))).toEqual([])
  })

  it('hints past the spec cap', () => {
    const diagnostics = rule.check(withFrontmatter(`description: ${'d'.repeat(1025)}`))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/description-spec-length')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.message).toContain('1025 characters')
    expect(diagnostics[0]?.range.start.line).toBe(2)
  })

  it('does not count when_to_use', () => {
    expect(
      rule.check(withFrontmatter(`description: short\nwhen_to_use: ${'w'.repeat(2000)}`)),
    ).toEqual([])
  })

  it('honours a custom cap', () => {
    expect(
      new DescriptionSpecLengthRule(10).check(withFrontmatter("description: 'twelve chars'")),
    ).toHaveLength(1)
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
