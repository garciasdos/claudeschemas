import { describe, expect, it } from 'vitest'
import { SkillBodyPortabilityCheck } from '../../src/core/kinds/skill/portability/SkillBodyPortabilityCheck'
import {
  agentSkillsSpecTargetId,
  createSkillTargets,
  skillsApiTargetId,
} from '../../src/core/kinds/skill/targets/createSkillTargets'
import type { SkillPortabilityTarget } from '../../src/core/kinds/skill/targets/types'
import { withFrontmatter } from '../support/parseDocument'

const portabilityTargetOf = (selectionId: string): SkillPortabilityTarget => {
  const target = createSkillTargets().find((selection) => selection.id === selectionId)
    ?.portabilityTargets[0]
  if (target === undefined) {
    throw new Error(`no portability target for ${selectionId}`)
  }
  return target
}

const skillsApi = portabilityTargetOf(skillsApiTargetId)
const agentSkillsSpec = portabilityTargetOf(agentSkillsSpecTargetId)
const check = new SkillBodyPortabilityCheck()

describe('SkillBodyPortabilityCheck', () => {
  it('reports an inline dynamic context injection', () => {
    const diagnostics = check.check(
      withFrontmatter('name: demo', 'Current state: !`git status`\n'),
      skillsApi,
    )
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('portability/dynamic-context')
    expect(diagnostics[0]?.severity).toBe('warning')
    expect(diagnostics[0]?.source).toBe('body')
    expect(diagnostics[0]?.message).toContain('!`git status`')
    expect(diagnostics[0]?.message).toContain('On claude.ai and through the Skills API')
    expect(diagnostics[0]?.portability?.targets).toEqual(['skills-api'])
  })

  it('reports a fenced dynamic context injection block once, quoting its first line', () => {
    const diagnostics = check.check(
      withFrontmatter('name: demo', '```!\ngit status\ngit diff --stat\n```\n'),
      skillsApi,
    )
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('portability/dynamic-context')
    expect(diagnostics[0]?.message).toContain('block starts here')
    expect(diagnostics[0]?.message).not.toContain('git diff --stat')
  })

  it.each(['$ARGUMENTS', '$1'])('reports the %s placeholder', (placeholder) => {
    const diagnostics = check.check(
      withFrontmatter('name: demo', `Work on ${placeholder}.\n`),
      skillsApi,
    )
    expect(diagnostics.map((diagnostic) => diagnostic.ruleId)).toEqual([
      'portability/argument-placeholder',
    ])
    expect(diagnostics[0]?.message).toContain(placeholder)
  })

  it('reports a declared named argument placeholder', () => {
    const diagnostics = check.check(
      withFrontmatter('name: demo\narguments: issue-number', 'Close issue $issue-number.\n'),
      skillsApi,
    )
    expect(diagnostics.map((diagnostic) => diagnostic.ruleId)).toEqual([
      'portability/argument-placeholder',
    ])
    expect(diagnostics[0]?.message).toContain('$issue-number')
  })

  it('reports a Claude Code environment variable', () => {
    const diagnostics = check.check(
      withFrontmatter('name: demo', 'Read ${CLAUDE_SKILL_DIR}/template.md.\n'),
      skillsApi,
    )
    expect(diagnostics.map((diagnostic) => diagnostic.ruleId)).toEqual([
      'portability/environment-variable',
    ])
    expect(diagnostics[0]?.message).toContain('${CLAUDE_SKILL_DIR}')
  })

  it('ignores the same constructs inside an ordinary fenced code block', () => {
    const body = [
      '```markdown',
      'Current state: !`git status`',
      'Work on $ARGUMENTS and $1.',
      'Read ${CLAUDE_SKILL_DIR}/template.md.',
      '```',
      '',
    ].join('\n')
    expect(check.check(withFrontmatter('name: demo', body), skillsApi)).toEqual([])
  })

  it('names the place the construct stops working for the target it checks', () => {
    const document = withFrontmatter('name: demo', 'Work on $ARGUMENTS.\n')
    expect(check.check(document, agentSkillsSpec)[0]?.message).toContain('Outside Claude Code')
    expect(check.check(document, agentSkillsSpec)[0]?.portability?.targets).toEqual([
      'agent-skills-spec',
    ])
  })

  it('keeps every message on one line and reasonably short', () => {
    const body = '!`git status` and $ARGUMENTS and ${CLAUDE_SKILL_DIR}\n'
    for (const diagnostic of check.check(withFrontmatter('name: demo', body), skillsApi)) {
      expect(diagnostic.message).not.toContain('\n')
      expect(diagnostic.message.length).toBeLessThan(300)
    }
  })

  it('finds nothing in a body without Claude Code constructs', () => {
    expect(check.check(withFrontmatter('name: demo', 'Just prose.\n'), skillsApi)).toEqual([])
  })
})
