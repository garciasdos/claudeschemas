import { describe, expect, it } from 'vitest'
import { ShellWithoutAllowedToolsRule } from '../../../src/core/kinds/skill/rules/hints/ShellWithoutAllowedToolsRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new ShellWithoutAllowedToolsRule()

const shellBody = 'Run the tests:\n\n```bash\nnpm test\n```\n'

describe('ShellWithoutAllowedToolsRule', () => {
  it('hints at the first shell block when allowed-tools is missing', () => {
    const diagnostics = rule.check(withFrontmatter('name: demo', shellBody))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/shell-without-allowed-tools')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.source).toBe('body')
    expect(diagnostics[0]?.message).toContain('a bash block')
    expect(diagnostics[0]?.range).toEqual({
      start: { line: 7, column: 1 },
      end: { line: 7, column: 8 },
    })
  })

  it('reports once however many blocks there are', () => {
    expect(rule.check(withFrontmatter('name: demo', `${shellBody}\n${shellBody}`))).toHaveLength(1)
  })

  it('recognises the common shell info strings', () => {
    for (const language of ['sh', 'shell', 'zsh', 'console', 'powershell']) {
      expect(
        rule.check(withFrontmatter('name: demo', `\`\`\`${language}\nls\n\`\`\`\n`)),
      ).toHaveLength(1)
    }
  })

  it('ignores code blocks in other languages', () => {
    expect(rule.check(withFrontmatter('name: demo', '```json\n{ "a": 1 }\n```\n'))).toEqual([])
    expect(rule.check(withFrontmatter('name: demo', '```\nnpm test\n```\n'))).toEqual([])
  })

  it('stays quiet once allowed-tools is declared', () => {
    expect(rule.check(withFrontmatter('allowed-tools: Bash(npm test:*)', shellBody))).toEqual([])
    expect(rule.check(withFrontmatter('allowed-tools:\n  - Read', shellBody))).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument(shellBody))).toEqual([])
  })
})
