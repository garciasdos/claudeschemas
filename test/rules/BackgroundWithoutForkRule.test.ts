import { describe, expect, it } from 'vitest'
import { BackgroundWithoutForkRule } from '../../src/core/kinds/skill/rules/BackgroundWithoutForkRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new BackgroundWithoutForkRule()

describe('BackgroundWithoutForkRule', () => {
  it('warns when background is set without context: fork', () => {
    const diagnostics = rule.check(withFrontmatter('name: demo\nbackground: false'))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/background-without-fork')
    expect(diagnostics[0]?.severity).toBe('warning')
    expect(diagnostics[0]?.range.start.line).toBe(3)
  })

  it('stays quiet when context is fork', () => {
    expect(rule.check(withFrontmatter('background: true\ncontext: fork'))).toEqual([])
  })

  it('stays quiet when background is absent', () => {
    expect(rule.check(withFrontmatter('name: demo'))).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
