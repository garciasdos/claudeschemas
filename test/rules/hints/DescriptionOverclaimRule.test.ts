import { describe, expect, it } from 'vitest'
import { DescriptionOverclaimRule } from '../../../src/core/kinds/skill/rules/hints/DescriptionOverclaimRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new DescriptionOverclaimRule()

describe('DescriptionOverclaimRule', () => {
  it('hints when the description claims every request', () => {
    const diagnostics = rule.check(
      withFrontmatter('name: demo\ndescription: Applies house style. Use for every request.'),
    )
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/description-overclaims')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.message).toContain('"description" says "every request"')
    expect(diagnostics[0]?.range.start.line).toBe(3)
  })

  it('checks when_to_use as well', () => {
    const diagnostics = rule.check(withFrontmatter('when_to_use: Always.'))
    expect(diagnostics[0]?.message).toContain('"when_to_use" says "Always"')
  })

  it('stays quiet for a description that names concrete situations', () => {
    expect(
      rule.check(withFrontmatter('description: Formats SQL when the user pastes a query.')),
    ).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Always do it.\n'))).toEqual([])
  })
})
