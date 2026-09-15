import { describe, expect, it } from 'vitest'
import { parseCliOptions } from '../../src/cli/parseCliOptions'

const options = (argv: readonly string[]) => {
  const result = parseCliOptions(argv)
  if (result.outcome !== 'options') {
    throw new Error(result.message)
  }
  return result.options
}

describe('parseCliOptions', () => {
  it('defaults to the skill kind, the text format and no explicit target', () => {
    expect(options([])).toEqual({
      paths: [],
      kindId: 'skill',
      targetId: null,
      format: 'text',
      strict: false,
      showHelp: false,
      listTargets: false,
    })
  })

  it('collects file paths in the order they were given', () => {
    expect(options(['one/SKILL.md', 'two/SKILL.md']).paths).toEqual([
      'one/SKILL.md',
      'two/SKILL.md',
    ])
  })

  it('treats a single dash as a path so standard input can be mixed with files', () => {
    expect(options(['-', 'other/SKILL.md']).paths).toEqual(['-', 'other/SKILL.md'])
  })

  it('reads a flag value from the next argument', () => {
    const parsed = options(['--kind', 'skill', '--target', 'skills-api'])
    expect(parsed.kindId).toBe('skill')
    expect(parsed.targetId).toBe('skills-api')
  })

  it('reads a flag value written after an equals sign', () => {
    expect(options(['--target=agent-skills-spec']).targetId).toBe('agent-skills-spec')
  })

  it('recognises the switches', () => {
    const parsed = options(['--json', '--strict', '--list-targets', '--help'])
    expect(parsed.format).toBe('json')
    expect(parsed.strict).toBe(true)
    expect(parsed.listTargets).toBe(true)
    expect(parsed.showHelp).toBe(true)
  })

  it('accepts the short help flag', () => {
    expect(options(['-h']).showHelp).toBe(true)
  })

  it('reports a flag that is missing its value', () => {
    expect(parseCliOptions(['--target'])).toEqual({
      outcome: 'error',
      message: '--target needs a value.',
    })
  })

  it('reports an unknown option', () => {
    expect(parseCliOptions(['--verbose'])).toEqual({
      outcome: 'error',
      message: 'Unknown option --verbose.',
    })
  })

  it('reports a value given to a switch', () => {
    expect(parseCliOptions(['--json=yes'])).toEqual({
      outcome: 'error',
      message: '--json does not take a value.',
    })
  })
})
