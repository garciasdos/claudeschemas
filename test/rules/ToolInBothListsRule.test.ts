import { describe, expect, it } from 'vitest'
import { ToolInBothListsRule } from '../../src/core/kinds/skill/rules/ToolInBothListsRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new ToolInBothListsRule()

describe('ToolInBothListsRule', () => {
  it('warns when the same entry is in both lists', () => {
    const diagnostics = rule.check(
      withFrontmatter('allowed-tools: Read, Edit\ndisallowed-tools:\n  - Edit'),
    )
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/tool-in-both-lists')
    expect(diagnostics[0]?.severity).toBe('warning')
    expect(diagnostics[0]?.message).toContain('"Edit" appears in both')
    expect(diagnostics[0]?.range.start.line).toBe(2)
  })

  it('treats a bare disallowed tool as covering its scoped grants', () => {
    const diagnostics = rule.check(
      withFrontmatter('allowed-tools: Bash(npm test:*) Read\ndisallowed-tools: Bash'),
    )
    expect(diagnostics[0]?.message).toContain('"Bash(npm test:*)" appears in both')
  })

  it('keeps a scoped pattern intact when splitting a string', () => {
    expect(
      rule.check(
        withFrontmatter('allowed-tools: Bash(git log:*)\ndisallowed-tools: Bash(git push:*)'),
      ),
    ).toEqual([])
  })

  it('lists every conflicting entry once', () => {
    const diagnostics = rule.check(
      withFrontmatter('allowed-tools: [Read, Edit, Write]\ndisallowed-tools: [Read, Write]'),
    )
    expect(diagnostics[0]?.message).toContain('"Read", "Write" appear in both')
  })

  it('stays quiet when the lists do not overlap or one is missing', () => {
    expect(rule.check(withFrontmatter('allowed-tools: Read\ndisallowed-tools: Edit'))).toEqual([])
    expect(rule.check(withFrontmatter('allowed-tools: Read'))).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
