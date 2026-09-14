import { describe, expect, it } from 'vitest'
import { HookMatcherIgnoredRule } from '../../src/core/kinds/skill/rules/HookMatcherIgnoredRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new HookMatcherIgnoredRule()

const hooks = (event: string, matcher: string): string =>
  `name: demo\nhooks:\n  ${event}:\n    - matcher: ${matcher}\n      hooks:\n        - type: command\n          command: echo`

describe('HookMatcherIgnoredRule', () => {
  it('warns about a matcher on an event that ignores it', () => {
    const diagnostics = rule.check(withFrontmatter(hooks('Stop', 'Bash')))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/hook-matcher-ignored')
    expect(diagnostics[0]?.severity).toBe('warning')
    expect(diagnostics[0]?.message).toContain('"Stop" hooks')
    expect(diagnostics[0]?.range.start.line).toBe(5)
  })

  it('covers the other events without matcher support', () => {
    for (const event of ['UserPromptSubmit', 'TaskCompleted', 'WorktreeCreate', 'CwdChanged']) {
      expect(rule.check(withFrontmatter(hooks(event, 'x')))).toHaveLength(1)
    }
  })

  it('reports every matcher group under the event', () => {
    const text = `${hooks('Stop', 'Bash')}\n    - matcher: Write\n      hooks:\n        - type: command\n          command: echo`
    const diagnostics = rule.check(withFrontmatter(text))
    expect(diagnostics.map((diagnostic) => diagnostic.range.start.line)).toEqual([5, 9])
  })

  it('leaves matchers on filtering events alone', () => {
    expect(rule.check(withFrontmatter(hooks('PreToolUse', 'Bash')))).toEqual([])
    expect(rule.check(withFrontmatter(hooks('SessionStart', 'startup')))).toEqual([])
  })

  it('stays quiet when the event has no matcher', () => {
    const text = 'hooks:\n  Stop:\n    - hooks:\n        - type: command\n          command: echo'
    expect(rule.check(withFrontmatter(text))).toEqual([])
  })

  it('stays quiet when hooks is not a mapping or is absent', () => {
    expect(rule.check(withFrontmatter('hooks: nope'))).toEqual([])
    expect(rule.check(withFrontmatter('name: demo'))).toEqual([])
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
