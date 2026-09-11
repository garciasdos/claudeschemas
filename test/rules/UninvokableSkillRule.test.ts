import { describe, expect, it } from 'vitest'
import { UninvokableSkillRule } from '../../src/core/kinds/skill/rules/UninvokableSkillRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new UninvokableSkillRule()

describe('UninvokableSkillRule', () => {
  it('reports a skill nothing can invoke', () => {
    const diagnostics = rule.check(
      withFrontmatter('disable-model-invocation: true\nuser-invocable: false'),
    )
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/uninvokable')
    expect(diagnostics[0]?.severity).toBe('error')
    expect(diagnostics[0]?.range.start.line).toBe(2)
  })

  it('reads the boolean spellings Claude Code accepts', () => {
    expect(
      rule.check(withFrontmatter('disable-model-invocation: yes\nuser-invocable: off')),
    ).toHaveLength(1)
    expect(
      rule.check(withFrontmatter('disable-model-invocation: 1\nuser-invocable: 0')),
    ).toHaveLength(1)
  })

  it('stays quiet when either half is missing', () => {
    expect(rule.check(withFrontmatter('disable-model-invocation: true'))).toEqual([])
    expect(rule.check(withFrontmatter('user-invocable: false'))).toEqual([])
    expect(
      rule.check(withFrontmatter('disable-model-invocation: false\nuser-invocable: false')),
    ).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
