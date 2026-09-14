import { describe, expect, it } from 'vitest'
import { AbsolutePathRule } from '../../../src/core/kinds/skill/rules/hints/AbsolutePathRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new AbsolutePathRule()

describe('AbsolutePathRule', () => {
  it('hints at a macOS home path', () => {
    const diagnostics = rule.check(withFrontmatter('name: demo', 'Run /Users/alex/bin/tool now.\n'))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/absolute-path')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.message).toContain('"/Users/alex/bin/tool" is an absolute path')
    expect(diagnostics[0]?.range).toEqual({
      start: { line: 5, column: 5 },
      end: { line: 5, column: 25 },
    })
  })

  it('hints at Linux home and Windows drive paths', () => {
    expect(rule.check(parseDocument('See /home/alex/notes.md\n'))).toHaveLength(1)
    expect(rule.check(parseDocument('Open C:\\Users\\alex\\notes.md\n'))).toHaveLength(1)
  })

  it('reports each path', () => {
    expect(rule.check(parseDocument('/Users/a/x and /home/b/y\n'))).toHaveLength(2)
  })

  it('ignores relative paths, skill variables and other absolute paths', () => {
    expect(rule.check(parseDocument('Use ${CLAUDE_SKILL_DIR}/scripts/run.sh\n'))).toEqual([])
    expect(
      rule.check(parseDocument('Read scripts/run.sh and /etc/hosts and /usr/bin/env\n')),
    ).toEqual([])
    expect(rule.check(parseDocument('See https://example.com/home/page\n'))).toEqual([])
  })
})
