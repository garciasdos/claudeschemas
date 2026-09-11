import { describe, expect, it } from 'vitest'
import { DescriptionLengthRule } from '../../src/core/kinds/skill/rules/DescriptionLengthRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new DescriptionLengthRule()

describe('DescriptionLengthRule', () => {
  it('stays quiet at exactly the cap', () => {
    expect(rule.check(withFrontmatter(`description: ${'d'.repeat(1536)}`))).toEqual([])
  })

  it('reports an error past the cap', () => {
    const diagnostics = rule.check(withFrontmatter(`description: ${'d'.repeat(1537)}`))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/description-length')
    expect(diagnostics[0]?.severity).toBe('error')
    expect(diagnostics[0]?.message).toContain('1537 characters')
  })

  it('counts description and when_to_use together', () => {
    const frontmatter = `description: ${'d'.repeat(800)}\nwhen_to_use: ${'w'.repeat(800)}`
    const diagnostics = rule.check(withFrontmatter(frontmatter))
    expect(diagnostics[0]?.message).toContain('1600 characters')
    expect(diagnostics[0]?.range.start.line).toBe(2)
  })

  it('points at when_to_use when there is no description', () => {
    const diagnostics = rule.check(withFrontmatter(`when_to_use: ${'w'.repeat(1600)}`))
    expect(diagnostics[0]?.range.start.line).toBe(2)
  })

  it('honours a custom cap', () => {
    expect(
      new DescriptionLengthRule(10).check(withFrontmatter("description: 'twelve chars'")),
    ).toHaveLength(1)
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
