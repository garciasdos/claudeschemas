import { describe, expect, it } from 'vitest'
import { createSkillDocumentKind } from '../../src/core/kinds/skill/createSkillDocumentKind'
import {
  agentSkillsSpecTargetId,
  allTargetsId,
  claudeCodeTargetId,
  skillsApiTargetId,
} from '../../src/core/kinds/skill/targets/createSkillTargets'
import type { Diagnostic } from '../../src/core/diagnostics/types'

const kind = createSkillDocumentKind()

const claudeCodeOnlySkill = [
  '---',
  'name: release-notes',
  'description: Writes release notes for a tagged release. Use when a release is being cut.',
  'argument-hint: [tag]',
  'arguments: tag',
  'context: fork',
  '---',
  '',
  '# Release notes',
  '',
  'Summarize $tag from !`git show --stat $tag`.',
  '',
  'Follow the layout in ${CLAUDE_SKILL_DIR}/template.md.',
  '',
].join('\n')

const portableSkill = [
  '---',
  'name: summarize-release-notes',
  'description: Turns a list of merged pull requests into release notes grouped by audience-visible change. Use when a release is being cut or someone asks for release notes.',
  'license: Apache-2.0',
  'compatibility: Works in Claude Code, claude.ai and the Skills API; needs no tools beyond reading the repository.',
  'metadata:',
  '  owner: developer-experience',
  '  catalog-id: rel-notes-2',
  'allowed-tools: Read',
  '---',
  '',
  '# Summarize release notes',
  '',
  '1. Read the pull request titles and bodies you are given.',
  '2. Drop anything a user cannot observe, such as refactors and test-only changes.',
  '3. Write one line per remaining change, grouped under Added, Changed and Fixed.',
  '',
].join('\n')

const skillWithUnhintedArguments = [
  '---',
  'name: close-issue',
  'description: Closes a GitHub issue with a comment. Use when someone asks to close an issue.',
  'arguments: issue-number',
  '---',
  '',
  '# Close issue',
  '',
  'Close issue $issue-number with a short explanation.',
  '',
].join('\n')

const isPortability = (diagnostic: Diagnostic): boolean =>
  diagnostic.ruleId.startsWith('portability/')

const portabilityFindings = (text: string, targetId: string): Diagnostic[] =>
  kind.validate(text, targetId).filter(isPortability)

const ruleIdsOf = (diagnostics: readonly Diagnostic[]): string[] =>
  diagnostics.map((diagnostic) => diagnostic.ruleId)

describe('skill target selection', () => {
  it('lists every target with its schema', () => {
    expect(kind.targets.map((target) => target.id)).toEqual([
      claudeCodeTargetId,
      skillsApiTargetId,
      agentSkillsSpecTargetId,
      allTargetsId,
    ])
    expect(kind.targets[1]?.schemaUrl).toBe('schemas/skill.skills-api.schema.json')
  })

  it('defaults to Claude Code', () => {
    expect(kind.defaultTargetId).toBe(claudeCodeTargetId)
    expect(kind.validate(claudeCodeOnlySkill)).toEqual(
      kind.validate(claudeCodeOnlySkill, claudeCodeTargetId),
    )
  })

  it('falls back to Claude Code for an unknown target', () => {
    expect(kind.validate(claudeCodeOnlySkill, 'no-such-target')).toEqual(
      kind.validate(claudeCodeOnlySkill, claudeCodeTargetId),
    )
  })
})

describe('Claude Code target', () => {
  it('reports no portability findings for Claude Code-only fields and body constructs', () => {
    expect(portabilityFindings(claudeCodeOnlySkill, claudeCodeTargetId)).toEqual([])
  })

  it('keeps reporting the Claude Code hints', () => {
    expect(ruleIdsOf(kind.validate(skillWithUnhintedArguments, claudeCodeTargetId))).toContain(
      'skill/missing-argument-hint',
    )
  })

  it('has nothing to make portable', () => {
    expect(kind.toPortable(claudeCodeOnlySkill, claudeCodeTargetId)).toBeNull()
  })
})

describe('portability targets', () => {
  it.each([skillsApiTargetId, agentSkillsSpecTargetId])(
    'reports every Claude Code-only field as unsupported on %s',
    (targetId) => {
      const unsupported = portabilityFindings(claudeCodeOnlySkill, targetId).filter(
        (diagnostic) => diagnostic.ruleId === 'portability/unsupported-field',
      )
      expect(unsupported.map((diagnostic) => diagnostic.range.start.line)).toEqual([4, 5, 6])
      for (const diagnostic of unsupported) {
        expect(diagnostic.severity).toBe('error')
        expect(diagnostic.source).toBe('frontmatter')
        expect(diagnostic.portability?.targets).toEqual([targetId])
      }
    },
  )

  it('names the field and what to do instead', () => {
    const message = portabilityFindings(claudeCodeOnlySkill, skillsApiTargetId)[0]?.message ?? ''
    expect(message).toContain('`argument-hint` is a Claude Code-only field.')
    expect(message).toContain('unexpected-key error')
    expect(message).toContain('Move it under `metadata`, or remove it.')
  })

  it('reports each unsupported field once for all targets at a time', () => {
    const unsupported = portabilityFindings(claudeCodeOnlySkill, allTargetsId).filter(
      (diagnostic) => diagnostic.ruleId === 'portability/unsupported-field',
    )
    expect(unsupported).toHaveLength(3)
    for (const diagnostic of unsupported) {
      expect(diagnostic.portability?.targets).toEqual([skillsApiTargetId, agentSkillsSpecTargetId])
    }
    expect(unsupported[0]?.message).toContain('unexpected-key error')
  })

  it('reports each body construct once for all targets at a time', () => {
    const body = portabilityFindings(claudeCodeOnlySkill, allTargetsId).filter(
      (diagnostic) => diagnostic.source === 'body',
    )
    expect(ruleIdsOf(body)).toEqual([
      'portability/argument-placeholder',
      'portability/dynamic-context',
      'portability/environment-variable',
    ])
    for (const diagnostic of body) {
      expect(diagnostic.portability?.targets).toEqual([skillsApiTargetId, agentSkillsSpecTargetId])
    }
  })

  it('reports a field the target requires but Claude Code does not', () => {
    const findings = portabilityFindings('---\nname: demo\n---\n\nBody.\n', skillsApiTargetId)
    expect(ruleIdsOf(findings)).toEqual(['portability/field-constraint'])
    expect(findings[0]?.message).toContain('Missing required field "description".')
    expect(findings[0]?.message).toContain('reject the upload')
  })

  it('does not repeat a problem Claude Code already reports', () => {
    const text =
      '---\nname: demo\ndescription: Does a thing when asked to.\nunknown: 1\n---\n\nBody.\n'
    const findings = portabilityFindings(text, skillsApiTargetId)
    expect(findings).toEqual([])
    expect(ruleIdsOf(kind.validate(text, skillsApiTargetId))).toContain('schema/unknown-field')
  })

  it('suppresses hints that mean nothing on the target', () => {
    expect(ruleIdsOf(kind.validate(skillWithUnhintedArguments, skillsApiTargetId))).not.toContain(
      'skill/missing-argument-hint',
    )
  })
})

describe('a skill written to the Agent Skills spec', () => {
  it.each([claudeCodeTargetId, skillsApiTargetId, agentSkillsSpecTargetId, allTargetsId])(
    'reports nothing at all on %s',
    (targetId) => {
      expect(kind.validate(portableSkill, targetId)).toEqual([])
    },
  )
})
