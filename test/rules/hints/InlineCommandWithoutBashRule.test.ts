import { describe, expect, it } from 'vitest'
import { InlineCommandWithoutBashRule } from '../../../src/core/kinds/skill/rules/hints/InlineCommandWithoutBashRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new InlineCommandWithoutBashRule()

const body = 'Status:\n\n!`git status --short`\n\nExplain it.\n'

describe('InlineCommandWithoutBashRule', () => {
  it('hints at the first injected command when nothing pre-approves it', () => {
    const diagnostics = rule.check(withFrontmatter('name: demo', body))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/inline-command-without-bash')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.source).toBe('body')
    expect(diagnostics[0]?.message).toContain('!`git status --short` runs before the skill loads')
    expect(diagnostics[0]?.range).toEqual({
      start: { line: 7, column: 1 },
      end: { line: 7, column: 22 },
    })
  })

  it('recognises an injection after whitespace', () => {
    expect(
      rule.check(withFrontmatter('name: demo', 'Branch: !`git branch --show-current`\n')),
    ).toHaveLength(1)
  })

  it('ignores an exclamation mark that is not at a token start', () => {
    expect(rule.check(withFrontmatter('name: demo', 'Wow!`not a command`\n'))).toEqual([])
    expect(rule.check(withFrontmatter('name: demo', 'Plain `code` and text!\n'))).toEqual([])
  })

  it('reports once however many injections there are', () => {
    expect(rule.check(withFrontmatter('name: demo', `${body}${body}`))).toHaveLength(1)
  })

  it('stays quiet once a shell tool is pre-approved', () => {
    expect(rule.check(withFrontmatter('allowed-tools: Bash(git status:*)', body))).toEqual([])
    expect(rule.check(withFrontmatter('allowed-tools:\n  - Bash', body))).toEqual([])
    expect(rule.check(withFrontmatter('allowed-tools: PowerShell', body))).toEqual([])
  })

  it('still hints when only other tools are pre-approved', () => {
    expect(rule.check(withFrontmatter('allowed-tools: Read, Edit', body))).toHaveLength(1)
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument(body))).toEqual([])
  })
})
