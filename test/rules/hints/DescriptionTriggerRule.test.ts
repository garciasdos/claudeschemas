import { describe, expect, it } from 'vitest'
import { DescriptionTriggerRule } from '../../../src/core/kinds/skill/rules/hints/DescriptionTriggerRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new DescriptionTriggerRule()

describe('DescriptionTriggerRule', () => {
  it('hints when the description never says when to use the skill', () => {
    const diagnostics = rule.check(
      withFrontmatter('description: Sorts the imports of a TypeScript file.'),
    )
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/description-when-to-use')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.source).toBe('frontmatter')
    expect(diagnostics[0]?.range.start.line).toBe(2)
  })

  it('accepts trigger phrasing inside the description', () => {
    expect(
      rule.check(withFrontmatter('description: Sorts imports. Use when a file is untidy.')),
    ).toEqual([])
    expect(
      rule.check(withFrontmatter('description: Sorts imports whenever a review asks for it.')),
    ).toEqual([])
  })

  it('does not take "pull request" for trigger phrasing', () => {
    expect(
      rule.check(withFrontmatter('description: Records a merged pull request in the changelog.')),
    ).toHaveLength(1)
  })

  it('accepts a when_to_use field instead', () => {
    expect(
      rule.check(
        withFrontmatter('description: Sorts imports.\nwhen_to_use: Use after adding imports.'),
      ),
    ).toEqual([])
  })

  it('ignores a blank when_to_use', () => {
    expect(
      rule.check(withFrontmatter("description: Sorts the imports.\nwhen_to_use: ' '")),
    ).toHaveLength(1)
  })

  it('stays quiet when Claude cannot invoke the skill on its own', () => {
    expect(
      rule.check(
        withFrontmatter('description: Sorts the imports.\ndisable-model-invocation: true'),
      ),
    ).toEqual([])
  })

  it('leaves a missing or empty description to the description rule', () => {
    expect(rule.check(withFrontmatter('name: demo'))).toEqual([])
    expect(rule.check(withFrontmatter("description: ''"))).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
