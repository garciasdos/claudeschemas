import { describe, expect, it } from 'vitest'
import { DeadModelInvocationFieldRule } from '../../src/core/kinds/skill/rules/DeadModelInvocationFieldRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new DeadModelInvocationFieldRule()

describe('DeadModelInvocationFieldRule', () => {
  it('warns about when_to_use and paths once model invocation is disabled', () => {
    const diagnostics = rule.check(
      withFrontmatter('disable-model-invocation: true\nwhen_to_use: Use often.\npaths: src/**'),
    )
    expect(diagnostics.map((diagnostic) => diagnostic.ruleId)).toEqual([
      'skill/dead-model-invocation-field',
      'skill/dead-model-invocation-field',
    ])
    expect(diagnostics.map((diagnostic) => diagnostic.range.start.line).sort()).toEqual([3, 4])
    expect(diagnostics[0]?.severity).toBe('warning')
  })

  it('accepts the boolean spellings', () => {
    expect(
      rule.check(withFrontmatter('disable-model-invocation: yes\npaths: src/**')),
    ).toHaveLength(1)
  })

  it('stays quiet when model invocation is allowed', () => {
    expect(rule.check(withFrontmatter('when_to_use: Use often.\npaths: src/**'))).toEqual([])
    expect(
      rule.check(withFrontmatter('disable-model-invocation: false\nwhen_to_use: Use often.')),
    ).toEqual([])
  })

  it('stays quiet when neither field is present', () => {
    expect(rule.check(withFrontmatter('disable-model-invocation: true'))).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
