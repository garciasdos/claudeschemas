import { describe, expect, it } from 'vitest'
import { HiddenArgumentHintRule } from '../../../src/core/kinds/skill/rules/hints/HiddenArgumentHintRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new HiddenArgumentHintRule()

describe('HiddenArgumentHintRule', () => {
  it('hints when an argument-hint is set on a skill hidden from the / menu', () => {
    const diagnostics = rule.check(
      withFrontmatter("argument-hint: '[issue]'\nuser-invocable: false"),
    )
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/argument-hint-hidden')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.range.start.line).toBe(2)
  })

  it('reads the boolean spellings Claude Code accepts', () => {
    expect(
      rule.check(withFrontmatter("argument-hint: '[issue]'\nuser-invocable: no")),
    ).toHaveLength(1)
  })

  it('stays quiet when the skill is user-invocable', () => {
    expect(rule.check(withFrontmatter("argument-hint: '[issue]'"))).toEqual([])
    expect(rule.check(withFrontmatter("argument-hint: '[issue]'\nuser-invocable: true"))).toEqual(
      [],
    )
  })

  it('stays quiet without an argument-hint', () => {
    expect(rule.check(withFrontmatter('user-invocable: false'))).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
