import { describe, expect, it } from 'vitest'
import { ClaudeVariableRule } from '../../src/core/kinds/skill/rules/ClaudeVariableRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new ClaudeVariableRule()

describe('ClaudeVariableRule', () => {
  it.each([
    'CLAUDE_SESSION_ID',
    'CLAUDE_EFFORT',
    'CLAUDE_SKILL_DIR',
    'CLAUDE_PROJECT_DIR',
    'CLAUDE_PLUGIN_ROOT',
    'CLAUDE_PLUGIN_DATA',
  ])('accepts %s', (name) => {
    expect(rule.check(withFrontmatter('name: demo', `Run \${${name}}/run.sh\n`))).toEqual([])
  })

  it('warns about an unknown variable', () => {
    const diagnostics = rule.check(withFrontmatter('name: demo', 'Read ${CLAUDE_HOME}/x\n'))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/unknown-claude-variable')
    expect(diagnostics[0]?.severity).toBe('warning')
    expect(diagnostics[0]?.message).toContain('${CLAUDE_HOME}')
    expect(diagnostics[0]?.source).toBe('body')
  })

  it('reports each occurrence with its own range', () => {
    const diagnostics = rule.check(
      withFrontmatter('name: demo', 'One ${CLAUDE_A}\nTwo ${CLAUDE_B}\n'),
    )
    expect(diagnostics).toHaveLength(2)
    expect(diagnostics[0]?.range.start).toEqual({ line: 5, column: 5 })
    expect(diagnostics[1]?.range.start).toEqual({ line: 6, column: 5 })
  })

  it('ignores variables that are not CLAUDE_ prefixed', () => {
    expect(rule.check(withFrontmatter('name: demo', 'Read ${HOME} and $CLAUDE_HOME\n'))).toEqual([])
  })

  it('scans a file without frontmatter', () => {
    expect(rule.check(parseDocument('Read ${CLAUDE_NOPE}\n'))).toHaveLength(1)
  })
})
