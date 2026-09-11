import { describe, expect, it } from 'vitest'
import { DescriptionVoiceRule } from '../../../src/core/kinds/skill/rules/hints/DescriptionVoiceRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new DescriptionVoiceRule()

describe('DescriptionVoiceRule', () => {
  it('hints at a first-person description', () => {
    const diagnostics = rule.check(
      withFrontmatter('description: I can help you sort imports when asked.'),
    )
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/description-voice')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.message).toContain('"description" speaks as "I"')
  })

  it('hints at a second-person description', () => {
    const diagnostics = rule.check(
      withFrontmatter('description: You can use this to sort imports when asked.'),
    )
    expect(diagnostics[0]?.message).toContain('speaks as "You can"')
  })

  it('checks when_to_use as well', () => {
    const diagnostics = rule.check(
      withFrontmatter('description: Sorts imports.\nwhen_to_use: Use it when we ship.'),
    )
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.message).toContain('"when_to_use" speaks as "we"')
    expect(diagnostics[0]?.range.start.line).toBe(3)
  })

  it('accepts a third-person description that mentions the user', () => {
    expect(
      rule.check(
        withFrontmatter('description: Sorts imports when the user asks you to tidy a file.'),
      ),
    ).toEqual([])
  })

  it('does not mistake a lowercase i or a word containing we for a pronoun', () => {
    expect(
      rule.check(withFrontmatter('description: Sorts imports in a file when the week ends.')),
    ).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('I do things.\n'))).toEqual([])
  })
})
