import { describe, expect, it } from 'vitest'
import { createSkillDocumentKind } from '../src/core/kinds/skill/createSkillDocumentKind'
import { createDefaultRegistry } from '../src/core/createDefaultRegistry'

const kind = createSkillDocumentKind()

describe('SkillDocumentKind', () => {
  it('describes itself', () => {
    expect(kind.id).toBe('skill')
    expect(kind.label).toBe('SKILL.md')
    expect(kind.schemaUrl).toBe('schemas/skill.schema.json')
  })

  it('is registered in the default registry', () => {
    expect(createDefaultRegistry().get('skill')?.label).toBe('SKILL.md')
  })

  it('finds nothing wrong with its own sample', () => {
    expect(kind.validate(kind.sample)).toEqual([])
  })

  it('reports a YAML syntax error instead of schema errors', () => {
    const diagnostics = kind.validate('---\nname: demo\n  bad: indent\n---\n\nBody.\n')
    expect(diagnostics.map((diagnostic) => diagnostic.ruleId)).toEqual(['frontmatter/yaml-syntax'])
    expect(diagnostics[0]?.source).toBe('frontmatter')
  })

  it('combines schema and rule diagnostics in line order', () => {
    const diagnostics = kind.validate(
      [
        '---',
        'name: Demo',
        'description: Does a thing when asked to.',
        'effort: ultra',
        '---',
        '',
        'Body.',
        '',
      ].join('\n'),
    )
    expect(
      diagnostics.map((diagnostic) => [diagnostic.range.start.line, diagnostic.ruleId]),
    ).toEqual([
      [2, 'skill/name-format'],
      [4, 'schema/enum'],
    ])
  })

  it('appends improvement hints after the problems on the same line', () => {
    const diagnostics = kind.validate(
      ['---', 'name: Demo-Skill', 'description: Sorts imports.', '---', '', 'Body.', ''].join('\n'),
    )
    expect(diagnostics.map((diagnostic) => [diagnostic.severity, diagnostic.ruleId])).toEqual([
      ['error', 'skill/name-format'],
      ['hint', 'skill/name-says-skill'],
      ['hint', 'skill/description-brevity'],
      ['hint', 'skill/description-when-to-use'],
    ])
  })

  it('is deterministic', () => {
    const text = '---\nname: Demo\n---\n\n${CLAUDE_NOPE}\n'
    expect(kind.validate(text)).toEqual(kind.validate(text))
  })

  it('marks schema diagnostics with the schema source', () => {
    const diagnostics = kind.validate(
      '---\nname: demo\ndescription: Does a thing when asked to.\nunknown: 1\n---\n\nBody.\n',
    )
    expect(diagnostics[0]?.source).toBe('schema')
    expect(diagnostics[0]?.ruleId).toBe('schema/unknown-field')
    expect(diagnostics[0]?.range.start.line).toBe(4)
  })

  it('falls back to the frontmatter block when a key cannot be located', () => {
    const diagnostics = kind.validate('---\n- name: demo\n---\n\nBody.\n')
    expect(diagnostics[0]?.ruleId).toBe('schema/type')
    expect(diagnostics[0]?.range.start).toEqual({ line: 1, column: 1 })
  })

  it('offers Claude Code as the default of four targets', () => {
    expect(kind.defaultTargetId).toBe('claude-code')
    expect(kind.targets.map((target) => target.id)).toEqual([
      'claude-code',
      'skills-api',
      'agent-skills-spec',
      'all',
    ])
    expect(kind.targets[0]?.schemaUrl).toBe(kind.schemaUrl)
  })

  it('validates against the default target when none is named', () => {
    const text = '---\nname: Demo\nargument-hint: [tag]\n---\n\nBody.\n'
    expect(kind.validate(text)).toEqual(kind.validate(text, 'claude-code'))
  })

  it('has nothing to make portable for the Claude Code target', () => {
    expect(kind.toPortable(kind.sample, 'claude-code')).toBeNull()
  })
})
