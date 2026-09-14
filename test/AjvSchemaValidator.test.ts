import { describe, expect, it } from 'vitest'
import skillSchema from '../schemas/skill.schema.json'
import { AjvSchemaValidator } from '../src/core/schema/AjvSchemaValidator'

const validator = new AjvSchemaValidator(skillSchema)

describe('AjvSchemaValidator', () => {
  it('accepts frontmatter that uses every documented field', () => {
    expect(
      validator.validate({
        name: 'demo',
        description: 'Does a thing.',
        when_to_use: 'When a thing is needed.',
        'argument-hint': '[issue-number]',
        arguments: ['issue'],
        'disable-model-invocation': false,
        'user-invocable': true,
        'allowed-tools': 'Read, Edit',
        'disallowed-tools': ['AskUserQuestion'],
        model: 'inherit',
        effort: 'high',
        context: 'fork',
        agent: 'general-purpose',
        background: false,
        hooks: { Stop: [{ matcher: '', hooks: [{ type: 'command', command: 'echo done' }] }] },
        paths: ['src/**/*.ts'],
        shell: 'bash',
        metadata: { team: 'platform', tier: 2 },
        license: 'MIT',
        compatibility: 'Claude Code v2.1 or later',
      }),
    ).toEqual([])
  })

  it('accepts an empty mapping', () => {
    expect(validator.validate({})).toEqual([])
  })

  it('reports an unknown field and points at it', () => {
    const violations = validator.validate({ 'argument-hints': '[x]' })
    expect(violations).toHaveLength(1)
    expect(violations[0]?.ruleId).toBe('schema/unknown-field')
    expect(violations[0]?.message).toContain('Unknown field "argument-hints"')
    expect(violations[0]?.path).toEqual(['argument-hints'])
  })

  it('suggests the intended field for a near miss', () => {
    const violations = validator.validate({ Description: 'x', allowed_tools: 'Read' })
    expect(violations.map((violation) => violation.message)).toEqual([
      'Unknown field "Description". Did you mean "description"? Field names are case-sensitive and must be spelled exactly.',
      'Unknown field "allowed_tools". Did you mean "allowed-tools"? Field names are case-sensitive and must be spelled exactly.',
    ])
  })

  it('names the single accepted value of context', () => {
    const violations = validator.validate({ context: 'main' })
    expect(violations[0]?.ruleId).toBe('schema/enum')
    expect(violations[0]?.message).toBe('Field "context" must be "fork".')
  })

  it('accepts every hook type and rejects an unknown one', () => {
    const hook = (type: string): Record<string, unknown> => ({
      hooks: { Stop: [{ hooks: [{ type, command: 'echo' }] }] },
    })
    for (const type of ['command', 'http', 'mcp_tool', 'prompt', 'agent']) {
      expect(validator.validate(hook(type))).toEqual([])
    }
    const violations = validator.validate(hook('webhook'))
    expect(violations[0]?.ruleId).toBe('schema/enum')
    expect(violations[0]?.path).toEqual(['hooks', 'Stop', 0, 'hooks', 0, 'type'])
  })

  it('lists the allowed values of an enum', () => {
    const violations = validator.validate({ effort: 'ultra' })
    expect(violations[0]?.ruleId).toBe('schema/enum')
    expect(violations[0]?.message).toBe(
      'Field "effort" must be one of: low, medium, high, xhigh, max.',
    )
  })

  it('collapses a union into one readable message', () => {
    const violations = validator.validate({ 'allowed-tools': 42 })
    expect(violations).toHaveLength(1)
    expect(violations[0]?.ruleId).toBe('schema/invalid-value')
    expect(violations[0]?.message).toBe(
      'Field "allowed-tools" must be a string or list of strings.',
    )
  })

  it('accepts the boolean spellings Claude Code accepts', () => {
    expect(validator.validate({ background: 'yes' })).toEqual([])
    expect(validator.validate({ 'user-invocable': 0 })).toEqual([])
    expect(validator.validate({ 'disable-model-invocation': true })).toEqual([])
  })

  it('rejects a value that is not a boolean spelling', () => {
    const violations = validator.validate({ background: 'maybe' })
    expect(violations[0]?.message).toBe('Field "background" must be a boolean value.')
  })

  it('reports a length limit in characters', () => {
    const violations = validator.validate({ compatibility: 'x'.repeat(501) })
    expect(violations[0]?.ruleId).toBe('schema/max-length')
    expect(violations[0]?.message).toBe('Field "compatibility" must be at most 500 characters.')
  })

  it('reports frontmatter that is not a mapping', () => {
    const violations = validator.validate(['name'])
    expect(violations[0]?.message).toBe('The frontmatter must be a mapping of fields.')
    expect(violations[0]?.path).toEqual([])
  })

  it('points at the offending entry inside hooks', () => {
    const violations = validator.validate({ hooks: { Stop: 'echo done' } })
    expect(violations[0]?.path).toEqual(['hooks', 'Stop'])
  })
})
