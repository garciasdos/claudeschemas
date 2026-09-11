import { describe, expect, it } from 'vitest'
import { DescriptionBrevityRule } from '../../../src/core/kinds/skill/rules/hints/DescriptionBrevityRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new DescriptionBrevityRule()

describe('DescriptionBrevityRule', () => {
  it('hints at a description of fewer than five words', () => {
    const diagnostics = rule.check(withFrontmatter('description: Sorts imports.'))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/description-brevity')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.message).toContain('2 words long')
    expect(diagnostics[0]?.message).toContain('"Sorts imports."')
  })

  it('uses the singular for a single word', () => {
    expect(rule.check(withFrontmatter('description: Sorts'))[0]?.message).toContain('1 word long')
  })

  it('accepts five words or more', () => {
    expect(rule.check(withFrontmatter('description: Sorts the imports of a file.'))).toEqual([])
  })

  it('leaves an empty description to the description rule', () => {
    expect(rule.check(withFrontmatter("description: '  '"))).toEqual([])
    expect(rule.check(withFrontmatter('name: demo'))).toEqual([])
  })

  it('honours a custom minimum', () => {
    expect(
      new DescriptionBrevityRule(2).check(withFrontmatter('description: Sorts imports.')),
    ).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Sorts.\n'))).toEqual([])
  })
})
