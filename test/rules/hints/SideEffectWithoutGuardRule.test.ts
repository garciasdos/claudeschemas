import { describe, expect, it } from 'vitest'
import { SideEffectWithoutGuardRule } from '../../../src/core/kinds/skill/rules/hints/SideEffectWithoutGuardRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new SideEffectWithoutGuardRule()

describe('SideEffectWithoutGuardRule', () => {
  it('hints when the description promises a deploy and Claude may invoke the skill', () => {
    const diagnostics = rule.check(
      withFrontmatter('name: preview\ndescription: Deploys the branch to a preview environment.'),
    )
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/side-effect-without-guard')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.message).toContain('The description says the skill will "Deploys"')
    expect(diagnostics[0]?.range.start.line).toBe(3)
  })

  it('reads the verb out of a hyphenated name', () => {
    const diagnostics = rule.check(withFrontmatter('name: send-slack-message'))
    expect(diagnostics[0]?.message).toContain('The name says the skill will "send"')
    expect(diagnostics[0]?.range.start.line).toBe(2)
  })

  it('reports once even when name and description both match', () => {
    expect(
      rule.check(withFrontmatter('name: publish-docs\ndescription: Publishes the docs site.')),
    ).toHaveLength(1)
  })

  it('stays quiet once model invocation is disabled', () => {
    expect(rule.check(withFrontmatter('name: deploy\ndisable-model-invocation: true'))).toEqual([])
  })

  it('stays quiet for verbs that do not leave the machine', () => {
    expect(
      rule.check(withFrontmatter('name: format-code\ndescription: Formats the changed files.')),
    ).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Deploy it.\n'))).toEqual([])
  })
})
