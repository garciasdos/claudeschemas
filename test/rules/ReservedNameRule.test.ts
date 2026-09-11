import { describe, expect, it } from 'vitest'
import { ReservedNameRule } from '../../src/core/kinds/skill/rules/ReservedNameRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new ReservedNameRule()

describe('ReservedNameRule', () => {
  it('rejects the reserved name', () => {
    const diagnostics = rule.check(withFrontmatter('name: synced'))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/reserved-name')
    expect(diagnostics[0]?.severity).toBe('error')
    expect(diagnostics[0]?.range.start.line).toBe(2)
  })

  it.each(['Synced', 'SYNCED', 'SyNcEd'])('rejects %s in any capitalization', (name) => {
    expect(rule.check(withFrontmatter(`name: ${name}`))).toHaveLength(1)
  })

  it('accepts a name that merely contains the reserved word', () => {
    expect(rule.check(withFrontmatter('name: synced-notes'))).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
