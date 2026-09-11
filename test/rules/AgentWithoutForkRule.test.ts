import { describe, expect, it } from 'vitest'
import { AgentWithoutForkRule } from '../../src/core/kinds/skill/rules/AgentWithoutForkRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new AgentWithoutForkRule()

describe('AgentWithoutForkRule', () => {
  it('warns when agent is set without context: fork', () => {
    const diagnostics = rule.check(withFrontmatter('name: demo\nagent: code-reviewer'))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/agent-without-fork')
    expect(diagnostics[0]?.severity).toBe('warning')
    expect(diagnostics[0]?.range.start.line).toBe(3)
  })

  it('stays quiet when context is fork', () => {
    expect(rule.check(withFrontmatter('agent: code-reviewer\ncontext: fork'))).toEqual([])
  })

  it('warns when context names something other than fork', () => {
    expect(rule.check(withFrontmatter('agent: code-reviewer\ncontext: inline'))).toHaveLength(1)
  })

  it('stays quiet when agent is absent', () => {
    expect(rule.check(withFrontmatter('name: demo\ncontext: fork'))).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
